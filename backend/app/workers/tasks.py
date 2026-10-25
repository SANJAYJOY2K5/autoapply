from __future__ import annotations

from app.core.logging import logger
from app.core.config import settings

def discover_jobs_hourly():
    """
    Background hourly task to scan for fresher jobs in Chennai and Remote India.
    In Phase 1, automated scraping remains disabled.
    """
    logger.info("Hourly job discovery triggered: scanning Chennai & Remote India openings...")
    if not settings.FEATURE_JOB_SCRAPING_ENABLED:
        logger.info("Scraping feature flag is disabled for Phase 1. Task completed safely.")
        return {"scanned": 0, "status": "disabled_in_phase_1"}
    
    return {"scanned": 0, "status": "active"}
