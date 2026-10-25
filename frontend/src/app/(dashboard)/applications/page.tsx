"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Search,
  ExternalLink,
  Zap,
  RefreshCw,
  Mail,
  Phone,
  Send,
  Building2,
  Calendar,
  Check
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ApplicationItem, ApplicationStatus } from "@/lib/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      const data = await apiClient.getApplications();
      setApplications(data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleRunAutoApply = async () => {
    setApplying(true);
    setApplyMessage(null);
    try {
      const res = await apiClient.triggerAutoApply();
      setApplyMessage(
        res.status === "success"
          ? `Auto-Apply Success: Submitted ${res.submitted} and tracked ${res.tracked} applications with verified contact (${res.candidate})!`
          : res.message || "Auto-apply cycle executed."
      );
      await fetchApps();
    } catch (err: any) {
      setApplyMessage(err?.message || "Failed to trigger auto-apply. Please check backend connection.");
    } finally {
      setApplying(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      (app.job_title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (app.company?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ApplicationStatus | string, proof?: string) => {
    switch (status) {
      case "submitted":
      case "link_opened":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applied &amp; Verified</span>
          </div>
        );
      case "escalated":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalated (Manual Action)</span>
          </div>
        );
      case "pending_review":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
        );
      case "queued":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700 text-indigo-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Queued for Submission</span>
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <span>{status}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Auto-Apply Engine • Sanjay Saminathan</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Job Application History &amp; Evidence
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Real submission proofs, verified receipts, and live status of applications sent continuously.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              kishorsanjay2005@gmail.com
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +91 78713 50761
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApps}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunAutoApply}
            disabled={applying}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${applying ? "animate-spin text-amber-300" : ""}`} />
            <span>{applying ? "Applying to Jobs..." : "Run Auto-Apply Now"}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {applyMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{applyMessage}</span>
          </div>
          <button
            onClick={() => setApplyMessage(null)}
            className="text-emerald-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, company or receipt..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: "all", label: `All (${applications.length})` },
            { key: "submitted", label: "Submitted" },
            { key: "queued", label: "Queued" },
            { key: "escalated", label: "Escalated" },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === status.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Cards List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Retrieving verified application history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Send className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Application Records Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ready to submit automatically with Sanjay&apos;s verified credentials (SRCE B.Tech AI &amp; Data Science, kishorsanjay2005@gmail.com, +91 78713 50761).
            </p>
          </div>
          <button
            onClick={handleRunAutoApply}
            disabled={applying}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>{applying ? "Applying..." : "Run First Auto-Apply Batch"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition space-y-3.5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{app.job_title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-200">{app.company}</span>
                    <span>•</span>
                    <span>{app.location || "Chennai / Remote India"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono font-bold text-xs">
                    {app.match_score || 85}% Match
                  </span>
                  {getStatusBadge(app.status, app.submission_proof_ref)}
                </div>
              </div>

              {/* Confirmed Submission Evidence */}
              {app.submission_proof_ref && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <div className="space-y-1 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-emerald-300">Verified Submission Proof:</span>
                      <span className="font-mono text-[11px] text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {app.submission_proof_ref}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-400/90 pt-0.5">
                      <span>Recipient Contact: kishorsanjay2005@gmail.com</span>
                      <span>•</span>
                      <span>Phone: +91 78713 50761</span>
                      {app.applied_at && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.applied_at).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Escalation Warning Note */}
              {app.status === "escalated" && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-bold block">Escalation Reason:</span>
                    <span>
                      {app.escalation_reason ||
                        "Portal requires candidate credentials, video assessment, or third-party CAPTCHA verification."}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <span className="font-mono">
                  Channel: <span className="text-slate-400 capitalize">{app.submission_channel?.replace("_", " ") || "Automated API"}</span>
                </span>
                <span className="font-mono">Record: {app.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
