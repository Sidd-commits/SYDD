"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ShieldCheck, Check, Sparkles, X, ArrowRight } from "lucide-react";

export function OnboardingBanner() {
  const { appData, completeOnboarding, updateGoals, loadDemoData } = useApp();
  const [isConfiguring, setIsConfiguring] = useState(false);

  // If user already finished onboarding, hide banner
  if (appData.settings.onboardingCompleted) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-stone-50 dark:from-emerald-950/40 dark:to-stone-900 border border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl p-5 sm:p-6 shadow-xs mb-6 relative overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              Welcome to SYDD
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Show up. Stack days.
            </span>
          </div>

          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Your personal consistency tracker
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Record your daily steps, hydration, workouts, and micro-habits. SYDD visualizes your consistency on a green contribution graph—just like GitHub commits. <strong>100% private:</strong> all entries are stored solely in your browser on this device.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0 self-stretch sm:self-auto">
          <button
            onClick={loadDemoData}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 rounded-xl transition-all shadow-xs"
          >
            Load Demo Data
          </button>
          <button
            onClick={completeOnboarding}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <span>Got it, let&apos;s start</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
