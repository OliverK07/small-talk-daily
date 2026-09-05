from __future__ import annotations

import json
import os
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT))

from tesla_inventory.client import build_query
from tesla_inventory.config import Settings
from tesla_inventory.models import build_telegram_message, load_fixture, parse_vehicle
from tesla_inventory.scan import run_scan
from tesla_inventory.state import SeenVinStore


class ParseTests(unittest.TestCase):
    def test_parse_vehicle_and_fixture(self) -> None:
        total, vehicles = load_fixture(ROOT / "fixtures" / "my.json", "my")
        self.assertEqual(total, 2)
        self.assertEqual(len(vehicles), 2)
        self.assertEqual(vehicles[0].vin, "XP7YGCEK0SB123001")
        self.assertIn("MYRWD", vehicles[0].option_codes)

    def test_build_query_includes_rwd_trims(self) -> None:
        settings = Settings(market="TW", language="zh_TW", condition="new")
        query = build_query(model="my", settings=settings, trims=["MYRWD"])
        self.assertEqual(query["query"]["options"]["TRIM"], ["MYRWD"])
        self.assertEqual(query["query"]["market"], "TW")

    def test_telegram_message_lists_new_cars(self) -> None:
        _, vehicles = load_fixture(ROOT / "fixtures" / "m3.json", "m3")
        settings = Settings(market="TW", models=["m3"])
        msg = build_telegram_message(
            new_vehicles=vehicles,
            totals={"m3": 1},
            settings=settings,
        )
        self.assertIn("LRW3E7EK5SC456001", msg)
        self.assertIn("NT$", msg)
        self.assertIn("Model 3", msg)


class ScanDedupTests(unittest.TestCase):
    def test_run_scan_reports_only_new_vins(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "seen.json"
            store = SeenVinStore(state_path)
            store.add_many(["XP7YGCEK0SB123001"])
            store.save()

            settings = Settings(
                market="TW",
                models=["my", "m3"],
                state_file=state_path,
                fixture_path=ROOT / "fixtures",
            )
            result = run_scan(settings, store)
            new_vins = {v.vin for v in result.new_vehicles}
            self.assertEqual(new_vins, {"XP7YGCEK0SB123002", "LRW3E7EK5SC456001"})
            self.assertEqual(result.totals["my"], 2)
            self.assertEqual(result.totals["m3"], 1)


class CliSmokeTests(unittest.TestCase):
    def test_dry_run_fixture(self) -> None:
        from tesla_inventory.scan import main

        with tempfile.TemporaryDirectory() as tmp:
            os.environ["STATE_FILE"] = str(Path(tmp) / "seen.json")
            os.environ.pop("TELEGRAM_BOT_TOKEN", None)
            os.environ.pop("TELEGRAM_CHAT_ID", None)
            code = main(["--dry-run", "--fixture", str(ROOT / "fixtures"), "--json"])
            self.assertEqual(code, 0)


if __name__ == "__main__":
    unittest.main()
