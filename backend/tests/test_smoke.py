from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_seeded_users_projects_board_and_notifications():
    users = client.get("/api/users").json()
    assert [user["name"] for user in users] == ["Alice", "Bob", "Carol"]

    projects = client.get("/api/projects", headers={"X-User-Id": "1"}).json()
    assert len(projects) == 1
    assert projects[0]["name"] == "SC6105 Group Project"

    board = client.get("/api/projects/1/board", headers={"X-User-Id": "1"}).json()
    assert [column["name"] for column in board["columns"]] == ["To Do", "In Progress", "Review", "Done"]
    assert sum(len(column["tasks"]) for column in board["columns"]) == 12

    count = client.get("/api/notifications/unread-count", headers={"X-User-Id": "2"}).json()
    assert count["count"] == 3


def test_move_task_persists():
    board = client.get("/api/projects/1/board", headers={"X-User-Id": "1"}).json()
    task_id = board["columns"][1]["tasks"][0]["id"]
    response = client.patch(f"/api/tasks/{task_id}/move", headers={"X-User-Id": "1"}, json={"column_id": 3, "position": 2})
    assert response.status_code == 200
    assert response.json()["column_id"] == 3
