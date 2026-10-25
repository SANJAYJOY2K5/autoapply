export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year?: number;
  cgpa_or_percentage?: string;
}

export interface SkillItem {
  id?: string;
  skill_name: string;
  category: "technical" | "framework" | "tool" | "language" | "soft";
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
}

export interface ResumeMetadata {
  id?: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  is_primary: boolean;
  uploaded_at?: string;
}

export interface CandidateProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  headline?: string;
  current_location: string;
  relocation_preference: string;
  preferred_work_modes: string[];
  preferred_roles: string[];
  min_match_score: number;
  search_frequency: string;
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  resumes: ResumeMetadata[];
  created_at?: string;
  updated_at?: string;
}

export interface JobItem {
  id: string;
  external_id?: string;
  source: string;
  title: string;
  company: string;
  location: string;
  work_mode: string;
  description?: string;
  apply_url: string;
  min_experience_years: number;
  match_score?: number;
  is_active: boolean;
  created_at?: string;
}

export type ApplicationStatus = "pending_review" | "escalated" | "queued" | "submitted" | "rejected" | "link_opened";

export interface ApplicationItem {
  id: string;
  profile_id: string;
  job_id: string;
  job_title?: string;
  company?: string;
  location?: string;
  match_score: number;
  status: ApplicationStatus;
  escalation_reason?: string;
  submission_channel: string;
  submission_proof_ref?: string;
  applied_at?: string;
  created_at?: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}
