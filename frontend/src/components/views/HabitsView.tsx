"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Habit } from "@/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  CheckSquare,
  Plus,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Flame,
} from "lucide-react";

export function HabitsView() {
  const {
    appData,
    addHabit,
    renameHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabitPermanently,
  } = useApp();

  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const activeHabits = appData.habits.filter((h) => h.active);
  const archivedHabits = appData.habits.filter((h) => !h.active);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName("");
    }
  };

  const startRename = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      renameHabit(id, editingName.trim());
    }
    setEditingHabitId(null);
  };

  const getCompletionCount = (habitId: string) => {
    return appData.habitCompletions.filter((c) => c.habitId === habitId && c.completed).length;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12 max-w-4xl mx-auto">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Habits & Routines
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          Configure recurring micro-habits. Archiving keeps your past historical grid completions intact.
        </p>
      </div>

      {/* Add New Habit Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Create New Recurring Habit</span>
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-stretch gap-3">
          <input
            type="text"
            placeholder="e.g. 10-minute mobility walk, stretch after dinner..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="flex-1 px-4 py-3 text-sm bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-zinc-950 text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Habit</span>
          </button>
        </form>
      </div>

      {/* Active Habits List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Active Habits ({activeHabits.length})
          </h2>
        </div>

        {activeHabits.length === 0 ? (
          <div className="p-10 text-center glass-card rounded-3xl border-dashed border-white/[0.1]">
            <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">
              No active habits right now.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Add small daily routines above to stack your consistency grid.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map((habit) => {
              const completions = getCompletionCount(habit.id);
              const isEditing = editingHabitId === habit.id;

              return (
                <div
                  key={habit.id}
                  className="glass-card glass-card-interactive rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="flex-1 px-4 py-2 text-sm bg-white/[0.04] border border-emerald-500/40 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                      />
                      <button
                        onClick={() => saveRename(habit.id)}
                        className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl cursor-pointer"
                        title="Save name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingHabitId(null)}
                        className="p-2.5 text-zinc-400 hover:bg-white/[0.05] rounded-xl cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {habit.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 font-mono">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Completed <strong className="text-emerald-400 tabular-nums">{completions}</strong> times all-time</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => startRename(habit)}
                        aria-label={`Rename ${habit.name}`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
                        title="Rename habit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => archiveHabit(habit.id)}
                        aria-label={`Archive ${habit.name}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-colors cursor-pointer"
                        title="Archive habit (preserves past history)"
                      >
                        <Archive className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Archive</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Habits Section */}
      {archivedHabits.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Archived Habits ({archivedHabits.length})
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Archived habits are preserved in past dates but do not appear in today&apos;s checklist.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {archivedHabits.map((habit) => {
              const completions = getCompletionCount(habit.id);
              return (
                <div
                  key={habit.id}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-400">
                      {habit.name}
                    </span>
                    <span className="text-zinc-600 ml-2 font-mono">
                      ({completions} past completions)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => unarchiveHabit(habit.id)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setHabitToDelete(habit)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors rounded-xl cursor-pointer"
                      title="Permanently delete habit and historical completions"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(habitToDelete)}
        title="Delete Habit Permanently?"
        message={`Are you sure you want to permanently delete "${habitToDelete?.name}"? This will delete all historical records for this habit. Prefer archiving if you want to keep your past consistency grid intact.`}
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        onConfirm={() => {
          if (habitToDelete) {
            deleteHabitPermanently(habitToDelete.id);
            setHabitToDelete(null);
          }
        }}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
}
