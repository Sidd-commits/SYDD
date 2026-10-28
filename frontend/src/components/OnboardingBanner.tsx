"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary } from "@/lib/calculations";
import { Flame, Footprints, Droplet, Dumbbell, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

const MOTIVATIONAL_QUOTES = [
  "Consistency is what transforms average into excellence.",
  "We don't rise to the level of our goals; we fall to the level of our daily habits.",
  "Show up even on the days you don't feel like it. That is where real momentum is forged.",
  "Small disciplines repeated with consistency every day lead to great achievements.",
  "Do something today that your future self will thank you for.",
  "Stack your green cells. Every day you show up is an undisputed victory.",
  "Dedication is not an event — it is a daily standard.",
];

export function OnboardingBanner() {
  const { appData, today, openQuickLog, logWater } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const summary = calculateDaySummary(appData, today);
  const goals = appData.settings.goals;

  // Count core goals met
  let goalsCount = 0;
  let goalsMet = 0;

  if (goals.stepsPerDay > 0) {
    goalsCount++;
    if (summary.stepsMet) goalsMet++;
  }
  if (goals.waterMlPerDay > 0) {
    goalsCount++;
    if (summary.waterMet) goalsMet++;
  }
  if (goals.workoutGoalEnabled && goals.workoutMinutesPerDay > 0) {
    goalsCount++;
    if (summary.workoutMet) goalsMet++;
  }
  if (summary.completedHabits.length > 0 || summary.pendingHabits.length > 0) {
    goalsCount++;
    if (summary.pendingHabits.length === 0 && summary.completedHabits.length > 0) goalsMet++;
  }

  // Quote selected based on day of year
  const dayOfYear = Math.floor(
    (new Date(today).getTime() - new Date(new Date(today).getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const quote = MOTIVATIONAL_QUOTES[Math.abs(dayOfYear) % MOTIVATIONAL_QUOTES.length];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 via-zinc-900/80 to-zinc-950/90 p-5 sm:p-6 shadow-2xl mb-6">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Today's Discipline & Inspiring Quote */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              TODAY&apos;S DISCIPLINE
            </span>
            <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
              • Show up. Stack days.
            </span>
          </div>

          <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            &ldquo;{quote}&rdquo;
          </p>

          {!isCollapsed && (
            <div className="mt-2.5 flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>
                  {summary.activeDay
                    ? "Active day achieved! Today's green cell is stacked."
                    : `${goalsMet} of ${goalsCount} daily targets met so far.`}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 self-start md:self-center">
          <button
            onClick={() => openQuickLog("steps")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Log steps"
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Steps</span>
          </button>

          <button
            onClick={() => logWater(500, "add", today)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.08] hover:border-sky-500/30 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-sky-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Quick add 500 ml water"
          >
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
            <span>+ 500ml Water</span>
          </button>

          <button
            onClick={() => openQuickLog("workout")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-indigo-500/15 border border-white/[0.08] hover:border-indigo-500/30 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-indigo-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Log workout session"
          >
            <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Workout</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expand banner" : "Collapse banner"}
            title={isCollapsed ? "Expand banner" : "Collapse banner"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
