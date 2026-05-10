# TaskFlow Backend

```bash
uv sync
uv run python -m app.seed
uv run uvicorn app.main:app --reload
```

The AI route uses DeepSeek when `DEEPSEEK_API_KEY` is set. Without a key, it returns deterministic demo subtasks.
