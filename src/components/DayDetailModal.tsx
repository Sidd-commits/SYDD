"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary, isHabitCompleted } from "@/lib/calculations";
import { formatDisplayDate, getTodayISODate } from "@/lib/dateUtils";
import {
  X,
  Calendar,
  Footprints,
  Flame,
  Droplet,
  Dumbbell,
  CheckCircle2,
  Trash2,
  Plus,
  Edit2,
  StickyNote,
} from "lucide-react";

export function DayDetailModal() {
  const {
    isDayDetailOpen,
    closeDayDetail,
    selectedDate,
    appData,
    openQuickLog,
    toggleHabit,
    deleteWorkout,
    saveDailyNotes,
  } = useApp();

  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!isDayDetailOpen) return null;

  const summary = calculateDaySummary(appData, selectedDate);
  const isToday = selectedDate === getTodayISODate();

  const handleNotesSave = () => {
    saveDailyNotes(notes, selectedDate);
    setIsEditingNotes(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="day-detail-title" className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {formatDisplayDate(selectedDate, "full")}
                </h2>
                {isToday && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {summary.hasData ? (
                  summary.activeDay ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Active day • Goals / habits stacked
                    </span>
                  ) : (
                    <span>Activity logged</span>
                  )
                ) : (
                  <span>No activity recorded for this day</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={closeDayDetail}
            aria-label="Close dialog"
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Metrics Overview 4-grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Steps */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <Footprints className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Steps</span>
                </div>
                {summary.stepsMet && (
                  <span className="text-[10px] font-bold text-emerald-600">Met</span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
                  {summary.steps > 0 ? summary.steps.toLocaleString() : "—"}
                </span>
                <span className="text-xs text-stone-400">/ {summary.stepsGoal.toLocaleString()}</span>
              </div>
            </div>

            {/* Water */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <Droplet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Water</span>
                </div>
                {summary.waterMet && (
                  <span className="text-[10px] font-bold text-sky-600">Met</span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
                  {summary.waterMl > 0 ? `${summary.waterMl} ml` : "—"}
                </span>
                <span className="text-xs text-stone-400">/ {summary.waterGoal} ml</span>
              </div>
            </div>

            {/* Workouts */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <Dumbbell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Workout</span>
                </div>
                {summary.workoutMet && (
                  <span className="text-[10px] font-bold text-indigo-600">Met</span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
                  {summary.workoutMinutes > 0 ? `${summary.workoutMinutes}m` : "—"}
                </span>
                {summary.workoutGoalEnabled && (
                  <span className="text-xs text-stone-400">/ {summary.workoutGoal}m</span>
                )}
              </div>
            </div>

            {/* Calories */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Calories</span>
                </div>
                <span className="text-[10px] text-stone-400">Intake</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
                  {summary.caloriesConsumed > 0 ? summary.caloriesConsumed.toLocaleString() : "—"}
                </span>
                <span className="text-xs text-stone-400">kcal</span>
              </div>
            </div>
          </div>

          {/* Workouts Logged for this Day */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Workouts ({summary.workouts.length})
              </h3>
              <button
                onClick={() => {
                  closeDayDetail();
                  openQuickLog("workout");
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Workout</span>
              </button>
            </div>

            {summary.workouts.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No workouts logged on this date.</p>
            ) : (
              <div className="space-y-2">
                {summary.workouts.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 text-xs"
                  >
                    <div>
                      <span className="font-bold capitalize text-stone-900 dark:text-stone-100">
                        {w.type}
                      </span>
                      <span className="text-stone-500 ml-2 font-medium">{w.durationMinutes} minutes</span>
                      {w.notes && (
                        <p className="text-stone-400 text-[11px] mt-0.5">{w.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteWorkout(w.id)}
                      aria-label="Delete workout"
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits Status for this Date */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Habits ({summary.completedHabits.length} completed)
            </h3>
            {appData.habits.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No habits configured.</p>
            ) : (
              <div className="space-y-1.5">
                {appData.habits
                  .filter((h) => h.active)
                  .map((habit) => {
                    const done = isHabitCompleted(appData, habit.id, selectedDate);
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id, selectedDate)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          done
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 font-medium"
                            : "bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              done ? "text-emerald-600 dark:text-emerald-400" : "text-stone-300 dark:text-stone-600"
                            }`}
                          />
                          <span className={done ? "line-through opacity-80" : ""}>{habit.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-400">
                          {done ? "Completed" : "Not completed"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Notes for this day */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-stone-400" />
                <span>Daily Note</span>
              </h3>
              {!isEditingNotes && (
                <button
                  onClick={() => {
                    const rec = appData.dailyRecords.find((r) => r.date === selectedDate);
                    setNotes(rec?.notes || "");
                    setIsEditingNotes(true);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Edit Note
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel today? Note soreness, sleep quality, or achievements..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1.5 text-xs text-stone-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNotesSave}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 min-h-[44px]">
                {appData.dailyRecords.find((r) => r.date === selectedDate)?.notes || (
                  <span className="italic text-stone-400">No note written for this date.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-850/50">
          <span className="text-xs text-stone-400">
            SYDD Local Record
          </span>
          <button
            onClick={() => {
              closeDayDetail();
              openQuickLog("steps");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Metrics for this Day</span>
          </button>
        </div>
      </div>
    </div>
  );
}
