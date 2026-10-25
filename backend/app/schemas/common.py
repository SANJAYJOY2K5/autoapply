from __future__ import annotations

import datetime
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class HealthResponse(BaseModel):
    """Health check status response model."""
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str = "development"
    timestamp: str = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
    )


class APIResponse(BaseModel, Generic[DataT]):
    """Standardized API response wrapper."""
    success: bool = True
    message: Optional[str] = None
    data: Optional[DataT] = None


class ErrorResponse(BaseModel):
    """Standardized error response model."""
    success: bool = False
    error: str
    detail: Optional[Any] = None
