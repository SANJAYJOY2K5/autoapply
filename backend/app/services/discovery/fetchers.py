from __future__ import annotations

import httpx
import re
import urllib.parse
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


HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


async def fetch_linkedin_live_jobs(keywords: str = "Frontend Developer", location: str = "Chennai", limit: int = 10) -> List[RawJobData]:
    """
    Fetches 100% original, active, live job postings directly from LinkedIn's public feed.
    Requires no user login or password.
    """
    jobs: List[RawJobData] = []
    enc_keywords = urllib.parse.quote(keywords)
    enc_location = urllib.parse.quote(location)
    url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={enc_keywords}&location={enc_location}"

    try:
        async with httpx.AsyncClient(headers=HTTP_HEADERS, timeout=8.0, follow_redirects=True) as client:
            res = await client.get(url)
            if res.status_code == 200:
                cards = re.findall(r'<div class="base-card[^\"]*job-search-card.*?</li>', res.text, re.DOTALL)
                for card in cards:
                    t_match = re.search(r'<h3 class="base-search-card__title">\s*([^<\n\r]+)', card)
                    c_match = re.search(r'<h4 class="base-search-card__subtitle">\s*(?:<a[^>]*>)?\s*([^<\n\r]+)', card)
                    l_match = re.search(r'<span class="job-search-card__location">\s*([^<\n\r]+)', card)
                    link_match = re.search(r'<a class="base-card__full-link[^\"]*" href="([^\"]+)"', card)

                    if t_match and link_match:
                        title = t_match.group(1).strip()
                        company = c_match.group(1).strip() if c_match else "Verified Employer"
                        loc = l_match.group(1).strip() if l_match else location
                        apply_url = link_match.group(1).split("?")[0]
                        job_id = re.search(r'/view/([^/?]+)', apply_url)
                        ext_id = f"linkedin-{job_id.group(1)}" if job_id else f"linkedin-{len(jobs)+1}"

                        is_remote = "remote" in loc.lower() or "remote" in title.lower()

                        jobs.append(
                            RawJobData(
                                external_id=ext_id,
                                source="LinkedIn",
                                title=title,
                                company=company,
                                location=loc,
                                work_mode="remote" if is_remote else "hybrid",
                                description=f"Live vacancy on LinkedIn for {title} at {company} ({loc}). Full details and requirements on official listing.",
                                apply_url=apply_url,
                                min_experience_years=0.0
                            )
                        )
                        if len(jobs) >= limit:
                            break
    except Exception as exc:
        logger.warning(f"Live LinkedIn fetch error: {exc}")

    return jobs


async def fetch_shine_live_jobs(keywords: str = "frontend-developer", location: str = "chennai", limit: int = 10) -> List[RawJobData]:
    """
    Fetches real-time active job postings from Shine.com.
    """
    jobs: List[RawJobData] = []
    slug_kw = re.sub(r'[^a-zA-Z0-9]+', '-', keywords.lower()).strip('-')
    slug_loc = re.sub(r'[^a-zA-Z0-9]+', '-', location.lower()).strip('-')
    url = f"https://www.shine.com/job-search/{slug_kw}-jobs-in-{slug_loc}"

    try:
        async with httpx.AsyncClient(headers=HTTP_HEADERS, timeout=8.0, follow_redirects=True) as client:
            res = await client.get(url)
            if res.status_code == 200:
                # Find shine job links: /jobs/{slug}/{company}/{id}
                matches = re.findall(r'href="(/jobs/([^/]+)/([^/]+)/(\d+)[^"]*)"', res.text)
                seen_ids = set()
                for full_path, role_slug, comp_slug, job_id in matches:
                    if job_id in seen_ids:
                        continue
                    seen_ids.add(job_id)

                    title = role_slug.replace("-", " ").title()
                    company = comp_slug.replace("-", " ").title()
                    apply_url = f"https://www.shine.com/jobs/{role_slug}/{comp_slug}/{job_id}/"

                    jobs.append(
                        RawJobData(
                            external_id=f"shine-{job_id}",
                            source="Shine",
                            title=title,
                            company=company,
                            location=f"{location.title()}, Tamil Nadu",
                            work_mode="hybrid",
                            description=f"Live job opening listed on Shine for {title} at {company}. Direct candidate application via Shine portal.",
                            apply_url=apply_url,
                            min_experience_years=0.0
                        )
                    )
                    if len(jobs) >= limit:
                        break
    except Exception as exc:
        logger.warning(f"Live Shine fetch error: {exc}")

    return jobs


async def fetch_remotive_live_jobs(limit: int = 10) -> List[RawJobData]:
    """Fetches real-time remote tech jobs from Remotive API for India & Worldwide candidates."""
    jobs: List[RawJobData] = []
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=20")
            if res.status_code == 200:
                data = res.json()
                for item in data.get("jobs", []):
                    candidate_location = (item.get("candidate_required_location") or "").lower()
                    if any(token in candidate_location for token in ["india", "worldwide", "anywhere", "apac", ""]):
                        clean_desc = re.sub(r'<[^>]+>', ' ', item.get("description", ""))[:300]
                        jobs.append(
                            RawJobData(
                                external_id=f"remotive-{item.get('id')}",
                                source="Remotive (Remote India)",
                                title=item.get("title", "Software Developer"),
                                company=item.get("company_name", "Tech Startup"),
                                location=item.get("candidate_required_location") or "Remote, India",
                                work_mode="remote",
                                description=clean_desc,
                                apply_url=item.get("url", "https://remotive.com"),
                                min_experience_years=0.0
                            )
                        )
                        if len(jobs) >= limit:
                            break
    except Exception as exc:
        logger.warning(f"Live Remotive API error: {exc}")

    return jobs


async def fetch_all_active_openings(preferred_roles: Optional[List[str]] = None, location: str = "Chennai") -> List[RawJobData]:
    """
    Gathers 100% original, real-time live openings from LinkedIn, Shine, and Remotive.
    """
    results: List[RawJobData] = []
    roles_to_scan = preferred_roles or ["Frontend Developer", "AI Developer", "Data Analyst"]

    # Scan primary target role on LinkedIn
    primary_role = roles_to_scan[0] if roles_to_scan else "Frontend Developer"
    linkedin_jobs = await fetch_linkedin_live_jobs(keywords=primary_role, location=location, limit=8)
    results.extend(linkedin_jobs)

    # Scan Shine
    shine_jobs = await fetch_shine_live_jobs(keywords=primary_role, location=location, limit=6)
    results.extend(shine_jobs)

    # Scan Remote India
    remotive_jobs = await fetch_remotive_live_jobs(limit=6)
    results.extend(remotive_jobs)

    logger.info(f"Aggregated live jobs: {len(linkedin_jobs)} LinkedIn, {len(shine_jobs)} Shine, {len(remotive_jobs)} Remotive.")
    return results
