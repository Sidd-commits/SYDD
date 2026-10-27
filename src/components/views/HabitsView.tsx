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
  Info,
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
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          Habits & Routines
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Define recurring micro-habits. Archiving keeps your past completion history intact.
        </p>
      </div>

      {/* Add New Habit Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Create New Habit</span>
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <input
            type="text"
            placeholder="e.g. 10-minute mobility walk, stretch after dinner..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </form>
      </div>

      {/* Active Habits List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Active Habits ({activeHabits.length})
          </h2>
        </div>

        {activeHabits.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl">
            <Sparkles className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
              No active habits right now.
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Add small recurring routines above to stack your daily grid.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeHabits.map((habit) => {
              const completions = getCompletionCount(habit.id);
              const isEditing = editingHabitId === habit.id;

              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="flex-1 px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900 dark:text-stone-100"
                      />
                      <button
                        onClick={() => saveRename(habit.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl"
                        title="Save name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingHabitId(null)}
                        className="p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {habit.name}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          Completed <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">{completions}</strong> times all time
                        </p>
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => startRename(habit)}
                        aria-label={`Rename ${habit.name}`}
                        className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                        title="Rename habit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => archiveHabit(habit.id)}
                        aria-label={`Archive ${habit.name}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors"
                        title="Archive habit (preserves past history)"
                      >
                        <Archive className="w-3.5 h-3.5 text-stone-500" />
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
        <div className="space-y-3 pt-4 border-t border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                Archived Habits ({archivedHabits.length})
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Archived habits remain in past dates but do not appear in today&apos;s checklist.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {archivedHabits.map((habit) => {
              const completions = getCompletionCount(habit.id);
              return (
                <div
                  key={habit.id}
                  className="bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-stone-600 dark:text-stone-300">
                      {habit.name}
                    </span>
                    <span className="text-stone-400 ml-2">
                      ({completions} past completions)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => unarchiveHabit(habit.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setHabitToDelete(habit)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-lg"
                      title="Permanently delete habit and its completions"
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
        message={`Are you sure you want to permanently delete "${habitToDelete?.name}"? This will remove all historical completion records for this habit. Prefer archiving if you want to keep your past consistency grid intact.`}
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
