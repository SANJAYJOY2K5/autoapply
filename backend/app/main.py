from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AutoApply AI Backend Service...")
    logger.info(f"Active Environment: {settings.ENVIRONMENT}")
    logger.info(f"Auto-Apply Engine Feature Flag: {settings.FEATURE_AUTO_APPLY_ENABLED}")
    yield
    logger.info("Shutting down AutoApply AI Backend Service...")


app = FastAPI(
    title="AutoApply AI Backend API",
    description="Job discovery, matching, and application automation platform for Indian freshers.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API Router
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "AutoApply AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": "Internal Server Error", "detail": str(exc)}
    )
