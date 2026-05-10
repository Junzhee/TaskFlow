from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from app.auth import get_current_user, require_project_member
from app.db import get_db
from app.models import KanbanColumn, Membership, Project, Task, User
from app.serializers import column_out, project_out, user_out

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _progress(tasks: list[Task]) -> int:
    if not tasks:
        return 0
    done = sum(1 for task in tasks if task.completed_at is not None)
    return round(done / len(tasks) * 100)


@router.get("")
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = (
        db.query(Membership)
        .join(Project)
        .options(selectinload(Membership.project).selectinload(Project.tasks))
        .filter(Membership.user_id == user.id)
        .order_by(Project.created_at)
        .all()
    )
    data = []
    for membership in memberships:
        project = membership.project
        item = project_out(project, role=membership.role, progress=_progress(project.tasks))
        item["total_tasks"] = len(project.tasks)
        item["completed_tasks"] = sum(1 for task in project.tasks if task.completed_at is not None)
        item["member_count"] = len(project.memberships)
        data.append(item)
    return data


@router.get("/{project_id}/board")
def get_board(project_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = require_project_member(project_id, user, db)
    columns = (
        db.query(KanbanColumn)
        .options(
            selectinload(KanbanColumn.tasks).selectinload(Task.assignee),
        )
        .filter(KanbanColumn.project_id == project_id)
        .order_by(KanbanColumn.position)
        .all()
    )
    members = (
        db.query(User)
        .join(Membership, Membership.user_id == User.id)
        .filter(Membership.project_id == project_id)
        .order_by(User.id)
        .all()
    )
    return {
        "project": project_out(project, progress=_progress(project.tasks)),
        "members": [user_out(member) for member in members],
        "columns": [column_out(column) for column in columns],
    }
