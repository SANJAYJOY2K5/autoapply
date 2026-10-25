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
    """Builds Sanjay Saminathan's personal operator profile template from verified resume."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return CandidateProfileResponse(
        id=user_id,
        full_name="SANJAY SAMINATHAN",
        email=email if (email and "@" in email and "demo" not in email) else "kishorsanjay2005@gmail.com",
        phone="+91 78713 50761",
        headline="Full Stack Developer & AI/Data Science Engineer",
        current_location="Chennai",
        relocation_preference="Chennai, Tamilnadu & Remote India",
        preferred_work_modes=["remote", "hybrid", "onsite"],
        preferred_roles=[
            "Full-stack Developer",
            "Frontend Developer",
            "AI / AI Product Developer",
            "Data Analyst",
            "Data Scientist",
            "Backend Developer"
        ],
        min_match_score=75,
        search_frequency="hourly",
        education=[
            EducationItem(
                id="edu-sanjay-1",
                institution="Sri Ramakrishna College of Engineering",
                degree="B.Tech – AI & Data Science",
                field_of_study="Artificial Intelligence & Data Science",
                start_year=2022,
                end_year=2026,
                cgpa_or_percentage="7.71/10 CGPA"
            ),
            EducationItem(
                id="edu-sanjay-2",
                institution="Meenakshi Ramasamy Mat. HSS",
                degree="HSC (Class XII)",
                field_of_study="Computer Science & Mathematics",
                start_year=2021,
                end_year=2022,
                cgpa_or_percentage="71.17%"
            ),
            EducationItem(
                id="edu-sanjay-3",
                institution="Annai Theresa Matriculation School",
                degree="SSLC (Class X)",
                field_of_study="General Secondary Education",
                start_year=2019,
                end_year=2020,
                cgpa_or_percentage="80.4%"
            )
        ],
        skills=[
            SkillItem(id="sk-1", skill_name="React.js", category="framework", proficiency="advanced"),
            SkillItem(id="sk-2", skill_name="Next.js", category="framework", proficiency="advanced"),
            SkillItem(id="sk-3", skill_name="Python", category="language", proficiency="advanced"),
            SkillItem(id="sk-4", skill_name="FastAPI", category="framework", proficiency="advanced"),
            SkillItem(id="sk-5", skill_name="Node.js", category="technical", proficiency="intermediate"),
            SkillItem(id="sk-6", skill_name="Express.js", category="framework", proficiency="intermediate"),
            SkillItem(id="sk-7", skill_name="JavaScript", category="language", proficiency="advanced"),
            SkillItem(id="sk-8", skill_name="Tailwind CSS", category="tool", proficiency="advanced"),
            SkillItem(id="sk-9", skill_name="HTML5 & CSS3", category="technical", proficiency="advanced"),
            SkillItem(id="sk-10", skill_name="REST APIs", category="technical", proficiency="advanced"),
            SkillItem(id="sk-11", skill_name="PostgreSQL", category="technical", proficiency="intermediate"),
            SkillItem(id="sk-12", skill_name="MongoDB", category="technical", proficiency="intermediate"),
            SkillItem(id="sk-13", skill_name="MySQL", category="technical", proficiency="intermediate"),
            SkillItem(id="sk-14", skill_name="Firebase", category="technical", proficiency="intermediate"),
            SkillItem(id="sk-15", skill_name="Power BI", category="tool", proficiency="advanced"),
            SkillItem(id="sk-16", skill_name="Pandas", category="framework", proficiency="advanced"),
            SkillItem(id="sk-17", skill_name="NumPy", category="framework", proficiency="advanced"),
            SkillItem(id="sk-18", skill_name="TensorFlow", category="framework", proficiency="intermediate"),
            SkillItem(id="sk-19", skill_name="OpenCV", category="framework", proficiency="intermediate"),
            SkillItem(id="sk-20", skill_name="Git & GitHub", category="tool", proficiency="advanced"),
            SkillItem(id="sk-21", skill_name="Docker", category="tool", proficiency="intermediate"),
            SkillItem(id="sk-22", skill_name="Vercel & Render", category="tool", proficiency="advanced"),
            SkillItem(id="sk-23", skill_name="VS Code & Cursor AI", category="tool", proficiency="expert"),
            SkillItem(id="sk-24", skill_name="Problem-solving", category="soft", proficiency="advanced"),
            SkillItem(id="sk-25", skill_name="Teamwork & Communication", category="soft", proficiency="advanced")
        ],
        projects=[
            ProjectItem(
                id="proj-1",
                title="Community Detection of Purchasing Tendency in Large-Scale E-Commerce (2026)",
                description="Applied graph-based community detection algorithms (Louvain, Girvan-Newman) to uncover buyer clusters from large-scale e-commerce transaction networks. Engineered user-product interaction graphs using Python (NetworkX, Pandas) from millions of purchase records. Built a React + D3.js dashboard to visualize community structures and buying patterns with interactive filters and graph exploration.",
                technologies=["Python", "NetworkX", "Pandas", "React", "D3.js", "Graph Algorithms"],
                github_url="https://github.com/SANJAYJOY2K5"
            ),
            ProjectItem(
                id="proj-2",
                title="Community Detection Dashboard (2024)",
                description="Graph-based community detection system with interactive D3.js visualization frontend. REST API backend (FastAPI/Python) serving Louvain and Girvan-Newman algorithm results. Exported reports as PDF with dynamic charts using ReportLab and Matplotlib.",
                technologies=["FastAPI", "Python", "React", "D3.js", "ReportLab", "Matplotlib"],
                github_url="https://github.com/SANJAYJOY2K5"
            ),
            ProjectItem(
                id="proj-3",
                title="Animal Type Classifier (2024)",
                description="ML image classification model using TensorFlow and OpenCV in Python to identify animal species. Integrated model into a Flask web app with drag-and-drop image upload and prediction display.",
                technologies=["TensorFlow", "OpenCV", "Python", "Flask", "Machine Learning"],
                github_url="https://github.com/SANJAYJOY2K5"
            ),
            ProjectItem(
                id="proj-4",
                title="Virtual Hand Gesture Mouse (2022)",
                description="Controlled the computer cursor via real-time hand gestures using MediaPipe + OpenCV computer vision. Designed for improved device accessibility for users with limited mobility.",
                technologies=["Python", "MediaPipe", "OpenCV", "Computer Vision"],
                github_url="https://github.com/SANJAYJOY2K5"
            ),
            ProjectItem(
                id="proj-5",
                title="Sleep Tracker Android App (2024)",
                description="Android app tracking and analyzing sleep duration with automatic start/stop detection. Built with Java/Kotlin; visualized sleep trends using MPAndroidChart library.",
                technologies=["Android", "Kotlin", "Java", "MPAndroidChart"],
                github_url="https://github.com/SANJAYJOY2K5"
            ),
            ProjectItem(
                id="proj-6",
                title="Software Developer – Greator Software (Perambalur)",
                description="Developing and maintaining full stack web applications as part of the core software team. Collaborating with cross-functional teams to design, build, and ship product features on schedule following agile practices.",
                technologies=["Full Stack", "React", "Node.js", "Agile", "Web Applications"],
                live_url="https://linkedin.com/in/sanjay-saminathan-6908202a3"
            ),
            ProjectItem(
                id="proj-7",
                title="Full Stack Developer Intern – ZANE",
                description="Built and deployed full stack web features using React (frontend) and Node.js/Express (backend). Performed data cleaning, preprocessing, and analysis using Python (Pandas, NumPy). Designed interactive Power BI dashboards for real-time business KPI monitoring. Integrated REST APIs to connect frontend with backend.",
                technologies=["Python", "Power BI", "React", "Node.js", "Express.js", "REST APIs", "Pandas", "NumPy"],
                live_url="https://linkedin.com/in/sanjay-saminathan-6908202a3"
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
