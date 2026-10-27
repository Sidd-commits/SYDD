"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { WorkoutType } from "@/types";
import { formatDisplayDate, getTodayISODate } from "@/lib/dateUtils";
import {
  X,
  Footprints,
  Flame,
  Droplet,
  Dumbbell,
  Check,
  Plus,
} from "lucide-react";

export function QuickLogModal() {
  const {
    isQuickLogOpen,
    closeQuickLog,
    quickLogMetric,
    selectedDate,
    logSteps,
    logCalories,
    logWater,
    addWorkout,
    appData,
  } = useApp();

  const [activeMetric, setActiveMetric] = useState<"steps" | "calories" | "water" | "workout">(quickLogMetric);
  const [logDate, setLogDate] = useState(selectedDate);

  // Form states
  const [stepsInput, setStepsInput] = useState("");
  const [caloriesInput, setCaloriesInput] = useState("");
  const [waterInput, setWaterInput] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("walking");
  const [workoutDuration, setWorkoutDuration] = useState("30");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync when opened
  useEffect(() => {
    if (isQuickLogOpen) {
      setActiveMetric(quickLogMetric);
      setLogDate(selectedDate);
      setErrorMsg("");

      // Preload existing values if any
      const record = appData.dailyRecords.find((r) => r.date === selectedDate);
      if (record) {
        setStepsInput(record.steps !== undefined ? String(record.steps) : "");
        setCaloriesInput(record.caloriesConsumedKcal !== undefined ? String(record.caloriesConsumedKcal) : "");
        setWaterInput(record.waterMl !== undefined ? String(record.waterMl) : "");
      } else {
        setStepsInput("");
        setCaloriesInput("");
        setWaterInput("");
      }
    }
  }, [isQuickLogOpen, quickLogMetric, selectedDate, appData]);

  if (!isQuickLogOpen) return null;

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
      addWorkout(workoutType, duration, workoutNotes, logDate);
      closeQuickLog();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-log-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 id="quick-log-title" className="text-base font-bold text-stone-900 dark:text-stone-100">
              Log Activity
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Logging for: <strong className="text-stone-700 dark:text-stone-200">{formatDisplayDate(logDate, "medium")}</strong>
            </p>
          </div>
          <button
            onClick={closeQuickLog}
            aria-label="Close modal"
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Selector Tabs */}
        <div className="p-3 bg-stone-50 dark:bg-stone-850 border-b border-stone-100 dark:border-stone-800 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveMetric("steps")}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === "steps"
                ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-stone-200/60 dark:border-stone-700"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Footprints className="w-4 h-4 mb-1" />
            <span>Steps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("water")}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === "water"
                ? "bg-white dark:bg-stone-900 text-sky-700 dark:text-sky-400 shadow-xs border border-stone-200/60 dark:border-stone-700"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Droplet className="w-4 h-4 mb-1" />
            <span>Water</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("workout")}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === "workout"
                ? "bg-white dark:bg-stone-900 text-indigo-700 dark:text-indigo-400 shadow-xs border border-stone-200/60 dark:border-stone-700"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Dumbbell className="w-4 h-4 mb-1" />
            <span>Workout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric("calories")}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === "calories"
                ? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-xs border border-stone-200/60 dark:border-stone-700"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Flame className="w-4 h-4 mb-1" />
            <span>Calories</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Date Picker Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={logDate}
              max={getTodayISODate()}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Metric-specific controls */}
          {activeMetric === "steps" && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Total Steps Today
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
                  className="w-full px-3.5 py-2.5 text-base font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <span className="absolute right-3.5 top-3 text-xs font-medium text-stone-400">
                  steps
                </span>
              </div>

              {/* Quick increment buttons */}
              <div className="mt-2.5 flex items-center gap-1.5">
                {[1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(stepsInput || "0", 10);
                      setStepsInput(String((isNaN(cur) ? 0 : cur) + amt));
                    }}
                    className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMetric === "water" && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
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
                  className="w-full px-3.5 py-2.5 text-base font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <span className="absolute right-3.5 top-3 text-xs font-medium text-stone-400">
                  ml
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5">
                {[250, 500, 750].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(waterInput || "0", 10);
                      setWaterInput(String((isNaN(cur) ? 0 : cur) + amt));
                    }}
                    className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 rounded-lg text-xs font-medium transition-colors"
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
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Workout Type
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-stone-900 dark:text-stone-100"
                >
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="cycling">Cycling</option>
                  <option value="strength">Strength Training</option>
                  <option value="yoga">Yoga / Mobility</option>
                  <option value="other">Other Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
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
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-stone-900 dark:text-stone-100 font-semibold"
                  />
                  <span className="absolute right-3.5 top-2 text-xs font-medium text-stone-400">
                    mins
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Park intervals, leg day"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {activeMetric === "calories" && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
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
                  className="w-full px-3.5 py-2.5 text-base font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <span className="absolute right-3.5 top-3 text-xs font-medium text-stone-400">
                  kcal
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                Informational intake reference only. SYDD does not provide dietary or medical advice.
              </p>
            </div>
          )}

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeQuickLog}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
