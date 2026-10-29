"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { WorkoutExercise, WorkoutType } from "@/types";
import { formatDisplayDate } from "@/lib/dateUtils";
import { WorkoutSetBuilder } from "@/components/WorkoutSetBuilder";
import {
  X,
  Footprints,
  Flame,
  Droplet,
  Dumbbell,
  Check,
  Calendar,
} from "lucide-react";

export function QuickLogModal() {
  const { isQuickLogOpen, selectedDate, quickLogMetric } = useApp();
  if (!isQuickLogOpen) return null;

  return <QuickLogModalContent key={`${selectedDate}-${quickLogMetric}`} />;
}

function QuickLogModalContent() {
  const {
    closeQuickLog,
    quickLogMetric,
    selectedDate,
    logSteps,
    logCalories,
    logWater,
    addWorkout,
    appData,
    today,
  } = useApp();

  const [activeMetric, setActiveMetric] = useState<"steps" | "calories" | "water" | "workout">(quickLogMetric);
  const [logDate, setLogDate] = useState(selectedDate);

  const initialRecord = appData.dailyRecords.find((r) => r.date === selectedDate);
  const [stepsInput, setStepsInput] = useState(initialRecord?.steps !== undefined ? String(initialRecord.steps) : "");
  const [caloriesInput, setCaloriesInput] = useState(initialRecord?.caloriesConsumedKcal !== undefined ? String(initialRecord.caloriesConsumedKcal) : "");
  const [waterInput, setWaterInput] = useState(initialRecord?.waterMl !== undefined ? String(initialRecord.waterMl) : "");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("walking");
  const [workoutDuration, setWorkoutDuration] = useState("30");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeQuickLog();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeQuickLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (activeMetric === "steps") {
      const val = parseInt(stepsInput, 10);
      if (isNaN(val) || val < 0) {
        setErrorMsg("Please enter a valid step count (0 or greater).");
        return;
      }
      if (val > 100000) {
        setErrorMsg("Step count exceeds 100,000. Please enter a realistic number.");
        return;
      }
      logSteps(val, logDate);
      closeQuickLog();
    } else if (activeMetric === "calories") {
      const val = parseInt(caloriesInput, 10);
      if (isNaN(val) || val < 0) {
        setErrorMsg("Please enter a valid calorie amount (0 or greater).");
        return;
      }
      if (val > 25000) {
        setErrorMsg("Calorie value exceeds 25,000. Please verify.");
        return;
      }
      logCalories(val, logDate);
      closeQuickLog();
    } else if (activeMetric === "water") {
      const val = parseInt(waterInput, 10);
      if (isNaN(val) || val < 0) {
        setErrorMsg("Please enter a valid water volume in ml (0 or greater).");
        return;
      }
      if (val > 15000) {
        setErrorMsg("Water intake exceeds 15,000 ml. Please verify.");
        return;
      }
      logWater(val, "set", logDate);
      closeQuickLog();
    } else if (activeMetric === "workout") {
      const duration = parseInt(workoutDuration, 10);
      if (isNaN(duration) || duration < 1 || duration > 1440) {
        setErrorMsg("Duration must be between 1 and 1440 minutes.");
        return;
      }
      addWorkout(
        workoutType,
        duration,
        workoutNotes,
        logDate,
        workoutExercises.length > 0 ? workoutExercises : undefined
      );
      closeQuickLog();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-log-title"
      onClick={closeQuickLog}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-[#10121a] border-t sm:border border-white/[0.1] rounded-t-2xl sm:rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh] relative animate-slide-up-mobile sm:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile pull indicator */}
        <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-0.5" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 id="quick-log-title" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Log Daily Metric
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Target date: <strong className="text-zinc-200 font-mono">{formatDisplayDate(logDate, "medium")}</strong>
            </p>
          </div>
          <button
            onClick={closeQuickLog}
            aria-label="Close modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Selector Tabs */}
        <div className="p-2 bg-zinc-900/60 border-b border-white/[0.06] grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveMetric("steps")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "steps"
                ? "bg-zinc-800 text-white border border-white/[0.1] shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Footprints className="w-4 h-4 mb-0.5 text-emerald-400" />
            <span>Steps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("water")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "water"
                ? "bg-zinc-800 text-white border border-white/[0.1] shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Droplet className="w-4 h-4 mb-0.5 text-sky-400" />
            <span>Water</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("workout")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "workout"
                ? "bg-zinc-800 text-white border border-white/[0.1] shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Dumbbell className="w-4 h-4 mb-0.5 text-indigo-400" />
            <span>Workout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("calories")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "calories"
                ? "bg-zinc-800 text-white border border-white/[0.1] shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Flame className="w-4 h-4 mb-0.5 text-amber-400" />
            <span>Calories</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Date Picker Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Record Date</span>
            </label>
            <input
              type="date"
              value={logDate}
              max={today}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-emerald-500/60 focus:outline-none text-white font-mono"
            />
          </div>

          {/* Metric-specific controls */}
          {activeMetric === "steps" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Total Steps
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="1"
                  autoFocus
                  placeholder="e.g. 8500"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full pl-3.5 pr-16 py-2.5 text-xl font-bold font-mono bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-emerald-500/60 focus:outline-none text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 pointer-events-none">
                  steps
                </span>
              </div>

              {/* Quick increment buttons */}
              <div className="mt-2.5 flex items-center gap-2">
                {[1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(stepsInput || "0", 10);
                      const next = isNaN(cur) ? amt : cur + amt;
                      setStepsInput(String(next));
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMetric === "water" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Water Volume (ml)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="15000"
                  step="50"
                  autoFocus
                  placeholder="e.g. 2000"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-full pl-3.5 pr-14 py-2.5 text-xl font-bold font-mono bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-sky-500/60 focus:outline-none text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 pointer-events-none">
                  ml
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                {[250, 500, 750].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(waterInput || "0", 10);
                      setWaterInput(String((isNaN(cur) ? 0 : cur) + amt));
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    +{amt} ml
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMetric === "workout" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Workout Category
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-indigo-500/60 focus:outline-none text-white cursor-pointer"
                >
                  <option value="walking" className="bg-zinc-900">Walking</option>
                  <option value="running" className="bg-zinc-900">Running</option>
                  <option value="cycling" className="bg-zinc-900">Cycling</option>
                  <option value="strength" className="bg-zinc-900">Strength Training</option>
                  <option value="yoga" className="bg-zinc-900">Yoga / Mobility</option>
                  <option value="other" className="bg-zinc-900">Other Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Duration (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    placeholder="30"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    className="w-full pl-3.5 pr-14 py-2 text-sm font-mono font-semibold bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-indigo-500/60 focus:outline-none text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 pointer-events-none">
                    mins
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Workout Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Outdoor 5k tempo, heavy leg day"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-indigo-500/60 focus:outline-none text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Collapsible Granular Sets & Reps Builder */}
              <WorkoutSetBuilder
                exercises={workoutExercises}
                onChange={setWorkoutExercises}
                defaultWeightUnit={appData.settings.unitWeight || "kg"}
              />
            </div>
          )}

          {activeMetric === "calories" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Calories Consumed (kcal)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="25000"
                  step="50"
                  autoFocus
                  placeholder="e.g. 2100"
                  value={caloriesInput}
                  onChange={(e) => setCaloriesInput(e.target.value)}
                  className="w-full pl-3.5 pr-14 py-2.5 text-xl font-bold font-mono bg-zinc-900 border border-white/[0.1] rounded-lg focus:border-amber-500/60 focus:outline-none text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 pointer-events-none">
                  kcal
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                Informational intake reference only.
              </p>
            </div>
          )}

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeQuickLog}
              className="px-3.5 py-2 text-zinc-400 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
