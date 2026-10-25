from __future__ import annotations

import uuid
from typing import List, Optional, Dict
from app.core.logging import logger
from app.schemas.profile import CandidateProfileResponse
from app.schemas.job import JobResponse
from app.services.discovery.fetchers import fetch_all_active_openings
from app.services.discovery.matcher import calculate_job_match

# In-memory discovered jobs store
_active_discovered_jobs: Dict[str, JobResponse] = {}


async def run_discovery_scan(
    profile: CandidateProfileResponse,
    min_score_override: Optional[int] = None
) -> List[JobResponse]:
    """
    Executes a complete live discovery scan:
      1. Fetches real-time openings from verified channels.
      2. Calculates transparent 0-100% match scores for candidate.
      3. Enforces the strict match threshold (default 75%+).
      4. Returns qualified jobs sorted by relevance.
    """
    threshold = min_score_override if min_score_override is not None else profile.min_match_score
    raw_openings = await fetch_all_active_openings(
        preferred_roles=profile.preferred_roles,
        location=profile.current_location or "Chennai"
    )

    matched_jobs: List[JobResponse] = []

    for raw in raw_openings:
        score, reasons = calculate_job_match(
            title=raw.title,
            location=raw.location,
            work_mode=raw.work_mode,
            description=raw.description,
            profile=profile,
            min_threshold=threshold
        )

        if score >= threshold:
            job_obj = JobResponse(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, raw.apply_url)),
                external_id=raw.external_id,
                source=raw.source,
                title=raw.title,
                company=raw.company,
                location=raw.location,
                work_mode=raw.work_mode,
                description=raw.description,
                apply_url=raw.apply_url,
                min_experience_years=raw.min_experience_years,
                match_score=score,
                is_active=True
            )
            _active_discovered_jobs[job_obj.id] = job_obj
            matched_jobs.append(job_obj)

    # Sort descending by match score
    matched_jobs.sort(key=lambda j: (j.match_score or 0), reverse=True)
    logger.info(f"Discovery scan complete: {len(matched_jobs)} jobs matched score >= {threshold}%")
    return matched_jobs


def get_cached_discovered_jobs() -> List[JobResponse]:
    """Returns currently discovered jobs from cache."""
    return list(_active_discovered_jobs.values())


def get_job_by_id(job_id: str) -> Optional[JobResponse]:
    """Retrieves a single job by its unique ID."""
    return _active_discovered_jobs.get(job_id)
