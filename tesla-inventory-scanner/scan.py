#!/usr/bin/env python3
"""CLI entrypoint: python scan.py [--dry-run] [--fixture path]"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tesla_inventory.scan import main

if __name__ == "__main__":
    raise SystemExit(main())
