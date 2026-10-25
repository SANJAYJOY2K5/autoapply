from __future__ import annotations

import re
from typing import List, Tuple, Set
from app.schemas.profile import CandidateProfileResponse, SkillItem


def _normalize_text(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())


def calculate_job_match(
    title: str,
    location: str,
    work_mode: str,
    description: str,
    profile: CandidateProfileResponse,
    min_threshold: int = 75
) -> Tuple[int, List[str]]:
    """
    Evaluates job relevance for Indian freshers against candidate preferences.
    Calculates a transparent score (0 - 100):
      - Role Relevance (up to 35 pts)
      - Location & Work Mode Fit (up to 25 pts)
      - Skill Stack Alignment (up to 40 pts)
    """
    match_reasons: List[str] = []
    norm_title = _normalize_text(title)
    norm_desc = _normalize_text(description or "")
    norm_loc = _normalize_text(location)

    # 1. Role Match (35 Points)
    title_score = 0
    candidate_roles = [r.lower() for r in (profile.preferred_roles or [])]

    # Keyword mappings
    role_keywords = {
        "frontend": ["frontend", "front end", "react", "ui developer", "javascript"],
        "ai": ["ai", "machine learning", "product developer", "llm", "artificial intelligence"],
        "data": ["data analyst", "data scientist", "analytics", "sql", "bi analyst"],
        "full-stack": ["full stack", "fullstack", "software engineer", "developer", "graduate engineer"]
    }

    matched_role_family = False
    for pref_role in candidate_roles:
        # Direct phrase match in title
        if any(token in norm_title for token in pref_role.split()):
            title_score = 35
            match_reasons.append(f"Target role match: {pref_role.title()}")
            matched_role_family = True
            break

    if not matched_role_family:
        # Check generic software engineer/developer
        if "developer" in norm_title or "engineer" in norm_title or "intern" in norm_title:
            title_score = 25
            match_reasons.append("Relevant entry-level developer title")
        else:
            title_score = 10

    # 2. Location & Work Mode Match (25 Points)
    loc_score = 0
    is_remote = "remote" in norm_loc or work_mode.lower() == "remote" or "anywhere" in norm_loc or "india" in norm_loc
    is_chennai = any(c in norm_loc for c in ["chennai", "tamil nadu", "omr", "guindy", "siruseri", "ambattur"])

    if is_chennai:
        loc_score = 25
        match_reasons.append("Exact target location: Chennai & nearby corridors")
    elif is_remote:
        loc_score = 25
        match_reasons.append("Eligible Pan-India Remote work mode")
    elif "india" in norm_loc or "bengaluru" in norm_loc or "hyderabad" in norm_loc:
        loc_score = 15
        match_reasons.append("India tech hub (hybrid/relocation possible)")
    else:
        loc_score = 5

    # 3. Technical Skills Alignment (40 Points)
    skill_score = 0
    candidate_skills: Set[str] = {
        s.skill_name.lower().strip() for s in (profile.skills or []) if s.skill_name
    }

    matched_skills: List[str] = []
    for skill in candidate_skills:
        # Match skill boundary in description or title
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, norm_desc) or re.search(pattern, norm_title):
            matched_skills.append(skill.title())

    if candidate_skills:
        ratio = len(matched_skills) / max(len(candidate_skills), 1)
        skill_score = min(int(ratio * 60), 40)
        if len(matched_skills) >= 1:
            skill_score = max(skill_score, 25)
        elif matched_role_family:
            # Specialization matches candidate role family
            skill_score = max(skill_score, 20)
    else:
        skill_score = 20

    if matched_skills:
        match_reasons.append(f"Matching stack: {', '.join(matched_skills[:4])}")
    elif matched_role_family:
        match_reasons.append("Role alignment with candidate technical stack")

    total_score = min(title_score + loc_score + skill_score, 100)
    return total_score, match_reasons
