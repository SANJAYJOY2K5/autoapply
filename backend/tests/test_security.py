from __future__ import annotations

from fastapi.testclient import TestClient


def test_unauthenticated_request_rejected(client: TestClient):
    """Verifies that accessing protected endpoints without credentials returns HTTP 401."""
    response = client.get("/api/v1/profile/me")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_invalid_bearer_token_rejected(client: TestClient):
    """Verifies that requests with malformed tokens return HTTP 401."""
    response = client.get(
        "/api/v1/profile/me",
        headers={"Authorization": "Bearer not-a-valid-jwt-token"}
    )
    assert response.status_code == 401


def test_cross_tenant_storage_access_rejected(client: TestClient, auth_headers: dict):
    """
    Verifies that a user cannot confirm or download a resume belonging to a different user directory.
    """
    other_user_path = "victim-user-id/secret-resume.pdf"
    response = client.get(
        f"/api/v1/storage/resume-download-url?path={other_user_path}",
        headers=auth_headers
    )
    assert response.status_code == 403
    assert "Cannot access resumes outside your tenant directory" in response.json()["detail"]


def test_resume_upload_target_generation(client: TestClient, auth_headers: dict, test_user_id: str):
    """Verifies that upload target enforces the user's isolated folder prefix."""
    payload = {
        "file_name": "Kishore_Resume.pdf",
        "file_size": 102400,
        "mime_type": "application/pdf"
    }
    response = client.post("/api/v1/storage/resume-upload-url", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["storage_path"].startswith(f"{test_user_id}/")
    assert data["bucket"] == "resumes"
