from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field


class JobBase(BaseModel):
    title: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)
    work_mode: str = Field(default="hybrid")
    description: Optional[str] = None
    apply_url: str = Field(..., min_length=5)
    source: str = Field(default="company_portal")
    min_experience_years: float = Field(default=0.0, ge=0.0)
    is_active: bool = True


class JobResponse(JobBase):
    id: str
    external_id: Optional[str] = None
    match_score: Optional[int] = Field(None, ge=0, le=100)
    created_at: Optional[str] = None


class JobSearchParams(BaseModel):
    location: Optional[str] = "Chennai"
    include_remote: bool = True
    min_match_score: int = 75
    roles: Optional[List[str]] = None
