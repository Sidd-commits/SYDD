"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { getActiveHabitsForDate, isHabitCompleted } from "@/lib/calculations";
import { getTodayISODate } from "@/lib/dateUtils";
import { Check, Plus, Sparkles, CheckCircle2 } from "lucide-react";

export function HabitsChecklist() {
  const { appData, toggleHabit, addHabit, today } = useApp();
  const activeHabits = getActiveHabitsForDate(appData, today);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const completedCount = activeHabits.filter((h) =>
    isHabitCompleted(appData, h.id, today)
  ).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName("");
      setIsAdding(false);
    }
  };

  const progressPercent =
    activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Today&apos;s Habits
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 tabular-nums">
              {completedCount}/{activeHabits.length}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Micro-habits stacked daily build long-term momentum.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
          aria-label="Add a new habit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Progress mini-bar */}
      {activeHabits.length > 0 && (
        <div className="mb-4 h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Inline Add Input */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-3 flex items-center gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="e.g. 10-minute mobility stretch"
            autoFocus
            className="flex-1 px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-xs font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Checklist */}
      {activeHabits.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
          <Sparkles className="w-6 h-6 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
            No habits active yet.
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            Create small habits like stretching or a 10-minute walk.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeHabits.map((habit) => {
            const completed = isHabitCompleted(appData, habit.id, today);
            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id, today)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleHabit(habit.id, today);
                  }
                }}
                role="checkbox"
                tabIndex={0}
                aria-checked={completed}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                  completed
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100"
                    : "bg-stone-50/70 dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                    }`}
                  >
                    {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      completed
                        ? "line-through text-stone-500 dark:text-stone-400"
                        : "text-stone-800 dark:text-stone-200"
                    }`}
                  >
                    {habit.name}
                  </span>
                </div>

                {completed && (
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
