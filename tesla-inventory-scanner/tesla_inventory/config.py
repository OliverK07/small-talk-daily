from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path


DEFAULT_RWD_TRIMS: dict[str, list[str]] = {
    "my": ["MYRWD"],
    "m3": ["M3RWD", "LRRWD"],
}

MODEL_LABELS = {
    "my": "Model Y",
    "m3": "Model 3",
    "ms": "Model S",
    "mx": "Model X",
}


def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    market: str = "TW"
    language: str = "zh_TW"
    super_region: str = "asia pacific"
    condition: str = "new"
    models: list[str] = field(default_factory=lambda: ["my", "m3"])
    trims: dict[str, list[str]] = field(default_factory=lambda: dict(DEFAULT_RWD_TRIMS))
    zip_code: str = ""
    search_range: int = 0
    count: int = 50
    cookie: str = ""
    state_file: Path = Path("data/seen_vins.json")
    notify_on_empty: bool = False
    notify_on_error: bool = True
    fixture_path: Path | None = None

    @property
    def telegram_configured(self) -> bool:
        return bool(self.telegram_bot_token and self.telegram_chat_id)

    @classmethod
    def from_env(cls) -> Settings:
        models_raw = os.getenv("TESLA_MODELS", "my,m3")
        models = [m.strip().lower() for m in models_raw.split(",") if m.strip()]

        trims = dict(DEFAULT_RWD_TRIMS)
        trims_raw = os.getenv("TESLA_TRIMS", "").strip()
        if trims_raw:
            parsed = json.loads(trims_raw)
            if not isinstance(parsed, dict):
                raise ValueError("TESLA_TRIMS must be a JSON object")
            trims = {str(k).lower(): list(v) for k, v in parsed.items()}

        fixture = os.getenv("TESLA_FIXTURE", "").strip()
        return cls(
            telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN", "").strip(),
            telegram_chat_id=os.getenv("TELEGRAM_CHAT_ID", "").strip(),
            market=os.getenv("TESLA_MARKET", "TW").strip() or "TW",
            language=os.getenv("TESLA_LANGUAGE", "zh_TW").strip() or "zh_TW",
            super_region=os.getenv("TESLA_SUPER_REGION", "asia pacific").strip()
            or "asia pacific",
            condition=os.getenv("TESLA_CONDITION", "new").strip() or "new",
            models=models or ["my", "m3"],
            trims=trims,
            zip_code=os.getenv("TESLA_ZIP", "").strip(),
            search_range=int(os.getenv("TESLA_RANGE", "0") or "0"),
            count=int(os.getenv("TESLA_COUNT", "50") or "50"),
            cookie=os.getenv("TESLA_COOKIE", "").strip(),
            state_file=Path(os.getenv("STATE_FILE", "data/seen_vins.json")),
            notify_on_empty=_env_bool("NOTIFY_ON_EMPTY", False),
            notify_on_error=_env_bool("NOTIFY_ON_ERROR", True),
            fixture_path=Path(fixture) if fixture else None,
        )
