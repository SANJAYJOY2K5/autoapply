"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Bell, Shield, MapPin, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TopNavProps {
  onToggleMobile: () => void;
  title?: string;
}

export function TopNav({ onToggleMobile, title }: TopNavProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-lg font-bold text-slate-100 tracking-tight hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Candidate Target Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>Chennai + Remote India</span>
        </div>

        {/* 75% Score Gate Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300">
          <Target className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">Min Match: 75%</span>
        </div>

        {/* Sanjay Personal Operator Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-indigo-500/30">
              SJ
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">Sanjay</span>
              <span className="text-[10px] text-emerald-400 font-medium leading-none">Personal Operator</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition border border-transparent hover:border-rose-900/50 ml-1"
            title="Reset session or sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{loggingOut ? "..." : "Exit"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
