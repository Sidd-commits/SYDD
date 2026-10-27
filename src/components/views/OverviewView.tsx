"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary } from "@/lib/calculations";
import { formatDisplayDate, getTodayISODate } from "@/lib/dateUtils";
import { MetricCard } from "@/components/MetricCard";
import { HabitsChecklist } from "@/components/HabitsChecklist";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { Sparkles, Calendar } from "lucide-react";

export function OverviewView() {
  const { appData, openQuickLog, logWater, today } = useApp();
  const summary = calculateDaySummary(appData, today);
  const goals = appData.settings.goals;

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12">
      {/* Onboarding Banner */}
      <OnboardingBanner />

      {/* Date & Day Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDisplayDate(today, "full")}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-0.5">
            Today&apos;s Focus
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {summary.activeDay ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Active day stacked!</span>
            </div>
          ) : (
            <div className="text-xs text-stone-500 font-medium">
              Log steps, water, or a habit to stack today.
            </div>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps Card */}
        <MetricCard
          title="Daily Steps"
          type="steps"
          value={summary.steps}
          target={goals.stepsPerDay}
          unit="steps"
          isGoalMet={summary.stepsMet}
          hasData={summary.steps > 0 || appData.dailyRecords.some((r) => r.date === today && r.steps !== undefined)}
          onEdit={() => openQuickLog("steps")}
          onQuickAdd={(amount) => openQuickLog("steps")}
          quickAddOptions={[{ label: "Log Steps", amount: 0 }]}
        />

        {/* Water Card */}
        <MetricCard
          title="Hydration"
          type="water"
          value={summary.waterMl}
          target={goals.waterMlPerDay}
          unit="ml"
          isGoalMet={summary.waterMet}
          hasData={summary.waterMl > 0 || appData.dailyRecords.some((r) => r.date === today && r.waterMl !== undefined)}
          onEdit={() => openQuickLog("water")}
          onQuickAdd={(amount) => logWater(amount, "add", today)}
          quickAddOptions={[
            { label: "+250 ml", amount: 250 },
            { label: "+500 ml", amount: 500 },
          ]}
        />

        {/* Workout Card */}
        <MetricCard
          title="Workout"
          type="workout"
          value={summary.workoutMinutes}
          target={goals.workoutGoalEnabled ? goals.workoutMinutesPerDay : undefined}
          unit="mins"
          isGoalMet={summary.workoutMet}
          hasData={summary.workoutMinutes > 0}
          onEdit={() => openQuickLog("workout")}
          onQuickAdd={() => openQuickLog("workout")}
          quickAddOptions={[{ label: "Log Workout", amount: 0 }]}
        />

        {/* Calories Card */}
        <MetricCard
          title="Calories Consumed"
          type="calories"
          value={summary.caloriesConsumed}
          target={goals.caloriesConsumedKcalPerDay}
          unit="kcal"
          isGoalMet={false}
          hasData={summary.caloriesConsumed > 0 || appData.dailyRecords.some((r) => r.date === today && r.caloriesConsumedKcal !== undefined)}
          subtitle="Informational intake tracking only"
          onEdit={() => openQuickLog("calories")}
          onQuickAdd={() => openQuickLog("calories")}
          quickAddOptions={[{ label: "Log Calories", amount: 0 }]}
        />
      </div>

      {/* Habits Checklist */}
      <HabitsChecklist />

      {/* Signature Contribution Heatmap */}
      <ActivityHeatmap />

      {/* Weekly Recap */}
      <WeeklyRecap />
    </div>
  );
}
