"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary } from "@/lib/calculations";
import { formatDisplayDate } from "@/lib/dateUtils";
import { MetricCard } from "@/components/MetricCard";
import { HabitsChecklist } from "@/components/HabitsChecklist";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { FitnessAnalytics } from "@/components/FitnessAnalytics";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { Sparkles, Calendar } from "lucide-react";

export function OverviewView() {
  const { appData, openQuickLog, logWater, today } = useApp();
  const summary = calculateDaySummary(appData, today);
  const goals = appData.settings.goals;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-24 md:pb-16 min-w-0 w-full">
      {/* Onboarding Banner */}
      <OnboardingBanner />

      {/* Date & Day Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formatDisplayDate(today, "full")}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Daily Overview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {summary.activeDay ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active day stacked</span>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 font-medium px-3 py-1.5 bg-zinc-900 border border-white/[0.08] rounded-lg">
              Complete a goal or habit to stack today&apos;s green cell
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
          onQuickAdd={() => openQuickLog("steps")}
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
          title="Workouts"
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

      {/* Habits & Rolling 7-Day Recap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Habits Checklist */}
        <HabitsChecklist />

        {/* 7-Day Rolling Analytics Recap */}
        <WeeklyRecap />
      </div>

      {/* Signature Contribution Heatmap */}
      <ActivityHeatmap />

      {/* Fitness Analytics, 14/30-Day Trends & Personal Records */}
      <FitnessAnalytics />
    </div>
  );
}
