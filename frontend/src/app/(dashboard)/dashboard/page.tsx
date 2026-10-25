"use client";

import { useEffect, useState, useCallback } from "react";
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
  UserCheck,
  Zap,
  RefreshCw,
  Mail,
  Phone,
  Activity,
  BarChart3,
  SendHorizonal
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { CandidateProfile, ApplicationItem } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApplying, setAutoApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{
    status: string; scanned: number; applied: number;
    submitted: number; tracked: number; message: string;
  } | null>(null);
  const [applyStats, setApplyStats] = useState<{
    total_applied: number; submitted: number; link_tracked: number;
  } | null>(null);
  const [scanning, setScanning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profData, appsData, statsData] = await Promise.allSettled([
        apiClient.getProfile(),
        apiClient.getApplications(),
        apiClient.getApplyStats(),
      ]);
      if (profData.status === "fulfilled") setProfile(profData.value);
      if (appsData.status === "fulfilled") setApplications(appsData.value);
      if (statsData.status === "fulfilled") setApplyStats(statsData.value);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAutoApply = async () => {
    setAutoApplying(true);
    setApplyResult(null);
    try {
      const result = await apiClient.triggerAutoApply();
      setApplyResult(result);
      // Refresh stats after apply
      const stats = await apiClient.getApplyStats();
      setApplyStats(stats);
      await loadData();
    } catch (err: any) {
      setApplyResult({
        status: "error", scanned: 0, applied: 0, submitted: 0, tracked: 0,
        message: err?.message || "Auto-apply failed. Check backend connection."
      });
    } finally {
      setAutoApplying(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await apiClient.triggerJobScan();
    } finally {
      setScanning(false);
    }
  };

  const submittedCount = applications.filter((a) => a.status === "submitted").length;
  const escalatedCount = applications.filter((a) => a.status === "escalated").length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/50 border border-indigo-900/40 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.08),_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanjay's Auto-Apply Command Center • Chennai & Remote Tech</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome, {profile?.full_name || "SANJAY SAMINATHAN"} 👋
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {profile?.email || "kishorsanjay2005@gmail.com"}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {profile?.phone || "+91 78713 50761"}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
              AutoApply AI is{" "}
              <span className="text-emerald-400 font-semibold">actively running</span> — scanning
              LinkedIn, Shine & Remotive every hour for{" "}
              <span className="text-indigo-400 font-medium">75%+ match score</span> jobs in
              Chennai & Remote India.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 justify-center"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Edit Profile
            </Link>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 justify-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-purple-400 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning..." : "Scan Now"}
            </button>
            <button
              onClick={handleAutoApply}
              disabled={autoApplying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoApplying ? (
                <><Activity className="w-4 h-4 animate-pulse" /> Applying...</>
              ) : (
                <><Zap className="w-4 h-4" /> Auto-Apply Now</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Apply Result Banner */}
      {applyResult && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          applyResult.status === "success"
            ? "bg-emerald-950/40 border-emerald-700/50"
            : applyResult.status === "no_matches"
            ? "bg-amber-950/40 border-amber-700/50"
            : "bg-rose-950/40 border-rose-700/50"
        }`}>
          {applyResult.status === "success"
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className={`text-sm font-semibold ${
              applyResult.status === "success" ? "text-emerald-300"
              : applyResult.status === "no_matches" ? "text-amber-300" : "text-rose-300"
            }`}>
              {applyResult.status === "success"
                ? `✅ Auto-Apply Complete — ${applyResult.applied} applications sent!`
                : applyResult.status === "no_matches"
                ? "⚠️ No matching jobs found this scan"
                : "❌ Auto-apply error"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{applyResult.message}</p>
            {applyResult.status === "success" && (
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-emerald-400 font-bold">{applyResult.submitted} API submitted</span>
                <span className="text-indigo-400 font-bold">{applyResult.tracked} link tracked</span>
                <span className="text-slate-400">{applyResult.scanned} jobs scanned</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Match Gate</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{profile?.min_match_score || 75}%</div>
          <p className="text-[11px] text-slate-400">Min score before auto-apply</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Scan Frequency</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white capitalize">{profile?.search_frequency || "Hourly"}</div>
          <p className="text-[11px] text-slate-400">24/7 on Render Worker</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Applied</span>
            <SendHorizonal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{applyStats?.total_applied ?? 0}</div>
          <p className="text-[11px] text-slate-400">
            {applyStats?.submitted ?? 0} API + {applyStats?.link_tracked ?? 0} link tracked
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Escalated</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{escalatedCount}</div>
          <p className="text-[11px] text-slate-400">Needs manual review</p>
        </div>
      </div>

      {/* Target Criteria & Auto-Apply Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Target Parameters */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active Discovery Parameters</h2>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              LIVE
            </span>
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
                    "Full-stack Developer", "Frontend Developer", "AI / AI Product Developer",
                    "Data Analyst", "Data Scientist", "Backend Developer",
                  ]).map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/50 text-[11px] text-purple-300 font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
              <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Application Contact Details (Used in All Submissions)</span>
                <span className="text-xs text-emerald-300 font-mono">
                  kishorsanjay2005@gmail.com &nbsp;•&nbsp; +91 78713 50761
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Apply Status Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">Auto-Apply Engine</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Engine Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Naukri API</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Internshala API</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">LinkedIn / Shine</span>
                <span className="text-indigo-400 font-medium">Link Tracker</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Hourly Celery Beat</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-400">Duplicate Guard</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> On
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAutoApply}
              disabled={autoApplying}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {autoApplying
                ? <><Activity className="w-4 h-4 animate-pulse" /> Applying...</>
                : <><Zap className="w-4 h-4" /> Run Auto-Apply Now</>
              }
            </button>
            <Link
              href="/applications"
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 text-center transition block"
            >
              View All Applications
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Tracked Applications</h2>
            <p className="text-xs text-slate-400">Real-time status of auto-applied jobs</p>
          </div>
          <Link href="/applications" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="py-8 text-center">
            <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No applications tracked yet.</p>
            <p className="text-xs text-slate-600 mt-1">Click <strong className="text-indigo-400">Auto-Apply Now</strong> to start applying!</p>
          </div>
        ) : (
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
                {applications.slice(0, 5).map((app) => (
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
                          ✅ Submitted
                        </span>
                      )}
                      {app.status === "escalated" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 font-medium">
                          ⚠️ Manual Review
                        </span>
                      )}
                      {app.status === "pending_review" && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link href="/applications" className="text-slate-400 hover:text-white transition">
                        <ExternalLink className="w-3.5 h-3.5 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
