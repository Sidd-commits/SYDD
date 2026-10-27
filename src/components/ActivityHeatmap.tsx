"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { buildHeatmapWeeks, formatDisplayDate } from "@/lib/dateUtils";
import { calculateHeatmapCell, calculateStreaks } from "@/lib/calculations";
import { ISODate } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  HelpCircle,
  Trophy,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function ActivityHeatmap() {
  const { appData, openDayDetail, today } = useApp();
  const [selectedYear, setSelectedYear] = useState(2026);
  const currentYear = parseInt(today.slice(0, 4), 10) || 2026;

  React.useEffect(() => {
    const y = parseInt(today.slice(0, 4), 10);
    if (!isNaN(y)) setSelectedYear(y);
  }, [today]);

  const [hoveredCell, setHoveredCell] = useState<{
    date: ISODate;
    level: number;
    score: number;
    steps: number;
    water: number;
    workouts: number;
    habits: number;
    x: number;
    y: number;
  } | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const weeks = buildHeatmapWeeks(selectedYear, today);
  const { currentStreak, bestStreak, totalActiveDays } = calculateStreaks(appData, today);

  const getCellClasses = (level: number, isFuture: boolean, isToday: boolean) => {
    if (isFuture) {
      return "bg-zinc-950/40 border border-white/[0.03] opacity-30 cursor-not-allowed";
    }

    let bg = "";
    switch (level) {
      case -1:
        bg = "bg-zinc-900/70 border border-white/[0.06] hover:border-white/30";
        break;
      case 0:
        bg = "bg-zinc-800 border border-zinc-700/60 hover:border-zinc-500";
        break;
      case 1:
        bg = "bg-emerald-950 border border-emerald-800/80 hover:ring-2 hover:ring-emerald-700";
        break;
      case 2:
        bg = "bg-emerald-700 border border-emerald-600 shadow-xs hover:ring-2 hover:ring-emerald-500";
        break;
      case 3:
        bg = "bg-emerald-500 border border-emerald-400 shadow-xs hover:ring-2 hover:ring-emerald-300";
        break;
      case 4:
        bg = "bg-emerald-400 border border-emerald-300 shadow-md shadow-emerald-500/50 hover:ring-2 hover:ring-emerald-200 animate-pulse-glow";
        break;
    }

    const todayRing = isToday ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#08090d]" : "";

    return `${bg} ${todayRing} cursor-pointer transition-all duration-150 rounded-[3px] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none`;
  };

  const getAccessibleLabel = (date: ISODate, level: number, isFuture: boolean) => {
    if (isFuture) return `${formatDisplayDate(date, "short")}: Future date`;
    if (level === -1) return `${formatDisplayDate(date, "short")}: No activity logged`;
    if (level === 4) return `${formatDisplayDate(date, "short")}: Daily goals reached!`;
    if (level === 0) return `${formatDisplayDate(date, "short")}: Logged activity, 0% goal progress`;
    return `${formatDisplayDate(date, "short")}: Level ${level} progress`;
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-xl relative">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Consistency Grid</span>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                53 Weeks
              </span>
            </h2>
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label="How is the consistency grid scored?"
              title="Scoring formula info"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Every green cell represents stacked daily habits and completed goals.
          </p>
        </div>

        {/* Year Selector & Streak Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center border border-white/[0.08] rounded-xl overflow-hidden text-xs font-semibold bg-zinc-900/80">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-2 hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-zinc-200 font-bold tabular-nums">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => Math.min(currentYear, y + 1))}
              disabled={selectedYear >= currentYear}
              className={`p-2 transition-colors ${
                selectedYear >= currentYear
                  ? "opacity-20 cursor-not-allowed text-zinc-600"
                  : "hover:bg-white/[0.06] text-zinc-400 hover:text-white cursor-pointer"
              }`}
              aria-label="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transparent formula explanation panel */}
      {showFormula && (
        <div className="mb-5 p-4 bg-zinc-900/90 border border-emerald-500/20 rounded-2xl text-xs text-zinc-300 space-y-2 animate-fade-in shadow-xl">
          <div className="font-bold text-white flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Transparent Scoring Formula
          </div>
          <p className="text-zinc-400">
            Cell intensity is the average progress of your active tracking goals:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1 text-zinc-400 font-mono text-[11px]">
            <li><strong>Steps:</strong> min(steps / step target, 1.0)</li>
            <li><strong>Water:</strong> min(water ml / water target, 1.0)</li>
            <li><strong>Habits:</strong> completed habits / active habits</li>
            <li><strong>Workout:</strong> min(minutes / workout target, 1.0)</li>
            <li><strong>Calories:</strong> Informational reference only. Does <em>not</em> inflate fitness score.</li>
          </ul>
        </div>
      )}

      {/* Heatmap Grid Container (Horizontally scrollable on small screens) */}
      <div className="overflow-x-auto custom-scrollbar pb-3 pt-1">
        <div className="inline-block min-w-max select-none">
          {/* Month Labels Row */}
          <div className="flex text-[11px] font-mono text-zinc-500 mb-2 ml-7">
            {weeks.map((week, idx) => (
              <div
                key={`month-${idx}`}
                className="w-3.5 mr-1 text-left overflow-visible whitespace-nowrap"
              >
                {week.monthLabel || ""}
              </div>
            ))}
          </div>

          {/* Grid rows (7 days: Mon -> Sun) */}
          <div className="flex">
            {/* Weekday Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[10px] font-mono font-semibold text-zinc-500 mr-2 h-[106px] py-[2px] leading-none">
              <span>Mon</span>
              <span className="opacity-0">Tue</span>
              <span>Wed</span>
              <span className="opacity-0">Thu</span>
              <span>Fri</span>
              <span className="opacity-0">Sat</span>
              <span className="opacity-0">Sun</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1" role="grid" aria-label="Activity Heatmap">
              {weeks.map((week) => (
                <div key={week.weekNumber} className="flex flex-col gap-1">
                  {week.days.map((day) => {
                    const isToday = day.date === today;
                    const cell = calculateHeatmapCell(appData, day.date);
                    const accessibleLabel = getAccessibleLabel(day.date, cell.level, day.isFuture);

                    return (
                      <div
                        key={day.date}
                        role="gridcell"
                        tabIndex={day.isFuture ? -1 : 0}
                        aria-label={accessibleLabel}
                        onClick={() => {
                          if (!day.isFuture) {
                            openDayDetail(day.date);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (!day.isFuture && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            openDayDetail(day.date);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!day.isFuture) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              date: day.date,
                              level: cell.level,
                              score: cell.score,
                              steps: cell.record?.steps ?? 0,
                              water: cell.record?.waterMl ?? 0,
                              workouts: cell.workouts.reduce((s, w) => s + w.durationMinutes, 0),
                              habits: cell.completedHabitsCount,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-3.5 h-3.5 ${getCellClasses(cell.level, day.isFuture, isToday)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-zinc-900/95 border border-white/20 backdrop-blur-xl rounded-2xl p-3 shadow-2xl text-xs space-y-1 w-48 animate-fade-in"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 8}px`,
          }}
        >
          <div className="font-bold text-white flex items-center justify-between border-b border-white/[0.08] pb-1">
            <span>{formatDisplayDate(hoveredCell.date, "short")}</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                hoveredCell.level === 4
                  ? "bg-emerald-500/20 text-emerald-400"
                  : hoveredCell.level > 0
                  ? "bg-emerald-900/50 text-emerald-300"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {hoveredCell.level === 4 ? "Goal Met!" : hoveredCell.level === -1 ? "No data" : `${Math.round(hoveredCell.score * 100)}%`}
            </span>
          </div>
          <div className="text-[11px] text-zinc-300 space-y-0.5 pt-0.5 font-mono">
            {hoveredCell.steps > 0 && <div>👣 {hoveredCell.steps.toLocaleString()} steps</div>}
            {hoveredCell.water > 0 && <div>💧 {hoveredCell.water.toLocaleString()} ml</div>}
            {hoveredCell.workouts > 0 && <div>🏋️ {hoveredCell.workouts} mins</div>}
            {hoveredCell.habits > 0 && <div>✅ {hoveredCell.habits} habits</div>}
            {hoveredCell.level === -1 && <div className="text-zinc-500 italic">No activity recorded</div>}
          </div>
          <div className="text-[9px] text-zinc-500 pt-1 border-t border-white/[0.04]">
            Click to inspect day
          </div>
        </div>
      )}

      {/* Legend & Stats Summary Bar */}
      <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        {/* Streak & Active Days Summary */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-mono tabular-nums font-bold text-white">{currentStreak}</span>
            <span>day streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-mono tabular-nums font-bold text-white">{bestStreak}</span>
            <span>best streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-medium">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="font-mono tabular-nums font-bold text-white">{totalActiveDays}</span>
            <span>active days</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 self-end sm:self-auto">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div
              className="w-3.5 h-3.5 rounded-[2px] bg-zinc-900/70 border border-white/[0.06]"
              title="No data"
            />
            <div
              className="w-3.5 h-3.5 rounded-[2px] bg-zinc-800 border border-zinc-700/60"
              title="Logged 0% progress"
            />
            <div
              className="w-3.5 h-3.5 rounded-[2px] bg-emerald-950 border border-emerald-800/80"
              title="1-49% progress"
            />
            <div
              className="w-3.5 h-3.5 rounded-[2px] bg-emerald-700 border border-emerald-600"
              title="50-74% progress"
            />
            <div
              className="w-3.5 h-3.5 rounded-[2px] bg-emerald-500 border border-emerald-400"
              title="75-99% progress"
            />
            <div
              className="w-3.5 h-3.5 rounded-[2px] bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/50"
              title="100%+ Goal reached"
            />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
