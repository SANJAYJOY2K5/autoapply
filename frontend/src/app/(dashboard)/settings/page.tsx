"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  Server,
  Lock,
  Clock,
  Ban,
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { HealthStatus } from "@/lib/types";

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await apiClient.getHealth();
        setHealth(res);
      } catch (err) {
        console.error("Health check error:", err);
      } finally {
        setCheckingHealth(false);
      }
    }
    checkBackend();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">System & Policy Settings</h1>
        <p className="text-sm text-slate-400">
          Review security boundaries, source rate limits, and Phase 1 guardrails.
        </p>
      </div>

      {/* Backend API Health Status */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">FastAPI Backend Connection</h2>
          </div>
          {checkingHealth ? (
            <span className="text-xs text-slate-400">Checking health...</span>
          ) : health?.status === "healthy" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected & Healthy</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-800 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline / Local Fallback</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
            <span className="text-slate-400 block mb-1">API Version</span>
            <span className="text-white font-mono font-semibold">{health?.version || "1.0.0"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
            <span className="text-slate-400 block mb-1">Environment</span>
            <span className="text-white font-mono font-semibold capitalize">
              {health?.environment || "development"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
            <span className="text-slate-400 block mb-1">Auth Scheme</span>
            <span className="text-emerald-400 font-mono font-semibold">Supabase JWT (HS256)</span>
          </div>
        </div>
      </div>

      {/* Mandatory Phase 1 Feature Toggles (Disabled per Scope) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Phase 1 Guardrail Constraints</h2>
          <p className="text-xs text-slate-400">
            Per architectural constraints, direct automation modules are locked until Phase 2 & 3.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-200 block">
                Automated Application Submission Engine
              </span>
              <p className="text-xs text-slate-400">
                Direct form submission requires Phase 3 authorized integration validation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-amber-400" />
              <span>Disabled (Phase 1)</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-200 block">
                Third-Party Job Platform Scraping
              </span>
              <p className="text-xs text-slate-400">
                Unauthorized scraping or bot bypassing is strictly disabled by policy.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-amber-400" />
              <span>Disabled</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-200 block">
                External Password Storage
              </span>
              <p className="text-xs text-slate-400">
                Zero plaintext credentials or job portal passwords stored in database.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Storage Enforced</span>
            </span>
          </div>
        </div>
      </div>

      {/* Discovery Frequency & Rate Limits */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Discovery Schedule & Rate Limits</h2>
          <p className="text-xs text-slate-400">
            Cadence parameters configured for Indian tech fresher job boards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Scan Frequency: Hourly</span>
            </div>
            <p className="text-slate-400">
              Celery Beat scheduler configured to discover new openings on an hourly cycle.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <Activity className="w-4 h-4" />
              <span>Rate Limit Enforcement</span>
            </div>
            <p className="text-slate-400">
              Enforces respectful request pauses and exponential backoff on all verified discovery channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
