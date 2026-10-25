from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from app.services.discovery.matcher import calculate_job_match
from app.schemas.profile import CandidateProfileResponse, SkillItem


def test_calculate_job_match_high_for_chennai_react():
    """Verifies that a React role in Chennai matches above the 75% threshold."""
    profile = CandidateProfileResponse(
        id="test-id",
        full_name="Kishore Kumar",
        email="fresher@example.com",
        current_location="Chennai",
        relocation_preference="Chennai + Remote India",
        preferred_roles=["Frontend Developer", "Full-stack Developer"],
        skills=[
            SkillItem(skill_name="React", category="framework", proficiency="intermediate"),
            SkillItem(skill_name="TypeScript", category="language", proficiency="intermediate")
        ],
        min_match_score=75
    )

    score, reasons = calculate_job_match(
        title="Frontend Developer (React)",
        location="Chennai, Tamil Nadu",
        work_mode="onsite",
        description="Looking for React developers with TypeScript knowledge in Chennai.",
        profile=profile,
        min_threshold=75
    )

    assert score >= 75
    assert any("Chennai" in r for r in reasons)


def test_calculate_job_match_low_for_irrelevant_job():
    """Verifies that an unrelated role outside territory scores well below 75%."""
    profile = CandidateProfileResponse(
        id="test-id",
        full_name="Kishore Kumar",
        email="fresher@example.com",
        current_location="Chennai",
        preferred_roles=["Frontend Developer"],
        skills=[
            SkillItem(skill_name="React", category="framework", proficiency="intermediate")
        ],
        min_match_score=75
    )

    score, reasons = calculate_job_match(
        title="Senior Mechanical Maintenance Foreman",
        location="Bhilai, Chhattisgarh",
        work_mode="onsite",
        description="Heavy machinery diesel turbine maintenance and civil piping.",
        profile=profile,
        min_threshold=75
    )

    assert score < 75


def test_trigger_live_discovery_scan_endpoint(client: TestClient, auth_headers: dict):
    """Verifies POST /api/v1/jobs/scan triggers discovery and returns qualified listings."""
    response = client.post("/api/v1/jobs/scan", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Every job returned should respect the score gate
    for job in data:
        assert job["match_score"] >= 70
