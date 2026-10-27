"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary, calculateWeeklyRecap } from "@/lib/calculations";
import { formatDisplayDate, getPast7Days } from "@/lib/dateUtils";
import { Footprints, Droplet, Dumbbell, CalendarCheck, TrendingUp } from "lucide-react";

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
        <div className="flex items-end gap-1.5 h-12 p-2 bg-zinc-900/60 rounded-2xl border border-white/[0.06] self-start sm:self-auto">
          {past7Days.map((date) => {
            const summary = calculateDaySummary(appData, date);
            const heightPercent = summary.level >= 0 ? Math.max(20, (summary.level / 4) * 100) : 10;
            const isDayToday = date === today;

            return (
              <div
                key={date}
                onClick={() => openDayDetail(date)}
                title={`${formatDisplayDate(date, "short")}: Level ${summary.level >= 0 ? summary.level : 0}`}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div className="w-5 h-8 bg-white/[0.04] rounded-md overflow-hidden flex items-end">
                  <div
                    className={`w-full rounded-md transition-all duration-300 ${
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
                        : "bg-white/[0.05]"
                    } group-hover:opacity-80`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[9px] font-mono ${isDayToday ? "text-emerald-400 font-bold" : "text-zinc-500"}`}>
                  {formatDisplayDate(date, "short").slice(0, 3)}
                </span>
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
