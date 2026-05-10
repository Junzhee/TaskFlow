from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_project_member
from app.db import get_db
from app.models import KanbanColumn, Notification, Task, User
from app.schemas import TaskCreate, TaskMove, TaskUpdate
from app.serializers import task_out

router = APIRouter(tags=["tasks"])


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _get_task(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def _max_position(db: Session, column_id: int) -> int:
    value = db.query(func.max(Task.position)).filter(Task.column_id == column_id).scalar()
    return int(value if value is not None else -1)


def _normalize_column_positions(db: Session, column_id: int) -> None:
    tasks = db.query(Task).filter(Task.column_id == column_id).order_by(Task.position, Task.id).all()
    for index, task in enumerate(tasks):
        task.position = index


def _notify_assignment(db: Session, task: Task, actor: User, assignee_id: int | None) -> None:
    if assignee_id is None or assignee_id == actor.id:
        return
    db.add(
        Notification(
            user_id=assignee_id,
            type="TASK_ASSIGNED",
            message=f"{actor.name} assigned you a task: {task.title}",
            related_task_id=task.id,
            is_read=False,
            created_at=_now(),
        )
    )


@router.post("/api/projects/{project_id}/tasks", status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = require_project_member(project_id, user, db)
    column = db.get(KanbanColumn, payload.column_id) if payload.column_id else None
    if column is None:
        column = (
            db.query(KanbanColumn)
            .filter(KanbanColumn.project_id == project.id, KanbanColumn.status_key == "todo")
            .order_by(KanbanColumn.position)
            .first()
        )
    if column is None or column.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid column")

    task = Task(
        project=project,
        column=column,
        title=payload.title,
        description=payload.description,
        assignee_id=payload.assignee_id,
        deadline=payload.deadline,
        label=payload.label,
        position=_max_position(db, column.id) + 1,
        completed_at=_now() if column.status_key == "done" else None,
    )
    db.add(task)
    db.flush()
    _notify_assignment(db, task, user, payload.assignee_id)
    db.commit()
    db.refresh(task)
    return task_out(task)


@router.patch("/api/tasks/{task_id}")
def update_task(
    task_id: int,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_task(db, task_id)
    require_project_member(task.project_id, user, db)
    old_assignee = task.assignee_id
    old_column_id = task.column_id
    data = payload.model_dump(exclude_unset=True)

    if "column_id" in data and data["column_id"] is not None:
        column = db.get(KanbanColumn, data["column_id"])
        if column is None or column.project_id != task.project_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid column")
        task.column = column
        if column.status_key == "done" and task.completed_at is None:
            task.completed_at = _now()
        elif column.status_key != "done":
            task.completed_at = None
        task.position = _max_position(db, column.id) + 1
        data.pop("column_id")

    for key, value in data.items():
        setattr(task, key, value)

    if task.assignee_id != old_assignee:
        _notify_assignment(db, task, user, task.assignee_id)
    if old_column_id != task.column_id:
        _normalize_column_positions(db, old_column_id)
        _normalize_column_positions(db, task.column_id)

    db.commit()
    db.refresh(task)
    return task_out(task)


@router.patch("/api/tasks/{task_id}/move")
def move_task(
    task_id: int,
    payload: TaskMove,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_task(db, task_id)
    require_project_member(task.project_id, user, db)
    target = db.get(KanbanColumn, payload.column_id)
    if target is None or target.project_id != task.project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid column")

    old_column_id = task.column_id
    task.column = target
    task.position = payload.position
    if target.status_key == "done" and task.completed_at is None:
        task.completed_at = _now()
    elif target.status_key != "done":
        task.completed_at = None

    if target.status_key == "review" and task.assignee_id and task.assignee_id != user.id:
        db.add(
            Notification(
                user_id=task.assignee_id,
                type="STATUS_CHANGED",
                message=f"Task moved to Review: {task.title}",
                related_task_id=task.id,
                is_read=False,
                created_at=_now(),
            )
        )

    db.flush()
    _normalize_column_positions(db, old_column_id)
    _normalize_column_positions(db, target.id)
    db.commit()
    db.refresh(task)
    return task_out(task)


@router.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = _get_task(db, task_id)
    require_project_member(task.project_id, user, db)
    column_id = task.column_id
    db.delete(task)
    db.flush()
    _normalize_column_positions(db, column_id)
    db.commit()
    return None
