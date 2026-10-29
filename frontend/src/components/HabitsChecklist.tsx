"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { getActiveHabitsForDate, isHabitCompleted } from "@/lib/calculations";
import { Check, Plus, Sparkles, Flame } from "lucide-react";

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
    <div className="glass-card rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Today&apos;s Habits
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
                {completedCount} / {activeHabits.length} Done
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Micro-habits stacked daily build long-term momentum.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/[0.08] transition-all cursor-pointer active:scale-95"
            aria-label="Add a new habit"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Habit</span>
          </button>
        </div>

        {/* Progress bar */}
        {activeHabits.length > 0 && (
          <div className="mb-4 h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Inline Add Input */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="mb-4 flex items-center gap-2 p-1.5 bg-zinc-900 rounded-lg border border-white/[0.12]">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. 10-minute mobility stretch..."
              autoFocus
              className="flex-1 px-2.5 py-1.5 text-xs bg-transparent border-none focus:outline-none text-white placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-md transition-all cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Checklist */}
        {activeHabits.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/[0.08] rounded-lg bg-white/[0.01]">
            <Sparkles className="w-5 h-5 text-zinc-500 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-zinc-300">
              No habits active yet.
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Create small routines like stretching or reading to stack your daily grid.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeHabits.map((habit) => {
              const completed = isHabitCompleted(appData, habit.id, today);
              const totalCompletions = appData.habitCompletions.filter(
                (c) => c.habitId === habit.id && c.completed
              ).length;

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
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-150 select-none group ${
                    completed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-zinc-900/60 hover:bg-zinc-800/60 border-white/[0.06] hover:border-white/[0.12] text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0 ${
                        completed
                          ? "bg-emerald-500 border-emerald-400 text-zinc-950"
                          : "border-white/20 bg-zinc-900 group-hover:border-white/40"
                      }`}
                    >
                      {completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs font-medium truncate transition-colors ${
                        completed
                          ? "line-through text-zinc-400"
                          : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      {habit.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pl-2">
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {totalCompletions}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
