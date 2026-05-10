from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Membership, Project, User


def get_current_user(
    x_user_id: int | None = Header(default=None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    user_id = x_user_id or 1
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Unknown demo user")
    return user


def require_project_member(project_id: int, user: User, db: Session) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    membership = (
        db.query(Membership)
        .filter(Membership.project_id == project_id, Membership.user_id == user.id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not a project member")
    return project
