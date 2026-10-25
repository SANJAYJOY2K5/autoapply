-- ==============================================================================
-- AutoApply AI — Migration 00002: Row-Level Security & Private Storage
-- Enforces tenant isolation, secure owner policies, and private resume bucket
-- ==============================================================================

-- 1. Enable Row-Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Candidate Education Policies
CREATE POLICY "Users can view their own education"
ON public.candidate_education FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own education"
ON public.candidate_education FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own education"
ON public.candidate_education FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own education"
ON public.candidate_education FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 4. Candidate Skills Policies
CREATE POLICY "Users can view their own skills"
ON public.candidate_skills FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own skills"
ON public.candidate_skills FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own skills"
ON public.candidate_skills FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own skills"
ON public.candidate_skills FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 5. Candidate Projects Policies
CREATE POLICY "Users can view their own projects"
ON public.candidate_projects FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own projects"
ON public.candidate_projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own projects"
ON public.candidate_projects FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own projects"
ON public.candidate_projects FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 6. Candidate Resumes Policies
CREATE POLICY "Users can view their own resumes"
ON public.candidate_resumes FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own resumes"
ON public.candidate_resumes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own resumes"
ON public.candidate_resumes FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own resumes"
ON public.candidate_resumes FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 7. Jobs Policies (Authenticated users can read active jobs)
CREATE POLICY "Authenticated users can view active jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (is_active = true);

-- 8. Job Applications Policies
CREATE POLICY "Users can view their own applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own applications"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own applications"
ON public.job_applications FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- ==============================================================================
-- 9. Private Storage Bucket Setup: resumes
-- ==============================================================================
-- Resumes must NEVER be publicly readable.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false,
    5242880, -- 5 MB limit
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf'];

-- Storage RLS: Users can only upload to resumes/{auth.uid()}/*
CREATE POLICY "Users can upload resumes to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Users can only view/download their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Users can delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
