"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateStreaks } from "@/lib/calculations";
import { Flame, Plus } from "lucide-react";
import { SyddLogo } from "./SyddLogo";

export function Header() {
  const { appData, openQuickLog, today } = useApp();
  const { currentStreak, totalActiveDays } = calculateStreaks(appData, today);

  return (
    <header className="border-b border-white/[0.07] bg-[#08090d]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative group cursor-pointer" title="SYDD — Show up. Stack days.">
            <SyddLogo className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg shadow-sm border border-white/[0.1] bg-[#12141c] shrink-0 transition-transform group-hover:scale-105" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg text-white">
                SYDD
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Show up. Stack days.
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Current Streak Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900/90 text-amber-300 border border-white/[0.08] shadow-xs cursor-default"
            title={`${currentStreak} day active streak • ${totalActiveDays} total active days`}
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-bold text-sm text-white tabular-nums">
                {currentStreak}
              </span>
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                day streak
              </span>
            </div>
          </div>

          {/* Quick Log Action */}
          <button
            onClick={() => openQuickLog("steps")}
            className="min-h-[34px] sm:min-h-[36px] flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
            aria-label="Quick log activity"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Log Activity</span>
            <span className="sm:hidden font-bold">Log</span>
          </button>
        </div>
      </div>
    </header>
  );
}
