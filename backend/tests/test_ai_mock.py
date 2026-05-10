from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_ai_mock_decompose_and_accept(monkeypatch):
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    response = client.post(
        "/api/projects/1/ai/decompose",
        headers={"X-User-Id": "1"},
        json={"description": "Build a complete user authentication page with email login and password reset"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["subtasks"]) == 4

    subtask_id = data["subtasks"][0]["id"]
    accepted = client.post(
        f"/api/ai/results/{subtask_id}/accept",
        headers={"X-User-Id": "1"},
        json={"subtask_id": subtask_id},
    )
    assert accepted.status_code == 201
    assert accepted.json()["label"] == "AI"
