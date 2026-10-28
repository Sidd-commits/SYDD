import { AppData, DailyRecord, Habit, HabitCompletion, Workout } from "@/types";
import { DEFAULT_HABITS, DEFAULT_SETTINGS, STORAGE_KEY } from "./constants";
import { addDays, getTodayISODate } from "./dateUtils";

/**
 * Returns default empty state for a new user.
 */
export function getDefaultAppData(): AppData {
  return {
    settings: DEFAULT_SETTINGS,
    dailyRecords: [],
    workouts: [],
    habits: [...DEFAULT_HABITS],
    habitCompletions: [],
  };
}

/**
 * Validates and safely migrates loaded raw data.
 */
export function validateAndMigrateData(raw: unknown): AppData {
  const fallback = getDefaultAppData();
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const data = raw as Partial<AppData>;

  // Validate settings
  const settings = {
    schemaVersion: 1,
    goals: {
      stepsPerDay: typeof data.settings?.goals?.stepsPerDay === "number" ? data.settings.goals.stepsPerDay : fallback.settings.goals.stepsPerDay,
      caloriesConsumedKcalPerDay: typeof data.settings?.goals?.caloriesConsumedKcalPerDay === "number" ? data.settings.goals.caloriesConsumedKcalPerDay : fallback.settings.goals.caloriesConsumedKcalPerDay,
      waterMlPerDay: typeof data.settings?.goals?.waterMlPerDay === "number" ? data.settings.goals.waterMlPerDay : fallback.settings.goals.waterMlPerDay,
      workoutMinutesPerDay: typeof data.settings?.goals?.workoutMinutesPerDay === "number" ? data.settings.goals.workoutMinutesPerDay : fallback.settings.goals.workoutMinutesPerDay,
      workoutGoalEnabled: typeof data.settings?.goals?.workoutGoalEnabled === "boolean" ? data.settings.goals.workoutGoalEnabled : fallback.settings.goals.workoutGoalEnabled,
    },
    onboardingCompleted: Boolean(data.settings?.onboardingCompleted),
    unitWater: data.settings?.unitWater === "l" ? ("l" as const) : ("ml" as const),
    unitWeight: data.settings?.unitWeight === "lbs" ? ("lbs" as const) : ("kg" as const),
  };

  // Validate records
  const dailyRecords: DailyRecord[] = Array.isArray(data.dailyRecords)
    ? data.dailyRecords
        .slice(0, 50000)
        .filter((r): r is DailyRecord => Boolean(r && typeof r.date === "string"))
        .map((r) => ({
          date: r.date,
          steps: typeof r.steps === "number" ? Math.max(0, r.steps) : undefined,
          caloriesConsumedKcal: typeof r.caloriesConsumedKcal === "number" ? Math.max(0, r.caloriesConsumedKcal) : undefined,
          waterMl: typeof r.waterMl === "number" ? Math.max(0, r.waterMl) : undefined,
          notes: typeof r.notes === "string" ? r.notes.slice(0, 5000) : undefined,
          updatedAt: r.updatedAt || new Date().toISOString(),
        }))
    : [];

  // Validate workouts
  const workouts: Workout[] = Array.isArray(data.workouts)
    ? data.workouts
        .slice(0, 50000)
        .filter((w): w is Workout => Boolean(w && typeof w.id === "string" && typeof w.date === "string"))
        .map((w) => ({
          id: w.id,
          date: w.date,
          type: w.type || "other",
          durationMinutes: Math.max(1, Number(w.durationMinutes) || 1),
          notes: typeof w.notes === "string" ? w.notes.slice(0, 5000) : undefined,
          exercises: Array.isArray(w.exercises) && w.exercises.length > 0
            ? w.exercises
                .slice(0, 100)
                .filter((ex) => Boolean(ex && typeof ex.name === "string" && ex.name.trim().length > 0))
                .map((ex) => ({
                  id: ex.id || `ex-${Math.random().toString(36).substring(2, 9)}`,
                  exerciseId: typeof ex.exerciseId === "string" ? ex.exerciseId : undefined,
                  name: ex.name.trim().slice(0, 200),
                  notes: typeof ex.notes === "string" ? ex.notes.trim().slice(0, 2000) : undefined,
                  sets: Array.isArray(ex.sets)
                    ? ex.sets.slice(0, 100).map((s, idx) => ({
                        id: s.id || `set-${Math.random().toString(36).substring(2, 9)}`,
                        setNumber: typeof s.setNumber === "number" && s.setNumber > 0 ? s.setNumber : idx + 1,
                        reps: Math.max(0, Number(s.reps) || 0),
                        weight: typeof s.weight === "number" && !isNaN(s.weight) ? Math.max(0, s.weight) : undefined,
                        weightUnit: s.weightUnit === "lbs" ? ("lbs" as const) : ("kg" as const),
                        completed: s.completed !== false,
                      }))
                    : [],
                }))
            : undefined,
          createdAt: w.createdAt || new Date().toISOString(),
          updatedAt: w.updatedAt || new Date().toISOString(),
        }))
    : [];

  // Validate habits
  const habits: Habit[] = Array.isArray(data.habits) && data.habits.length > 0
    ? data.habits
        .slice(0, 1000)
        .filter((h): h is Habit => Boolean(h && typeof h.id === "string" && typeof h.name === "string"))
        .map((h) => ({
          id: h.id,
          name: h.name.slice(0, 200),
          active: h.active !== false,
          createdAt: h.createdAt || new Date().toISOString(),
          archivedAt: h.archivedAt,
        }))
    : fallback.habits;

  // Validate habit completions
  const habitCompletions: HabitCompletion[] = Array.isArray(data.habitCompletions)
    ? data.habitCompletions
        .slice(0, 100000)
        .filter((c): c is HabitCompletion => Boolean(c && typeof c.habitId === "string" && typeof c.date === "string"))
        .map((c) => ({
          habitId: c.habitId,
          date: c.date,
          completed: Boolean(c.completed),
          updatedAt: c.updatedAt || new Date().toISOString(),
        }))
    : [];

  return {
    settings,
    dailyRecords,
    workouts,
    habits,
    habitCompletions,
  };
}

