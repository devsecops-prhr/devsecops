from app import app


def test_health():
    client = app.test_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "flask"


def test_index():
    client = app.test_client()
    resp = client.get("/")
    assert resp.status_code == 200
    assert "DevSecOps" in resp.get_json()["message"]
