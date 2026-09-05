from __future__ import annotations

import json
from pathlib import Path


class SeenVinStore:
    """Persists previously reported VINs so Telegram only gets net-new cars."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._vins: set[str] = set()
        self._loaded = False

    def load(self) -> None:
        if self._loaded:
            return
        self._loaded = True
        if not self.path.exists():
            return
        data = json.loads(self.path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            self._vins = {str(v) for v in data}
        elif isinstance(data, dict):
            self._vins = {str(v) for v in data.get("vins", [])}

    def contains(self, vin: str) -> bool:
        self.load()
        return vin in self._vins

    def add_many(self, vins: list[str]) -> None:
        self.load()
        self._vins.update(vins)

    def save(self) -> None:
        self.load()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"vins": sorted(self._vins)}
        self.path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    @property
    def count(self) -> int:
        self.load()
        return len(self._vins)
