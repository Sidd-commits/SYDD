import { AppData, DailyRecord, Habit, HabitCompletion, NutritionEntry, Workout, WorkoutRoutine } from "@/types";
import { DEFAULT_HABITS, DEFAULT_ROUTINES, DEFAULT_SETTINGS, STORAGE_KEY } from "./constants";
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
    nutritionEntries: [],
    workoutRoutines: [...DEFAULT_ROUTINES],
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
      proteinGPerDay: typeof data.settings?.goals?.proteinGPerDay === "number" ? Math.max(0, data.settings.goals.proteinGPerDay) : fallback.settings.goals.proteinGPerDay,
      carbsGPerDay: typeof data.settings?.goals?.carbsGPerDay === "number" ? Math.max(0, data.settings.goals.carbsGPerDay) : fallback.settings.goals.carbsGPerDay,
      fatGPerDay: typeof data.settings?.goals?.fatGPerDay === "number" ? Math.max(0, data.settings.goals.fatGPerDay) : fallback.settings.goals.fatGPerDay,
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

  // Validate habit completions with (habitId, date) uniqueness
  const completionsMap = new Map<string, HabitCompletion>();
  if (Array.isArray(data.habitCompletions)) {
    data.habitCompletions
      .slice(0, 100000)
      .filter((c): c is HabitCompletion => Boolean(c && typeof c.habitId === "string" && typeof c.date === "string"))
      .forEach((c) => {
        const key = `${c.habitId}_${c.date}`;
        const existing = completionsMap.get(key);
        const curTime = Date.parse(c.updatedAt || "") || 0;
        const exTime = existing ? (Date.parse(existing.updatedAt || "") || 0) : -1;
        if (!existing || curTime >= exTime) {
          completionsMap.set(key, {
            habitId: c.habitId,
            date: c.date,
            completed: Boolean(c.completed),
            updatedAt: c.updatedAt || new Date().toISOString(),
          });
        }
      });
  }
  const habitCompletions: HabitCompletion[] = Array.from(completionsMap.values());

  // Validate nutrition entries
  const nutritionEntries: NutritionEntry[] = Array.isArray(data.nutritionEntries)
    ? data.nutritionEntries
        .slice(0, 50000)
        .filter((n): n is NutritionEntry => Boolean(n && typeof n.id === "string" && typeof n.date === "string" && typeof n.calories === "number"))
        .map((n) => ({
          id: n.id,
          date: n.date,
          name: typeof n.name === "string" && n.name.trim() ? n.name.trim().slice(0, 200) : "Meal",
          calories: Math.max(0, Math.floor(n.calories)),
          proteinG: typeof n.proteinG === "number" && !isNaN(n.proteinG) ? Math.max(0, Math.round(n.proteinG * 10) / 10) : undefined,
          carbsG: typeof n.carbsG === "number" && !isNaN(n.carbsG) ? Math.max(0, Math.round(n.carbsG * 10) / 10) : undefined,
          fatG: typeof n.fatG === "number" && !isNaN(n.fatG) ? Math.max(0, Math.round(n.fatG * 10) / 10) : undefined,
          time: typeof n.time === "string" ? n.time.slice(0, 10) : undefined,
          createdAt: n.createdAt || new Date().toISOString(),
          updatedAt: n.updatedAt || new Date().toISOString(),
        }))
    : [];

  // Validate workout routines
  const workoutRoutines: WorkoutRoutine[] = Array.isArray(data.workoutRoutines) && data.workoutRoutines.length > 0
    ? data.workoutRoutines
        .slice(0, 500)
        .filter((r): r is WorkoutRoutine => Boolean(r && typeof r.id === "string" && typeof r.name === "string" && r.name.trim().length > 0))
        .map((r) => ({
          id: r.id,
          name: r.name.trim().slice(0, 200),
          type: r.type || "strength",
          durationMinutes: typeof r.durationMinutes === "number" && r.durationMinutes > 0 ? r.durationMinutes : undefined,
          notes: typeof r.notes === "string" ? r.notes.trim().slice(0, 2000) : undefined,
          exercises: Array.isArray(r.exercises)
            ? r.exercises.slice(0, 50).map((ex) => ({
                id: ex.id || `rex-${Math.random().toString(36).substring(2, 9)}`,
                exerciseId: typeof ex.exerciseId === "string" ? ex.exerciseId : undefined,
                name: typeof ex.name === "string" ? ex.name.trim().slice(0, 200) : "Exercise",
                notes: typeof ex.notes === "string" ? ex.notes.trim().slice(0, 1000) : undefined,
                sets: Array.isArray(ex.sets)
                  ? ex.sets.slice(0, 50).map((s, idx) => ({
                      id: s.id || `rset-${Math.random().toString(36).substring(2, 9)}`,
                      setNumber: typeof s.setNumber === "number" && s.setNumber > 0 ? s.setNumber : idx + 1,
                      reps: Math.max(0, Number(s.reps) || 0),
                      weight: typeof s.weight === "number" && !isNaN(s.weight) ? Math.max(0, s.weight) : undefined,
                      weightUnit: s.weightUnit === "lbs" ? ("lbs" as const) : ("kg" as const),
                      completed: s.completed !== false,
                    }))
                  : [],
              }))
            : [],
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: r.updatedAt || new Date().toISOString(),
        }))
    : [...DEFAULT_ROUTINES];

  return {
    settings,
    dailyRecords,
    workouts,
    habits,
    habitCompletions,
    nutritionEntries,
    workoutRoutines,
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
    const headers = [
      "Date",
      "Steps",
      "CaloriesConsumed_kcal",
      "Protein_g",
      "Carbs_g",
      "Fat_g",
      "Water_ml",
      "Workout_minutes",
      "Habits_completed",
      "Notes",
    ];
    const rows: string[] = [headers.join(",")];

    // Gather all distinct dates
    const dates = new Set<string>();
    data.dailyRecords.forEach((r) => dates.add(r.date));
    data.workouts.forEach((w) => dates.add(w.date));
    data.habitCompletions.forEach((c) => dates.add(c.date));
    (data.nutritionEntries || []).forEach((n) => dates.add(n.date));

    const sortedDates = Array.from(dates).sort();

    sortedDates.forEach((date) => {
      const rec = data.dailyRecords.find((r) => r.date === date);
      const workouts = data.workouts.filter((w) => w.date === date);
      const workoutMins = workouts.reduce((s, w) => s + w.durationMinutes, 0);
      const habitsDone = data.habitCompletions.filter((c) => c.date === date && c.completed).length;

      const dayNutr = (data.nutritionEntries || []).filter((n) => n.date === date);
      const dayCals =
        dayNutr.length > 0
          ? dayNutr.reduce((s, n) => s + (n.calories || 0), 0)
          : rec?.caloriesConsumedKcal ?? "";

      const hasP = dayNutr.some((n) => typeof n.proteinG === "number");
      const proteinVal = hasP ? dayNutr.reduce((s, n) => s + (n.proteinG || 0), 0) : "";

      const hasC = dayNutr.some((n) => typeof n.carbsG === "number");
      const carbsVal = hasC ? dayNutr.reduce((s, n) => s + (n.carbsG || 0), 0) : "";

      const hasF = dayNutr.some((n) => typeof n.fatG === "number");
      const fatVal = hasF ? dayNutr.reduce((s, n) => s + (n.fatG || 0), 0) : "";

      let notesText = rec?.notes ?? "";
      // Neutralize spreadsheet formula injection characters: =, +, -, @, \t, \r
      if (notesText && /^[=+\-@\t\r]/.test(notesText)) {
        notesText = `'${notesText}`;
      }
      const safeNotes = notesText ? `"${notesText.replace(/"/g, '""')}"` : "";

      rows.push([
        date,
        rec?.steps ?? "",
        dayCals,
        proteinVal,
        carbsVal,
        fatVal,
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

    // Sample nutrition meals for the last 3 days
    const nutritionEntries: NutritionEntry[] = [
      {
        id: "sample-nutr-1",
        date: today,
        name: "Oatmeal with whey & blueberries",
        calories: 480,
        proteinG: 34,
        carbsG: 62,
        fatG: 9,
        time: "08:30",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-nutr-2",
        date: today,
        name: "Grilled chicken breast, jasmine rice & broccoli",
        calories: 680,
        proteinG: 52,
        carbsG: 75,
        fatG: 14,
        time: "13:00",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-nutr-3",
        date: today,
        name: "Greek yogurt parfait with walnuts",
        calories: 320,
        proteinG: 22,
        carbsG: 28,
        fatG: 12,
        time: "17:15",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-nutr-4",
        date: addDays(today, -1),
        name: "Eggs, avocado & sourdough toast",
        calories: 540,
        proteinG: 28,
        carbsG: 44,
        fatG: 26,
        time: "09:00",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-nutr-5",
        date: addDays(today, -1),
        name: "Salmon fillet with roasted sweet potato",
        calories: 720,
        proteinG: 46,
        carbsG: 58,
        fatG: 28,
        time: "19:30",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const sampleData: AppData = {
      settings: {
        ...DEFAULT_SETTINGS,
        onboardingCompleted: true,
      },
      dailyRecords: records,
      workouts,
      habits,
      habitCompletions,
      nutritionEntries,
      workoutRoutines: [...DEFAULT_ROUTINES],
    };

    return sampleData;
  },
};

/**
 * Safely merges local and remote AppData using timestamp-based conflict resolution.
 * Guarantees that neither device loses records.
 */
export function mergeAppData(local: AppData, remote: AppData): AppData {
  const mergedDaily = [...(local.dailyRecords || [])];
  (remote.dailyRecords || []).forEach((rRemote) => {
    const idx = mergedDaily.findIndex((r) => r.date === rRemote.date);
    if (idx >= 0) {
      const localTime = Date.parse(mergedDaily[idx].updatedAt || "") || 0;
      const remoteTime = Date.parse(rRemote.updatedAt || "") || 0;
      if (remoteTime >= localTime) {
        mergedDaily[idx] = { ...mergedDaily[idx], ...rRemote };
      }
    } else {
      mergedDaily.push(rRemote);
    }
  });

  const mergedNutrition = [...(local.nutritionEntries || [])];
  (remote.nutritionEntries || []).forEach((nRemote) => {
    const idx = mergedNutrition.findIndex((n) => n.id === nRemote.id);
    if (idx >= 0) {
      const localTime = Date.parse(mergedNutrition[idx].updatedAt || "") || 0;
      const remoteTime = Date.parse(nRemote.updatedAt || "") || 0;
      if (remoteTime >= localTime) {
        mergedNutrition[idx] = { ...mergedNutrition[idx], ...nRemote };
      }
    } else {
      mergedNutrition.push(nRemote);
    }
  });

  const mergedWorkouts = [...(local.workouts || [])];
  (remote.workouts || []).forEach((wRemote) => {
    const idx = mergedWorkouts.findIndex((w) => w.id === wRemote.id);
    if (idx >= 0) {
      const localTime = Date.parse(mergedWorkouts[idx].updatedAt || "") || 0;
      const remoteTime = Date.parse(wRemote.updatedAt || "") || 0;
      if (remoteTime >= localTime) {
        mergedWorkouts[idx] = { ...mergedWorkouts[idx], ...wRemote };
      }
    } else {
      mergedWorkouts.push(wRemote);
    }
  });

  const mergedHabits = [...(local.habits || [])];
  (remote.habits || []).forEach((hRemote) => {
    const idx = mergedHabits.findIndex((h) => h.id === hRemote.id);
    if (idx >= 0) {
      mergedHabits[idx] = { ...mergedHabits[idx], ...hRemote };
    } else {
      mergedHabits.push(hRemote);
    }
  });

  const mergedCompletions = [...(local.habitCompletions || [])];
  (remote.habitCompletions || []).forEach((cRemote) => {
    const idx = mergedCompletions.findIndex(
      (c) => c.habitId === cRemote.habitId && c.date === cRemote.date
    );
    if (idx >= 0) {
      const localTime = Date.parse(mergedCompletions[idx].updatedAt || "") || 0;
      const remoteTime = Date.parse(cRemote.updatedAt || "") || 0;
      if (remoteTime >= localTime) {
        mergedCompletions[idx] = { ...mergedCompletions[idx], ...cRemote };
      }
    } else {
      mergedCompletions.push(cRemote);
    }
  });

  const mergedRoutines = [...(local.workoutRoutines || [])];
  (remote.workoutRoutines || []).forEach((rRemote) => {
    const idx = mergedRoutines.findIndex((r) => r.id === rRemote.id);
    if (idx >= 0) {
      mergedRoutines[idx] = { ...mergedRoutines[idx], ...rRemote };
    } else {
      mergedRoutines.push(rRemote);
    }
  });

  return {
    settings: {
      ...local.settings,
      ...remote.settings,
      goals: {
        ...local.settings.goals,
        ...remote.settings.goals,
      },
    },
    dailyRecords: mergedDaily,
    workouts: mergedWorkouts,
    habits: mergedHabits,
    habitCompletions: mergedCompletions,
    nutritionEntries: mergedNutrition,
    workoutRoutines: mergedRoutines,
  };
}
