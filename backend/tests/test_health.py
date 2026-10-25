from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_check_endpoint(client: TestClient):
    """Verifies GET /api/v1/health returns HTTP 200 with healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert "environment" in data
    assert "timestamp" in data


def test_root_endpoint(client: TestClient):
    """Verifies GET / returns service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "AutoApply AI API"
    assert data["docs"] == "/docs"
