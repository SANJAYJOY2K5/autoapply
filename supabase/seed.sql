-- ==============================================================================
-- AutoApply AI — Sample Seed Data for Local Development & Testing
-- Contains realistic entry-level tech opportunities in Chennai & Remote India
-- ==============================================================================

INSERT INTO public.jobs (id, external_id, source, title, company, location, work_mode, description, apply_url, min_experience_years, is_active)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'chennai-fe-01',
    'company_portal',
    'Associate Frontend Developer',
    'Zoho Corporation',
    'Chennai, Tamil Nadu',
    'onsite',
    'Looking for entry-level React/TypeScript developers with good grasp of modern web fundamentals and component architecture.',
    'https://careers.zohocorp.com/jobs/frontend-dev',
    0.0,
    true
),
(
    'b2222222-2222-2222-2222-222222222222',
    'chennai-ai-02',
    'company_portal',
    'Junior AI Product Developer',
    'Freshworks',
    'Chennai, Tamil Nadu',
    'hybrid',
    'Work with LLMs, prompt engineering, and Python backend services to power customer experience AI agents.',
    'https://careers.freshworks.com/jobs/junior-ai-dev',
    0.0,
    true
),
(
    'c3333333-3333-3333-3333-333333333333',
    'remote-da-03',
    'company_portal',
    'Junior Data Analyst',
    'Chargebee',
    'Remote, India',
    'remote',
    'Entry-level data analyst responsible for SQL queries, reporting dashboards, and metric anomaly detection.',
    'https://careers.chargebee.com/jobs/data-analyst',
    0.0,
    true
),
(
    'd4444444-4444-4444-4444-444444444444',
    'remote-fs-04',
    'company_portal',
    'Graduate Software Engineer (Full-stack)',
    'Postman',
    'Remote, India',
    'remote',
    'Full-stack engineering role using Node.js, React, and PostgreSQL. Fresh graduates and self-taught developers welcome.',
    'https://careers.postman.com/jobs/fresher-fs',
    0.0,
    true
)
ON CONFLICT (id) DO NOTHING;