/**
 * Storage service abstraction for loading and persisting AppData.
 */
export const StorageService = {
  load(): AppData {
    if (typeof window === "undefined") {
      return getDefaultAppData();
    }
    try {
      const serialized = window.localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return getDefaultAppData();
      }
      const parsed = JSON.parse(serialized);
      return validateAndMigrateData(parsed);
    } catch (e) {
      console.warn("SYDD: Failed to load from localStorage, returning default state.", e);
      return getDefaultAppData();
    }
  },

  save(data: AppData): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("SYDD: Failed to save to localStorage", e);
      return false;
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("SYDD: Failed to clear localStorage", e);
    }
  },

  exportJSON(data: AppData): string {
    return JSON.stringify(data, null, 2);
  },

  exportCSV(data: AppData): string {
    const headers = ["Date", "Steps", "CaloriesConsumed_kcal", "Water_ml", "Workout_minutes", "Habits_completed", "Notes"];
    const rows: string[] = [headers.join(",")];

    // Gather all distinct dates
    const dates = new Set<string>();
    data.dailyRecords.forEach((r) => dates.add(r.date));
    data.workouts.forEach((w) => dates.add(w.date));
    data.habitCompletions.forEach((c) => dates.add(c.date));

    const sortedDates = Array.from(dates).sort();

    sortedDates.forEach((date) => {
      const rec = data.dailyRecords.find((r) => r.date === date);
      const workouts = data.workouts.filter((w) => w.date === date);
      const workoutMins = workouts.reduce((s, w) => s + w.durationMinutes, 0);
      const habitsDone = data.habitCompletions.filter((c) => c.date === date && c.completed).length;

      let notesText = rec?.notes ?? "";
      // Neutralize spreadsheet formula injection characters: =, +, -, @, \t, \r
      if (notesText && /^[=+\-@\t\r]/.test(notesText)) {
        notesText = `'${notesText}`;
      }
      const safeNotes = notesText ? `"${notesText.replace(/"/g, '""')}"` : "";

      rows.push([
        date,
        rec?.steps ?? "",
        rec?.caloriesConsumedKcal ?? "",
        rec?.waterMl ?? "",
        workoutMins || "",
        habitsDone || "",
        safeNotes,
      ].join(","));
    });

    return rows.join("\n");
  },

  importJSON(jsonString: string): { success: boolean; data?: AppData; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = validateAndMigrateData(parsed);
      this.save(validated);
      return { success: true, data: validated };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown JSON parse error";
      return { success: false, error: message };
    }
  },

  generateSampleData(): AppData {
    const today = getTodayISODate();
    const records: DailyRecord[] = [];
    const workouts: Workout[] = [];
    const habitCompletions: HabitCompletion[] = [];
    const habits = [...DEFAULT_HABITS];

    // Generate past 45 days of realistic data showing habit stacking and consistency
    for (let i = 45; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayOfWeek = (new Date(date).getDay() + 6) % 7; // 0=Mon, 6=Sun
      const isWeekend = dayOfWeek >= 5;

      // Realistic variation: some active streaks, occasional rest days
      const isRestDay = (i % 7 === 3);

      if (!isRestDay) {
        const stepBase = isWeekend ? 9500 : 8200;
        const stepVariance = ((i * 37) % 3000) - 1000;
        const steps = Math.max(3000, stepBase + stepVariance);

        const waterBase = 2000;
        const waterVariance = ((i * 150) % 750) - 250;
        const waterMl = Math.max(1000, waterBase + waterVariance);

        const calories = 1950 + ((i * 43) % 400) - 200;

        records.push({
          date,
          steps,
          caloriesConsumedKcal: calories,
          waterMl,
          notes: i === 0 ? "Feeling energetic today!" : undefined,
          updatedAt: new Date().toISOString(),
        });

        // 3-4 workouts per week
        if (i % 2 === 0) {
          workouts.push({
            id: `sample-workout-${i}`,
            date,
            type: isWeekend ? "running" : "strength",
            durationMinutes: isWeekend ? 45 : 30,
            notes: isWeekend ? "Outdoor run" : "Upper body & core",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Habit completions
        habits.forEach((habit, hIdx) => {
          const completed = (i + hIdx) % 4 !== 0;
          if (completed) {
            habitCompletions.push({
              habitId: habit.id,
              date,
              completed: true,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      }
    }

    const sampleData: AppData = {
      settings: {
        ...DEFAULT_SETTINGS,
        onboardingCompleted: true,
      },
      dailyRecords: records,
      workouts,
      habits,
      habitCompletions,
    };

    return sampleData;
  },
};
