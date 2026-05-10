from __future__ import annotations

from app.models import KanbanColumn, Notification, Project, Subtask, Task, User


def user_out(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_color": user.avatar_color,
        "skills": user.skills,
    }


def task_out(task: Task) -> dict:
    return {
        "id": task.id,
        "project_id": task.project_id,
        "column_id": task.column_id,
        "title": task.title,
        "description": task.description,
        "assignee_id": task.assignee_id,
        "assignee": user_out(task.assignee) if task.assignee else None,
        "deadline": task.deadline,
        "label": task.label,
        "position": task.position,
        "created_at": task.created_at,
        "completed_at": task.completed_at,
    }


def column_out(column: KanbanColumn) -> dict:
    return {
        "id": column.id,
        "project_id": column.project_id,
        "name": column.name,
        "position": column.position,
        "status_key": column.status_key,
        "tasks": [task_out(task) for task in sorted(column.tasks, key=lambda item: (item.position, item.id))],
    }


def project_out(project: Project, role: str | None = None, progress: int | None = None) -> dict:
    data = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "deadline": project.deadline,
        "owner_id": project.owner_id,
        "created_at": project.created_at,
    }
    if role is not None:
        data["role"] = role
    if progress is not None:
        data["progress"] = progress
        data["progress_percent"] = progress
    return data


def notification_out(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "type": notification.type,
        "message": notification.message,
        "related_task_id": notification.related_task_id,
        "is_read": notification.is_read,
        "created_at": notification.created_at,
    }


def subtask_out(subtask: Subtask) -> dict:
    return {
        "id": subtask.id,
        "request_id": subtask.request_id,
        "title": subtask.title,
        "description": subtask.description,
        "effort": subtask.effort,
        "suggested_assignee_id": subtask.suggested_assignee_id,
        "suggested_assignee": user_out(subtask.suggested_assignee) if subtask.suggested_assignee else None,
        "review_status": subtask.review_status,
    }
