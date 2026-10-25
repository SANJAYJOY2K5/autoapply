from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user, AuthenticatedUser
from app.api.v1.profile import get_my_profile
from app.schemas.job import JobResponse
from app.services.discovery.service import run_discovery_scan, get_cached_discovered_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


from app.services.applier.engine import get_applied_job_ids

@router.get("", response_model=List[JobResponse])
async def list_jobs(
    min_score: int = Query(75, ge=0, le=100),
    location: Optional[str] = Query(None),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[JobResponse]:
    """
    Returns only unapplied, live discovered jobs.
    When a job is applied, it immediately leaves this feed and moves to the Applied History tracker.
    New jobs continue to populate hourly.
    """
    applied_ids = get_applied_job_ids()
    cached = get_cached_discovered_jobs()

    # Filter for jobs that have NOT been applied to yet
    unapplied = [
        job for job in cached
        if job.id not in applied_ids and (job.match_score or 100) >= min_score
    ]

    # If no unapplied cached jobs remain, trigger fresh scan
    if not unapplied:
        profile = await get_my_profile(current_user=current_user)
        cached = await run_discovery_scan(profile=profile, min_score_override=min_score)
        unapplied = [
            job for job in cached
            if job.id not in applied_ids and (job.match_score or 100) >= min_score
        ]

    return unapplied


@router.post("/scan", response_model=List[JobResponse])
async def trigger_live_discovery_scan(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[JobResponse]:
    """
    Connects live to LinkedIn, Shine, and Remotive feeds to retrieve active postings.
    Calculates candidate match scores and returns only live qualified openings.
    """
    profile = await get_my_profile(current_user=current_user)
    return await run_discovery_scan(profile=profile)
