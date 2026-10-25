from __future__ import annotations

from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.profile import router as profile_router
from app.api.v1.storage import router as storage_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.applications import router as applications_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(profile_router)
api_router.include_router(storage_router)
api_router.include_router(jobs_router)
api_router.include_router(applications_router)
