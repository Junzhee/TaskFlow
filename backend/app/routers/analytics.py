from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_project_member
from app.db import get_db
from app.models import Membership, Task, User

router = APIRouter(prefix="/api/projects", tags=["analytics"])


@router.get("/{project_id}/analytics")
def project_analytics(project_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = require_project_member(project_id, user, db)
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    completed = [task for task in tasks if task.completed_at is not None]
    total = len(tasks)
    percent = round(len(completed) / total * 100) if total else 0

    start = min([project.created_at] + [task.created_at for task in tasks]).date()
    today = max([task.completed_at.date() for task in completed] + [project.created_at.date()])
    today = max(today, project.created_at.date())
    days = max((today - start).days, 6)
    burndown = []
    for offset in range(days + 1):
        day = start + timedelta(days=offset)
        completed_by_day = sum(1 for task in completed if task.completed_at and task.completed_at.date() <= day)
        burndown.append({"date": day.isoformat(), "remaining": max(total - completed_by_day, 0), "completed": completed_by_day})

    members = (
        db.query(User)
        .join(Membership, Membership.user_id == User.id)
        .filter(Membership.project_id == project_id)
        .order_by(User.id)
        .all()
    )
    member_stats = []
    workload = []
    for member in members:
        owned = [task for task in tasks if task.assignee_id == member.id]
        done = [task for task in owned if task.completed_at is not None]
        member_stats.append(
            {
                "user_id": member.id,
                "name": member.name,
                "completed": len(done),
                "total": len(owned),
                "percent": round(len(done) / len(owned) * 100) if owned else 0,
            }
        )
        workload.append({"user_id": member.id, "name": member.name, "value": len(owned)})

    return {
        "progress": {"total": total, "completed": len(completed), "percent": percent},
        "burndown": burndown,
        "member_stats": member_stats,
        "workload": workload,
    }
