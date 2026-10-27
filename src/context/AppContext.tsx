"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import {
  ActiveTab,
  AppData,
  Goals,
  Habit,
  ISODate,
  Workout,
  WorkoutType,
} from "@/types";
import { StorageService, getDefaultAppData } from "@/lib/storage";
import { getTodayISODate } from "@/lib/dateUtils";

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
    date?: ISODate
  ) => void;
  deleteWorkout: (id: string) => void;
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>(getDefaultAppData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [today, setToday] = useState<ISODate>("2026-10-27");
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [selectedDate, setSelectedDate] = useState<ISODate>("2026-10-27");
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogMetric, setQuickLogMetric] = useState<"steps" | "calories" | "water" | "workout">("steps");
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage and set client date on mount
  useEffect(() => {
    const loaded = StorageService.load();
    const actualToday = getTodayISODate();
    setToday(actualToday);
    setSelectedDate(actualToday);
    setAppData(loaded);
    setIsLoaded(true);
    setIsMounted(true);
  }, []);

  // Save to localStorage when appData changes (after initial mount)
  const updateData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      if (isLoaded) {
        StorageService.save(next);
      }
      return next;
    });
  };

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
    date: ISODate = selectedDate
  ) => {
    const cleanDuration = Math.max(1, Math.floor(durationMinutes));
    const newWorkout: Workout = {
      id: `workout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date,
      type,
      durationMinutes: cleanDuration,
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateData((prev) => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout],
    }));

    showToast(`Workout logged: ${cleanDuration}m ${type}`);
  };

  const deleteWorkout = (id: string) => {
    updateData((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((w) => w.id !== id),
    }));
    showToast("Workout removed", "info");
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
      setAppData(res.data);
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
    setAppData(defaults);
    showToast("All local data has been reset", "info");
  };

  const loadDemoData = () => {
    const sample = StorageService.generateSampleData();
    StorageService.save(sample);
    setAppData(sample);
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
        deleteWorkout,
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
