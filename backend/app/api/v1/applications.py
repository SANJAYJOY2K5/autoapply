from __future__ import annotations

import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, AuthenticatedUser
from app.schemas.application import ApplicationResponse, ApplicationBase, ApplicationSubmissionProof

router = APIRouter(prefix="/applications", tags=["Applications"])

from app.services.applier.engine import get_all_applications

# Live applications storage
_live_applications: List[ApplicationResponse] = []


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[ApplicationResponse]:
    """Returns only real candidate applications tracked in the system."""
    apps_map = {app.job_id: app for app in _live_applications if app.profile_id == current_user.id}

    # Integrate applications from auto-apply engine
    for res in get_all_applications():
        if res.job_id not in apps_map:
            apps_map[res.job_id] = ApplicationResponse(
                id=f"app-{res.job_id[:8]}",
                profile_id=current_user.id,
                job_id=res.job_id,
                job_title=res.job_title,
                company=res.company,
                location="Chennai / Remote India",
                match_score=85,
                status="submitted" if res.status in ("submitted", "link_opened") else "queued",
                escalation_reason=res.error if res.status == "failed" else None,
                submission_channel=res.channel,
                submission_proof_ref=res.proof_ref,
                applied_at=res.applied_at,
                created_at=res.applied_at
            )

    return list(apps_map.values())


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
