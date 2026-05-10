#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

rm -f "$ROOT_DIR/backend/taskflow.db"
cd "$ROOT_DIR/backend"
uv run python -m app.seed
