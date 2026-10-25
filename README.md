# AutoApply AI — Job Discovery & Application Automation

A production-minded platform engineered for Indian freshers targeting entry-level tech roles in **Chennai and nearby areas, plus Remote jobs across India**.

## Target Roles
- Frontend Developer
- AI / AI Product Developer
- Data Analyst & Data Scientist
- Full-stack Developer
- Relevant entry-level Software Engineering roles

## Core System Guardrails & Policies
- **Location Target**: Chennai (and nearby regions) + Remote within India.
- **Minimum Match Score**: 75% algorithm match before considering application.
- **Search Frequency**: Hourly job discovery schedule (subject to source rate limits).
- **Submission Policy**: Direct submission only via explicitly authorized integrations with immutable evidence. Ambiguous, restricted, or credential-sensitive applications are automatically escalated for manual user review.
- **Security & Privacy**: Zero plaintext credentials stored; private resume storage with short-lived signed URLs; Row-Level Security (RLS) on all database tables.

---

## Monorepo Layout

```
autoapply/
├── frontend/        # Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase SSR
├── backend/         # FastAPI, Python 3.8+, Pydantic v2, Pytest
├── supabase/        # SQL schema migrations, RLS policies, private storage definition
└── docs/            # Architecture specifications and local setup instructions
```

## Quick Start
Refer to [`docs/SETUP.md`](docs/SETUP.md) for local configuration and run instructions.
Architecture details and design constraints are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
