from __future__ import annotations

import asyncio
from app.core.logging import logger
from app.core.config import settings


def discover_and_apply_hourly():
    """
    Hourly background task: Live job discovery + auto-apply for Sanjay Saminathan.
    Runs every hour on Render via Celery Beat.
    Steps:
      1. Build operator profile (Sanjay's verified resume data)
      2. Fetch live jobs from LinkedIn, Shine, Remotive
      3. Score and filter: only 75%+ match score jobs proceed
      4. Auto-apply to all new qualified jobs with real contact details
    """
    logger.info("=" * 60)
    logger.info("[HOURLY TASK] AutoApply AI — Job Discovery & Auto-Apply Started")
    logger.info("=" * 60)

    try:
        return asyncio.run(_async_discover_and_apply())
    except RuntimeError:
        # If event loop already running (e.g., Celery with gevent)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(_async_discover_and_apply())
        finally:
            loop.close()


async def _async_discover_and_apply() -> dict:
    """Async implementation of the hourly discovery + apply pipeline."""
    from app.api.v1.profile import _get_default_profile
    from app.services.discovery.service import run_discovery_scan
    from app.services.applier.engine import run_auto_apply_batch

    # Build Sanjay's verified profile
    profile = _get_default_profile(
        user_id="sanjay-operator",
        email="kishorsanjay2005@gmail.com"
    )

    # Step 1: Live job discovery
    logger.info("[STEP 1] Running live job discovery scan...")
    matched_jobs = await run_discovery_scan(profile=profile, min_score_override=75)
    logger.info(f"[STEP 1] Discovered {len(matched_jobs)} qualified jobs (75%+ match)")

    if not matched_jobs:
        logger.info("[STEP 2] No new matched jobs this scan. Will retry next hour.")
        return {"scanned": 0, "applied": 0, "status": "no_matches"}

    # Step 2: Auto-apply to all matched jobs
    logger.info(f"[STEP 2] Running auto-apply batch for {len(matched_jobs)} jobs...")
    results = await run_auto_apply_batch(matched_jobs, max_per_run=20)

    submitted = sum(1 for r in results if r.status == "submitted")
    tracked = sum(1 for r in results if r.status == "link_opened")

    logger.info(
        f"[HOURLY TASK] Complete — {submitted} submitted, {tracked} link-tracked, "
        f"{len(results)} total this run"
    )
    logger.info("=" * 60)

    return {
        "scanned":   len(matched_jobs),
        "applied":   len(results),
        "submitted": submitted,
        "tracked":   tracked,
        "status":    "success",
        "candidate": "kishorsanjay2005@gmail.com",
        "phone":     "+91 78713 50761",
    }
