# Tesla RWD Inventory Scanner

Periodically scans Tesla **rear-wheel-drive (後驅 / RWD)** new inventory and sends Telegram alerts when new cars appear.

Default target: **Taiwan (`TW`)** · Model Y `MYRWD` · Model 3 `M3RWD` / `LRRWD`.

## How it works

1. Query Tesla public inventory API (`/inventory/api/v4/inventory-results`) with RWD trim filters.
2. Compare VINs against a local state file (`data/seen_vins.json`).
3. Send a Telegram message only for **net-new** VINs (optional heartbeat / error alerts).

## Quick start (local)

```bash
cd tesla-inventory-scanner
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 1) Create a Telegram bot via @BotFather, then get your chat id
# 2) Copy config and fill secrets
cp config.example.env .env
set -a && source .env && set +a

# Dry-run against fixtures (no Tesla / Telegram calls)
python scan.py --dry-run --fixture fixtures --json

# Live scan (may need cookie / residential proxy — see below)
python scan.py --dry-run
python scan.py
```

### Telegram setup

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. Start a chat with your bot, then open  
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id`.  
   For a group, add the bot and use the negative group chat id.
3. Set secrets:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

## GitHub Actions (scheduled)

Workflow: `.github/workflows/tesla-rwd-inventory.yml`

- Runs every **30 minutes** (and on manual `workflow_dispatch`).
- Caches `data/seen_vins.json` so the same VIN is not re-alerted.
- Required repository **Secrets**:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
- Optional repository **Variables** (or secrets):
  - `TESLA_MARKET` (default `TW`)
  - `TESLA_LANGUAGE` (default `zh_TW`)
  - `TESLA_MODELS` (default `my,m3`)
  - `TESLA_COOKIE` — browser Cookie header (helps when Akamai blocks runners)
  - `HTTPS_PROXY` — residential proxy URL if datacenter IPs are blocked
  - `NOTIFY_ON_EMPTY` / `NOTIFY_ON_ERROR`

## Akamai / 403 note

Tesla protects inventory with Akamai Bot Manager. Datacenter IPs (Cloud Agent VMs, many GitHub-hosted runners, Cloudflare Workers egress) often get `403` / `429`.

Mitigations, in order:

1. **Run locally** on a home / office network (`python scan.py`).
2. Set **`TESLA_COOKIE`**: open Tesla inventory in a real browser → DevTools → Network → `inventory-results` → copy the `cookie` request header.
3. Set **`HTTPS_PROXY`** to a residential proxy.
4. Keep `NOTIFY_ON_ERROR=true` so Telegram still tells you when scans fail.

## Configuration

| Env var | Default | Meaning |
|---|---|---|
| `TESLA_MARKET` | `TW` | Market code |
| `TESLA_LANGUAGE` | `zh_TW` | Language |
| `TESLA_MODELS` | `my,m3` | Models to scan |
| `TESLA_TRIMS` | built-in RWD map | JSON override, e.g. `{"my":["MYRWD"]}` |
| `TESLA_CONDITION` | `new` | `new` / `used` |
| `TESLA_COUNT` | `50` | Page size |
| `STATE_FILE` | `data/seen_vins.json` | Seen VIN store |
| `NOTIFY_ON_EMPTY` | `false` | Heartbeat when nothing new |
| `NOTIFY_ON_ERROR` | `true` | Alert on API failures |

## Tests

```bash
cd tesla-inventory-scanner
python -m unittest discover -s tests -v
```
