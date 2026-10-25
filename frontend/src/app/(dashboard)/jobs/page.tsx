"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Target,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle2,
  Filter,
  Sparkles,
  RefreshCw,
  SearchCheck,
  Layers
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { JobItem } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [minScore, setMinScore] = useState(75);
  const [filterMode, setFilterMode] = useState<string>("all");
  const [scanStatusMsg, setScanStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiClient.getJobs(minScore);
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [minScore]);

  const handleScan = async () => {
    setScanning(true);
    setScanStatusMsg(null);
    try {
      const scanned = await apiClient.triggerJobScan();
      setJobs(scanned);
      setScanStatusMsg(`Discovery complete: Found ${scanned.length} verified jobs matching your 75%+ score gate!`);
    } catch (err: any) {
      setScanStatusMsg(err?.message || "Failed to complete discovery scan.");
    } finally {
      setScanning(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterMode === "all") return true;
    return job.work_mode === filterMode;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chennai & Remote India Only</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verified Job Matches</h1>
          <p className="text-sm text-slate-400">
            Real-time entry-level positions filtered against your minimum 75% match threshold.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Gate: {minScore}%+</span>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin text-white" : ""}`} />
            <span>{scanning ? "Scanning Feeds..." : "Scan Real-Time Feeds"}</span>
          </button>
        </div>
      </div>

      {/* Scan Status Toast Banner */}
      {scanStatusMsg && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/60 text-indigo-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchCheck className="w-4 h-4 text-indigo-400" />
            <span>{scanStatusMsg}</span>
          </div>
          <button
            onClick={() => setScanStatusMsg(null)}
            className="text-xs text-indigo-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Work Mode:</span>
          {["all", "remote", "hybrid", "onsite"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs capitalize font-medium transition ${
                filterMode === mode
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Sources: Chennai ATS Corridor + Remotive API</span>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Matching opportunities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{job.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium text-slate-300">{job.company}</span>
                      <span>•</span>
                      <span className="capitalize">{job.source.replace("_", " ")}</span>
                    </div>
                  </div>

                  {job.match_score && (
                    <div className="flex flex-col items-end">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono font-bold text-xs shadow-sm">
                        {job.match_score}% Match
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    {job.location}
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] capitalize">
                    {job.work_mode}
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-medium">
                    {job.min_experience_years === 0 ? "Fresher / 0 Yrs Exp" : `${job.min_experience_years} Yrs Exp`}
                  </span>
                </div>

                {job.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Verified Candidate Opening
                </span>

                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                >
                  <span>Apply on Company Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
