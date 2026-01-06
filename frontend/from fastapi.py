from fastapi.testclient import TestClient
from backend.main import app  # Ajusta el import si tu estructura es distinta
client = TestClient(app)
def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_login_fail():
    response = client.post("/auth/login", json={"usuario": "fake", "password": "wrong"})
    assert response.status_code == 401 or response.status_code == 400

# Agrega aquí más tests para endpoints críticos