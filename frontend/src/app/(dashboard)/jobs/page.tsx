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
  Globe,
  Share2
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { JobItem } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [minScore, setMinScore] = useState(75);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [scanStatusMsg, setScanStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiClient.triggerJobScan();
        setJobs(data);
      } catch (err) {
        // Fallback
        const fallback = await apiClient.getJobs(minScore);
        setJobs(fallback);
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
      setScanStatusMsg(`Live scan complete: Aggregated ${scanned.length} original openings from LinkedIn, Shine & Remotive!`);
    } catch (err: any) {
      setScanStatusMsg(err?.message || "Failed to complete discovery scan.");
    } finally {
      setScanning(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterSource === "all") return true;
    return (job.source || "").toLowerCase().includes(filterSource.toLowerCase());
  });

  const getSourceBadge = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("linkedin")) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-700/60 text-blue-300 font-semibold text-[11px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> LinkedIn Live
        </span>
      );
    }
    if (s.includes("shine")) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Shine.com Live
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-700/60 text-purple-300 font-semibold text-[11px] flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Remotive India
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Online Work: LinkedIn, Shine & Remotive</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Original Live Openings</h1>
          <p className="text-sm text-slate-400">
            Real-time vacancies matching your Chennai & Remote India criteria with 75%+ score gate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Score Gate: {minScore}%+</span>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin text-white" : ""}`} />
            <span>{scanning ? "Connecting to Feeds..." : "Sync Live Feeds"}</span>
          </button>
        </div>
      </div>

      {/* Live Scan Notification Banner */}
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

      {/* Filter and Portal Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Source:</span>
          {["all", "linkedin", "shine", "remotive"].map((source) => (
            <button
              key={source}
              onClick={() => setFilterSource(source)}
              className={`px-3 py-1 rounded-lg text-xs capitalize font-medium transition ${
                filterSource === source
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {source === "all" ? "All Sources" : source === "linkedin" ? "LinkedIn Live" : source === "shine" ? "Shine.com" : "Remotive Remote"}
            </button>
          ))}
        </div>

        {/* Naukri Direct Search Escalation Link */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.naukri.com/frontend-developer-jobs-in-chennai?experience=0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            title="Open verified Naukri search in your own session"
          >
            <span>Naukri Chennai Portal</span>
            <ExternalLink className="w-3 h-3 text-indigo-400" />
          </a>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Fetching original live postings from LinkedIn & Shine...</p>
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
                  {getSourceBadge(job.source)}

                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    {job.location}
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] capitalize">
                    {job.work_mode}
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-medium">
                    Fresher / 0-1 Yrs
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
                  Original Listing
                </span>

                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700 hover:border-indigo-500 transition flex items-center gap-1.5"
                >
                  <span>Apply on {job.source.split(" ")[0]}</span>
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
