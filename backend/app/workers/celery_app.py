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
            # Run discovery + auto-apply every hour, 24/7 on Render
            "hourly-discovery-and-apply": {
                "task": "app.workers.tasks.discover_and_apply_hourly",
                "schedule": 3600.0,  # Every 60 minutes
            },
        }
    )
    logger.info("Celery app initialized — hourly auto-apply scheduled (Asia/Kolkata timezone)")
except ImportError:
    celery_app = None
    logger.info("Celery not available — auto-apply engine running in direct-call mode.")
