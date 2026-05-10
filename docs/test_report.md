# TaskFlow Demo Test Report

This file records verification passes for the ready-to-run TaskFlow demo.

## Full Demo Implementation — 2026-05-11 — PASS

### Acceptance criteria
- [x] Root quickstart exists in `README.md`.
- [x] `./scripts/reset.sh` reseeds the clean demo database.
- [x] `./start.sh` starts FastAPI and Vite and prints the demo URL.
- [x] Login/dashboard routes are implemented.
- [x] Kanban board renders 4 columns and seeded tasks.
- [x] Drag move endpoint persists task column changes.
- [x] Task detail edit and inline add are implemented.
- [x] AI decomposition works without `DEEPSEEK_API_KEY` using deterministic 4-item mock.
- [x] Accepted AI subtasks create To Do task cards.
- [x] Analytics endpoint and page expose progress, burndown, member completion, and workload.
- [x] Bob starts with 3 unread notifications and read toggling decrements unread count.

### Commands
- `cd backend && uv run pytest -x` — PASS, 3 tests.
- `cd frontend && npm run typecheck` — PASS.
- `cd frontend && npm run build` — PASS.
- `./start.sh` — PASS; printed `backend ready on :8000`, `frontend ready on :5173`, and `TaskFlow demo: http://localhost:5173/login`.

### API checks
- `GET /health` — PASS, `{"ok":true}`.
- `GET /api/projects/1/board` as Alice — PASS, 4 columns and 12 tasks with 25% progress.
- `GET /api/users` through Vite proxy on `:5173` — PASS, Alice/Bob/Carol returned.
- `POST /api/projects/1/ai/decompose` as Alice without a key — PASS, 4 mock subtasks.
- `POST /api/ai/results/1/accept` as Alice — PASS, created a To Do task with label `AI`.
- `GET /api/projects/1/analytics` as Alice — PASS, progress `3 / 12`, burndown points, member stats, workload.
- `GET /api/notifications/unread-count` as Bob — PASS, seeded count `3`; after marking one read, count became `2`.

### Gaps
- No browser automation screenshots were captured because no browser automation tool was available in this environment.
- `npm install` reports 2 moderate transitive audit findings; accepted for localhost-only demo scope.
