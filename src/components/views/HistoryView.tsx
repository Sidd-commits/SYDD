"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary } from "@/lib/calculations";
import { formatDisplayDate, getTodayISODate } from "@/lib/dateUtils";
import { ISODate } from "@/types";
import {
  Calendar,
  Footprints,
  Droplet,
  Dumbbell,
  CheckCircle2,
  Filter,
  Plus,
  ArrowRight,
} from "lucide-react";

export function HistoryView() {
  const { appData, openDayDetail, openQuickLog, today } = useApp();
  const [filterMode, setFilterMode] = useState<"all" | "active">("all");
  const [searchDate, setSearchDate] = useState("");

  // Collect all distinct recorded dates
  const recordedDatesSet = new Set<ISODate>();
  appData.dailyRecords.forEach((r) => recordedDatesSet.add(r.date));
  appData.workouts.forEach((w) => recordedDatesSet.add(w.date));
  appData.habitCompletions.forEach((c) => {
    if (c.completed) recordedDatesSet.add(c.date);
  });

  // Always include today
  recordedDatesSet.add(today);

  const sortedDates = Array.from(recordedDatesSet)
    .filter((d) => d <= today)
    .sort((a, b) => b.localeCompare(a)); // Descending chronological

  const filteredDates = sortedDates.filter((date) => {
    if (searchDate && !date.includes(searchDate)) return false;
    if (filterMode === "active") {
      const summary = calculateDaySummary(appData, date);
      return summary.activeDay;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Activity History
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Browse and inspect your past days, workout sessions, and habit completions.
          </p>
        </div>

        {/* Quick Log Action */}
        <button
          onClick={() => openQuickLog("steps")}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Past Activity</span>
        </button>
      </div>

      {/* Filter and search controls */}
      <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "all"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
            }`}
          >
            All Logged Days ({sortedDates.length})
          </button>
          <button
            onClick={() => setFilterMode("active")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "active"
                ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
            }`}
          >
            Active Days Only
          </button>
        </div>

        {/* Jump to Date Picker */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium hidden sm:inline">Jump to:</span>
          <input
            type="date"
            max={today}
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchDate && (
            <button
              onClick={() => setSearchDate("")}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Days List */}
      {filteredDates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            No matching dates found
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Try adjusting your search date or log an activity for that date.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDates.map((date) => {
            const summary = calculateDaySummary(appData, date);
            const isCurrentToday = date === today;

            return (
              <div
                key={date}
                onClick={() => openDayDetail(date)}
                className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-500/60 dark:hover:border-emerald-600/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all shadow-xs group"
              >
                {/* Date and Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-10 rounded-full shrink-0 ${
                      summary.level === 4
                        ? "bg-emerald-500"
                        : summary.level === 3
                        ? "bg-emerald-600"
                        : summary.level === 2
                        ? "bg-emerald-400"
                        : summary.level === 1
                        ? "bg-emerald-200"
                        : summary.level === 0
                        ? "bg-stone-300"
                        : "bg-stone-100 border border-dashed border-stone-300"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                        {formatDisplayDate(date, "medium")}
                      </span>
                      {isCurrentToday && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                      {summary.activeDay && (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                          Active Day
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-medium">
                      {date}
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown Chips */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  {/* Steps */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
                    <Footprints className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold tabular-nums text-stone-800 dark:text-stone-200">
                      {summary.steps > 0 ? summary.steps.toLocaleString() : "0"}
                    </span>
                    <span className="text-[10px] text-stone-400">steps</span>
                  </div>

                  {/* Water */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
                    <Droplet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="font-bold tabular-nums text-stone-800 dark:text-stone-200">
                      {summary.waterMl > 0 ? `${summary.waterMl} ml` : "0 ml"}
                    </span>
                  </div>

                  {/* Workouts */}
                  {summary.workoutMinutes > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
                      <Dumbbell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold tabular-nums text-stone-800 dark:text-stone-200">
                        {summary.workoutMinutes}m
                      </span>
                    </div>
                  )}

                  {/* Habits */}
                  {summary.completedHabits.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold tabular-nums text-stone-800 dark:text-stone-200">
                        {summary.completedHabits.length} habits
                      </span>
                    </div>
                  )}

                  <div className="p-1.5 text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors hidden sm:block">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
