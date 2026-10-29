"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  calculateMonthlySummary,
  calculatePersonalRecords,
  calculateRangeAnalytics,
} from "@/lib/calculations";
import { formatDisplayDate, parseISODate } from "@/lib/dateUtils";
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Footprints,
  Droplet,
  Sparkles,
  Calendar,
  Award,
  ChevronRight,
  Flame,
} from "lucide-react";

type TimeRange = 7 | 14 | 30;
type MetricKey = "volume" | "steps" | "water" | "consistency";

export function FitnessAnalytics() {
  const { appData, today, openDayDetail } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>(14);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("volume");
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const rangeData = calculateRangeAnalytics(appData, today, timeRange);
  const prs = calculatePersonalRecords(appData, today);
  const monthly = calculateMonthlySummary(appData, today);
  const goals = appData.settings.goals;
  const unitWeight = appData.settings.unitWeight || "kg";

  // Determine chart values based on active metric
  const points = rangeData.dataPoints;
  const values = points.map((p) => {
    switch (activeMetric) {
      case "volume":
        return p.workoutVolume;
      case "steps":
        return p.steps;
      case "water":
        return p.waterMl;
      case "consistency":
        return Math.round(p.score * 100);
    }
  });

  const targetValue =
    activeMetric === "steps"
      ? goals.stepsPerDay
      : activeMetric === "water"
      ? goals.waterMlPerDay
      : activeMetric === "consistency"
      ? 100
      : undefined;

  const rawMax = Math.max(...values, targetValue || 0, 1);
  // Add 15% headroom for aesthetic spacing
  const chartMax = Math.ceil(rawMax * 1.15);

  // SVG dimensions
  const width = 640;
  const height = 200;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Map data points to SVG coordinates
  const coords = points.map((p, i) => {
    const x = padLeft + (i / Math.max(1, points.length - 1)) * plotWidth;
    const val = values[i];
    const y = padTop + plotHeight - (val / chartMax) * plotHeight;
    return { x, y, val, date: p.date, activeDay: p.activeDay, hasData: p.hasData };
  });

  // Build SVG path
  let pathD = "";
  let areaD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const cx = (prev.x + cur.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
    }
    const bottomY = padTop + plotHeight;
    areaD = `${pathD} L ${coords[coords.length - 1].x} ${bottomY} L ${coords[0].x} ${bottomY} Z`;
  }

  // Target reference line Y coordinate
  const targetY =
    targetValue !== undefined
      ? padTop + plotHeight - (targetValue / chartMax) * plotHeight
      : undefined;

  // Metric visual configurations
  const metricConfig = {
    volume: {
      label: `Workout Volume (${unitWeight})`,
      color: "#818cf8", // Indigo 400
      gradientId: "vol-grad",
      unit: unitWeight,
      icon: Dumbbell,
    },
    steps: {
      label: "Daily Steps",
      color: "#34d399", // Emerald 400
      gradientId: "steps-grad",
      unit: "steps",
      icon: Footprints,
    },
    water: {
      label: "Hydration (ml)",
      color: "#38bdf8", // Sky 400
      gradientId: "water-grad",
      unit: "ml",
      icon: Droplet,
    },
    consistency: {
      label: "Consistency Score (%)",
      color: "#10b981", // Emerald 500
      gradientId: "score-grad",
      unit: "%",
      icon: TrendingUp,
    },
  }[activeMetric];

  const hasAnyMetricData = values.some((v) => v > 0);

  return (
    <div className="space-y-6">
      {/* Main Analytics Card */}
      <div className="glass-card rounded-xl p-4 sm:p-6 shadow-xs space-y-5">
        {/* Card Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Performance & Trends</span>
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {rangeData.consistencyRate}% Consistent
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-day trajectory tracking workout volume, daily activity, and habit consistency.
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/[0.08] rounded-lg self-start md:self-auto">
            {([7, 14, 30] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-zinc-800 text-white border border-white/[0.08] shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {r} Days
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { key: "volume", label: "Volume Load", sub: `${rangeData.totalVolume.toLocaleString()} ${unitWeight}` },
              { key: "steps", label: "Steps", sub: `${rangeData.avgSteps.toLocaleString()} avg` },
              { key: "water", label: "Hydration", sub: `${rangeData.avgWaterMl.toLocaleString()} ml avg` },
              { key: "consistency", label: "Consistency", sub: `${rangeData.activeDaysCount}/${rangeData.daysCount} days` },
            ] as const
          ).map((m) => {
            const isSelected = activeMetric === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setActiveMetric(m.key)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-800/90 border-white/[0.12] text-white shadow-xs"
                    : "bg-zinc-900/40 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-zinc-900/70"
                }`}
              >
                <span className="text-xs font-medium block text-zinc-400">
                  {m.label}
                </span>
                <span className="text-sm font-bold font-mono tracking-tight block mt-0.5 text-white">
                  {m.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* SVG Interactive Chart */}
        <div className="relative p-2 bg-zinc-950/70 rounded-lg border border-white/[0.06] overflow-hidden">
          {!hasAnyMetricData ? (
            <div className="h-52 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Sparkles className="w-7 h-7 text-zinc-600" />
              <p className="text-xs font-bold text-zinc-300">
                No {metricConfig.label} logged in the past {timeRange} days.
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm">
                Log daily entries using the &ldquo;+ Quick Log&rdquo; button to visualize your progress curves.
              </p>
            </div>
          ) : (
            <div className="relative">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-52 sm:h-60 overflow-visible select-none"
              >
                <defs>
                  {/* Linear gradient for area fill */}
                  <linearGradient id={metricConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.33, 0.66, 1].map((pct, idx) => {
                  const y = padTop + plotHeight * (1 - pct);
                  const valLabel = Math.round(chartMax * pct);
                  return (
                    <g key={idx}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={width - padRight}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray={pct === 0 ? "none" : "3,3"}
                      />
                      <text
                        x={padLeft - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[9px] font-mono fill-zinc-500"
                      >
                        {valLabel >= 1000 ? `${Math.round(valLabel / 100) / 10}k` : valLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Target Goal Reference Line */}
                {targetY !== undefined && targetY >= padTop && (
                  <g>
                    <line
                      x1={padLeft}
                      y1={targetY}
                      x2={width - padRight}
                      y2={targetY}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                    <text
                      x={width - padRight}
                      y={targetY - 5}
                      textAnchor="end"
                      className="text-[9px] font-mono font-bold fill-emerald-400"
                    >
                      Target: {targetValue?.toLocaleString()}
                    </text>
                  </g>
                )}

                {/* Area Gradient Fill */}
                {areaD && <path d={areaD} fill={`url(#${metricConfig.gradientId})`} />}

                {/* Main Stroke Path */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={metricConfig.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Point Circles */}
                {coords.map((pt, idx) => {
                  const isHovered = hoveredPointIdx === idx;
                  const isToday = pt.date === today;

                  return (
                    <g
                      key={pt.date}
                      className="cursor-pointer"
                      onClick={() => openDayDetail(pt.date)}
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    >
                      {/* Generous touch/hover target */}
                      <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />

                      {/* Visible dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? "5" : isToday ? "4" : "3"}
                        fill={isHovered ? "#ffffff" : metricConfig.color}
                        stroke="#08090d"
                        strokeWidth={isHovered ? "2.5" : "1.5"}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

                {/* X-Axis Date Labels */}
                {coords.map((pt, idx) => {
                  // Only label every N days to prevent mobile crowding
                  const stride = timeRange === 30 ? 6 : timeRange === 14 ? 3 : 1;
                  if (idx % stride !== 0 && idx !== coords.length - 1) return null;

                  const d = parseISODate(pt.date);
                  const label = d.toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  });

                  return (
                    <text
                      key={`lbl-${pt.date}`}
                      x={pt.x}
                      y={height - 10}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-zinc-500"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>

              {/* Hover / Touch Tooltip Overlay */}
              {hoveredPointIdx !== null && coords[hoveredPointIdx] && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -top-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.15] shadow-2xl text-xs z-30 flex items-center gap-2 whitespace-nowrap animate-fade-in"
                  style={{
                    left: `${(coords[hoveredPointIdx].x / width) * 100}%`,
                  }}
                >
                  <span className="font-mono text-zinc-400 text-[10px]">
                    {formatDisplayDate(coords[hoveredPointIdx].date, "short")}:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {coords[hoveredPointIdx].val.toLocaleString()} {metricConfig.unit}
                  </span>
                  {coords[hoveredPointIdx].activeDay && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Showcase: Verified Personal Records (PRs) & Monthly Recap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Records Trophy Showcase */}
        <div className="glass-card rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Verified Personal Records
                </h3>
                <p className="text-xs text-zinc-400">
                  All-time peaks calculated from your verified local logs.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Best Streak */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Best Streak</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-white">
                  {prs.bestStreak}
                </span>
                <span className="text-xs text-zinc-400">days</span>
              </div>
            </div>

            {/* Peak Steps */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Peak Steps</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-white">
                  {prs.maxStepsDay.steps > 0 ? prs.maxStepsDay.steps.toLocaleString() : "—"}
                </span>
                <span className="text-xs text-zinc-400">steps</span>
              </div>
            </div>

            {/* Peak Single Workout Volume */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
                <span>Max Volume</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-white">
                  {prs.maxSingleWorkoutVolume.volume > 0
                    ? prs.maxSingleWorkoutVolume.volume.toLocaleString()
                    : "—"}
                </span>
                <span className="text-xs text-zinc-400">{unitWeight}</span>
              </div>
            </div>

            {/* Total Volume Lifted */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span>All-Time Volume</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold text-white">
                  {prs.totalAllTimeVolume > 0
                    ? prs.totalAllTimeVolume.toLocaleString()
                    : "—"}
                </span>
                <span className="text-xs text-zinc-400">{unitWeight}</span>
              </div>
            </div>
          </div>

          {/* Top Exercise PR Badges */}
          {prs.exercisePRs.length > 0 && (
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 block">
                Top Exercise Heaviest Lifts
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                {prs.exercisePRs.slice(0, 5).map((pr) => (
                  <div
                    key={pr.exerciseName}
                    className="p-2 rounded-lg bg-zinc-900/50 border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-200 truncate mr-2">
                      {pr.exerciseName}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400 shrink-0">
                      {pr.maxWeight} {pr.weightUnit} × {pr.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Summary Card */}
        <div className="glass-card rounded-xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {monthly.monthName} Overview
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Month-to-date habit and consistency accumulation.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {monthly.consistencyPercent}% Stacked
              </span>
            </div>

            {/* Monthly Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Active Days Consistency</span>
                <span className="font-mono text-zinc-300">
                  {monthly.activeDays} / {monthly.totalDaysSoFar} days
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${monthly.consistencyPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Monthly Metric Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                <span className="text-xs font-medium text-zinc-400 block">
                  Steps
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white block mt-1">
                  {monthly.totalSteps > 0 ? monthly.totalSteps.toLocaleString() : "0"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                <span className="text-xs font-medium text-zinc-400 block">
                  Workouts
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white block mt-1">
                  {monthly.totalWorkouts}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                <span className="text-xs font-medium text-zinc-400 block">
                  Volume
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white block mt-1 truncate">
                  {monthly.totalVolume > 0 ? monthly.totalVolume.toLocaleString() : "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
            <span>Show up every day to build long-term momentum.</span>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

