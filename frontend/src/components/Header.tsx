"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateStreaks } from "@/lib/calculations";
import { Flame, Plus } from "lucide-react";

export function Header() {
  const { appData, openQuickLog, today } = useApp();
  const { currentStreak, totalActiveDays } = calculateStreaks(appData, today);

  return (
    <header className="border-b border-white/[0.07] bg-[#08090d]/80 backdrop-blur-xl sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-emerald-500/30 text-white flex items-center justify-center font-black tracking-tight text-lg shadow-inner">
              <span className="bg-gradient-to-br from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                S
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl text-white">
                SYDD
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Show up. Stack days.
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Current Streak Pill */}
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent text-amber-300 border border-amber-500/20 shadow-xs cursor-default"
            title={`${currentStreak} day active streak • ${totalActiveDays} total active days`}
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse-glow" />
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-bold text-sm text-white tabular-nums">
                {currentStreak}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                day streak
              </span>
            </div>
          </div>

          {/* Quick Log Action */}
          <button
            onClick={() => openQuickLog("steps")}
            className="relative group min-h-[44px] flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Quick log activity"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden xs:inline">Log</span>
            <span className="hidden sm:inline">Activity</span>
          </button>
        </div>
      </div>
    </header>
  );
}
