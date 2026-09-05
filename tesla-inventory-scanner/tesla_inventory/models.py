from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .config import MODEL_LABELS, Settings


@dataclass(frozen=True)
class Vehicle:
    vin: str
    model: str
    trim_name: str
    year: int | None
    price: int | None
    paint: str
    interior: str
    wheels: str
    city: str
    is_demo: bool
    option_codes: list[str]

    @property
    def model_label(self) -> str:
        return MODEL_LABELS.get(self.model, self.model.upper())

    def inventory_url(self, settings: Settings) -> str:
        if settings.market.upper() == "TW":
            return (
                f"https://www.tesla.com/zh_tw/inventory/{settings.condition}/"
                f"{self.model}?query={self.vin}"
            )
        return (
            f"https://www.tesla.com/inventory/{settings.condition}/"
            f"{self.model}?query={self.vin}"
        )


def _first_str(value: Any) -> str:
    if isinstance(value, list) and value:
        return str(value[0])
    if value is None:
        return ""
    return str(value)


def _option_codes(raw: dict[str, Any]) -> list[str]:
    codes = raw.get("OptionCodeList") or raw.get("optionCodeList") or []
    if isinstance(codes, str):
        return [c.strip() for c in codes.split(",") if c.strip()]
    if isinstance(codes, list):
        return [str(c) for c in codes]
    return []


def parse_vehicle(raw: dict[str, Any], fallback_model: str) -> Vehicle | None:
    vin = str(raw.get("VIN") or raw.get("vin") or "").strip()
    if not vin:
        return None

    model = str(raw.get("Model") or raw.get("model") or fallback_model).lower()
    price = raw.get("TotalPrice")
    if price is None:
        price = raw.get("Price")
    year = raw.get("Year")
    try:
        year_i = int(year) if year is not None else None
    except (TypeError, ValueError):
        year_i = None
    try:
        price_i = int(price) if price is not None else None
    except (TypeError, ValueError):
        price_i = None

    return Vehicle(
        vin=vin,
        model=model,
        trim_name=str(raw.get("TrimName") or raw.get("trimName") or "RWD"),
        year=year_i,
        price=price_i,
        paint=_first_str(raw.get("PAINT") or raw.get("Paint")),
        interior=_first_str(raw.get("INTERIOR") or raw.get("Interior")),
        wheels=_first_str(raw.get("WHEELS") or raw.get("Wheels")),
        city=str(raw.get("City") or raw.get("city") or ""),
        is_demo=bool(raw.get("IsDemo") or raw.get("isDemo")),
        option_codes=_option_codes(raw),
    )


def normalize_results(payload: Any, fallback_model: str) -> list[Vehicle]:
    """Tesla sometimes returns results as a list, sometimes as a single object."""
    if isinstance(payload, dict):
        results = payload.get("results", [])
    else:
        results = payload

    if isinstance(results, dict):
        results = [results]
    if not isinstance(results, list):
        return []

    vehicles: list[Vehicle] = []
    for item in results:
        if not isinstance(item, dict):
            continue
        vehicle = parse_vehicle(item, fallback_model)
        if vehicle:
            vehicles.append(vehicle)
    return vehicles


def load_fixture(path: Path, fallback_model: str) -> tuple[int, list[Vehicle]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    total = int(data.get("total_matches_found") or len(data.get("results") or []))
    return total, normalize_results(data, fallback_model)


def format_price(price: int | None, market: str) -> str:
    if price is None:
        return "n/a"
    if market.upper() == "TW":
        return f"NT${price:,}"
    if market.upper() in {"DE", "NL", "AT", "BE", "FR", "ES", "IT"}:
        return f"€{price:,}"
    if market.upper() == "GB":
        return f"£{price:,}"
    return f"${price:,}"


def format_vehicle_line(vehicle: Vehicle, settings: Settings) -> str:
    bits = [
        f"• {vehicle.year or '?'} {vehicle.model_label} {vehicle.trim_name}",
        format_price(vehicle.price, settings.market),
    ]
    extras = [x for x in [vehicle.paint, vehicle.interior, vehicle.wheels, vehicle.city] if x]
    if extras:
        bits.append(" / ".join(extras))
    if vehicle.is_demo:
        bits.append("DEMO")
    bits.append(f"`{vehicle.vin}`")
    bits.append(vehicle.inventory_url(settings))
    return "\n  ".join(bits)


def build_telegram_message(
    *,
    new_vehicles: list[Vehicle],
    totals: dict[str, int],
    settings: Settings,
    errors: list[str] | None = None,
) -> str:
    lines: list[str] = []
    market = settings.market.upper()
    condition = settings.condition

    if new_vehicles:
        lines.append(f"🚗 Tesla RWD inventory — {len(new_vehicles)} new ({market}/{condition})")
        lines.append("")
        for vehicle in new_vehicles:
            lines.append(format_vehicle_line(vehicle, settings))
            lines.append("")
    else:
        lines.append(f"👀 Tesla RWD scan — no new cars ({market}/{condition})")

    summary = ", ".join(
        f"{MODEL_LABELS.get(m, m)}={totals.get(m, 0)}" for m in settings.models
    )
    lines.append(f"In stock now: {summary}")

    if errors:
        lines.append("")
        lines.append("⚠️ Errors:")
        for err in errors:
            lines.append(f"- {err}")

    return "\n".join(lines).strip()
