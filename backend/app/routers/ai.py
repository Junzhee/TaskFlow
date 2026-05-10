from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.auth import get_current_user, require_project_member
from app.db import get_db
from app.llm import decompose
from app.models import AIRequest, KanbanColumn, Membership, Notification, Subtask, Task, User
from app.schemas import AcceptSubtaskRequest, DecomposeRequest, RejectSubtaskRequest
from app.serializers import subtask_out, task_out

router = APIRouter(tags=["ai"])


def _todo_column(db: Session, project_id: int) -> KanbanColumn:
    column = (
        db.query(KanbanColumn)
        .filter(KanbanColumn.project_id == project_id, KanbanColumn.status_key == "todo")
        .order_by(KanbanColumn.position)
        .first()
    )
    if not column:
        raise HTTPException(status_code=500, detail="Project has no To Do column")
    return column


@router.post("/api/projects/{project_id}/ai/decompose")
def decompose_project_goal(
    project_id: int,
    payload: DecomposeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_project_member(project_id, user, db)
    members = (
        db.query(User)
        .join(Membership, Membership.user_id == User.id)
        .filter(Membership.project_id == project_id)
        .order_by(User.id)
        .all()
    )
    counts = dict(
        db.query(Task.assignee_id, func.count(Task.id))
        .filter(Task.project_id == project_id, Task.completed_at.is_(None), Task.assignee_id.isnot(None))
        .group_by(Task.assignee_id)
        .all()
    )
    request = AIRequest(project_id=project_id, user_id=user.id, description=payload.description, status="completed")
    db.add(request)
    db.flush()
    for item in decompose(payload.description, members, counts):
        db.add(
            Subtask(
                request_id=request.id,
                title=item.title,
                description=item.description,
                effort=item.effort,
                suggested_assignee_id=item.suggested_assignee_id,
            )
        )
    db.commit()
    db.refresh(request)
    request = (
        db.query(AIRequest)
        .options(selectinload(AIRequest.subtasks).selectinload(Subtask.suggested_assignee))
        .filter(AIRequest.id == request.id)
        .one()
    )
    return {"request_id": request.id, "subtasks": [subtask_out(item) for item in request.subtasks]}


@router.post("/api/ai/results/{result_id}/accept", status_code=status.HTTP_201_CREATED)
def accept_subtask(
    result_id: int,
    payload: AcceptSubtaskRequest | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subtask_id = payload.subtask_id if payload else result_id
    subtask = db.get(Subtask, subtask_id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    request = db.get(AIRequest, subtask.request_id)
    if not request:
        raise HTTPException(status_code=404, detail="AI request not found")
    require_project_member(request.project_id, user, db)
    column = _todo_column(db, request.project_id)
    max_position = db.query(func.max(Task.position)).filter(Task.column_id == column.id).scalar()
    assignee_id = payload.assignee_id if payload and payload.assignee_id is not None else subtask.suggested_assignee_id
    task = Task(
        project_id=request.project_id,
        column_id=column.id,
        title=(payload.title if payload and payload.title else subtask.title),
        description=(payload.description if payload and payload.description else subtask.description),
        assignee_id=assignee_id,
        label="AI",
        position=int(max_position if max_position is not None else -1) + 1,
        created_at=datetime.utcnow(),
    )
    db.add(task)
    subtask.review_status = "accepted"
    db.flush()
    if task.assignee_id and task.assignee_id != user.id:
        db.add(
            Notification(
                user_id=task.assignee_id,
                type="TASK_ASSIGNED",
                message=f"{user.name} assigned you a task: {task.title}",
                related_task_id=task.id,
                created_at=datetime.utcnow(),
            )
        )
    db.commit()
    db.refresh(task)
    return task_out(task)


@router.post("/api/ai/results/{result_id}/reject")
def reject_subtask(
    result_id: int,
    payload: RejectSubtaskRequest | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subtask_id = payload.subtask_id if payload else result_id
    subtask = db.get(Subtask, subtask_id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    request = db.get(AIRequest, subtask.request_id)
    if not request:
        raise HTTPException(status_code=404, detail="AI request not found")
    require_project_member(request.project_id, user, db)
    subtask.review_status = "rejected"
    db.commit()
    return subtask_out(subtask)
