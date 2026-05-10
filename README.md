# TaskFlow

Ready-to-run local demo for the SC6105 TaskFlow project.

## Quickstart

```bash
cd /home/ubuntu/jz_code/TaskFlow
cp backend/.env.example backend/.env
cd backend && uv sync && cd ..
cd frontend && npm install && cd ..
./scripts/reset.sh
./start.sh
```

Open `http://localhost:5173/login`.

`DEEPSEEK_API_KEY` in `backend/.env` is optional. If it is not set, the AI decomposition scene uses the deterministic offline mock so the demo still works without internet access.

## Demo Flow

Follow [docs/demo_flow.md](docs/demo_flow.md) for the recording steps and English narration.
