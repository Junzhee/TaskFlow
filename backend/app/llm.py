from __future__ import annotations

import json
import os
from dataclasses import dataclass

from dotenv import load_dotenv
from openai import OpenAI

from app.models import User

load_dotenv()

SYSTEM_PROMPT = """You split student software project goals into concrete Kanban tasks.
Return strict JSON with shape {"subtasks":[{"title":"","description":"","effort":"S|M|L","suggested_assignee_name":""}]}."""


@dataclass
class DecomposedSubtask:
    title: str
    description: str
    effort: str
    suggested_assignee_id: int | None


def _mock(description: str, members: list[User]) -> list[dict[str, str]]:
    prefix = description.strip().rstrip(".") or "Build the requested feature"
    names = [member.name for member in members] or ["Alice", "Bob", "Carol"]
    return [
        {"title": "Design authentication page layout", "description": f"Create the responsive screen structure for: {prefix}.", "effort": "M", "suggested_assignee_name": names[2 % len(names)]},
        {"title": "Implement email login form", "description": "Build validated email and password fields with loading and error states.", "effort": "M", "suggested_assignee_name": names[0]},
        {"title": "Connect password reset flow", "description": "Wire reset request, confirmation states, and recovery copy for the demo.", "effort": "S", "suggested_assignee_name": names[1 % len(names)]},
        {"title": "Add QA checks for authentication UX", "description": "Verify keyboard navigation, empty states, and responsive behavior.", "effort": "S", "suggested_assignee_name": names[2 % len(names)]},
    ]


def _map(items: list[dict[str, str]], members: list[User]) -> list[DecomposedSubtask]:
    by_name = {member.name.lower(): member.id for member in members}
    mapped: list[DecomposedSubtask] = []
    for item in items[:5]:
        name = str(item.get("suggested_assignee_name", "")).lower()
        mapped.append(
            DecomposedSubtask(
                title=str(item.get("title") or "Untitled subtask")[:180],
                description=str(item.get("description") or ""),
                effort=str(item.get("effort") or "M")[:40],
                suggested_assignee_id=by_name.get(name),
            )
        )
    return mapped


def decompose(description: str, members: list[User], workload: dict[int, int]) -> list[DecomposedSubtask]:
    key = os.getenv("DEEPSEEK_API_KEY")
    if not key:
        return _map(_mock(description, members), members)
    try:
        client = OpenAI(api_key=key, base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"))
        member_lines = "\n".join(f"- {m.name}: {m.skills}; active tasks: {workload.get(m.id, 0)}" for m in members)
        resp = client.chat.completions.create(
            model="deepseek-v4-flash",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Team:\n{member_lines}\n\nGoal: {description}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            timeout=12,
        )
        content = resp.choices[0].message.content or "{}"
        parsed = json.loads(content)
        items = parsed.get("subtasks", [])
        if not isinstance(items, list) or not items:
            raise ValueError("No subtasks returned")
        return _map(items, members)
    except Exception:
        return _map(_mock(description, members), members)
