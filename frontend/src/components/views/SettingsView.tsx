"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Goals } from "@/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Target,
  Download,
  Upload,
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
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12 max-w-4xl mx-auto">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          Configure daily targets, download backups, and manage offline storage.
        </p>
      </div>

      {/* Daily Goals Configuration */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Daily Consistency Targets
            </h2>
            <p className="text-xs text-zinc-400">
              Personal reference goals. Adjust anytime without modifying past raw entries.
            </p>
          </div>
        </div>

        <form onSubmit={handleGoalsSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Steps Target */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-4 pr-18 py-3 text-base bg-white/[0.04] border border-white/[0.1] rounded-2xl font-mono font-bold tabular-nums text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-lg pointer-events-none">
                  steps
                </span>
              </div>
            </div>

            {/* Water Target */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-4 pr-18 py-3 text-base bg-white/[0.04] border border-white/[0.1] rounded-2xl font-mono font-bold tabular-nums text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-lg pointer-events-none">
                  ml
                </span>
              </div>
            </div>

            {/* Calories Consumed Reference */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Calorie Intake Reference (kcal)
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
                  className="w-full pl-4 pr-18 py-3 text-base bg-white/[0.04] border border-white/[0.1] rounded-2xl font-mono font-bold tabular-nums text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-lg pointer-events-none">
                  kcal
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Informational intake benchmark only.
              </p>
            </div>

            {/* Workout Minutes Target & Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Workout Target (Minutes)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-400">
                  <input
                    type="checkbox"
                    checked={goalsState.workoutGoalEnabled}
                    onChange={(e) =>
                      setGoalsState({ ...goalsState, workoutGoalEnabled: e.target.checked })
                    }
                    className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Track Workout Goal</span>
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
                  className={`w-full pl-4 pr-18 py-3 text-base bg-white/[0.04] border border-white/[0.1] rounded-2xl font-mono font-bold tabular-nums text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    !goalsState.workoutGoalEnabled ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 rounded-lg pointer-events-none">
                  mins
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Update Targets</span>
            </button>
          </div>
        </form>
      </div>

      {/* Data Export & Backup */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Data Portability & Backups
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            You own 100% of your data. Export your entire database offline as JSON or spreadsheet CSV.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* JSON Export */}
          <button
            onClick={exportJSON}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  Export JSON Backup
                </span>
                <span className="text-xs text-zinc-500">
                  Full state including habits and targets
                </span>
              </div>
            </div>
          </button>

          {/* CSV Export */}
          <button
            onClick={exportCSV}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-sky-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-sky-300 transition-colors">
                  Export Activity CSV
                </span>
                <span className="text-xs text-zinc-500">
                  Spreadsheet friendly: steps, water, workouts
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Import JSON */}
        <div>
          <label className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-white/[0.12] hover:border-emerald-500/50 cursor-pointer transition-colors bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Restore from JSON Backup
                </span>
                <span className="text-xs text-zinc-500">
                  Select a previously exported SYDD JSON backup
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <span className="text-xs font-mono font-bold text-emerald-400 px-3.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1]">
              Browse File
            </span>
          </label>

          {importError && (
            <div className="mt-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Demo Data & Danger Zone */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Sample Data & Factory Reset
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Load realistic sample activity to test the heatmap or wipe local device data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={loadDemoData}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Load 45-Day Realistic Sample</span>
          </button>

          <button
            onClick={() => setIsConfirmClearOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Stored Data</span>
          </button>
        </div>
      </div>

      {/* Privacy & Health Notice */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-500 space-y-2">
        <div className="flex items-center gap-2 font-bold text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Wellness Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          <strong>Local-First:</strong> SYDD stores all data inside your browser&apos;s localStorage on this device. No remote databases, telemetry, or external network requests are made.
        </p>
        <p className="leading-relaxed">
          <strong>Non-Medical:</strong> SYDD is a personal habit and consistency tracker. It does not measure physical steps automatically through hardware sensors and does not provide clinical or medical advice.
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
