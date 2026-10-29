"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary, calculateWeeklyRecap } from "@/lib/calculations";
import { formatDisplayDate, getPast7Days, parseISODate } from "@/lib/dateUtils";
import { Footprints, Droplet, Dumbbell, CalendarCheck } from "lucide-react";

export function WeeklyRecap() {
  const { appData, today, openDayDetail } = useApp();
  const recap = calculateWeeklyRecap(appData, today);
  const past7Days = getPast7Days(today);

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Past 7 Days Analytics
            </h2>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {recap.daysTracked}/7 Days Logged
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Rolling weekly averages to monitor consistency.
          </p>
        </div>

        {/* 7-Day Mini Sparkline Bars */}
        <div className="flex items-end gap-1.5 p-2 bg-zinc-900/80 rounded-lg border border-white/[0.06] self-start sm:self-auto">
          {past7Days.map((date) => {
            const summary = calculateDaySummary(appData, date);
            const heightPercent = summary.hasData
              ? Math.min(100, Math.max(16, Math.round(summary.score * 100)))
              : 0;
            const isDayToday = date === today;
            const d = parseISODate(date);
            const weekday = d.toLocaleDateString("en-US", { weekday: "narrow" });
            const dayNum = d.getDate();

            // Activity tooltip breakdown
            const parts: string[] = [];
            if (summary.workoutMinutes > 0) parts.push(`${summary.workoutMinutes}m workout`);
            if (summary.steps > 0) parts.push(`${summary.steps.toLocaleString()} steps`);
            if (summary.waterMl > 0) parts.push(`${summary.waterMl.toLocaleString()} ml water`);
            if (summary.completedHabits.length > 0) parts.push(`${summary.completedHabits.length} habits`);
            const detailsText = parts.length > 0 ? parts.join(" • ") : "No activity recorded";

            return (
              <div
                key={date}
                onClick={() => openDayDetail(date)}
                title={`${d.toLocaleDateString("en-US", { weekday: "short" })}, ${formatDisplayDate(date, "short")}: ${Math.round(summary.score * 100)}% consistency • Level ${summary.level >= 0 ? summary.level : 0} ${summary.activeDay ? "(Active Day)" : ""}\n${detailsText}`}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div className={`w-5 h-9 bg-white/[0.04] rounded-md overflow-hidden flex items-end border transition-all ${
                  isDayToday ? "border-emerald-500/50" : "border-white/[0.06] group-hover:border-white/20"
                }`}>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      summary.level === 4
                        ? "bg-emerald-400"
                        : summary.level === 3
                        ? "bg-emerald-500"
                        : summary.level === 2
                        ? "bg-emerald-600"
                        : summary.level === 1
                        ? "bg-emerald-800"
                        : summary.level === 0
                        ? "bg-zinc-700"
                        : "bg-transparent"
                    } group-hover:brightness-110`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <div className="flex flex-col items-center leading-tight">
                  <span className={`text-[11px] font-semibold ${isDayToday ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                    {weekday}
                  </span>
                  <span className={`text-[11px] font-mono ${isDayToday ? "text-emerald-300 font-semibold" : "text-zinc-500"}`}>
                    {dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Average Steps */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Avg Steps</span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-white tabular-nums">
              {recap.averageSteps > 0 ? recap.averageSteps.toLocaleString() : "—"}
            </div>
            <span className="text-xs text-zinc-400">per recorded day</span>
          </div>
        </div>

        {/* Average Hydration */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Avg Water</span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-white tabular-nums">
              {recap.averageWaterMl > 0 ? `${recap.averageWaterMl.toLocaleString()} ml` : "—"}
            </div>
            <span className="text-xs text-zinc-400">per recorded day</span>
          </div>
        </div>

        {/* Total Workouts */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">Workouts</span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-white tabular-nums">
              {recap.totalWorkoutMinutes > 0 ? `${recap.totalWorkoutMinutes}m` : "0m"}
            </div>
            <span className="text-xs text-zinc-400">exercise time</span>
          </div>
        </div>

        {/* Active Days */}
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Active Days</span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              {recap.activeDaysCount} <span className="text-xs font-normal text-zinc-400">/ 7</span>
            </div>
            <span className="text-xs text-zinc-400">goals met</span>
          </div>
        </div>
      </div>
    </div>
  );
}
