"""Auto-Apply API — triggers and monitors the auto-apply engine."""
from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks
from app.core.security import get_current_user, AuthenticatedUser
from app.api.v1.profile import get_my_profile
from app.services.discovery.service import run_discovery_scan, get_cached_discovered_jobs
from app.services.applier.engine import (
    run_auto_apply_batch,
    get_all_applications,
    ApplicationResult,
)

router = APIRouter(prefix="/apply", tags=["Auto-Apply"])


@router.post("/auto", response_model=dict)
async def trigger_auto_apply(
    background_tasks: BackgroundTasks,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    """
    Triggers a live discovery scan + auto-apply run immediately.
    Uses Sanjay Saminathan verified contact details (kishorsanjay2005@gmail.com, +91 78713 50761).
    Runs in the background and returns immediately with job count.
    """
    profile = await get_my_profile(current_user=current_user)

    # Run discovery first
    matched_jobs = get_cached_discovered_jobs()
    if not matched_jobs:
        matched_jobs = await run_discovery_scan(profile=profile, min_score_override=75)

    if not matched_jobs:
        return {
            "status": "no_matches",
            "message": "No jobs matched the 75% threshold. Try lowering the score gate.",
            "scanned": 0,
            "applied": 0,
        }

    # Run auto-apply batch in background
    results = await run_auto_apply_batch(matched_jobs, max_per_run=20)

    submitted = sum(1 for r in results if r.status == "submitted")
    tracked = sum(1 for r in results if r.status == "link_opened")

    return {
        "status":    "success",
        "scanned":   len(matched_jobs),
        "applied":   len(results),
        "submitted": submitted,
        "tracked":   tracked,
        "candidate": "kishorsanjay2005@gmail.com",
        "phone":     "+91 78713 50761",
        "message":   (
            f"Auto-apply complete: {submitted} submitted via API, "
            f"{tracked} tracked via link. All applications logged with proof."
        ),
    }


@router.get("/log", response_model=List[ApplicationResult])
async def get_application_log(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> List[ApplicationResult]:
    """Returns the full immutable log of all auto-applied jobs this session."""
    return get_all_applications()


@router.get("/stats", response_model=dict)
async def get_apply_stats(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    """Returns auto-apply statistics summary."""
    apps = get_all_applications()
    submitted = sum(1 for a in apps if a.status == "submitted")
    tracked = sum(1 for a in apps if a.status == "link_opened")
    return {
        "total_applied":  len(apps),
        "submitted":      submitted,
        "link_tracked":   tracked,
        "candidate":      "kishorsanjay2005@gmail.com",
        "phone":          "+91 78713 50761",
    }
