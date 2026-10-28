"use client";

import React, { useState } from "react";
import {
  ExerciseDefinition,
  MuscleGroup,
  WeightUnit,
  WorkoutExercise,
  WorkoutSet,
} from "@/types";
import {
  MUSCLE_GROUP_LABELS,
  searchExercises,
} from "@/lib/exercises";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Check,
  Dumbbell,
  Search,
  Layers,
} from "lucide-react";

type WorkoutSetBuilderProps = {
  exercises: WorkoutExercise[];
  onChange: (exercises: WorkoutExercise[]) => void;
  defaultWeightUnit?: WeightUnit;
};

let idCounter = 0;
function createId(prefix: string): string {
  idCounter++;
  return `${prefix}-${idCounter}`;
}

const MUSCLE_GROUPS: (MuscleGroup | "all")[] = [
  "all",
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
];

export function WorkoutSetBuilder({
  exercises,
  onChange,
  defaultWeightUnit = "kg",
}: WorkoutSetBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(exercises.length > 0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [customExerciseName, setCustomExerciseName] = useState("");

  const filteredCatalog = searchExercises(
    searchQuery,
    selectedMuscle,
    "all"
  );

  const handleAddExerciseFromCatalog = (catalogItem: ExerciseDefinition) => {
    const newEx: WorkoutExercise = {
      id: createId("ex"),
      exerciseId: catalogItem.id,
      name: catalogItem.name,
      sets: [
        {
          id: createId("set"),
          setNumber: 1,
          reps: 10,
          weight: 0,
          weightUnit: defaultWeightUnit,
          completed: true,
        },
      ],
    };
    onChange([...exercises, newEx]);
    setIsPickerOpen(false);
    setSearchQuery("");
  };

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customExerciseName.trim();
    if (!trimmed) return;

    const newEx: WorkoutExercise = {
      id: createId("ex"),
      name: trimmed,
      sets: [
        {
          id: createId("set"),
          setNumber: 1,
          reps: 10,
          weight: 0,
          weightUnit: defaultWeightUnit,
          completed: true,
        },
      ],
    };
    onChange([...exercises, newEx]);
    setCustomExerciseName("");
    setIsPickerOpen(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    onChange(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleAddSet = (exerciseId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: WorkoutSet = {
        id: createId("set"),
        setNumber: ex.sets.length + 1,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 0,
        weightUnit: lastSet?.weightUnit || defaultWeightUnit,
        completed: true,
      };
      return {
        ...ex,
        sets: [...ex.sets, newSet],
      };
    });
    onChange(updated);
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const filtered = ex.sets.filter((s) => s.id !== setId);
      // Re-index set numbers
      const reindexed = filtered.map((s, idx) => ({
        ...s,
        setNumber: idx + 1,
      }));
      return {
        ...ex,
        sets: reindexed,
      };
    });
    onChange(updated);
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
      };
    });
    onChange(updated);
  };

  // Compute total volume summary
  let totalVolume = 0;
  let totalCompletedSets = 0;
  exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.completed) {
        totalCompletedSets++;
        if (typeof s.weight === "number" && s.weight > 0 && s.reps > 0) {
          totalVolume += s.weight * s.reps;
        }
      }
    });
  });

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/40 overflow-hidden">
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              Granular Sets & Reps Builder
            </span>
            <span className="text-[11px] text-zinc-400 block">
              {exercises.length === 0
                ? "Optional — tap to log exercises, weights & sets"
                : `${exercises.length} exercise${exercises.length > 1 ? "s" : ""} • ${totalCompletedSets} sets completed`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalVolume > 0 && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {totalVolume.toLocaleString()} {defaultWeightUnit}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3.5 pt-1 space-y-4 border-t border-white/[0.06]">
          {/* List of Added Exercises */}
          {exercises.map((ex, exIdx) => (
            <div
              key={ex.id}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2.5"
            >
              {/* Exercise Card Title Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 w-4">
                    #{exIdx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {ex.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAddSet(ex.id)}
                    className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Set</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(ex.id)}
                    aria-label={`Remove ${ex.name}`}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-white/[0.05]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 gap-1.5 text-[10px] font-mono font-bold text-zinc-500 uppercase px-1">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-4">Weight ({defaultWeightUnit})</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-2 text-center">Done</div>
                  <div className="col-span-1"></div>
                </div>

                {ex.sets.map((set) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all ${
                      set.completed
                        ? "bg-white/[0.02] border-white/[0.06]"
                        : "bg-zinc-950/40 border-white/[0.03] opacity-60"
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 text-xs font-mono font-bold text-zinc-400 pl-1">
                      {set.setNumber}
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-4 relative">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        step="0.5"
                        placeholder="0 (bw)"
                        value={set.weight === 0 || set.weight === undefined ? "" : set.weight}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          handleUpdateSet(ex.id, set.id, {
                            weight: isNaN(val) ? 0 : val,
                          });
                        }}
                        className="w-full px-2 py-1 text-xs font-mono font-bold bg-white/[0.05] border border-white/[0.1] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        placeholder="10"
                        value={set.reps || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleUpdateSet(ex.id, set.id, {
                            reps: isNaN(val) ? 0 : val,
                          });
                        }}
                        className="w-full px-2 py-1 text-xs font-mono font-bold bg-white/[0.05] border border-white/[0.1] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                      />
                    </div>

                    {/* Completed Toggle */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSet(ex.id, set.id, {
                            completed: !set.completed,
                          })
                        }
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          set.completed
                            ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-xs shadow-emerald-500/40"
                            : "bg-white/[0.03] border-white/20 text-zinc-600 hover:border-white/40"
                        }`}
                        aria-label="Toggle set completion"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Delete Set */}
                    <div className="col-span-1 flex justify-end">
                      {ex.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(ex.id, set.id)}
                          aria-label="Delete set"
                          className="p-1 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add Exercise Actions */}
          {!isPickerOpen ? (
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/[0.12] hover:border-emerald-500/40 text-xs font-bold text-zinc-400 hover:text-emerald-300 bg-white/[0.01] hover:bg-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Exercise from Catalog</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-[#090b10] border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select Exercise</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bench press, squat, curl..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Muscle Group Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {MUSCLE_GROUPS.map((mg) => (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => setSelectedMuscle(mg)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedMuscle === mg
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-white/[0.04] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {mg === "all" ? "All" : MUSCLE_GROUP_LABELS[mg]}
                  </button>
                ))}
              </div>

              {/* Exercise Catalog List */}
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredCatalog.slice(0, 30).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleAddExerciseFromCatalog(cat)}
                    className="w-full p-2 rounded-xl text-left hover:bg-white/[0.06] flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                      <span className="capitalize">{cat.equipment}</span>
                      <span>•</span>
                      <span className="capitalize">{MUSCLE_GROUP_LABELS[cat.muscleGroup]}</span>
                    </div>
                  </button>
                ))}

                {filteredCatalog.length === 0 && (
                  <p className="text-xs text-zinc-500 italic p-2 text-center">
                    No matching exercises found.
                  </p>
                )}
              </div>

              {/* Or Add Custom Named Exercise */}
              <form
                onSubmit={handleAddCustomExercise}
                className="pt-2 border-t border-white/[0.06] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Or enter custom exercise name..."
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!customExerciseName.trim()}
                  className="px-3 py-1.5 bg-white/[0.08] hover:bg-emerald-500 hover:text-zinc-950 disabled:opacity-40 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Add Custom
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
