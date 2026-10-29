"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { calculateDaySummary, calculateWorkoutStats, isHabitCompleted } from "@/lib/calculations";
import { formatDisplayDate } from "@/lib/dateUtils";
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
  Edit3,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

export function DayDetailModal() {
  const { isDayDetailOpen } = useApp();
  if (!isDayDetailOpen) return null;

  return <DayDetailModalContent />;
}

function DayDetailModalContent() {
  const {
    closeDayDetail,
    selectedDate,
    appData,
    openQuickLog,
    toggleHabit,
    deleteWorkout,
    saveDailyNotes,
    today,
  } = useApp();

  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDayDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDayDetail]);

  const summary = calculateDaySummary(appData, selectedDate);
  const isSelectedToday = selectedDate === today;

  const toggleWorkoutExpanded = (id: string) => {
    setExpandedWorkouts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNotesSave = () => {
    saveDailyNotes(notes, selectedDate);
    setIsEditingNotes(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
      onClick={closeDayDetail}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        className="bg-[#0e1017] border-t sm:border border-white/[0.12] rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh] relative animate-slide-up-mobile sm:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile pull indicator */}
        <div className="sm:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-0.5" />

        {/* Header */}
        <div className="px-5 py-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="day-detail-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {formatDisplayDate(selectedDate, "full")}
                </h2>
                {isSelectedToday && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {summary.hasData ? (
                  summary.activeDay ? (
                    <span className="text-emerald-400 font-medium">
                      Active day stacked • Level {summary.level} consistency
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 relative z-10">
          {/* Metrics Overview 4-grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Steps */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                  <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Steps</span>
                </div>
                {summary.stepsMet && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">Met</span>
                )}
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono tracking-tight tabular-nums text-white">
                  {summary.steps > 0 ? summary.steps.toLocaleString() : "—"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/ {summary.stepsGoal.toLocaleString()}</span>
              </div>
            </div>

            {/* Water */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                  <Droplet className="w-3.5 h-3.5 text-sky-400" />
                  <span>Water</span>
                </div>
                {summary.waterMet && (
                  <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded">Met</span>
                )}
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono tracking-tight tabular-nums text-white">
                  {summary.waterMl > 0 ? `${summary.waterMl}` : "—"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/ {summary.waterGoal} ml</span>
              </div>
            </div>

            {/* Workouts */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                  <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Workout</span>
                </div>
                {summary.workoutMet && (
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded">Met</span>
                )}
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono tracking-tight tabular-nums text-white">
                  {summary.workoutMinutes > 0 ? `${summary.workoutMinutes}m` : "—"}
                </span>
                {summary.workoutGoalEnabled && (
                  <span className="text-xs text-zinc-500 font-mono">/ {summary.workoutGoal}m</span>
                )}
              </div>
            </div>

            {/* Calories */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calories</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Intake</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono tracking-tight tabular-nums text-white">
                  {summary.caloriesConsumed > 0 ? summary.caloriesConsumed.toLocaleString() : "—"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">kcal</span>
              </div>
            </div>
          </div>

          {/* Workouts Logged for this Day */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Workouts Logged ({summary.workouts.length})
              </h3>
              <button
                onClick={() => {
                  closeDayDetail();
                  openQuickLog("workout");
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Workout</span>
              </button>
            </div>

            {summary.workouts.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No workouts logged on this date.</p>
            ) : (
              <div className="space-y-2.5">
                {summary.workouts.map((w) => {
                  const stats = calculateWorkoutStats(w);
                  const isExpanded = expandedWorkouts[w.id];

                  return (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold capitalize text-white text-sm">
                              {w.type}
                            </span>
                            <span className="text-zinc-400 font-mono font-medium">
                              {w.durationMinutes} mins
                            </span>

                            {stats.hasGranularSets && (
                              <span className="text-[10px] font-mono font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">
                                {stats.totalExercises} ex • {stats.completedSets} sets
                              </span>
                            )}
                            {stats.totalVolume > 0 && (
                              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">
                                {stats.totalVolume.toLocaleString()} {appData.settings.unitWeight || "kg"}
                              </span>
                            )}
                          </div>

                          {w.notes && (
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                              {w.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {stats.hasGranularSets && (
                            <button
                              type="button"
                              onClick={() => toggleWorkoutExpanded(w.id)}
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            >
                              <span>{isExpanded ? "Hide Sets" : "View Sets"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => deleteWorkout(w.id)}
                            aria-label="Delete workout"
                            className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-white/[0.05]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Granular Exercises & Sets breakdown */}
                      {stats.hasGranularSets && isExpanded && (
                        <div className="pt-2 border-t border-white/[0.06] space-y-2">
                          {(w.exercises || []).map((ex, exIdx) => (
                            <div
                              key={ex.id || exIdx}
                              className="p-2.5 rounded-xl bg-zinc-950/50 border border-white/[0.05] space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">
                                  {ex.name}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {ex.sets.filter((s) => s.completed).length} / {ex.sets.length} sets
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {ex.sets.map((set) => (
                                  <div
                                    key={set.id}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono border ${
                                      set.completed
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                        : "bg-white/[0.02] border-white/[0.06] text-zinc-500 line-through"
                                    }`}
                                  >
                                    <span>#{set.setNumber}:</span>
                                    <span className="font-bold text-white">
                                      {set.reps} reps
                                    </span>
                                    {set.weight !== undefined && set.weight > 0 ? (
                                      <span>
                                        @ {set.weight}
                                        {set.weightUnit || appData.settings.unitWeight || "kg"}
                                      </span>
                                    ) : (
                                      <span className="text-zinc-400">(bw)</span>
                                    )}
                                    {set.completed && (
                                      <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Habits Status for this Date */}
          <div>
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Habits Status ({summary.completedHabits.length} completed)
            </h3>
            {appData.habits.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No habits configured.</p>
            ) : (
              <div className="space-y-2">
                {appData.habits
                  .filter((h) => h.active)
                  .map((habit) => {
                    const done = isHabitCompleted(appData, habit.id, selectedDate);
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id, selectedDate)}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          done
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                            : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              done ? "text-emerald-400" : "text-zinc-600"
                            }`}
                          />
                          <span className={done ? "line-through text-zinc-400" : "text-zinc-200"}>{habit.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-zinc-500">
                          {done ? "Completed" : "Pending"}
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
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-zinc-500" />
                <span>Daily Log Note</span>
              </h3>
              {!isEditingNotes && (
                <button
                  onClick={() => {
                    const rec = appData.dailyRecords.find((r) => r.date === selectedDate);
                    setNotes(rec?.notes || "");
                    setIsEditingNotes(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
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
                  placeholder="How did you feel today? Any soreness, energy levels, personal highlights..."
                  rows={3}
                  className="w-full p-3 text-xs bg-white/[0.04] border border-white/[0.12] rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-zinc-500"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 rounded-xl hover:bg-white/[0.05] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNotesSave}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 min-h-[44px]">
                {appData.dailyRecords.find((r) => r.date === selectedDate)?.notes || (
                  <span className="italic text-zinc-500">No notes recorded for this date.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))] border-t border-white/[0.08] flex items-center justify-between bg-zinc-900/50 relative z-10">
          <span className="text-xs font-mono text-zinc-500">
            Local Device Record
          </span>
          <button
            onClick={() => {
              closeDayDetail();
              openQuickLog("steps");
            }}
            className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Edit Metrics for this Day</span>
          </button>
        </div>
      </div>
    </div>
  );
}
