"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { getActiveHabitsForDate, isHabitCompleted } from "@/lib/calculations";
import { Check, Plus, Sparkles, CheckCircle2, Flame } from "lucide-react";

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
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Today&apos;s Habits
            </h2>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
              {completedCount} / {activeHabits.length} Done
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Micro-habits stacked daily build long-term momentum.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white/[0.05] hover:bg-emerald-500/15 text-zinc-300 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          aria-label="Add a new habit"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Progress mini-bar */}
      {activeHabits.length > 0 && (
        <div className="mb-4 h-2 w-full bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shimmer-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Inline Add Input */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-4 flex items-center gap-2 p-2 bg-zinc-900/80 rounded-2xl border border-emerald-500/30 animate-fade-in">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="e.g. 10-minute mobility stretch, read 10 pages..."
            autoFocus
            className="flex-1 px-3.5 py-2 text-sm bg-transparent border-none focus:outline-none text-white placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Save Habit
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Checklist */}
      {activeHabits.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
          <Sparkles className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-300">
            No habits active yet.
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create small routines like stretching or a 10-minute walk to stack your daily grid.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 select-none group ${
                  completed
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-sm shadow-emerald-500/10"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/20 text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${
                      completed
                        ? "bg-emerald-500 border-emerald-400 text-zinc-950 scale-105 shadow-xs shadow-emerald-500/50"
                        : "border-white/20 bg-zinc-900 group-hover:border-white/40"
                    }`}
                  >
                    {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                      completed
                        ? "line-through text-zinc-400"
                        : "text-zinc-200 group-hover:text-white"
                    }`}
                  >
                    {habit.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500/70" />
                    {totalCompletions}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
