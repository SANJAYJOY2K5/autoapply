import { createClient } from "./supabase/client";
import {
  CandidateProfile,
  JobItem,
  ApplicationItem,
  ResumeMetadata,
  HealthStatus
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class APIClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else {
        headers["Authorization"] = "Bearer demo-dev-token";
      }
    } catch {
      headers["Authorization"] = "Bearer demo-dev-token";
    }

    return headers;
  }

  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  }

  async getProfile(): Promise<CandidateProfile> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/profile/me`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.statusText}`);
    }
    return res.json();
  }

  async updateProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update profile");
    }
    return res.json();
  }

  async getJobs(minScore: number = 75, location?: string): Promise<JobItem[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams({ min_score: minScore.toString() });
    if (location) params.append("location", location);

    const res = await fetch(`${API_BASE_URL}/api/v1/jobs?${params.toString()}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch jobs: ${res.statusText}`);
    }
    return res.json();
  }

  async triggerJobScan(): Promise<JobItem[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/jobs/scan`, {
      method: "POST",
      headers,
    });
    if (!res.ok) {
      throw new Error("Job discovery scan failed");
    }
    return res.json();
  }


  async getApplications(): Promise<ApplicationItem[]> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/applications`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch applications: ${res.statusText}`);
    }
    return res.json();
  }

  async getResumeUploadUrl(fileName: string, fileSize: number): Promise<{ storage_path: string; bucket: string; upload_url?: string }> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/storage/resume-upload-url`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        file_name: fileName,
        file_size: fileSize,
        mime_type: "application/pdf",
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to generate resume upload path");
    }
    return res.json();
  }

  async confirmResumeUpload(metadata: ResumeMetadata): Promise<ResumeMetadata> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/storage/resume-confirm`, {
      method: "POST",
      headers,
      body: JSON.stringify(metadata),
    });
    if (!res.ok) {
      throw new Error("Failed to confirm resume upload");
    }
    return res.json();
  }

  async getResumeDownloadUrl(path: string): Promise<string> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/v1/storage/resume-download-url?path=${encodeURIComponent(path)}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error("Failed to get resume download URL");
    }
    const data = await res.json();
    return data.signed_url;
  }
}

export const apiClient = new APIClient();
