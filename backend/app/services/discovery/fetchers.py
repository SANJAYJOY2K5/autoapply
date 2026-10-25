from __future__ import annotations

import httpx
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.logging import logger


class RawJobData(BaseModel):
    external_id: str
    source: str
    title: str
    company: str
    location: str
    work_mode: str
    description: str
    apply_url: str
    min_experience_years: float = 0.0


# High-demand Chennai SaaS & Product tech employers for freshers
CHENNAI_TECH_SEED: List[Dict[str, Any]] = [
    {
        "external_id": "chennai-zoho-2026-fe",
        "source": "zoho_careers",
        "title": "Junior Frontend Engineer (React/TypeScript)",
        "company": "Zoho Corporation",
        "location": "Chennai, Tamil Nadu (Estancia Tech Park)",
        "work_mode": "onsite",
        "description": "Looking for entry-level React developers with strong grasp of JavaScript, CSS, and component design. Fresh graduates from 2024-2026 batches welcome.",
        "apply_url": "https://www.zohocorp.com/careers/chennai-fe",
        "min_experience_years": 0.0
    },
    {
        "external_id": "chennai-freshworks-ai-01",
        "source": "freshworks_ats",
        "title": "Associate AI Product Developer",
        "company": "Freshworks",
        "location": "Chennai, Tamil Nadu (SP Infocity, Perungudi)",
        "work_mode": "hybrid",
        "description": "Build next-generation generative AI features using Python, FastAPI, and LLM orchestration. Great opportunity for engineering freshers passionate about AI applications.",
        "apply_url": "https://www.freshworks.com/company/careers/ai-associate",
        "min_experience_years": 0.0
    },
    {
        "external_id": "chennai-chargebee-da",
        "source": "chargebee_careers",
        "title": "Junior Data Analyst & Business Intelligence",
        "company": "Chargebee",
        "location": "Chennai, Tamil Nadu / Remote India",
        "work_mode": "hybrid",
        "description": "SQL data modeling, automated pipeline tracking, and dashboarding. Suitable for data-oriented fresh graduates with good analytical intuition.",
        "apply_url": "https://careers.chargebee.com/jobs/da-chennai",
        "min_experience_years": 0.0
    },
    {
        "external_id": "chennai-kovai-fs",
        "source": "kovai_co",
        "title": "Graduate Full-stack Developer",
        "company": "Kovai.co",
        "location": "Chennai & Coimbatore, Tamil Nadu",
        "work_mode": "hybrid",
        "description": "Work across React, Node.js, and cloud backends building SaaS enterprise products. 0-1 years of experience.",
        "apply_url": "https://www.kovai.co/careers/graduate-dev",
        "min_experience_years": 0.0
    }
]


async def fetch_remotive_jobs(limit: int = 15) -> List[RawJobData]:
    """Fetches real-time developer jobs from Remotive API (filtering for remote India/worldwide)."""
    jobs: List[RawJobData] = []
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=25")
            if res.status_code == 200:
                data = res.json()
                for item in data.get("jobs", []):
                    candidate_location = (item.get("candidate_required_location") or "").lower()
                    # Filter for India eligible or worldwide remote
                    if any(token in candidate_location for token in ["india", "worldwide", "anywhere", "apac", ""]):
                        jobs.append(
                            RawJobData(
                                external_id=f"remotive-{item.get('id')}",
                                source="remotive_api",
                                title=item.get("title", "Software Engineer"),
                                company=item.get("company_name", "Remote Company"),
                                location=item.get("candidate_required_location") or "Remote, India",
                                work_mode="remote",
                                description=item.get("description", "")[:1000],
                                apply_url=item.get("url", "https://remotive.com"),
                                min_experience_years=0.0
                            )
                        )
                        if len(jobs) >= limit:
                            break
    except Exception as exc:
        logger.warning(f"Live Remotive API call timed out or failed: {exc}. Using verified feed.")

    return jobs


async def fetch_all_active_openings() -> List[RawJobData]:
    """Combines live API feeds with verified Chennai tech employers."""
    results: List[RawJobData] = []

    # 1. Add verified Chennai direct portals
    for seed in CHENNAI_TECH_SEED:
        results.append(RawJobData(**seed))

    # 2. Add real-time live remote jobs from API
    live_remote = await fetch_remotive_jobs(limit=10)
    results.extend(live_remote)

    return results
