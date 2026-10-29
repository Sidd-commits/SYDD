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
    <div className="rounded-xl border border-white/[0.08] bg-[#10121a] p-4 sm:p-5 shadow-xs mb-6 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Today's Discipline & Status */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Daily Focus
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {summary.activeDay
                ? "Active day achieved — green cell stacked"
                : `${goalsMet} of ${goalsCount} daily targets met`}
            </span>
          </div>

          <p className="text-sm sm:text-base font-semibold text-zinc-200 tracking-tight leading-snug">
            &ldquo;{quote}&rdquo;
          </p>

          {!isCollapsed && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>
                Log activities and check off daily micro-habits to reinforce your consistency streak.
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 self-start md:self-center">
          <button
            onClick={() => openQuickLog("steps")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Log steps"
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Steps</span>
          </button>

          <button
            onClick={() => logWater(500, "add", today)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Quick add 500 ml water"
          >
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
            <span>+ 500ml Water</span>
          </button>

          <button
            onClick={() => openQuickLog("workout")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Log workout session"
          >
            <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Workout</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
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
