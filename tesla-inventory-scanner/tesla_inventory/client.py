from __future__ import annotations

import json
import os
from typing import Any
from urllib.parse import quote

from .config import Settings
from .models import Vehicle, load_fixture, normalize_results


API_URL = "https://www.tesla.com/inventory/api/v4/inventory-results"


class TeslaInventoryError(RuntimeError):
    def __init__(self, message: str, *, status: int | None = None, body: str = "") -> None:
        super().__init__(message)
        self.status = status
        self.body = body


def build_query(
    *,
    model: str,
    settings: Settings,
    trims: list[str],
    offset: int = 0,
) -> dict[str, Any]:
    options: dict[str, Any] = {}
    if trims:
        options["TRIM"] = trims

    query: dict[str, Any] = {
        "model": model,
        "condition": settings.condition,
        "options": options,
        "arrangeby": "Price",
        "order": "asc",
        "market": settings.market,
        "language": settings.language,
        "super_region": settings.super_region,
    }
    if settings.zip_code:
        query["zip"] = settings.zip_code
        query["range"] = settings.search_range

    return {
        "query": query,
        "offset": offset,
        "count": settings.count,
        "outsideOffset": 0,
        "outsideSearch": False,
    }


def _headers(settings: Settings, model: str) -> dict[str, str]:
    if settings.market.upper() == "TW":
        referer = f"https://www.tesla.com/zh_tw/inventory/{settings.condition}/{model}"
        accept_language = "zh-TW,zh;q=0.9,en;q=0.8"
    else:
        referer = f"https://www.tesla.com/inventory/{settings.condition}/{model}"
        accept_language = "en-US,en;q=0.9"

    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": accept_language,
        "Referer": referer,
        "Origin": "https://www.tesla.com",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
    }
    if settings.cookie:
        headers["Cookie"] = settings.cookie
    return headers


def fetch_inventory_page(model: str, settings: Settings, *, offset: int = 0) -> dict[str, Any]:
    """Fetch one page from Tesla inventory API using Chrome TLS impersonation."""
    try:
        from curl_cffi import requests as cf_requests
    except ImportError as exc:  # pragma: no cover
        raise TeslaInventoryError(
            "curl_cffi is required. Install with: pip install -r requirements.txt"
        ) from exc

    trims = settings.trims.get(model, [])
    query = build_query(model=model, settings=settings, trims=trims, offset=offset)
    url = f"{API_URL}?query={quote(json.dumps(query, separators=(',', ':')))}"

    proxies = None
    proxy = os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY") or os.getenv("https_proxy")
    if proxy:
        proxies = {"https": proxy, "http": proxy}

    # Prefer Chrome impersonation; fall back to Safari if Chrome gets hard-blocked.
    last_error: Exception | None = None
    for impersonate in ("chrome131", "chrome124", "safari17_0"):
        try:
            resp = cf_requests.get(
                url,
                headers=_headers(settings, model),
                impersonate=impersonate,
                proxies=proxies,
                timeout=45,
            )
        except Exception as exc:  # network / TLS failures
            last_error = exc
            continue

        if resp.status_code == 200:
            try:
                return resp.json()
            except Exception as exc:
                raise TeslaInventoryError(
                    f"Invalid JSON from Tesla ({impersonate})",
                    status=200,
                    body=resp.text[:500],
                ) from exc

        body = resp.text[:500]
        # Challenge / soft block — try next fingerprint.
        if resp.status_code in {403, 429} and impersonate != "safari17_0":
            last_error = TeslaInventoryError(
                f"Tesla blocked request ({impersonate}) HTTP {resp.status_code}",
                status=resp.status_code,
                body=body,
            )
            continue

        raise TeslaInventoryError(
            f"Tesla inventory HTTP {resp.status_code} via {impersonate}. "
            "Copy a fresh Cookie from browser DevTools into TESLA_COOKIE, "
            "or set HTTPS_PROXY to a residential proxy.",
            status=resp.status_code,
            body=body,
        )

    raise TeslaInventoryError(f"Tesla inventory request failed: {last_error}")


def fetch_model_inventory(model: str, settings: Settings) -> tuple[int, list[Vehicle]]:
    if settings.fixture_path:
        # Fixture mode supports a single shared file or model-specific suffix.
        path = settings.fixture_path
        if path.is_dir():
            path = path / f"{model}.json"
        return load_fixture(path, model)

    data = fetch_inventory_page(model, settings)
    total = int(data.get("total_matches_found") or 0)
    vehicles = normalize_results(data, model)
    return total, vehicles
