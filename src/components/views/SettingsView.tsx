"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Goals } from "@/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Settings,
  Target,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";

export function SettingsView() {
  const {
    appData,
    updateGoals,
    exportJSON,
    exportCSV,
    importJSON,
    clearAllData,
    loadDemoData,
  } = useApp();

  const [goalsState, setGoalsState] = useState<Goals>({
    ...appData.settings.goals,
  });

  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleGoalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoals(goalsState);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const success = importJSON(content);
        if (!success) {
          setImportError("Invalid SYDD JSON backup file.");
        }
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read the selected file.");
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12 max-w-4xl mx-auto">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          Settings & Data
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Configure daily targets, manage exports and backups, and view privacy settings.
        </p>
      </div>

      {/* Daily Goals Configuration */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Daily Activity Targets
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Personal reference goals. Adjust them anytime without altering past raw records.
            </p>
          </div>
        </div>

        <form onSubmit={handleGoalsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Steps Target */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Daily Step Target
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1000"
                  max="100000"
                  step="500"
                  value={goalsState.stepsPerDay}
                  onChange={(e) =>
                    setGoalsState({ ...goalsState, stepsPerDay: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-bold tabular-nums text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                  steps
                </span>
              </div>
            </div>

            {/* Water Target */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Daily Hydration Target
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="15000"
                  step="250"
                  value={goalsState.waterMlPerDay}
                  onChange={(e) =>
                    setGoalsState({ ...goalsState, waterMlPerDay: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-bold tabular-nums text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                  ml
                </span>
              </div>
            </div>

            {/* Calories Consumed Reference */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Calories Consumed Target (Reference)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="50"
                  value={goalsState.caloriesConsumedKcalPerDay}
                  onChange={(e) =>
                    setGoalsState({
                      ...goalsState,
                      caloriesConsumedKcalPerDay: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-bold tabular-nums text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                  kcal
                </span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                Informational intake benchmark only.
              </p>
            </div>

            {/* Workout Minutes Target & Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Workout Minutes Target
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <input
                    type="checkbox"
                    checked={goalsState.workoutGoalEnabled}
                    onChange={(e) =>
                      setGoalsState({ ...goalsState, workoutGoalEnabled: e.target.checked })
                    }
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Track Goal</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="5"
                  disabled={!goalsState.workoutGoalEnabled}
                  value={goalsState.workoutMinutesPerDay ?? 30}
                  onChange={(e) =>
                    setGoalsState({
                      ...goalsState,
                      workoutMinutesPerDay: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className={`w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-bold tabular-nums text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    !goalsState.workoutGoalEnabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                  mins
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Update Targets</span>
            </button>
          </div>
        </form>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Export & Backup
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            You own 100% of your data. Download offline JSON or CSV records anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* JSON Export */}
          <button
            onClick={exportJSON}
            className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Export JSON Backup
                </span>
                <span className="text-xs text-stone-400">
                  Full data model including habits and settings
                </span>
              </div>
            </div>
          </button>

          {/* CSV Export */}
          <button
            onClick={exportCSV}
            className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Export Activity CSV
                </span>
                <span className="text-xs text-stone-400">
                  Spreadsheet friendly: steps, water, workouts
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 cursor-pointer transition-colors bg-stone-50/50 dark:bg-stone-850/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Restore from JSON Backup
                </span>
                <span className="text-xs text-stone-400">
                  Select a previously exported SYDD JSON file
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              Browse File
            </span>
          </label>

          {importError && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Demo Data & Danger Zone */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Sample Data & Reset
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Load sample activity to test the heatmap or wipe local storage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={loadDemoData}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Load Sample 45-Day Activity</span>
          </button>

          <button
            onClick={() => setIsConfirmClearOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Local Data</span>
          </button>
        </div>
      </div>

      {/* Privacy & Health Notice */}
      <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-850/70 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Local Storage & Health Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          <strong>Local-first:</strong> SYDD stores all information inside your browser&apos;s localStorage on this device. No external analytics, tracking pixels, or remote database services are connected.
        </p>
        <p className="leading-relaxed">
          <strong>Wellness tool:</strong> SYDD is a personal habit and consistency tracker. It does not measure steps automatically via hardware sensors and does not provide medical, diagnostic, or nutritional recommendations.
        </p>
      </div>

      {/* Clear Data Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        title="Clear All Stored Data?"
        message="This action will permanently delete all daily step records, water history, workouts, and habit completions stored on this browser. This cannot be undone unless you have a JSON backup."
        confirmLabel="Yes, Clear Everything"
        confirmVariant="danger"
        onConfirm={() => {
          clearAllData();
          setIsConfirmClearOpen(false);
        }}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
