"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { buildHeatmapWeeks, formatDisplayDate, getTodayISODate } from "@/lib/dateUtils";
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
    x: number;
    y: number;
  } | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const weeks = buildHeatmapWeeks(selectedYear, today);
  const { currentStreak, bestStreak, totalActiveDays } = calculateStreaks(appData, today);

  // Compute cell style based on level:
  // -1 = No data
  //  0 = Logged minimal/0 progress
  //  1 = 1-49%
  //  2 = 50-74%
  //  3 = 75-99%
  //  4 = 100%+ (Goal reached)
  const getCellClasses = (level: number, isFuture: boolean, isToday: boolean) => {
    if (isFuture) {
      return "bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/40 dark:border-stone-800/40 opacity-40 cursor-not-allowed";
    }

    let bg = "";
    switch (level) {
      case -1:
        bg = "bg-stone-100 dark:bg-stone-850 border border-dashed border-stone-200 dark:border-stone-700/60 hover:border-stone-400";
        break;
      case 0:
        bg = "bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-stone-400";
        break;
      case 1:
        bg = "bg-emerald-200 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 hover:ring-1 hover:ring-emerald-400";
        break;
      case 2:
        bg = "bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600 hover:ring-1 hover:ring-emerald-400";
        break;
      case 3:
        bg = "bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400 text-white hover:ring-1 hover:ring-emerald-300";
        break;
      case 4:
        bg = "bg-emerald-500 dark:bg-emerald-400 border border-emerald-600 dark:border-emerald-300 shadow-xs shadow-emerald-400/40 text-white hover:ring-2 hover:ring-emerald-400";
        break;
    }

    const todayRing = isToday ? "ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-stone-900" : "";

    return `${bg} ${todayRing} cursor-pointer transition-all duration-150 rounded-[3px] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none`;
  };

  const getAccessibleLabel = (date: ISODate, level: number, isFuture: boolean) => {
    if (isFuture) return `${formatDisplayDate(date, "short")}: Future date`;
    if (level === -1) return `${formatDisplayDate(date, "short")}: No activity logged`;
    if (level === 4) return `${formatDisplayDate(date, "short")}: Daily goals reached!`;
    if (level === 0) return `${formatDisplayDate(date, "short")}: Logged activity, 0% goal progress`;
    return `${formatDisplayDate(date, "short")}: Level ${level} progress`;
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Consistency Grid
            </h2>
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              aria-label="How is the consistency grid scored?"
              title="Scoring formula info"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Every cell is a day. Show up, log your actions, and stack green days.
          </p>
        </div>

        {/* Year Selector & Streak Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden text-xs font-semibold bg-stone-50 dark:bg-stone-800">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              aria-label="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-stone-700 dark:text-stone-200 font-bold tabular-nums">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => Math.min(currentYear, y + 1))}
              disabled={selectedYear >= currentYear}
              className={`p-1.5 transition-colors ${
                selectedYear >= currentYear
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-stone-200 dark:hover:bg-stone-700"
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
        <div className="mb-4 p-3.5 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-600 dark:text-stone-300 space-y-1.5 animate-fade-in">
          <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Transparent Scoring Formula
          </div>
          <p>
            Cell intensity is the average progress of your active tracking goals:
          </p>
          <ul className="list-disc list-inside space-y-0.5 ml-1 text-stone-500 dark:text-stone-400">
            <li><strong>Steps:</strong> steps / step target (capped at 100%)</li>
            <li><strong>Water:</strong> water ml / water target (capped at 100%)</li>
            <li><strong>Habits:</strong> completed habits / active habits</li>
            <li><strong>Workout:</strong> minutes / workout target (if enabled)</li>
            <li><strong>Calories:</strong> Purely informational personal tracking. Does <em>not</em> inflate fitness score (eating less is never rewarded as fitness).</li>
          </ul>
        </div>
      )}

      {/* Heatmap Grid Container (Horizontally scrollable on small screens) */}
      <div className="overflow-x-auto custom-scrollbar pb-3 pt-1">
        <div className="inline-block min-w-max select-none">
          {/* Month Labels Row */}
          <div className="flex text-[11px] font-medium text-stone-400 dark:text-stone-500 mb-1.5 ml-7">
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
            <div className="flex flex-col justify-between text-[10px] font-semibold text-stone-400 dark:text-stone-500 mr-2 h-[106px] py-[2px] leading-none">
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

      {/* Legend & Stats Summary Bar */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
        {/* Streak & Active Days Summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{currentStreak} day streak</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
            <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{bestStreak} best streak</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-stone-600 dark:text-stone-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{totalActiveDays} active days</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] self-end sm:self-auto">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-[2px] bg-stone-100 dark:bg-stone-850 border border-dashed border-stone-300 dark:border-stone-700"
              title="No data"
            />
            <div
              className="w-3 h-3 rounded-[2px] bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              title="Logged 0% progress"
            />
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-200 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-800"
              title="1-49% progress"
            />
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600"
              title="50-74% progress"
            />
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400"
              title="75-99% progress"
            />
            <div
              className="w-3 h-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-400 border border-emerald-600 dark:border-emerald-300 shadow-xs"
              title="100%+ Goal reached"
            />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
