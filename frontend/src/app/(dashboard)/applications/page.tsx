"use client";

import { useEffect, useState } from "react";
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Search,
  ExternalLink
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ApplicationItem, ApplicationStatus } from "@/lib/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchApps() {
      try {
        const data = await apiClient.getApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      (app.job_title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (app.company?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ApplicationStatus, proof?: string) => {
    switch (status) {
      case "submitted":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submitted</span>
          </div>
        );
      case "escalated":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-800 text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalated (Manual Action)</span>
          </div>
        );
      case "pending_review":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
        );
      case "queued":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800 text-indigo-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Queued for Pipeline</span>
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Application Tracker</h1>
          <p className="text-sm text-slate-400">
            Audit submission evidence, track pipeline stages, and review escalated applications.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Proof Requirement Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role or company..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "submitted", label: "Submitted" },
            { key: "escalated", label: "Escalated" },
            { key: "pending_review", label: "Pending" },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterStatus === status.key
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading applications...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{app.job_title}</h3>
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{app.company}</span> • {app.location}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono font-bold text-xs">
                    {app.match_score}% Match
                  </span>
                  {getStatusBadge(app.status, app.submission_proof_ref)}
                </div>
              </div>

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

              {/* Confirmed Submission Evidence */}
              {app.status === "submitted" && app.submission_proof_ref && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <span className="font-bold block">Confirmed Submission Evidence:</span>
                    <span className="font-mono text-[11px] text-emerald-200">
                      Receipt Ref: {app.submission_proof_ref}
                    </span>
                    {app.applied_at && (
                      <span className="block text-[11px] text-emerald-400/80 mt-0.5">
                        Applied on: {new Date(app.applied_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Channel: {app.submission_channel}</span>
                <span>ID: {app.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
