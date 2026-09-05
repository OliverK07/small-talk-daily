from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass

from .client import TeslaInventoryError, fetch_model_inventory
from .config import Settings
from .models import Vehicle, build_telegram_message
from .notify import TelegramNotifier
from .state import SeenVinStore


@dataclass
class ScanResult:
    totals: dict[str, int]
    new_vehicles: list[Vehicle]
    all_vehicles: list[Vehicle]
    errors: list[str]


def run_scan(settings: Settings, store: SeenVinStore) -> ScanResult:
    totals: dict[str, int] = {}
    all_vehicles: list[Vehicle] = []
    errors: list[str] = []

    for model in settings.models:
        try:
            total, vehicles = fetch_model_inventory(model, settings)
            totals[model] = total if total else len(vehicles)
            all_vehicles.extend(vehicles)
            print(
                f"[ok] {model}: total_matches={totals[model]} parsed={len(vehicles)}",
                file=sys.stderr,
            )
        except TeslaInventoryError as exc:
            msg = f"{model}: {exc}"
            errors.append(msg)
            totals[model] = 0
            print(f"[error] {msg}", file=sys.stderr)
            if exc.body:
                print(f"[error-body] {exc.body}", file=sys.stderr)
        except Exception as exc:  # unexpected
            msg = f"{model}: {exc}"
            errors.append(msg)
            totals[model] = 0
            print(f"[error] {msg}", file=sys.stderr)

    # Deduplicate by VIN across models, then filter to net-new.
    seen_in_run: set[str] = set()
    unique: list[Vehicle] = []
    for vehicle in all_vehicles:
        if vehicle.vin in seen_in_run:
            continue
        seen_in_run.add(vehicle.vin)
        unique.append(vehicle)

    new_vehicles = [v for v in unique if not store.contains(v.vin)]
    return ScanResult(
        totals=totals,
        new_vehicles=new_vehicles,
        all_vehicles=unique,
        errors=errors,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Scan Tesla RWD inventory and notify via Telegram",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print message to stdout; do not send Telegram or update state",
    )
    parser.add_argument(
        "--fixture",
        help="Use a local JSON fixture instead of calling Tesla (testing)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="as_json",
        help="Emit machine-readable JSON summary to stdout",
    )
    parser.add_argument(
        "--mark-seen",
        action="store_true",
        help="Persist newly found VINs even in --dry-run",
    )
    args = parser.parse_args(argv)

    settings = Settings.from_env()
    if args.fixture:
        from pathlib import Path

        settings.fixture_path = Path(args.fixture)

    store = SeenVinStore(settings.state_file)
    result = run_scan(settings, store)

    should_notify_new = bool(result.new_vehicles)
    should_notify_empty = settings.notify_on_empty and not result.new_vehicles and not result.errors
    should_notify_error = settings.notify_on_error and bool(result.errors)

    message = build_telegram_message(
        new_vehicles=result.new_vehicles,
        totals=result.totals,
        settings=settings,
        errors=result.errors if should_notify_error else None,
    )

    if args.as_json:
        payload = {
            "totals": result.totals,
            "new_count": len(result.new_vehicles),
            "new_vins": [v.vin for v in result.new_vehicles],
            "errors": result.errors,
            "message": message,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(message)

    sent = False
    if not args.dry_run and (should_notify_new or should_notify_empty or should_notify_error):
        if not settings.telegram_configured:
            print(
                "[warn] Telegram credentials missing; set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID",
                file=sys.stderr,
            )
            return 2
        notifier = TelegramNotifier(settings.telegram_bot_token, settings.telegram_chat_id)
        notifier.send(message, disable_preview=True)
        sent = True
        print("[ok] Telegram message sent", file=sys.stderr)
    elif args.dry_run:
        print("[dry-run] skipped Telegram send", file=sys.stderr)

    if result.new_vehicles and (not args.dry_run or args.mark_seen):
        store.add_many([v.vin for v in result.new_vehicles])
        store.save()
        print(
            f"[ok] state updated (+{len(result.new_vehicles)} vins → {store.count} total)",
            file=sys.stderr,
        )

    # Soft-fail on Tesla blocks so cron does not spam red X forever;
    # still exit non-zero when there were errors and nothing was notified.
    if result.errors and not sent and not args.dry_run:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
