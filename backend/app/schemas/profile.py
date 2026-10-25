from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, EmailStr


class EducationItem(BaseModel):
    id: Optional[str] = None
    institution: str = Field(..., min_length=2, description="College or university name")
    degree: str = Field(..., min_length=2, description="e.g. B.E, B.Tech, B.Sc, M.Sc")
    field_of_study: str = Field(..., min_length=2, description="e.g. Computer Science, Artificial Intelligence")
    start_year: int = Field(..., ge=1990, le=2100)
    end_year: Optional[int] = Field(None, ge=1990, le=2100)
    cgpa_or_percentage: Optional[str] = Field(None, description="e.g. 8.5 CGPA or 85%")


class SkillItem(BaseModel):
    id: Optional[str] = None
    skill_name: str = Field(..., min_length=1)
    category: str = Field(default="technical", description="technical, framework, tool, language, soft")
    proficiency: str = Field(default="intermediate", description="beginner, intermediate, advanced, expert")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        valid = {"technical", "framework", "tool", "language", "soft"}
        if v.lower() not in valid:
            raise ValueError(f"Category must be one of: {', '.join(valid)}")
        return v.lower()

    @field_validator("proficiency")
    @classmethod
    def validate_proficiency(cls, v: str) -> str:
        valid = {"beginner", "intermediate", "advanced", "expert"}
        if v.lower() not in valid:
            raise ValueError(f"Proficiency must be one of: {', '.join(valid)}")
        return v.lower()


class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=5)
    technologies: List[str] = Field(default_factory=list)
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ResumeMetadata(BaseModel):
    id: Optional[str] = None
    file_name: str
    storage_path: str
    file_size: int = Field(..., ge=1, le=5242880) # max 5MB
    mime_type: str = "application/pdf"
    is_primary: bool = True
    uploaded_at: Optional[str] = None


class CandidateProfileBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    phone: Optional[str] = None
    headline: Optional[str] = "Fresher Software Engineer"
    current_location: str = Field(default="Chennai", min_length=2)
    relocation_preference: str = Field(default="Chennai + Remote India")
    preferred_work_modes: List[str] = Field(
        default_factory=lambda: ["remote", "hybrid", "onsite"]
    )
    preferred_roles: List[str] = Field(
        default_factory=lambda: [
            "Frontend Developer",
            "AI / AI Product Developer",
            "Data Analyst",
            "Data Scientist",
            "Full-stack Developer"
        ]
    )
    min_match_score: int = Field(default=75, ge=0, le=100)
    search_frequency: str = Field(default="hourly")

    @field_validator("min_match_score")
    @classmethod
    def validate_match_score(cls, v: int) -> int:
        if v < 0 or v > 100:
            raise ValueError("Match score threshold must be between 0 and 100")
        return v


class CandidateProfileCreate(CandidateProfileBase):
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[SkillItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)


class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None, min_length=5)
    phone: Optional[str] = None
    headline: Optional[str] = None
    current_location: Optional[str] = None
    relocation_preference: Optional[str] = None
    preferred_work_modes: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None
    min_match_score: Optional[int] = Field(None, ge=0, le=100)
    search_frequency: Optional[str] = None
    education: Optional[List[EducationItem]] = None
    skills: Optional[List[SkillItem]] = None
    projects: Optional[List[ProjectItem]] = None


class CandidateProfileResponse(CandidateProfileBase):
    id: str
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[SkillItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    resumes: List[ResumeMetadata] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
