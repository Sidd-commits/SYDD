"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ExerciseDefinition,
  MuscleGroup,
  WeightUnit,
  WorkoutExercise,
  WorkoutRoutine,
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
  Bookmark,
  Timer,
  Save,
  Sparkles,
} from "lucide-react";

type WorkoutSetBuilderProps = {
  exercises: WorkoutExercise[];
  onChange: (exercises: WorkoutExercise[]) => void;
  defaultWeightUnit?: WeightUnit;
  onSelectRoutine?: (routine: WorkoutRoutine) => void;
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
  onSelectRoutine,
}: WorkoutSetBuilderProps) {
  const { appData, saveRoutine, startRestTimer } = useApp();
  const [isExpanded, setIsExpanded] = useState(exercises.length > 0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isRoutinePickerOpen, setIsRoutinePickerOpen] = useState(false);
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [routineNameInput, setRoutineNameInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [customExerciseName, setCustomExerciseName] = useState("");

  const routines = appData.workoutRoutines || [];

  const handleLoadRoutine = (routine: WorkoutRoutine) => {
    const loadedExercises: WorkoutExercise[] = routine.exercises.map((ex) => ({
      id: createId("ex"),
      exerciseId: ex.exerciseId,
      name: ex.name,
      notes: ex.notes,
      sets: ex.sets.map((s, idx) => ({
        id: createId("set"),
        setNumber: idx + 1,
        reps: s.reps,
        weight: s.weight,
        weightUnit: s.weightUnit || defaultWeightUnit,
        completed: true,
      })),
    }));
    onChange(loadedExercises);
    if (onSelectRoutine) {
      onSelectRoutine(routine);
    }
    setIsExpanded(true);
    setIsRoutinePickerOpen(false);
  };

  const handleSaveCurrentAsRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = routineNameInput.trim();
    if (!cleanName) return;
    saveRoutine(cleanName, "strength", exercises);
    setIsSavingRoutine(false);
    setRoutineNameInput("");
  };

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
          {/* Action Toolbar: Routines & Timer */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 pb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsRoutinePickerOpen(!isRoutinePickerOpen);
                  setIsSavingRoutine(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] hover:border-white/[0.15] text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3 h-3 text-indigo-400" />
                <span>Load Routine</span>
              </button>

              {exercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSavingRoutine(!isSavingRoutine);
                    setIsRoutinePickerOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] hover:border-white/[0.15] text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3 text-emerald-400" />
                  <span>Save as Routine</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => startRestTimer(90)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Launch 90s Rest Timer"
            >
              <Timer className="w-3 h-3 text-emerald-400" />
              <span>Rest Timer</span>
            </button>
          </div>

          {/* Routine Picker Dropdown / Modal */}
          {isRoutinePickerOpen && (
            <div className="p-3 rounded-2xl bg-zinc-900 border border-indigo-500/30 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Select Routine / Split Template</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoutinePickerOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {routines.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleLoadRoutine(r)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 block">
                        {r.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                        {r.exercises.length} exercises • {r.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} sets
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      Load
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Routine Form */}
          {isSavingRoutine && (
            <form onSubmit={handleSaveCurrentAsRoutine} className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Save Current Workout as Routine</span>
                <button
                  type="button"
                  onClick={() => setIsSavingRoutine(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Routine name (e.g. Heavy Upper Day, Leg Hypertrophy)"
                  value={routineNameInput}
                  onChange={(e) => setRoutineNameInput(e.target.value)}
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!routineNameInput.trim()}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

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
                  <SetRowItem
                    key={set.id}
                    exerciseId={ex.id}
                    set={set}
                    canDelete={ex.sets.length > 1}
                    onUpdateSet={handleUpdateSet}
                    onRemoveSet={handleRemoveSet}
                    onStartRestTimer={startRestTimer}
                  />
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

interface SetRowItemProps {
  exerciseId: string;
  set: WorkoutSet;
  canDelete: boolean;
  onUpdateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onStartRestTimer: (seconds: number) => void;
}

function SetRowItem({
  exerciseId,
  set,
  canDelete,
  onUpdateSet,
  onRemoveSet,
  onStartRestTimer,
}: SetRowItemProps) {
  const [prevWeight, setPrevWeight] = useState(set.weight);
  const [weightStr, setWeightStr] = useState(() =>
    set.weight === 0 || set.weight === undefined ? "" : String(set.weight)
  );

  if (set.weight !== prevWeight) {
    setPrevWeight(set.weight);
    const currentParsed = weightStr === "" ? 0 : parseFloat(weightStr);
    const target = set.weight === undefined ? 0 : set.weight;
    if (currentParsed !== target) {
      setWeightStr(target === 0 ? "" : String(target));
    }
  }

  const [prevReps, setPrevReps] = useState(set.reps);
  const [repsStr, setRepsStr] = useState(() =>
    set.reps === undefined ? "" : String(set.reps)
  );

  if (set.reps !== prevReps) {
    setPrevReps(set.reps);
    const currentParsed = repsStr === "" ? 0 : parseInt(repsStr, 10);
    const target = set.reps === undefined ? 0 : set.reps;
    if (currentParsed !== target) {
      setRepsStr(target === 0 ? "" : String(target));
    }
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWeightStr(val);
    const parsed = val === "" ? 0 : parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateSet(exerciseId, set.id, { weight: parsed });
    }
  };

  const handleWeightBlur = () => {
    const parsed = weightStr === "" ? 0 : parseFloat(weightStr);
    if (isNaN(parsed) || parsed < 0) {
      setWeightStr("");
      onUpdateSet(exerciseId, set.id, { weight: 0 });
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRepsStr(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateSet(exerciseId, set.id, { reps: parsed });
    }
  };

  const handleRepsBlur = () => {
    const parsed = repsStr === "" ? 0 : parseInt(repsStr, 10);
    if (isNaN(parsed) || parsed < 0) {
      setRepsStr("");
      onUpdateSet(exerciseId, set.id, { reps: 0 });
    }
  };

  return (
    <div
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
          value={weightStr}
          onChange={handleWeightChange}
          onBlur={handleWeightBlur}
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
          value={repsStr}
          onChange={handleRepsChange}
          onBlur={handleRepsBlur}
          className="w-full px-2 py-1 text-xs font-mono font-bold bg-white/[0.05] border border-white/[0.1] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
        />
      </div>

      {/* Completed Toggle */}
      <div className="col-span-2 flex justify-center">
        <button
          type="button"
          onClick={() => {
            const nextCompleted = !set.completed;
            onUpdateSet(exerciseId, set.id, {
              completed: nextCompleted,
            });
            if (nextCompleted) {
              onStartRestTimer(90);
            }
          }}
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
        {canDelete && (
          <button
            type="button"
            onClick={() => onRemoveSet(exerciseId, set.id)}
            aria-label="Delete set"
            className="p-1 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
