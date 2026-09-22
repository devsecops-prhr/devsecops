import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "flask"


def test_create_todo(client):
    resp = client.post("/todos", json={"title": "Estudar Actions"})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Estudar Actions"
    assert data["completed"] is False
    assert "id" in data


def test_list_todos(client):
    client.post("/todos", json={"title": "Item A"})
    resp = client.get("/todos")
    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)


def test_get_todo_404(client):
    resp = client.get("/todos/nao-existe")
    assert resp.status_code == 404


def test_validate_empty_title(client):
    resp = client.post("/todos", json={"title": "   "})
    assert resp.status_code == 400
    assert "error" in resp.get_json()


def test_validate_long_title(client):
    resp = client.post("/todos", json={"title": "x" * 121})
    assert resp.status_code == 400


def test_update_completed(client):
    created = client.post("/todos", json={"title": "Fazer X"}).get_json()
    resp = client.patch(f"/todos/{created['id']}", json={"completed": True})
    assert resp.status_code == 200
    assert resp.get_json()["completed"] is True


def test_update_completed_invalid(client):
    created = client.post("/todos", json={"title": "Fazer Y"}).get_json()
    resp = client.patch(f"/todos/{created['id']}", json={"completed": "sim"})
    assert resp.status_code == 400


def test_delete_todo(client):
    created = client.post("/todos", json={"title": "Remover"}).get_json()
    resp = client.delete(f"/todos/{created['id']}")
    assert resp.status_code == 204
