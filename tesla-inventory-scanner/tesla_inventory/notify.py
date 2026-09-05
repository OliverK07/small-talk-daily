from __future__ import annotations

import json
import urllib.error
import urllib.request


TELEGRAM_API = "https://api.telegram.org"


class TelegramNotifier:
    def __init__(self, bot_token: str, chat_id: str) -> None:
        self.bot_token = bot_token
        self.chat_id = chat_id

    def send(self, text: str, *, disable_preview: bool = False) -> dict:
        url = f"{TELEGRAM_API}/bot{self.bot_token}/sendMessage"
        # Telegram hard-limits messages at 4096 chars.
        chunks = _chunk_text(text, 4000)
        last: dict = {}
        for chunk in chunks:
            payload = {
                "chat_id": self.chat_id,
                "text": chunk,
                "disable_web_page_preview": disable_preview,
            }
            last = _post_json(url, payload)
        return last


def _chunk_text(text: str, limit: int) -> list[str]:
    if len(text) <= limit:
        return [text]
    chunks: list[str] = []
    current: list[str] = []
    size = 0
    for line in text.splitlines():
        # +1 for newline rejoined later
        add = len(line) + (1 if current else 0)
        if current and size + add > limit:
            chunks.append("\n".join(current))
            current = [line]
            size = len(line)
        else:
            current.append(line)
            size += add
    if current:
        chunks.append("\n".join(current))
    return chunks


def _post_json(url: str, payload: dict) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Telegram HTTP {exc.code}: {detail}") from exc
