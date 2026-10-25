from __future__ import annotations

import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, AuthenticatedUser
from app.schemas.application import ApplicationResponse, ApplicationBase, ApplicationSubmissionProof

router = APIRouter(prefix="/applications", tags=["Applications"])

# Live applications storage (starts empty; populated only by real candidate applications)
_live_applications: List[ApplicationResponse] = []


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[ApplicationResponse]:
    """Returns only real candidate applications tracked in the system."""
    return [app for app in _live_applications if app.profile_id == current_user.id]


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_data: ApplicationBase,
    job_title: Optional[str] = None,
    company: Optional[str] = None,
    location: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> ApplicationResponse:
    """Registers a real candidate application into tracking."""
    new_app = ApplicationResponse(
        id=f"app-{uuid.uuid4().hex[:8]}",
        profile_id=current_user.id,
        job_id=app_data.job_id,
        job_title=job_title or "Software Developer",
        company=company or "Direct Employer",
        location=location or "Chennai, India",
        match_score=app_data.match_score,
        status=app_data.status,
        escalation_reason=app_data.escalation_reason,
        submission_channel=app_data.submission_channel,
        submission_proof_ref=app_data.submission_proof_ref,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
    _live_applications.append(new_app)
    return new_app


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

    for app in _live_applications:
        if app.id == app_id:
            app.status = "submitted"
            app.submission_proof_ref = proof.submission_proof_ref.strip()
            app.applied_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            return app

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found")
