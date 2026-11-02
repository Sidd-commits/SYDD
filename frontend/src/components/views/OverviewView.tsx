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
import { Sparkles, Calendar, Utensils, Edit3, Trash2, Plus } from "lucide-react";

export function OverviewView() {
  const {
    appData,
    openQuickLog,
    logWater,
    deleteNutritionEntry,
    clearDailyCalories,
    today,
  } = useApp();
  const summary = calculateDaySummary(appData, today);
  const goals = appData.settings.goals;

  const todayMeals = (appData.nutritionEntries || []).filter((e) => e.date === today);
  const todayRecord = appData.dailyRecords.find((r) => r.date === today);
  const hasLegacyCalories = todayMeals.length === 0 && (todayRecord?.caloriesConsumedKcal ?? 0) > 0;
  const hasAnyCaloriesToday = todayMeals.length > 0 || hasLegacyCalories;

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
          hasData={
            summary.caloriesConsumed > 0 ||
            appData.dailyRecords.some((r) => r.date === today && r.caloriesConsumedKcal !== undefined) ||
            (appData.nutritionEntries || []).some((n) => n.date === today)
          }
          subtitle="Informational intake tracking only"
          macroSummary={{
            proteinG: summary.proteinConsumedG,
            carbsG: summary.carbsConsumedG,
            fatG: summary.fatConsumedG,
          }}
          onEdit={() => openQuickLog("calories")}
          onQuickAdd={() => openQuickLog("calories")}
          quickAddOptions={[{ label: "Log Food", amount: 0 }]}
        />
      </div>

      {/* Today's Food Log */}
      {hasAnyCaloriesToday && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-white/[0.08] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Today&apos;s Food Log</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {todayMeals.length} {todayMeals.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Granular meals logged today. Edit or remove items to adjust daily totals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Logged Total</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {summary.caloriesConsumed.toLocaleString()} kcal
                </span>
              </div>
              <button
                type="button"
                onClick={() => openQuickLog("calories", null, today)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Food</span>
              </button>
            </div>
          </div>

          {/* List of granular meals */}
          {todayMeals.length > 0 && (
            <div className="divide-y divide-white/[0.04]">
              {todayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="py-2.5 flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-white truncate max-w-[220px] sm:max-w-md">
                        {meal.name}
                      </span>
                      {meal.time && (
                        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                          {meal.time}
                        </span>
                      )}
                    </div>
                    {(meal.proteinG !== undefined || meal.carbsG !== undefined || meal.fatG !== undefined) && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-0.5">
                        {meal.proteinG !== undefined && (
                          <span className="text-emerald-400/90 font-medium">P: {meal.proteinG}g</span>
                        )}
                        {meal.carbsG !== undefined && (
                          <span className="text-sky-400/90 font-medium">C: {meal.carbsG}g</span>
                        )}
                        {meal.fatG !== undefined && (
                          <span className="text-rose-400/90 font-medium">F: {meal.fatG}g</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {meal.calories.toLocaleString()} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => openQuickLog("calories", meal, today)}
                      aria-label={`Edit ${meal.name}`}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Edit meal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNutritionEntry(meal.id)}
                      aria-label={`Delete ${meal.name}`}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Delete meal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legacy calories fallback banner */}
          {hasLegacyCalories && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-semibold text-white">Legacy Calorie Record</span>
                <p className="text-[11px] text-zinc-400">
                  {todayRecord?.caloriesConsumedKcal?.toLocaleString()} kcal logged directly without individual meal items
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openQuickLog("calories", null, today)}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-md border border-amber-500/30 cursor-pointer"
                >
                  Edit / Convert
                </button>
                <button
                  type="button"
                  onClick={() => clearDailyCalories(today)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-md border border-rose-500/30 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
