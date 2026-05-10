#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR/backend"
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:8000/health >/dev/null 2>&1; then
    echo "backend ready on :8000"
    break
  fi
  sleep 0.5
done

for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
    echo "frontend ready on :5173"
    break
  fi
  sleep 0.5
done

echo "TaskFlow demo: http://localhost:5173/login"
wait "$BACKEND_PID" "$FRONTEND_PID"
