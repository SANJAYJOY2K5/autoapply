"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileCheck2,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/applications", label: "Applications", icon: FileCheck2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-[#0b0f19] border-r border-slate-800/80 p-4 select-none">
      <div>
        {/* Brand Header */}
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 px-3 py-3 mb-6 rounded-xl hover:bg-slate-800/40 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              AutoApply <span className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Chennai & Remote India</p>
          </div>
        </Link>

        {/* Navigation Section */}
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Core Workspace
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Policy & Status Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-200">Guardrails Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Hourly checks active. 75%+ score gate. Direct submit requires proof.
          </p>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
          <span>Phase 1 Foundation</span>
          <span className="flex items-center gap-1 font-mono text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> RLS Verified
          </span>
        </div>
      </div>
    </aside>
  );
}
