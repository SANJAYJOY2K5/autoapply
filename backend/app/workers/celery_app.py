from __future__ import annotations

from app.core.config import settings
from app.core.logging import logger

try:
    from celery import Celery
    celery_app = Celery("autoapply_workers", broker=settings.REDIS_URL)
    celery_app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="Asia/Kolkata",
        enable_utc=True,
        beat_schedule={
            "hourly-job-discovery-scan": {
                "task": "app.workers.tasks.discover_jobs_hourly",
                "schedule": 3600.0,  # Run every hour
            },
        }
    )
except ImportError:
    celery_app = None
    logger.info("Celery library not imported in lightweight environment; ready for Phase 2.")
