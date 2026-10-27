"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Sparkles, ArrowRight, ShieldCheck, Flame } from "lucide-react";

export function OnboardingBanner() {
  const { appData, completeOnboarding, loadDemoData } = useApp();

  // If user already finished onboarding, hide banner
  if (appData.settings.onboardingCompleted) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900/80 to-zinc-950/90 p-6 sm:p-7 shadow-2xl mb-6">
      {/* Glow effect */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              WELCOME TO SYDD
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              /sɪd/ • Show up. Stack days.
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Developer-Grade Fitness Consistency Tracker
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Record your daily steps, hydration, workouts, and recurring habits. SYDD visualizes your dedication on a 53-week GitHub-style activity heatmap. <strong>100% private & offline-first:</strong> no logins, no cloud tracking, stored entirely in your browser.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0 self-stretch sm:self-auto">
          <button
            onClick={loadDemoData}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] hover:border-emerald-500/40 rounded-2xl transition-all duration-200 shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load 45-Day Demo</span>
          </button>
          <button
            onClick={completeOnboarding}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>Start Tracking</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
