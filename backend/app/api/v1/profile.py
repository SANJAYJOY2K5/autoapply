from __future__ import annotations

import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, AuthenticatedUser
from app.core.logging import logger
from app.db.supabase import get_supabase_admin, _in_memory_profiles
from app.schemas.profile import (
    CandidateProfileCreate,
    CandidateProfileUpdate,
    CandidateProfileResponse,
    EducationItem,
    SkillItem,
    ProjectItem,
    ResumeMetadata
)

router = APIRouter(prefix="/profile", tags=["Profile"])


def _get_default_profile(user_id: str, email: str) -> CandidateProfileResponse:
    """Builds a default fresher profile template."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return CandidateProfileResponse(
        id=user_id,
        full_name="Fresher Candidate",
        email=email,
        phone="+91 98765 43210",
        headline="Entry-Level Full-Stack & AI Product Developer",
        current_location="Chennai",
        relocation_preference="Chennai + Remote India",
        preferred_work_modes=["remote", "hybrid", "onsite"],
        preferred_roles=[
            "Frontend Developer",
            "AI / AI Product Developer",
            "Data Analyst",
            "Data Scientist",
            "Full-stack Developer"
        ],
        min_match_score=75,
        search_frequency="hourly",
        education=[
            EducationItem(
                id="edu-default-1",
                institution="Anna University",
                degree="B.E. Computer Science and Engineering",
                field_of_study="Computer Science",
                start_year=2020,
                end_year=2024,
                cgpa_or_percentage="8.4 CGPA"
            )
        ],
        skills=[
            SkillItem(id="sk-1", skill_name="React", category="framework", proficiency="intermediate"),
            SkillItem(id="sk-2", skill_name="TypeScript", category="language", proficiency="intermediate"),
            SkillItem(id="sk-3", skill_name="Python", category="language", proficiency="intermediate"),
            SkillItem(id="sk-4", skill_name="FastAPI", category="framework", proficiency="intermediate"),
            SkillItem(id="sk-5", skill_name="PostgreSQL", category="technical", proficiency="intermediate"),
            SkillItem(id="sk-6", skill_name="Tailwind CSS", category="tool", proficiency="intermediate")
        ],
        projects=[
            ProjectItem(
                id="proj-1",
                title="AI Powered Portfolio & Job Tracker",
                description="Built full-stack application using Next.js and FastAPI with Postgres storage and automated matching.",
                technologies=["React", "TypeScript", "FastAPI", "Tailwind CSS"],
                github_url="https://github.com/candidate/ai-job-tracker"
            )
        ],
        resumes=[],
        created_at=now,
        updated_at=now
    )


@router.get("/me", response_model=CandidateProfileResponse)
async def get_my_profile(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> CandidateProfileResponse:
    """Retrieves the candidate profile of the authenticated user."""
    client = get_supabase_admin()
    if client:
        try:
            res = client.table("profiles").select(
                "*, candidate_education(*), candidate_skills(*), candidate_projects(*), candidate_resumes(*)"
            ).eq("id", current_user.id).execute()
            if res.data and len(res.data) > 0:
                raw = res.data[0]
                return CandidateProfileResponse(
                    id=raw["id"],
                    full_name=raw["full_name"],
                    email=raw["email"],
                    phone=raw.get("phone"),
                    headline=raw.get("headline"),
                    current_location=raw["current_location"],
                    relocation_preference=raw["relocation_preference"],
                    preferred_work_modes=raw["preferred_work_modes"],
                    preferred_roles=raw["preferred_roles"],
                    min_match_score=raw["min_match_score"],
                    search_frequency=raw["search_frequency"],
                    education=raw.get("candidate_education") or [],
                    skills=raw.get("candidate_skills") or [],
                    projects=raw.get("candidate_projects") or [],
                    resumes=raw.get("candidate_resumes") or [],
                    created_at=raw.get("created_at"),
                    updated_at=raw.get("updated_at")
                )
        except Exception as exc:
            logger.warning(f"Failed to query Supabase profile: {exc}. Falling back.")

    # In-memory store fallback for offline tests and development
    if current_user.id in _in_memory_profiles:
        return _in_memory_profiles[current_user.id]

    default_profile = _get_default_profile(current_user.id, current_user.email)
    _in_memory_profiles[current_user.id] = default_profile
    return default_profile


@router.put("", response_model=CandidateProfileResponse)
async def update_my_profile(
    profile_data: CandidateProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> CandidateProfileResponse:
    """Updates candidate profile details and preferences."""
    existing = await get_my_profile(current_user=current_user)
    updated_dict = existing.model_dump()

    # Apply updates
    incoming_updates = profile_data.model_dump(exclude_unset=True)
    for field, val in incoming_updates.items():
        if val is not None:
            updated_dict[field] = val

    updated_dict["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    updated_profile = CandidateProfileResponse(**updated_dict)

    # Persist to Supabase if connected
    client = get_supabase_admin()
    if client:
        try:
            client.table("profiles").upsert({
                "id": current_user.id,
                "full_name": updated_profile.full_name,
                "email": updated_profile.email,
                "phone": updated_profile.phone,
                "headline": updated_profile.headline,
                "current_location": updated_profile.current_location,
                "relocation_preference": updated_profile.relocation_preference,
                "preferred_work_modes": updated_profile.preferred_work_modes,
                "preferred_roles": updated_profile.preferred_roles,
                "min_match_score": updated_profile.min_match_score,
                "search_frequency": updated_profile.search_frequency,
            }).execute()
        except Exception as exc:
            logger.warning(f"Supabase upsert failed: {exc}. Updated in-memory store.")

    _in_memory_profiles[current_user.id] = updated_profile
    return updated_profile
