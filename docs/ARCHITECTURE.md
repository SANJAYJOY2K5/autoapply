# AutoApply AI — System Architecture

## 1. System Overview
AutoApply AI is designed to automate job discovery, match calculation, and application submission for Indian freshers while adhering to strict security, compliance, and ethical automation principles.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Frontend                  │
│       (App Router, TypeScript, Tailwind, Lucide)       │
└───────────────────────────┬────────────────────────────┘
                            │ Bearer JWT (Supabase Auth)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend API                  │
│  - JWT Verification & Context Injection                │
│  - Profile Management & Preferences Validation         │
│  - Signed URL Generator for Private Resume Storage     │
│  - Guardrails & Policy Enforcement                     │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Supabase Database     │ │  Supabase Storage (resumes)│
│  - RLS Isolation Policies │ │  - Private bucket         │
│  - Integrity Constraints  │ │  - Signed URL access only │
└───────────────────────────┘ └───────────────────────────┘
```

## 2. Security Boundaries & Authorization
1. **Frontend Isolation**:
   - The browser client only accesses Supabase using `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly reserved for the backend service.
2. **Backend API Verification**:
   - Every protected API route extracts and validates the Bearer token against Supabase JWT authentication.
   - The user UUID (`sub`) is extracted securely and isolated so a user can never access or modify another candidate's profile, resume, or applications.
3. **Storage Security**:
   - Resumes bucket is configured as `public = false`.
   - Access to upload/read is granted strictly to the owner under `resumes/{user_id}/*`.
   - Resumes are served to the candidate UI via short-lived signed URLs (15-minute TTL).
4. **Application Submission Guardrail**:
   - Domain rule: Applications cannot enter `submitted` status without a validated `submission_proof_ref`.
   - Applications requiring complex authentication, CAPTCHA, or custom assessments are flagged with `status = 'escalated'`.
5. **Phase 1 Isolation**:
   - Automated external scrapers and submission workers remain disabled via feature flags.

## 3. Candidate Matching Requirements
- **Location Filter**: Chennai, Kanchipuram, Tiruvallur, Chengalpattu, Vellore, and Remote Pan-India.
- **Roles**: Frontend Developer, AI Product Developer, Data Analyst, Data Scientist, Full-stack Developer.
- **Minimum Match Score**: 75%.
- **Search Frequency**: Hourly discovery schedule.
