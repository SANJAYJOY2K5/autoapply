-- ==============================================================================
-- AutoApply AI — Migration 00001: Initial Domain Schema
-- Defines profiles, candidate details, jobs, and application tracking entities
-- ==============================================================================

-- 1. Helper Function: Automatic updated_at timestamp update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Candidate Profiles Table (Tied to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    headline TEXT DEFAULT 'Fresher Software Engineer',
    current_location TEXT NOT NULL DEFAULT 'Chennai',
    relocation_preference TEXT NOT NULL DEFAULT 'Chennai + Remote India',
    preferred_work_modes TEXT[] NOT NULL DEFAULT ARRAY['remote', 'hybrid', 'onsite'],
    preferred_roles TEXT[] NOT NULL DEFAULT ARRAY[
        'Frontend Developer',
        'AI / AI Product Developer',
        'Data Analyst',
        'Data Scientist',
        'Full-stack Developer'
    ],
    min_match_score INT NOT NULL DEFAULT 75 CHECK (min_match_score >= 0 AND min_match_score <= 100),
    search_frequency TEXT NOT NULL DEFAULT 'hourly',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. Candidate Education Table
CREATE TABLE IF NOT EXISTS public.candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_year INT NOT NULL CHECK (start_year >= 1990 AND start_year <= 2100),
    end_year INT CHECK (end_year >= 1990 AND end_year <= 2100),
    cgpa_or_percentage TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Candidate Skills Table
CREATE TABLE IF NOT EXISTS public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'technical' CHECK (category IN ('technical', 'framework', 'tool', 'language', 'soft')),
    proficiency TEXT NOT NULL DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Candidate Projects Table
CREATE TABLE IF NOT EXISTS public.candidate_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    github_url TEXT,
    live_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Candidate Resumes Table (Metadata for Private Storage)
CREATE TABLE IF NOT EXISTS public.candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    is_primary BOOLEAN NOT NULL DEFAULT true,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Discovered Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL DEFAULT 'hybrid',
    description TEXT,
    apply_url TEXT NOT NULL,
    min_experience_years NUMERIC(3,1) DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Job Applications Tracking Table with Guardrail Constraints
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    match_score INT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
        status IN ('pending_review', 'escalated', 'queued', 'submitted', 'rejected')
    ),
    escalation_reason TEXT,
    submission_channel TEXT NOT NULL DEFAULT 'authorized_integration',
    submission_proof_ref TEXT,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Guardrail constraint: cannot claim submitted without confirmed submission evidence
    CONSTRAINT chk_submission_proof_required CHECK (
        (status != 'submitted') OR (submission_proof_ref IS NOT NULL AND LENGTH(TRIM(submission_proof_ref)) > 0)
    )
);

-- Create helpful lookup indexes
CREATE INDEX IF NOT EXISTS idx_candidate_education_profile ON public.candidate_education(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_profile ON public.candidate_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_projects_profile ON public.candidate_projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_profile ON public.candidate_resumes(profile_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_profile ON public.job_applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
