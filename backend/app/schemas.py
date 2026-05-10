from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    avatar_color: str
    skills: str


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    deadline: datetime
    owner_id: int
    progress_percent: int
    task_count: int
    completed_count: int


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    column_id: int | None = None
    assignee_id: int | None = None
    deadline: datetime | None = None
    label: str = "General"


class TaskPatch(BaseModel):
    title: str | None = None
    description: str | None = None
    assignee_id: int | None = None
    deadline: datetime | None = None
    label: str | None = None


TaskUpdate = TaskPatch


class TaskMove(BaseModel):
    column_id: int
    position: int


class DecomposeRequest(BaseModel):
    description: str


class AcceptSubtaskRequest(BaseModel):
    subtask_id: int
    title: str | None = None
    description: str | None = None
    assignee_id: int | None = None


class RejectSubtaskRequest(BaseModel):
    subtask_id: int
