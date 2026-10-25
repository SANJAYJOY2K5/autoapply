"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Target,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { CandidateProfile, ApplicationItem } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, appsData] = await Promise.allSettled([
          apiClient.getProfile(),
          apiClient.getApplications(),
        ]);

        if (profData.status === "fulfilled") {
          setProfile(profData.value);
        }
        if (appsData.status === "fulfilled") {
          setApplications(appsData.value);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const submittedCount = applications.filter((a) => a.status === "submitted").length;
  const escalatedCount = applications.filter((a) => a.status === "escalated").length;
  const pendingCount = applications.filter((a) => a.status === "pending_review").length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/50 border border-indigo-900/40 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanjay's Personal Command Center • Chennai & Remote Tech</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome, {profile?.full_name || "Sanjay"} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              AutoApply AI is actively tracking entry-level roles matching your 75%+ score gate in{" "}
              <span className="text-indigo-400 font-medium">Chennai & Remote India</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Edit Profile
            </Link>
            <Link
              href="/jobs"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              Browse Qualified Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Minimum Match Threshold</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {profile?.min_match_score || 75}%
          </div>
          <p className="text-[11px] text-slate-400">Strict gate: sub-75% jobs filtered out</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Discovery Cadence</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white capitalize">
            {profile?.search_frequency || "Hourly"}
          </div>
          <p className="text-[11px] text-slate-400">Respects source-specific rate limits</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Submitted (With Proof)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {submittedCount}
          </div>
          <p className="text-[11px] text-slate-400">100% verified submission evidence</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Escalated For Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {escalatedCount}
          </div>
          <p className="text-[11px] text-slate-400">Sensitive credentials or custom portals</p>
        </div>
      </div>

      {/* Target Criteria & Guardrail Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Target Parameters */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active Discovery Parameters</h2>
            <span className="text-xs text-indigo-400 font-mono">Phase 1 Config</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Target Territory</span>
                <span className="text-xs text-slate-400">
                  Chennai (OMR, Guindy, Siruseri, Ambattur) + Remote pan-India opportunities
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <Briefcase className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Target Roles</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(profile?.preferred_roles || [
                    "Frontend Developer",
                    "AI / AI Product Developer",
                    "Data Analyst",
                    "Data Scientist",
                    "Full-stack Developer",
                  ]).map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/50 text-[11px] text-purple-300 font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Strict Submission Policy</span>
                <span className="text-xs text-slate-400">
                  Automatic submission is restricted strictly to explicitly authorized integrations. Portals requiring external passwords, CAPTCHAs, or subjective assessments are escalated to manual review.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System & Guardrails Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">System Guardrails</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Row-Level Security</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Private Resume Bucket</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Isolated
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Plaintext Passwords</span>
                <span className="text-slate-300 font-medium">None Stored</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Auto-Apply Engine</span>
                <span className="text-amber-400 font-medium">Disabled (Phase 1)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-400">Unverified Scraping</span>
                <span className="text-amber-400 font-medium">Disabled</span>
              </div>
            </div>
          </div>

          <Link
            href="/settings"
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 text-center transition block"
          >
            Review Security Settings
          </Link>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Tracked Applications</h2>
            <p className="text-xs text-slate-400">Real-time status of candidate applications</p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All Applications <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Job Title & Company</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Match Score</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applications.slice(0, 4).map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 pr-4">
                    <span className="font-semibold text-slate-100 block">{app.job_title}</span>
                    <span className="text-[11px] text-slate-400">{app.company}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-300">{app.location}</td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 font-mono font-bold">
                      {app.match_score}%
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    {app.status === "submitted" && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-medium">
                        Submitted • {app.submission_proof_ref?.slice(0, 15)}...
                      </span>
                    )}
                    {app.status === "escalated" && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 font-medium">
                        Escalated (Manual Review)
                      </span>
                    )}
                    {app.status === "pending_review" && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                        Pending Match Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href="/applications"
                      className="text-slate-400 hover:text-white transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 inline" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
