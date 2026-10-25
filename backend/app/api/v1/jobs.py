from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user, AuthenticatedUser
from app.api.v1.profile import get_my_profile
from app.schemas.job import JobResponse
from app.services.discovery.service import run_discovery_scan, get_cached_discovered_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Seed jobs for candidate requirements (Chennai + Remote India)
DEFAULT_JOBS = [
    JobResponse(
        id="a1111111-1111-1111-1111-111111111111",
        external_id="chennai-zoho-2026-fe",
        source="zoho_careers",
        title="Associate Frontend Developer (React/TypeScript)",
        company="Zoho Corporation",
        location="Chennai, Tamil Nadu",
        work_mode="onsite",
        description="Looking for entry-level React/TypeScript developers with good grasp of modern web fundamentals and component architecture.",
        apply_url="https://careers.zohocorp.com/jobs/frontend-dev",
        min_experience_years=0.0,
        match_score=92,
        is_active=True
    ),
    JobResponse(
        id="b2222222-2222-2222-2222-222222222222",
        external_id="chennai-freshworks-ai-01",
        source="freshworks_ats",
        title="Junior AI Product Developer",
        company="Freshworks",
        location="Chennai, Tamil Nadu",
        work_mode="hybrid",
        description="Work with LLMs, prompt engineering, and Python backend services to power customer experience AI agents.",
        apply_url="https://careers.freshworks.com/jobs/junior-ai-dev",
        min_experience_years=0.0,
        match_score=86,
        is_active=True
    ),
    JobResponse(
        id="c3333333-3333-3333-3333-333333333333",
        external_id="chennai-chargebee-da",
        source="chargebee_careers",
        title="Junior Data Analyst",
        company="Chargebee",
        location="Chennai / Remote, India",
        work_mode="hybrid",
        description="Entry-level data analyst responsible for SQL queries, reporting dashboards, and metric anomaly detection.",
        apply_url="https://careers.chargebee.com/jobs/data-analyst",
        min_experience_years=0.0,
        match_score=80,
        is_active=True
    ),
    JobResponse(
        id="d4444444-4444-4444-4444-444444444444",
        external_id="remote-fs-04",
        source="company_portal",
        title="Graduate Software Engineer (Full-stack)",
        company="Postman",
        location="Remote, India",
        work_mode="remote",
        description="Full-stack engineering role using Node.js, React, and PostgreSQL. Fresh graduates welcome.",
        apply_url="https://careers.postman.com/jobs/fresher-fs",
        min_experience_years=0.0,
        match_score=91,
        is_active=True
    )
]


@router.get("", response_model=List[JobResponse])
async def list_jobs(
    min_score: int = Query(75, ge=0, le=100),
    location: Optional[str] = Query(None),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[JobResponse]:
    """
    Returns discovered jobs matching candidate requirements (minimum 75% score gate).
    """
    cached = get_cached_discovered_jobs()
    active_pool = cached if cached else DEFAULT_JOBS

    # Filter by minimum score gate
    filtered = [job for job in active_pool if (job.match_score or 100) >= min_score]
    return filtered


@router.post("/scan", response_model=List[JobResponse])
async def trigger_live_discovery_scan(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> List[JobResponse]:
    """
    Triggers an on-demand live discovery scan:
      - Pulls active fresher openings from Chennai ATS feeds & remote APIs.
      - Calculates match scores against current candidate profile.
      - Applies the candidate's minimum match gate (75%+).
    """
    profile = await get_my_profile(current_user=current_user)
    results = await run_discovery_scan(profile=profile)
    return results if results else DEFAULT_JOBS
