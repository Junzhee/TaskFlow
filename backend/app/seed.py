from datetime import datetime, timedelta

from app.db import SessionLocal, init_db
from app.models import KanbanColumn, Membership, Notification, Project, Task, User


def seed_demo_data() -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.query(Project).filter(Project.name == "SC6105 Group Project").first():
            return

        now = datetime.utcnow().replace(microsecond=0)
        users = [
            User(id=1, name="Alice", email="alice@taskflow.demo", avatar_color="#D94F45", skills="Frontend, React, project coordination"),
            User(id=2, name="Bob", email="bob@taskflow.demo", avatar_color="#2F6F73", skills="Backend APIs, database design, CI"),
            User(id=3, name="Carol", email="carol@taskflow.demo", avatar_color="#8A6F3F", skills="UX design, QA, documentation"),
        ]
        db.add_all(users)
        project = Project(
            id=1,
            name="SC6105 Group Project",
            description="AI-powered project management demo for a student software engineering team.",
            deadline=now + timedelta(days=14),
            owner_id=1,
            created_at=now - timedelta(days=9),
        )
        db.add(project)
        db.flush()
        db.add_all(
            [
                Membership(project_id=1, user_id=1, role="Owner"),
                Membership(project_id=1, user_id=2, role="Member"),
                Membership(project_id=1, user_id=3, role="Member"),
            ]
        )
        columns = [
            KanbanColumn(id=1, project_id=1, name="To Do", position=0, status_key="todo"),
            KanbanColumn(id=2, project_id=1, name="In Progress", position=1, status_key="doing"),
            KanbanColumn(id=3, project_id=1, name="Review", position=2, status_key="review"),
            KanbanColumn(id=4, project_id=1, name="Done", position=3, status_key="done"),
        ]
        db.add_all(columns)
        tasks = [
            (1, "Write API spec", "Define REST contracts for board, AI, analytics, and notifications.", 2, "Backend", 0, 5, None),
            (1, "Design notification states", "Prepare unread, read, hover, and empty notification designs.", 3, "UX", 1, 6, None),
            (1, "Set up CI", "Add test commands and a short release checklist for the team.", 2, "DevOps", 2, 7, None),
            (1, "Prepare demo narration", "Turn the storyboard into a concise English voiceover.", 1, "Docs", 3, 4, None),
            (2, "Implement login API", "Wire seeded user selection to the backend user endpoint.", 2, "Backend", 0, 3, None),
            (2, "Build Kanban drag interaction", "Connect drag updates to the move endpoint with optimistic UI.", 1, "Frontend", 1, 4, None),
            (2, "Create AI prompt template", "Include team skills and workload in the decomposition prompt.", 1, "AI", 2, 5, None),
            (3, "Review project proposal", "Check the proposal against the final SRS requirements.", 3, "QA", 0, 2, None),
            (3, "Polish dashboard copy", "Make project cards easy to scan during screen recording.", 3, "UX", 1, 3, None),
            (4, "Draft project proposal", "Complete the initial problem statement and scope.", 1, "Docs", 0, -6, now - timedelta(days=6)),
            (4, "Design Kanban mockup", "Create the first visual layout for columns and task cards.", 3, "UX", 1, -4, now - timedelta(days=4)),
            (4, "Build burndown chart component", "Render the first analytics prototype with seeded data.", 1, "Analytics", 2, -2, now - timedelta(days=2)),
        ]
        for idx, (column_id, title, description, assignee_id, label, position, due_in, completed_at) in enumerate(tasks, start=1):
            db.add(
                Task(
                    id=idx,
                    project_id=1,
                    column_id=column_id,
                    title=title,
                    description=description,
                    assignee_id=assignee_id,
                    deadline=now + timedelta(days=due_in),
                    label=label,
                    position=position,
                    created_at=now - timedelta(days=9 - min(idx, 8)),
                    completed_at=completed_at,
                )
            )
        db.add_all(
            [
                Notification(user_id=2, type="TASK_ASSIGNED", message="Alice assigned you a task: Implement login API", related_task_id=5, created_at=now - timedelta(hours=1)),
                Notification(user_id=2, type="STATUS_CHANGED", message="Task moved to Review: Write API spec", related_task_id=1, created_at=now - timedelta(minutes=30)),
                Notification(user_id=2, type="TASK_ASSIGNED", message="Alice assigned you a task: Set up CI", related_task_id=3, created_at=now - timedelta(minutes=10)),
            ]
        )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
    print("Seeded TaskFlow demo data.")
