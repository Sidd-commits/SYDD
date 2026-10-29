"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ActiveTab,
  AppData,
  Goals,
  Habit,
  ISODate,
  WeightUnit,
  Workout,
  WorkoutExercise,
  WorkoutType,
} from "@/types";
import { StorageService, getDefaultAppData, validateAndMigrateData } from "@/lib/storage";
import { STORAGE_KEY } from "@/lib/constants";
import { getTodayISODate } from "@/lib/dateUtils";
import { SyncService, SyncState, BackendHealth } from "@/lib/syncService";

type ToastMessage = {
  id: string;
  message: string;
  type: "success" | "info" | "error";
};

type AppContextType = {
  appData: AppData;
  today: ISODate;
  isMounted: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: ISODate;
  setSelectedDate: (date: ISODate) => void;
  isQuickLogOpen: boolean;
  openQuickLog: (defaultMetric?: "steps" | "calories" | "water" | "workout") => void;
  closeQuickLog: () => void;
  quickLogMetric: "steps" | "calories" | "water" | "workout";
  isDayDetailOpen: boolean;
  openDayDetail: (date: ISODate) => void;
  closeDayDetail: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;

  // Logging & Data Actions
  logSteps: (steps: number, date?: ISODate) => void;
  logCalories: (calories: number, date?: ISODate) => void;
  logWater: (amountMl: number, mode?: "set" | "add", date?: ISODate) => void;
  saveDailyNotes: (notes: string, date?: ISODate) => void;
  addWorkout: (
    type: WorkoutType,
    durationMinutes: number,
    notes?: string,
    date?: ISODate,
    exercises?: WorkoutExercise[]
  ) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  updateUnitWeight: (unit: WeightUnit) => void;
  toggleHabit: (habitId: string, date?: ISODate) => void;
  addHabit: (name: string) => void;
  renameHabit: (id: string, newName: string) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  deleteHabitPermanently: (id: string) => void;
  updateGoals: (goals: Goals) => void;
  completeOnboarding: () => void;
  exportJSON: () => void;
  exportCSV: () => void;
  importJSON: (jsonString: string) => boolean;
  clearAllData: () => void;
  loadDemoData: () => void;

  // Backend Sync Actions & Status
  syncState: SyncState;
  backendHealth: BackendHealth | null;
  syncWithBackend: () => Promise<boolean>;
  restoreFromBackend: () => Promise<boolean>;
  checkBackendHealth: () => Promise<BackendHealth>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// In-memory snapshot & subscriber registry for React 18/19 useSyncExternalStore
let dataListeners: Array<() => void> = [];
let cachedDataSnapshot: AppData | null = null;

function subscribeData(listener: () => void) {
  dataListeners.push(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedDataSnapshot = StorageService.load();
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    dataListeners = dataListeners.filter((l) => l !== listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function getDataSnapshot(): AppData {
  if (typeof window === "undefined") {
    return getDefaultAppData();
  }
  if (!cachedDataSnapshot) {
    cachedDataSnapshot = StorageService.load();
  }
  return cachedDataSnapshot;
}

const serverAppDataSnapshot: AppData = getDefaultAppData();
function getServerDataSnapshot(): AppData {
  return serverAppDataSnapshot;
}

function emitDataChange(next: AppData) {
  cachedDataSnapshot = next;
  StorageService.save(next);
  for (const listener of dataListeners) {
    listener();
  }
}

const emptySubscribe = () => () => {};
function getTodaySnapshot(): ISODate {
  if (typeof window === "undefined") return "2026-10-27";
  return getTodayISODate();
}
function getServerTodaySnapshot(): ISODate {
  return "2026-10-27";
}
function getMountedSnapshot(): boolean {
  return true;
}
function getServerMountedSnapshot(): boolean {
  return false;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const appData = useSyncExternalStore(subscribeData, getDataSnapshot, getServerDataSnapshot);
  const today = useSyncExternalStore(emptySubscribe, getTodaySnapshot, getServerTodaySnapshot);
  const isMounted = useSyncExternalStore(emptySubscribe, getMountedSnapshot, getServerMountedSnapshot);

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [selectedDateOverride, setSelectedDateOverride] = useState<ISODate | null>(null);
  const selectedDate = selectedDateOverride ?? today;
  const setSelectedDate = (d: ISODate) => setSelectedDateOverride(d);

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogMetric, setQuickLogMetric] = useState<"steps" | "calories" | "water" | "workout">("steps");
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize modal open states with body scroll lock
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isQuickLogOpen || isDayDetailOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [isQuickLogOpen, isDayDetailOpen]);

  const toastSeqRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    toastSeqRef.current += 1;
    const id = `toast-${toastSeqRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkBackendHealth = useCallback(async (): Promise<BackendHealth> => {
    const health = await SyncService.checkHealth();
    setBackendHealth(health);
    if (!health.reachable) {
      setSyncState("offline");
    }
    return health;
  }, []);

  // Periodic health check & initial check
  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      const health = await SyncService.checkHealth();
      if (active) {
        setBackendHealth(health);
        if (!health.reachable) {
          setSyncState("offline");
        }
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const scheduleBackgroundSync = useCallback((data: AppData) => {
    if (syncDebounceRef.current) {
      clearTimeout(syncDebounceRef.current);
    }
    syncDebounceRef.current = setTimeout(async () => {
      try {
        const res = await SyncService.uploadBackup(data);
        if (res.success) {
          setSyncState("synced");
        } else {
          setSyncState("offline");
        }
      } catch {
        setSyncState("offline");
      }
    }, 2000);
  }, []);

  const syncWithBackend = useCallback(async (): Promise<boolean> => {
    setSyncState("syncing");
    const current = getDataSnapshot();
    const res = await SyncService.uploadBackup(current);
    if (res.success) {
      setSyncState("synced");
      if (res.isDuplicate) {
        showToast("Backend is already up to date with this device", "info");
      } else {
        showToast("Data backed up to local server successfully", "success");
      }
      checkBackendHealth();
      return true;
    } else {
      setSyncState("error");
      showToast(res.message || "Could not sync with local server", "error");
      return false;
    }
  }, [showToast, checkBackendHealth]);

  const restoreFromBackend = useCallback(async (): Promise<boolean> => {
    setSyncState("syncing");
    const res = await SyncService.fetchLatestBackup();
    if (res.success && res.data) {
      const validated = validateAndMigrateData(res.data);
      StorageService.save(validated);
      emitDataChange(validated);
      setSyncState("synced");
      showToast("Restored latest data from backend server", "success");
      return true;
    } else {
      setSyncState("error");
      showToast(res.message || "Failed to retrieve backup from backend", "error");
      return false;
    }
  }, [showToast]);

  const updateData = (updater: (prev: AppData) => AppData) => {
    const prev = getDataSnapshot();
    const next = updater(prev);
    emitDataChange(next);
    scheduleBackgroundSync(next);
  };

  const openQuickLog = (metric: "steps" | "calories" | "water" | "workout" = "steps") => {
    setQuickLogMetric(metric);
    setIsQuickLogOpen(true);
  };

  const closeQuickLog = () => setIsQuickLogOpen(false);

  const openDayDetail = (date: ISODate) => {
    setSelectedDate(date);
    setIsDayDetailOpen(true);
  };

  const closeDayDetail = () => setIsDayDetailOpen(false);

  const logSteps = (steps: number, date: ISODate = selectedDate) => {
    const cleanSteps = Math.max(0, Math.floor(steps));
    updateData((prev) => {
      const existingIdx = prev.dailyRecords.findIndex((r) => r.date === date);
      const records = [...prev.dailyRecords];
      if (existingIdx >= 0) {
        records[existingIdx] = {
          ...records[existingIdx],
          steps: cleanSteps,
          updatedAt: new Date().toISOString(),
        };
      } else {
        records.push({
          date,
          steps: cleanSteps,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...prev, dailyRecords: records };
    });
    showToast(`Steps saved: ${cleanSteps.toLocaleString()} steps on ${date}`);
  };

  const logCalories = (calories: number, date: ISODate = selectedDate) => {
    const cleanCalories = Math.max(0, Math.floor(calories));
    updateData((prev) => {
      const existingIdx = prev.dailyRecords.findIndex((r) => r.date === date);
      const records = [...prev.dailyRecords];
      if (existingIdx >= 0) {
        records[existingIdx] = {
          ...records[existingIdx],
          caloriesConsumedKcal: cleanCalories,
          updatedAt: new Date().toISOString(),
        };
      } else {
        records.push({
          date,
          caloriesConsumedKcal: cleanCalories,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...prev, dailyRecords: records };
    });
    showToast(`Calories recorded: ${cleanCalories.toLocaleString()} kcal consumed`);
  };

  const logWater = (amountMl: number, mode: "set" | "add" = "set", date: ISODate = selectedDate) => {
    let finalAmount = Math.max(0, Math.floor(amountMl));
    updateData((prev) => {
      const existingIdx = prev.dailyRecords.findIndex((r) => r.date === date);
      const records = [...prev.dailyRecords];
      if (existingIdx >= 0) {
        if (mode === "add") {
          finalAmount = (records[existingIdx].waterMl ?? 0) + finalAmount;
        }
        records[existingIdx] = {
          ...records[existingIdx],
          waterMl: finalAmount,
          updatedAt: new Date().toISOString(),
        };
      } else {
        records.push({
          date,
          waterMl: finalAmount,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...prev, dailyRecords: records };
    });
    showToast(`Hydration updated: ${finalAmount.toLocaleString()} ml`);
  };

  const saveDailyNotes = (notes: string, date: ISODate = selectedDate) => {
    updateData((prev) => {
      const existingIdx = prev.dailyRecords.findIndex((r) => r.date === date);
      const records = [...prev.dailyRecords];
      if (existingIdx >= 0) {
        records[existingIdx] = {
          ...records[existingIdx],
          notes,
          updatedAt: new Date().toISOString(),
        };
      } else {
        records.push({
          date,
          notes,
          updatedAt: new Date().toISOString(),
        });
      }
      return { ...prev, dailyRecords: records };
    });
    showToast(`Daily note saved for ${date}`);
  };

  const addWorkout = (
    type: WorkoutType,
    durationMinutes: number,
    notes?: string,
    date: ISODate = selectedDate,
    exercises?: WorkoutExercise[]
  ) => {
    const cleanDuration = Math.max(1, Math.floor(durationMinutes));
    const newWorkout: Workout = {
      id: `workout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date,
      type,
      durationMinutes: cleanDuration,
      notes: notes?.trim() || undefined,
      exercises: exercises && exercises.length > 0 ? exercises : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateData((prev) => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout],
    }));

    const detail =
      exercises && exercises.length > 0
        ? ` (${exercises.length} exercise${exercises.length > 1 ? "s" : ""})`
        : "";
    showToast(`Workout logged: ${cleanDuration}m ${type}${detail}`);
  };

  const updateWorkout = (workout: Workout) => {
    updateData((prev) => ({
      ...prev,
      workouts: prev.workouts.map((w) =>
        w.id === workout.id ? { ...workout, updatedAt: new Date().toISOString() } : w
      ),
    }));
    showToast("Workout updated");
  };

  const deleteWorkout = (id: string) => {
    updateData((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((w) => w.id !== id),
    }));
    showToast("Workout removed", "info");
  };

  const updateUnitWeight = (unit: WeightUnit) => {
    updateData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        unitWeight: unit,
      },
    }));
    showToast(`Weight unit set to ${unit}`);
  };

  const toggleHabit = (habitId: string, date: ISODate = selectedDate) => {
    updateData((prev) => {
      const existingIdx = prev.habitCompletions.findIndex(
        (c) => c.habitId === habitId && c.date === date
      );
      const completions = [...prev.habitCompletions];
      let isDoneNow = true;

      if (existingIdx >= 0) {
        isDoneNow = !completions[existingIdx].completed;
        completions[existingIdx] = {
          ...completions[existingIdx],
          completed: isDoneNow,
          updatedAt: new Date().toISOString(),
        };
      } else {
        completions.push({
          habitId,
          date,
          completed: true,
          updatedAt: new Date().toISOString(),
        });
      }

      return { ...prev, habitCompletions: completions };
    });
  };

  const addHabit = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      active: true,
      createdAt: new Date().toISOString(),
    };

    updateData((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));

    showToast(`Added habit: "${cleanName}"`);
  };

  const renameHabit = (id: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, name: cleanName } : h)),
    }));

    showToast("Habit updated");
  };

  const archiveHabit = (id: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id ? { ...h, active: false, archivedAt: new Date().toISOString() } : h
      ),
    }));
    showToast("Habit archived (history preserved)", "info");
  };

  const unarchiveHabit = (id: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id ? { ...h, active: true, archivedAt: undefined } : h
      ),
    }));
    showToast("Habit restored");
  };

  const deleteHabitPermanently = (id: string) => {
    updateData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
      habitCompletions: prev.habitCompletions.filter((c) => c.habitId !== id),
    }));
    showToast("Habit deleted", "info");
  };

  const updateGoals = (newGoals: Goals) => {
    updateData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        goals: newGoals,
      },
    }));
    showToast("Goals updated successfully");
  };

  const completeOnboarding = () => {
    updateData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        onboardingCompleted: true,
      },
    }));
  };

  const exportJSON = () => {
    const json = StorageService.exportJSON(appData);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sydd-backup-${getTodayISODate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON backup downloaded");
  };

  const exportCSV = () => {
    const csv = StorageService.exportCSV(appData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sydd-activity-${getTodayISODate()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV activity exported");
  };

  const importJSON = (jsonString: string): boolean => {
    const res = StorageService.importJSON(jsonString);
    if (res.success && res.data) {
      emitDataChange(res.data);
      showToast("Data imported successfully!");
      return true;
    } else {
      showToast(res.error || "Failed to import data", "error");
      return false;
    }
  };

  const clearAllData = () => {
    StorageService.clear();
    const defaults = getDefaultAppData();
    emitDataChange(defaults);
    showToast("All local data has been reset", "info");
  };

  const loadDemoData = () => {
    const sample = StorageService.generateSampleData();
    emitDataChange(sample);
    showToast("Demo activity loaded! Explore the heatmap and history.");
  };

  return (
    <AppContext.Provider
      value={{
        appData,
        today,
        isMounted,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        isQuickLogOpen,
        openQuickLog,
        closeQuickLog,
        quickLogMetric,
        isDayDetailOpen,
        openDayDetail,
        closeDayDetail,
        toasts,
        showToast,
        removeToast,
        logSteps,
        logCalories,
        logWater,
        saveDailyNotes,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        updateUnitWeight,
        toggleHabit,
        addHabit,
        renameHabit,
        archiveHabit,
        unarchiveHabit,
        deleteHabitPermanently,
        updateGoals,
        completeOnboarding,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
