from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ApplicationBase(BaseModel):
    job_id: str
    match_score: int = Field(..., ge=0, le=100)
    status: str = Field(default="pending_review")
    escalation_reason: Optional[str] = None
    submission_channel: str = Field(default="authorized_integration")
    submission_proof_ref: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = {"pending_review", "escalated", "queued", "submitted", "rejected"}
        if v.lower() not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v.lower()


class ApplicationSubmissionProof(BaseModel):
    submission_proof_ref: str = Field(
        ...,
        min_length=5,
        description="Immutable receipt or confirmation ID proving successful submission"
    )


class ApplicationResponse(ApplicationBase):
    id: str
    profile_id: str
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    applied_at: Optional[str] = None
    created_at: Optional[str] = None
