"use client";

import { useEffect, useState } from "react";
import {
  User,
  GraduationCap,
  Wrench,
  FolderGit2,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  UploadCloud,
  MapPin,
  Target,
  Clock
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  CandidateProfile,
  EducationItem,
  SkillItem,
  ProjectItem,
  ResumeMetadata
} from "@/lib/types";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "AI / AI Product Developer",
  "Data Analyst",
  "Data Scientist",
  "Full-stack Developer",
  "Backend Developer",
  "Software Engineer - Entry Level"
];

const WORK_MODE_OPTIONS = ["remote", "hybrid", "onsite"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"preferences" | "education" | "skills" | "projects" | "resume">("preferences");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Resume upload state
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await apiClient.getProfile();
        setProfile(data);
      } catch (err: any) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setFeedback(null);

    try {
      const updated = await apiClient.updateProfile(profile);
      setProfile(updated);
      setFeedback({ type: "success", message: "Candidate profile successfully updated!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    if (!profile) return;
    const current = profile.preferred_roles || [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setProfile({ ...profile, preferred_roles: updated });
  };

  const handleWorkModeToggle = (mode: string) => {
    if (!profile) return;
    const current = profile.preferred_work_modes || [];
    const updated = current.includes(mode)
      ? current.filter((m) => m !== mode)
      : [...current, mode];
    setProfile({ ...profile, preferred_work_modes: updated });
  };

  // Education handlers
  const addEducation = () => {
    if (!profile) return;
    const newItem: EducationItem = {
      institution: "Anna University",
      degree: "B.Tech Artificial Intelligence and Data Science",
      field_of_study: "AI & Data Science",
      start_year: 2022,
      end_year: 2026,
      cgpa_or_percentage: "8.5 CGPA"
    };
    setProfile({ ...profile, education: [...profile.education, newItem] });
  };

  const removeEducation = (index: number) => {
    if (!profile) return;
    setProfile({ ...profile, education: profile.education.filter((_, i) => i !== index) });
  };

  // Skill handlers
  const addSkill = () => {
    if (!profile) return;
    const newSkill: SkillItem = {
      skill_name: "",
      category: "technical",
      proficiency: "intermediate"
    };
    setProfile({ ...profile, skills: [...profile.skills, newSkill] });
  };

  const removeSkill = (index: number) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
  };

  // Project handlers
  const addProject = () => {
    if (!profile) return;
    const newProject: ProjectItem = {
      title: "",
      description: "",
      technologies: ["React", "FastAPI", "Python", "TypeScript"],
      github_url: "https://github.com/SANJAYJOY2K5/"
    };
    setProfile({ ...profile, projects: [...profile.projects, newProject] });
  };

  const removeProject = (index: number) => {
    if (!profile) return;
    setProfile({ ...profile, projects: profile.projects.filter((_, i) => i !== index) });
  };

  // Resume Upload simulation & registration
  const handleResumeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.type !== "application/pdf") {
      setFeedback({ type: "error", message: "Only PDF format (.pdf) is supported." });
      return;
    }

    if (file.size > 5242880) {
      setFeedback({ type: "error", message: "Resume file size must be less than 5 MB." });
      return;
    }

    setUploadingResume(true);
    setFeedback(null);

    try {
      const uploadTarget = await apiClient.getResumeUploadUrl(file.name, file.size);
      
      const newResume: ResumeMetadata = {
        file_name: file.name,
        storage_path: uploadTarget.storage_path,
        file_size: file.size,
        mime_type: "application/pdf",
        is_primary: true,
        uploaded_at: new Date().toISOString()
      };

      const confirmed = await apiClient.confirmResumeUpload(newResume);
      setProfile({
        ...profile,
        resumes: [confirmed, ...profile.resumes.filter((r) => r.storage_path !== confirmed.storage_path)]
      });
      setFeedback({ type: "success", message: `Resume "${file.name}" uploaded to private storage!` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to upload resume." });
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Loading candidate profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Profile</h1>
          <p className="text-sm text-slate-400">
            Define your credentials, target locations (Chennai/Remote), roles, and match parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
              : "bg-rose-950/50 border-rose-800 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { key: "preferences", label: "Job Preferences & Rules", icon: Sliders },
          { key: "education", label: `Education (${profile.education.length})`, icon: GraduationCap },
          { key: "skills", label: `Skills (${profile.skills.length})`, icon: Wrench },
          { key: "projects", label: `Projects (${profile.projects.length})`, icon: FolderGit2 },
          { key: "resume", label: `Resume (${profile.resumes.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Preferences & Candidate Requirements */}
      {activeTab === "preferences" && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Contact & Target Location</h2>
            <p className="text-xs text-slate-400">Configured for Chennai freshers and Remote India opportunities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Location</label>
              <input
                type="text"
                value={profile.current_location}
                onChange={(e) => setProfile({ ...profile, current_location: e.target.value })}
                placeholder="Chennai, Tamil Nadu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-300">Target Roles</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ROLE_OPTIONS.map((role) => {
                const checked = profile.preferred_roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition ${
                      checked
                        ? "bg-indigo-950/60 border-indigo-700 text-indigo-200"
                        : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        checked ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-600"
                      }`}
                    >
                      {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span>{role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Minimum Job Match Score Gate ({profile.min_match_score}%)
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={profile.min_match_score}
                onChange={(e) => setProfile({ ...profile, min_match_score: parseInt(e.target.value) })}
                className="w-full accent-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Candidate requirement specifies a minimum 75% match threshold before any application consideration.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discovery Cadence
              </label>
              <select
                value={profile.search_frequency}
                onChange={(e) => setProfile({ ...profile, search_frequency: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="hourly">Hourly (Recommended candidate frequency)</option>
                <option value="daily">Daily</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Searches run hourly subject to platform rate limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Education */}
      {activeTab === "education" && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Education History</h2>
              <p className="text-xs text-slate-400">Colleges, degrees, and academic performance</p>
            </div>
            <button
              onClick={addEducation}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>

          <div className="space-y-4">
            {profile.education.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Entry #{idx + 1}</span>
                  <button
                    onClick={() => removeEducation(idx)}
                    className="text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Institution</label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => {
                        const copy = [...profile.education];
                        copy[idx].institution = e.target.value;
                        setProfile({ ...profile, education: copy });
                      }}
                      placeholder="e.g. Anna University, Chennai"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">CGPA / Percentage</label>
                    <input
                      type="text"
                      value={item.cgpa_or_percentage || ""}
                      onChange={(e) => {
                        const copy = [...profile.education];
                        copy[idx].cgpa_or_percentage = e.target.value;
                        setProfile({ ...profile, education: copy });
                      }}
                      placeholder="8.5 CGPA"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Degree</label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => {
                        const copy = [...profile.education];
                        copy[idx].degree = e.target.value;
                        setProfile({ ...profile, education: copy });
                      }}
                      placeholder="B.E. Computer Science"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Start Year</label>
                    <input
                      type="number"
                      value={item.start_year}
                      onChange={(e) => {
                        const copy = [...profile.education];
                        copy[idx].start_year = parseInt(e.target.value) || 2020;
                        setProfile({ ...profile, education: copy });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">End Year (Graduation)</label>
                    <input
                      type="number"
                      value={item.end_year || ""}
                      onChange={(e) => {
                        const copy = [...profile.education];
                        copy[idx].end_year = parseInt(e.target.value) || undefined;
                        setProfile({ ...profile, education: copy });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Skills */}
      {activeTab === "skills" && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Technical Skills Matrix</h2>
              <p className="text-xs text-slate-400">Categorized skills evaluated for candidate match calculation</p>
            </div>
            <button
              onClick={addSkill}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.skills.map((skill, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-3">
                <input
                  type="text"
                  value={skill.skill_name}
                  onChange={(e) => {
                    const copy = [...profile.skills];
                    copy[idx].skill_name = e.target.value;
                    setProfile({ ...profile, skills: copy });
                  }}
                  placeholder="e.g. React, Python, FastAPI"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />

                <select
                  value={skill.category}
                  onChange={(e) => {
                    const copy = [...profile.skills];
                    copy[idx].category = e.target.value as any;
                    setProfile({ ...profile, skills: copy });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                >
                  <option value="technical">Technical</option>
                  <option value="framework">Framework</option>
                  <option value="tool">Tool</option>
                  <option value="language">Language</option>
                </select>

                <select
                  value={skill.proficiency}
                  onChange={(e) => {
                    const copy = [...profile.skills];
                    copy[idx].proficiency = e.target.value as any;
                    setProfile({ ...profile, skills: copy });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>

                <button
                  onClick={() => removeSkill(idx)}
                  className="text-slate-400 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Projects */}
      {activeTab === "projects" && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Project Showcase</h2>
              <p className="text-xs text-slate-400">Highlight portfolio projects for recruiters</p>
            </div>
            <button
              onClick={addProject}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          <div className="space-y-4">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Project #{idx + 1}</span>
                  <button
                    onClick={() => removeProject(idx)}
                    className="text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const copy = [...profile.projects];
                        copy[idx].title = e.target.value;
                        setProfile({ ...profile, projects: copy });
                      }}
                      placeholder="e.g. AI Powered Job Tracker"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={proj.github_url || ""}
                      onChange={(e) => {
                        const copy = [...profile.projects];
                        copy[idx].github_url = e.target.value;
                        setProfile({ ...profile, projects: copy });
                      }}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const copy = [...profile.projects];
                      copy[idx].description = e.target.value;
                      setProfile({ ...profile, projects: copy });
                    }}
                    placeholder="Briefly describe what you built and the impact..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Resume */}
      {activeTab === "resume" && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Private Resume Vault</h2>
            <p className="text-xs text-slate-400">
              Resumes are uploaded to private Supabase Storage (`resumes/{`{user_id}`}`) with strictly short-lived signed URLs.
            </p>
          </div>

          {/* Upload Zone */}
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {uploadingResume ? "Uploading to secure bucket..." : "Upload New Resume"}
              </p>
              <p className="text-xs text-slate-400">PDF documents only, max 5 MB</p>
            </div>
            <label className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/30 transition">
              Select PDF File
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploadingResume}
                onChange={handleResumeFileSelect}
              />
            </label>
          </div>

          {/* Uploaded Resumes List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stored Resumes ({profile.resumes.length})
            </h3>
            {profile.resumes.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No resumes uploaded yet.</p>
            ) : (
              profile.resumes.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{res.file_name}</span>
                        {res.is_primary && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-400 font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {Math.round(res.file_size / 1024)} KB • Path: {res.storage_path}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Private Encrypted</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
