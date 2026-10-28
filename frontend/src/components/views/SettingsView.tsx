"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Goals } from "@/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  usePWAInstall,
  promptPWAInstall,
} from "@/components/ServiceWorkerRegister";
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
  Smartphone,
  CheckCircle2,
  Dumbbell,
  HardDrive,
  RefreshCw,
  Server,
  Clock,
} from "lucide-react";

export function SettingsView() {
  const {
    appData,
    updateGoals,
    updateUnitWeight,
    exportJSON,
    exportCSV,
    importJSON,
    clearAllData,
    loadDemoData,
    syncState,
    backendHealth,
    syncWithBackend,
    restoreFromBackend,
    checkBackendHealth,
  } = useApp();

  const [goalsState, setGoalsState] = useState<Goals>({
    ...appData.settings.goals,
  });

  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const canInstallPWA = usePWAInstall();

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

      {/* Measurement Units */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Workout & Measurement Units
            </h2>
            <p className="text-xs text-zinc-400">
              Select your preferred units for logging exercise sets and volumes.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div>
            <span className="text-xs font-bold text-white block">
              Default Weight Unit
            </span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">
              Used when logging barbell, dumbbell, and machine sets
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-white/[0.08] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => updateUnitWeight("kg")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                (appData.settings.unitWeight || "kg") === "kg"
                  ? "bg-emerald-500 text-zinc-950 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              kg (Kilograms)
            </button>
            <button
              type="button"
              onClick={() => updateUnitWeight("lbs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                appData.settings.unitWeight === "lbs"
                  ? "bg-emerald-500 text-zinc-950 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              lbs (Pounds)
            </button>
          </div>
        </div>
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

      {/* Backend Server Persistence & Synchronization */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Backend Server Persistence & Synchronization
              </h2>
              <p className="text-xs text-zinc-400">
                Back up your local fitness records to a local Node.js filesystem service with SHA-256 deduplicated snapshots.
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {backendHealth?.reachable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {syncState === "syncing" || isManualSyncing
                    ? "Syncing..."
                    : syncState === "synced"
                    ? "Synced (Port 5000)"
                    : "Connected (Port 5000)"}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-800 border border-white/[0.08] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                <span>Server Offline</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => checkBackendHealth()}
              title="Refresh connection status"
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Manual Backup Button */}
          <button
            type="button"
            disabled={isManualSyncing || !backendHealth?.reachable}
            onClick={async () => {
              setIsManualSyncing(true);
              await syncWithBackend();
              setIsManualSyncing(false);
            }}
            className={`flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left transition-all ${
              backendHealth?.reachable
                ? "hover:bg-white/[0.06] hover:border-emerald-500/40 cursor-pointer group"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <HardDrive className={`w-4 h-4 ${isManualSyncing ? "animate-spin" : ""}`} />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  {isManualSyncing ? "Backing Up..." : "Back Up to Backend"}
                </span>
                <span className="text-xs text-zinc-500">
                  Store snapshot in backend/data/
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">
              Save
            </span>
          </button>

          {/* Restore Latest Backup Button */}
          <button
            type="button"
            disabled={!backendHealth?.reachable}
            onClick={() => setIsConfirmRestoreOpen(true)}
            className={`flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left transition-all ${
              backendHealth?.reachable
                ? "hover:bg-white/[0.06] hover:border-sky-500/40 cursor-pointer group"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-sky-300 transition-colors">
                  Restore from Server
                </span>
                <span className="text-xs text-zinc-500">
                  Load latest snapshot from disk
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">
              Restore
            </span>
          </button>
        </div>

        {/* Server Metadata & Timestamp */}
        {backendHealth?.reachable && (
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Last Server Snapshot:</span>
              <strong className="text-zinc-200 font-mono">
                {backendHealth.lastBackupTimestamp
                  ? new Date(backendHealth.lastBackupTimestamp).toLocaleString()
                  : "None recorded yet"}
              </strong>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Uptime: {Math.floor((backendHealth.uptimeSeconds || 0) / 60)} mins
            </span>
          </div>
        )}

        {/* Architecture & Persistence Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 space-y-2">
          <p className="leading-relaxed">
            <strong className="text-zinc-200">Local Filesystem Storage Architecture:</strong> Backups are saved directly as JSON files inside <code className="text-emerald-400 bg-white/[0.06] px-1.5 py-0.5 rounded">backend/data/</code> on your host machine with rotating backups and SHA-256 deduplication.
          </p>
          <p className="leading-relaxed text-zinc-500">
            <strong>Deployment Note:</strong> Local filesystem persistence works seamlessly in local development, desktop environments, or self-hosted Docker volumes. However, serverless platforms (e.g. Vercel Serverless Functions) use ephemeral read-only filesystems; for multi-user production cloud deployments, a managed database (PostgreSQL/Supabase/Firebase) would be required.
          </p>
        </div>
      </div>

      {/* Progressive Web App (PWA) & Mobile Status */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Android & Mobile Installation
              </h2>
              <p className="text-xs text-zinc-400">
                Install SYDD as a standalone app on your Android device with offline support.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PWA Standalone</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5 text-xs text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p>
              <strong className="text-zinc-200">Standalone Experience:</strong> Launches fullscreen without browser URL bars, behaves like a native Android app, and keeps screen awake during workouts.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p>
              <strong className="text-zinc-200">Offline Resilience:</strong> The app shell is cached locally via Service Worker. Track your steps, workouts, and habits anywhere without internet access.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p>
              <strong className="text-zinc-200">Android Chrome Installation:</strong> If you don&apos;t see the prompt below, tap the <strong>⋮ (menu)</strong> in Chrome and choose <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
            </p>
          </div>
        </div>

        {canInstallPWA && (
          <button
            onClick={() => promptPWAInstall()}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Install SYDD App to Android Home Screen</span>
          </button>
        )}
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

      {/* Restore Server Backup Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmRestoreOpen}
        title="Restore from Server Backup?"
        message="This action will replace your browser's current fitness records with the latest backup stored on the local backend server. Are you sure you want to proceed?"
        confirmLabel="Yes, Restore Backup"
        confirmVariant="primary"
        onConfirm={async () => {
          setIsConfirmRestoreOpen(false);
          await restoreFromBackend();
        }}
        onCancel={() => setIsConfirmRestoreOpen(false)}
      />
    </div>
  );
}
