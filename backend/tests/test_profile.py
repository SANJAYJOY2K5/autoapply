from __future__ import annotations

from fastapi.testclient import TestClient


def test_get_my_profile_authenticated(client: TestClient, auth_headers: dict):
    """Verifies that an authenticated user can retrieve their profile."""
    response = client.get("/api/v1/profile/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["current_location"] == "Chennai"
    assert data["min_match_score"] == 75
    assert "Frontend Developer" in data["preferred_roles"]
    assert len(data["skills"]) > 0


def test_update_profile_preferences(client: TestClient, auth_headers: dict):
    """Verifies updating candidate preferences and qualifications."""
    update_payload = {
        "full_name": "Kishore Kumar",
        "current_location": "Chennai",
        "relocation_preference": "Chennai + Remote India",
        "min_match_score": 80,
        "preferred_roles": [
            "Frontend Developer",
            "AI / AI Product Developer",
            "Full-stack Developer"
        ]
    }
    response = client.put("/api/v1/profile", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Kishore Kumar"
    assert data["min_match_score"] == 80
    assert data["preferred_roles"] == update_payload["preferred_roles"]


def test_validation_rejects_invalid_match_score(client: TestClient, auth_headers: dict):
    """Verifies that match scores outside 0-100 are rejected with HTTP 422."""
    bad_payload = {"min_match_score": 150}
    response = client.put("/api/v1/profile", json=bad_payload, headers=auth_headers)
    assert response.status_code == 422

    negative_payload = {"min_match_score": -10}
    response = client.put("/api/v1/profile", json=negative_payload, headers=auth_headers)
    assert response.status_code == 422


def test_validation_rejects_invalid_skill_category(client: TestClient, auth_headers: dict):
    """Verifies that invalid skill categories are rejected with HTTP 422."""
    bad_skills_payload = {
        "skills": [
            {"skill_name": "Python", "category": "invalid_category", "proficiency": "intermediate"}
        ]
    }
    response = client.put("/api/v1/profile", json=bad_skills_payload, headers=auth_headers)
    assert response.status_code == 422


def test_application_submission_guardrail_enforcement(client: TestClient, auth_headers: dict):
    """
    Verifies that an application CANNOT be marked submitted without confirmed submission evidence.
    """
    empty_proof_payload = {"submission_proof_ref": "   "}
    response = client.patch(
        "/api/v1/applications/app-1/submit",
        json=empty_proof_payload,
        headers=auth_headers
    )
    # Pydantic or endpoint rejects blank proof
    assert response.status_code in (400, 422)

    valid_proof_payload = {"submission_proof_ref": "SUBMISSION-PROOF-CONFIRM-99210"}
    response = client.patch(
        "/api/v1/applications/app-1/submit",
        json=valid_proof_payload,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "submitted"
    assert data["submission_proof_ref"] == "SUBMISSION-PROOF-CONFIRM-99210"
