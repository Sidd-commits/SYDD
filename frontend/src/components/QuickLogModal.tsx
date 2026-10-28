"use client";

import React, { useState } from "react";
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        className="bg-[#0e1017] border-t sm:border border-white/[0.12] rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh] relative animate-slide-up-mobile sm:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile pull indicator */}
        <div className="sm:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-0.5" />

        {/* Header */}
        <div className="px-5 py-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between relative z-10">
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Selector Tabs */}
        <div className="p-2 sm:p-3 bg-zinc-900/60 border-b border-white/[0.06] grid grid-cols-4 gap-1.5 relative z-10">
          <button
            type="button"
            onClick={() => setActiveMetric("steps")}
            className={`flex flex-col items-center justify-center min-h-[44px] py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "steps"
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Footprints className="w-4 h-4 mb-0.5" />
            <span>Steps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("water")}
            className={`flex flex-col items-center justify-center min-h-[44px] py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "water"
                ? "bg-sky-500/15 border border-sky-500/40 text-sky-300 shadow-md shadow-sky-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Droplet className="w-4 h-4 mb-0.5" />
            <span>Water</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("workout")}
            className={`flex flex-col items-center justify-center min-h-[44px] py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "workout"
                ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Dumbbell className="w-4 h-4 mb-0.5" />
            <span>Workout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("calories")}
            className={`flex flex-col items-center justify-center min-h-[44px] py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === "calories"
                ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Flame className="w-4 h-4 mb-0.5" />
            <span>Calories</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 relative z-10">
          {/* Date Picker Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Record Date</span>
            </label>
            <input
              type="date"
              value={logDate}
              max={today}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white font-mono"
            />
          </div>

          {/* Metric-specific controls */}
          {activeMetric === "steps" && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
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
                  className="w-full pl-4 pr-20 py-3 text-xl font-bold font-mono bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2.5 py-1 rounded-xl pointer-events-none">
                  steps
                </span>
              </div>

              {/* Quick increment buttons */}
              <div className="mt-3 flex items-center gap-2">
                {[1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(stepsInput || "0", 10);
                      setStepsInput(String((isNaN(cur) ? 0 : cur) + amt));
                    }}
                    className="flex-1 py-2 px-2 bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMetric === "water" && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
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
                  className="w-full pl-4 pr-16 py-3 text-xl font-bold font-mono bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2.5 py-1 rounded-xl pointer-events-none">
                  ml
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {[250, 500, 750].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(waterInput || "0", 10);
                      setWaterInput(String((isNaN(cur) ? 0 : cur) + amt));
                    }}
                    className="flex-1 py-2 px-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl text-xs font-mono font-bold text-sky-300 transition-colors cursor-pointer"
                  >
                    +{amt} ml
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMetric === "workout" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                  Workout Category
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
                  className="w-full px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white cursor-pointer"
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
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
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
                    className="w-full pl-4 pr-18 py-2.5 text-sm font-mono font-bold bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-lg pointer-events-none">
                    mins
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                  Workout Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Outdoor 5k tempo, heavy leg day"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
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
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
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
                  className="w-full pl-4 pr-18 py-3 text-xl font-bold font-mono bg-white/[0.04] border border-white/[0.1] rounded-2xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2.5 py-1 rounded-xl pointer-events-none">
                  kcal
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Informational intake reference only. SYDD does not provide clinical or medical advice.
              </p>
            </div>
          )}

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeQuickLog}
              className="min-h-[44px] px-4 py-2.5 text-zinc-400 hover:text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
