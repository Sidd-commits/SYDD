"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateWeeklyRecap } from "@/lib/calculations";
import { Footprints, Droplet, Dumbbell, CalendarCheck } from "lucide-react";

export function WeeklyRecap() {
  const { appData, today } = useApp();
  const recap = calculateWeeklyRecap(appData, today);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Past 7 Days Recap
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Rolling weekly averages to monitor consistency trends.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
          {recap.daysTracked}/7 days logged
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Average Steps */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            <Footprints className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Avg Steps</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
            {recap.averageSteps > 0 ? recap.averageSteps.toLocaleString() : "—"}
          </div>
          <span className="text-[11px] text-stone-400">per logged day</span>
        </div>

        {/* Average Hydration */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            <Droplet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Avg Water</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
            {recap.averageWaterMl > 0 ? `${recap.averageWaterMl.toLocaleString()} ml` : "—"}
          </div>
          <span className="text-[11px] text-stone-400">per logged day</span>
        </div>

        {/* Total Workout Minutes */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            <Dumbbell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Total Workouts</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
            {recap.totalWorkoutMinutes > 0 ? `${recap.totalWorkoutMinutes}m` : "0m"}
          </div>
          <span className="text-[11px] text-stone-400">total this week</span>
        </div>

        {/* Active Days */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Active Days</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {recap.activeDaysCount} <span className="text-xs font-normal text-stone-400">/ 7</span>
          </div>
          <span className="text-[11px] text-stone-400">goals or habits met</span>
        </div>
      </div>
    </div>
  );
}
