"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatDisplayDate, getTodayISODate } from "@/lib/dateUtils";
import { calculateStreaks } from "@/lib/calculations";
import { Flame, Plus, ShieldCheck, Sparkles } from "lucide-react";

export function Header() {
  const { appData, openQuickLog, today } = useApp();
  const { currentStreak, totalActiveDays } = calculateStreaks(appData, today);

  return (
    <header className="border-b border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black tracking-tight text-base sm:text-lg shadow-sm shadow-emerald-700/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg sm:text-xl text-stone-900 dark:text-stone-100">
                SYDD
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 hidden sm:inline-block">
                /sɪd/
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              Show up. Stack days.
            </p>
          </div>
        </div>

        {/* Center / Right info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Privacy badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Local Storage • 100% Private</span>
          </div>

          {/* Current streak badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
            title={`${currentStreak} day streak • ${totalActiveDays} total active days`}
          >
            <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
            <span className="tabular-nums font-bold">{currentStreak}</span>
            <span className="hidden sm:inline">day streak</span>
          </div>

          {/* Quick Log Action */}
          <button
            onClick={() => openQuickLog("steps")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Quick log activity"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Log</span>
            <span className="hidden sm:inline">Activity</span>
          </button>
        </div>
      </div>
    </header>
  );
}
