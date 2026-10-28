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
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Past 7 Days Analytics
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {recap.daysTracked}/7 Days Logged
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Rolling weekly averages to monitor consistency and habit adherence.
          </p>
        </div>

        {/* 7-Day Mini Sparkline Bars */}
        <div className="flex items-end gap-2 p-2.5 bg-zinc-900/60 rounded-2xl border border-white/[0.06] self-start sm:self-auto shadow-inner">
          {past7Days.map((date) => {
            const summary = calculateDaySummary(appData, date);
            // Continuous percentage height (0 to 100%) based on actual progress score
            const heightPercent = summary.hasData
              ? Math.min(100, Math.max(14, Math.round(summary.score * 100)))
              : 0;
            const isDayToday = date === today;
            const d = parseISODate(date);
            const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
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
                title={`${weekday}, ${formatDisplayDate(date, "short")}: ${Math.round(summary.score * 100)}% consistency • Level ${summary.level >= 0 ? summary.level : 0} ${summary.activeDay ? "(Active Day)" : ""}\n${detailsText}`}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className={`w-5 sm:w-6 h-10 bg-white/[0.04] rounded-lg overflow-hidden flex items-end border transition-all ${
                  isDayToday ? "border-emerald-500/40 shadow-xs shadow-emerald-500/20" : "border-white/[0.06] group-hover:border-emerald-500/40"
                }`}>
                  <div
                    className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-300 ${
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
                        : "bg-transparent"
                    } group-hover:brightness-110`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <div className="flex flex-col items-center leading-none">
                  <span className={`text-[9px] font-mono font-bold tracking-tight ${isDayToday ? "text-emerald-400 font-extrabold" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                    {weekday}
                  </span>
                  <span className={`text-[8px] font-mono mt-0.5 ${isDayToday ? "text-emerald-300 font-semibold" : "text-zinc-600"}`}>
                    {dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Average Steps */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <span>Avg Daily Steps</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums">
              {recap.averageSteps > 0 ? recap.averageSteps.toLocaleString() : "—"}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">per recorded day</span>
          </div>
        </div>

        {/* Average Hydration */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Droplet className="w-3.5 h-3.5" />
            </div>
            <span>Avg Hydration</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums">
              {recap.averageWaterMl > 0 ? `${recap.averageWaterMl.toLocaleString()} ml` : "—"}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">per recorded day</span>
          </div>
        </div>

        {/* Total Workouts */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <span>Total Workouts</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums">
              {recap.totalWorkoutMinutes > 0 ? `${recap.totalWorkoutMinutes}m` : "0m"}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">exercise time</span>
          </div>
        </div>

        {/* Active Days */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
            <span>Active Days</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400 tabular-nums">
              {recap.activeDaysCount} <span className="text-xs font-normal text-zinc-500">/ 7</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">days with goals met</span>
          </div>
        </div>
      </div>
    </div>
  );
}
