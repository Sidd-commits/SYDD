"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary } from "@/lib/calculations";
import { formatDisplayDate } from "@/lib/dateUtils";
import { ISODate } from "@/types";
import { FitnessAnalytics } from "@/components/FitnessAnalytics";
import {
  Calendar,
  Footprints,
  Droplet,
  Dumbbell,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  ListOrdered,
} from "lucide-react";

export function HistoryView() {
  const { appData, openDayDetail, openQuickLog, today } = useApp();
  const [viewTab, setViewTab] = useState<"logs" | "analytics">("logs");
  const [filterMode, setFilterMode] = useState<"all" | "active">("all");
  const [searchDate, setSearchDate] = useState("");

  // Collect all distinct recorded dates
  const recordedDatesSet = new Set<ISODate>();
  appData.dailyRecords.forEach((r) => recordedDatesSet.add(r.date));
  appData.workouts.forEach((w) => recordedDatesSet.add(w.date));
  appData.habitCompletions.forEach((c) => {
    if (c.completed) recordedDatesSet.add(c.date);
  });

  recordedDatesSet.add(today);

  const sortedDates = Array.from(recordedDatesSet)
    .filter((d) => d <= today)
    .sort((a, b) => b.localeCompare(a));

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
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Activity History & Logs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Browse and inspect your past days, workouts, and stacked micro-habits.
          </p>
        </div>

        {/* Quick Log Action */}
        <button
          onClick={() => openQuickLog("steps")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Log Past Activity</span>
        </button>
      </div>

      {/* Sub-view switcher */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/[0.08] rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setViewTab("logs")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            viewTab === "logs"
              ? "bg-zinc-800 text-white border border-white/[0.08] shadow-xs"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Daily Logs</span>
        </button>
        <button
          type="button"
          onClick={() => setViewTab("analytics")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            viewTab === "analytics"
              ? "bg-zinc-800 text-white border border-white/[0.08] shadow-xs"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analytics & PRs</span>
        </button>
      </div>

      {viewTab === "analytics" ? (
        <FitnessAnalytics />
      ) : (
        <>
          {/* Filter and search controls */}
          <div className="p-3 bg-zinc-900/80 border border-white/[0.08] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === "all"
                    ? "bg-zinc-800 text-white shadow-xs border border-white/[0.08]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All Recorded Days ({sortedDates.length})
              </button>
              <button
                onClick={() => setFilterMode("active")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === "active"
                    ? "bg-emerald-500/15 text-emerald-300 shadow-xs border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Active Days Only
              </button>
            </div>

            {/* Jump to Date Picker */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 hidden sm:inline">Jump to:</span>
              <input
                type="date"
                max={today}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="px-3 py-1 bg-zinc-950 border border-white/[0.1] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500/60"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate("")}
                  className="text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Days List */}
          {filteredDates.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl p-6 border-dashed border-white/[0.08]">
              <Calendar className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-zinc-300">
                No matching dates found
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Try adjusting your search date or log an activity for that date.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDates.map((date) => {
                const summary = calculateDaySummary(appData, date);
                const isCurrentToday = date === today;

                return (
                  <div
                    key={date}
                    onClick={() => openDayDetail(date)}
                    className="glass-card glass-card-interactive rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    {/* Date and Badge */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-9 rounded-full shrink-0 ${
                          summary.level === 4
                            ? "bg-emerald-400 shadow-xs shadow-emerald-400/50"
                            : summary.level === 3
                            ? "bg-emerald-500"
                            : summary.level === 2
                            ? "bg-emerald-600"
                            : summary.level === 1
                            ? "bg-emerald-800"
                            : summary.level === 0
                            ? "bg-zinc-700"
                            : "bg-zinc-800 border border-dashed border-white/20"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white tracking-tight">
                            {formatDisplayDate(date, "medium")}
                          </span>
                          {isCurrentToday && (
                            <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-1.5 py-0.2 rounded-md">
                              Today
                            </span>
                          )}
                          {summary.activeDay && (
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                              Active Day
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">
                          {date}
                        </span>
                      </div>
                    </div>

                {/* Metrics Breakdown Chips */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  {/* Steps */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono font-bold tabular-nums text-white">
                      {summary.steps > 0 ? summary.steps.toLocaleString() : "0"}
                    </span>
                    <span className="text-[10px] text-zinc-500">steps</span>
                  </div>

                  {/* Water */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <Droplet className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono font-bold tabular-nums text-white">
                      {summary.waterMl > 0 ? `${summary.waterMl} ml` : "0 ml"}
                    </span>
                  </div>

                  {/* Workouts */}
                  {summary.workoutMinutes > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-mono font-bold tabular-nums text-white">
                        {summary.workoutMinutes}m
                      </span>
                    </div>
                  )}

                  {/* Habits */}
                  {summary.completedHabits.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono font-bold tabular-nums text-white">
                        {summary.completedHabits.length} habits
                      </span>
                    </div>
                  )}

                  <div className="p-1 text-zinc-500 group-hover:text-emerald-400 transition-colors hidden sm:block">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}
