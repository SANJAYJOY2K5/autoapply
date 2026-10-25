from __future__ import annotations

import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.security import get_current_user, AuthenticatedUser
from app.core.config import settings
from app.schemas.application import ApplicationResponse, ApplicationBase, ApplicationSubmissionProof

router = APIRouter(prefix="/applications", tags=["Applications"])

# In-memory storage for development & testing
_mock_applications: List[ApplicationResponse] = [
    ApplicationResponse(
        id="app-1",
        profile_id="candidate-fresher",
        job_id="a1111111-1111-1111-1111-111111111111",
        job_title="Associate Frontend Developer",
        company="Zoho Corporation",
        location="Chennai, Tamil Nadu",
        match_score=88,
        status="pending_review",
        submission_channel="authorized_integration",
        created_at="2026-10-25T10:00:00Z"
    ),
    ApplicationResponse(
        id="app-2",
        profile_id="candidate-fresher",
        job_id="b2222222-2222-2222-2222-222222222222",
        job_title="Junior AI Product Developer",
        company="Freshworks",
        location="Chennai, Tamil Nadu",
        match_score=82,
        status="escalated",
        escalation_reason="Portal requires mandatory video assessment and custom credential authentication.",
        submission_channel="manual_escalation",
        created_at="2026-10-25T11:00:00Z"
    ),
    ApplicationResponse(
        id="app-3",
        profile_id="candidate-fresher",
        job_id="d4444444-4444-4444-4444-444444444444",
        job_title="Graduate Software Engineer (Full-stack)",
        company="Postman",
        location="Remote, India",
        match_score=91,
        status="submitted",
        submission_channel="authorized_integration",
        submission_proof_ref="POSTMAN-APP-REC-8931284",
        applied_at="2026-10-25T12:00:00Z",
        created_at="2026-10-25T11:30:00Z"
    )
]


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[ApplicationResponse]:
    """Returns candidate's application history and real-time statuses."""
    # Filter for the current user (or demo records)
    return _mock_applications


@router.patch("/{app_id}/submit", response_model=ApplicationResponse)
async def mark_application_submitted(
    app_id: str,
    proof: ApplicationSubmissionProof,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> ApplicationResponse:
    """
    Marks application as submitted only when valid immutable submission evidence is provided.
    Enforces the mandatory Phase 1 guardrail constraint.
    """
    if not proof.submission_proof_ref or not proof.submission_proof_ref.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot mark application as submitted without confirmed submission evidence"
        )

    for app in _mock_applications:
        if app.id == app_id:
            app.status = "submitted"
            app.submission_proof_ref = proof.submission_proof_ref.strip()
            app.applied_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            return app

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found")
