from __future__ import annotations

import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import get_current_user, AuthenticatedUser
from app.core.logging import logger
from app.db.supabase import get_supabase_admin, _in_memory_resumes
from app.schemas.profile import ResumeMetadata

router = APIRouter(prefix="/storage", tags=["Storage"])


class UploadUrlRequest(BaseModel):
    file_name: str = Field(..., min_length=3)
    file_size: int = Field(..., ge=1, le=5242880) # 5MB max
    mime_type: str = Field("application/pdf")


class UploadUrlResponse(BaseModel):
    storage_path: str
    bucket: str = "resumes"
    upload_url: Optional[str] = None
    expires_in_seconds: int = 900 # 15 minutes


class SignedDownloadUrlResponse(BaseModel):
    signed_url: str
    expires_in_seconds: int = 900


@router.post("/resume-upload-url", response_model=UploadUrlResponse)
async def create_resume_upload_url(
    req: UploadUrlRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> UploadUrlResponse:
    """
    Generates a secure path and signed upload target for candidate's private resume storage.
    Enforces that resumes are uploaded strictly under resumes/{user_id}/*
    """
    if req.mime_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF format (.pdf) is supported for resumes."
        )

    # Sanitize file name
    clean_name = "".join(c for c in req.file_name if c.isalnum() or c in "._-")
    target_path = f"{current_user.id}/{uuid.uuid4().hex[:8]}_{clean_name}"

    upload_url = None
    client = get_supabase_admin()
    if client:
        try:
            # Create a signed upload URL via Supabase Storage if available
            res = client.storage.from_("resumes").create_signed_upload_url(target_path)
            if res and "signedUrl" in res:
                upload_url = res["signedUrl"]
        except Exception as exc:
            logger.warning(f"Could not generate signed Supabase upload URL: {exc}. Providing relative path.")

    return UploadUrlResponse(
        storage_path=target_path,
        bucket="resumes",
        upload_url=upload_url,
        expires_in_seconds=900
    )


@router.post("/resume-confirm", response_model=ResumeMetadata)
async def confirm_resume_upload(
    metadata: ResumeMetadata,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> ResumeMetadata:
    """Records confirmed upload in the database with owner validation."""
    # Enforce that path starts with user id
    if not metadata.storage_path.startswith(f"{current_user.id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized storage path for current user"
        )

    confirmed = ResumeMetadata(
        id=metadata.id or f"res-{uuid.uuid4().hex[:8]}",
        file_name=metadata.file_name,
        storage_path=metadata.storage_path,
        file_size=metadata.file_size,
        mime_type=metadata.mime_type,
        is_primary=True,
        uploaded_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )

    client = get_supabase_admin()
    if client:
        try:
            client.table("candidate_resumes").insert({
                "profile_id": current_user.id,
                "file_name": confirmed.file_name,
                "storage_path": confirmed.storage_path,
                "file_size": confirmed.file_size,
                "mime_type": confirmed.mime_type,
                "is_primary": confirmed.is_primary
            }).execute()
        except Exception as exc:
            logger.warning(f"Failed to record resume in Supabase: {exc}")

    _in_memory_resumes[current_user.id] = confirmed.model_dump()
    return confirmed


@router.get("/resume-download-url", response_model=SignedDownloadUrlResponse)
async def get_resume_download_url(
    path: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> SignedDownloadUrlResponse:
    """Generates a temporary signed URL to safely download/preview private resume."""
    if not path.startswith(f"{current_user.id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access resumes outside your tenant directory"
        )

    signed_url = f"/api/v1/storage/mock-preview/{path}"
    client = get_supabase_admin()
    if client:
        try:
            res = client.storage.from_("resumes").create_signed_url(path, 900)
            if res and "signedURL" in res:
                signed_url = res["signedURL"]
        except Exception as exc:
            logger.warning(f"Could not generate signed Supabase download URL: {exc}")

    return SignedDownloadUrlResponse(
        signed_url=signed_url,
        expires_in_seconds=900
    )
