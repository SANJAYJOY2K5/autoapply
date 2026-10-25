from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user, AuthenticatedUser
from app.api.v1.profile import get_my_profile
from app.schemas.job import JobResponse
from app.services.discovery.service import run_discovery_scan, get_cached_discovered_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
async def list_jobs(
    min_score: int = Query(75, ge=0, le=100),
    location: Optional[str] = Query(None),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[JobResponse]:
    """
    Returns 100% original, live discovered jobs from online feeds.
    Zero sample or mock data. If no cached scan exists, runs a live scan.
    """
    cached = get_cached_discovered_jobs()
    if not cached:
        profile = await get_my_profile(current_user=current_user)
        cached = await run_discovery_scan(profile=profile, min_score_override=min_score)

    filtered = [job for job in cached if (job.match_score or 100) >= min_score]
    return filtered


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
