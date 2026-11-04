import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AppData, DailyRecord, Habit, HabitCompletion, NutritionEntry, Workout, WorkoutRoutine, WorkoutType, WeightUnit } from "@/types";
import initialBackupData from "@/lib/initialHistoricalData.json";

export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

interface DbWorkoutSet {
  id: string;
  set_number: number;
  reps: number;
  weight: number | null;
  weight_unit: WeightUnit | null;
  completed: boolean;
}

interface DbWorkoutExercise {
  id: string;
  exercise_id?: string;
  name: string;
  notes: string | null;
  workout_sets?: DbWorkoutSet[];
}

interface DbWorkout {
  id: string;
  date: string;
  type: WorkoutType;
  duration_minutes: number;
  notes: string | null;
  workout_exercises?: DbWorkoutExercise[];
  created_at: string;
  updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.includes("supabase.co"));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return clientInstance;
}

/**
 * Loads the complete AppData snapshot.
 * Reads from Supabase if configured, otherwise returns local bundle.
 */
export async function getCloudAppData(userId: string = DEFAULT_USER_ID): Promise<AppData> {
  const supabase = getSupabase();
  if (!supabase) {
    return initialBackupData.data as AppData;
  }

  try {
    // 1. Fetch user settings
    const { data: settingsRow } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 2. Fetch daily records
    const { data: dailyRows } = await supabase
      .from("daily_records")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    // 3. Fetch nutrition entries
    const { data: nutritionRows } = await supabase
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    // 4. Fetch workouts
    const { data: workoutRows } = await supabase
      .from("workouts")
      .select("*, workout_exercises(*, workout_sets(*))")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    // 5. Fetch habits
    const { data: habitRows } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId);

    // 6. Fetch habit completions
    const { data: completionRows } = await supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId);

    // 7. Fetch workout routines
    const { data: routineRows } = await supabase
      .from("workout_routines")
      .select("*")
      .eq("user_id", userId);

    const dailyRecords: DailyRecord[] = (dailyRows || []).map((r) => ({
      date: r.date,
      steps: r.steps ?? undefined,
      caloriesConsumedKcal: r.calories_consumed_kcal ?? undefined,
      waterMl: r.water_ml ?? undefined,
      notes: r.notes ?? undefined,
      updatedAt: r.updated_at,
    }));

    const nutritionEntries: NutritionEntry[] = (nutritionRows || []).map((n) => ({
      id: n.id,
      date: n.date,
      name: n.name,
      calories: n.calories,
      proteinG: n.protein_g !== null ? Number(n.protein_g) : undefined,
      carbsG: n.carbs_g !== null ? Number(n.carbs_g) : undefined,
      fatG: n.fat_g !== null ? Number(n.fat_g) : undefined,
      time: n.time || undefined,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));

    const typedWorkoutRows = (workoutRows as unknown as DbWorkout[]) || [];
    const workouts: Workout[] = typedWorkoutRows.map((w) => ({
      id: w.id,
      date: w.date,
      type: w.type,
      durationMinutes: w.duration_minutes,
      notes: w.notes || undefined,
      exercises: (w.workout_exercises || []).map((ex) => ({
        id: ex.id,
        exerciseId: ex.exercise_id || undefined,
        name: ex.name,
        notes: ex.notes || undefined,
        sets: (ex.workout_sets || []).map((s) => ({
          id: s.id,
          setNumber: s.set_number,
          reps: s.reps,
          weight: s.weight !== null ? Number(s.weight) : undefined,
          weightUnit: (s.weight_unit as WeightUnit) || "kg",
          completed: s.completed,
        })),
      })),
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    const habits: Habit[] = (habitRows || []).map((h) => ({
      id: h.id,
      name: h.name,
      active: h.active,
      createdAt: h.created_at,
      archivedAt: h.archived_at || undefined,
    }));

    const habitCompletions: HabitCompletion[] = (completionRows || []).map((c) => ({
      habitId: c.habit_id,
      date: c.date,
      completed: c.completed,
      updatedAt: c.updated_at,
    }));

    const workoutRoutines: WorkoutRoutine[] = (routineRows || []).map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      durationMinutes: r.duration_minutes || undefined,
      notes: r.notes || undefined,
      exercises: Array.isArray(r.exercises) ? r.exercises : [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const settings = settingsRow
      ? {
          schemaVersion: settingsRow.schema_version || 1,
          goals: settingsRow.goals || (initialBackupData.data as AppData).settings.goals,
          onboardingCompleted: Boolean(settingsRow.onboarding_completed),
          unitWater: settingsRow.unit_water || "ml",
          unitWeight: settingsRow.unit_weight || "kg",
        }
      : (initialBackupData.data as AppData).settings;

    return {
      settings,
      dailyRecords,
      workouts,
      habits,
      habitCompletions,
      nutritionEntries,
      workoutRoutines,
    };
  } catch (err) {
    console.warn("[Supabase] Failed to query cloud database, returning local snapshot:", err);
    return initialBackupData.data as AppData;
  }
}

/**
 * Merges delta sync changes into Supabase cloud database.
 */
export async function applyCloudDeltaSync(
  changes: {
    dailyRecords?: DailyRecord[];
    workouts?: Workout[];
    nutritionEntries?: NutritionEntry[];
    habits?: Habit[];
    habitCompletions?: HabitCompletion[];
    workoutRoutines?: WorkoutRoutine[];
    settings?: AppData["settings"];
  },
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; updatedCount: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: true, updatedCount: 0 };
  }

  let updatedCount = 0;

  try {
    // Ensure base user exists
    await supabase.from("users").upsert({ id: userId, email: "local-user@sydd.internal" }, { onConflict: "id" });

    // 1. Daily records (steps, water, calories, notes)
    if (Array.isArray(changes.dailyRecords) && changes.dailyRecords.length > 0) {
      const rows = changes.dailyRecords.map((r) => ({
        id: `dr_${r.date}`,
        user_id: userId,
        date: r.date,
        steps: typeof r.steps === "number" ? r.steps : null,
        calories_consumed_kcal: typeof r.caloriesConsumedKcal === "number" ? r.caloriesConsumedKcal : null,
        water_ml: typeof r.waterMl === "number" ? r.waterMl : null,
        notes: r.notes || null,
        updated_at: r.updatedAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from("daily_records").upsert(rows, { onConflict: "user_id,date" });
      if (!error) updatedCount += rows.length;
    }

    // 2. Nutrition entries (meals and macros)
    if (Array.isArray(changes.nutritionEntries) && changes.nutritionEntries.length > 0) {
      const rows = changes.nutritionEntries.map((n) => ({
        id: n.id,
        user_id: userId,
        date: n.date,
        name: n.name,
        calories: n.calories,
        protein_g: typeof n.proteinG === "number" ? n.proteinG : null,
        carbs_g: typeof n.carbsG === "number" ? n.carbsG : null,
        fat_g: typeof n.fatG === "number" ? n.fatG : null,
        time: n.time || null,
        updated_at: n.updatedAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from("nutrition_entries").upsert(rows, { onConflict: "id" });
      if (!error) updatedCount += rows.length;
    }

    // 3. Workouts
    if (Array.isArray(changes.workouts) && changes.workouts.length > 0) {
      for (const w of changes.workouts) {
        await supabase.from("workouts").upsert({
          id: w.id,
          user_id: userId,
          date: w.date,
          type: w.type,
          duration_minutes: w.durationMinutes,
          notes: w.notes || null,
          updated_at: w.updatedAt || new Date().toISOString(),
        });
        updatedCount++;

        // Sync exercises & sets if present
        if (Array.isArray(w.exercises)) {
          for (let i = 0; i < w.exercises.length; i++) {
            const ex = w.exercises[i];
            await supabase.from("workout_exercises").upsert({
              id: ex.id,
              workout_id: w.id,
              exercise_id: ex.exerciseId || null,
              name: ex.name,
              sort_order: i + 1,
              notes: ex.notes || null,
            });

            if (Array.isArray(ex.sets)) {
              for (const s of ex.sets) {
                await supabase.from("workout_sets").upsert({
                  id: s.id,
                  exercise_id: ex.id,
                  set_number: s.setNumber,
                  reps: s.reps,
                  weight: typeof s.weight === "number" ? s.weight : null,
                  weight_unit: s.weightUnit || "kg",
                  completed: s.completed,
                });
              }
            }
          }
        }
      }
    }

    // 4. Habits
    if (Array.isArray(changes.habits) && changes.habits.length > 0) {
      const rows = changes.habits.map((h) => ({
        id: h.id,
        user_id: userId,
        name: h.name,
        active: h.active,
        archived_at: h.archivedAt || null,
      }));
      const { error } = await supabase.from("habits").upsert(rows, { onConflict: "id" });
      if (!error) updatedCount += rows.length;
    }

    // 5. Habit Completions
    if (Array.isArray(changes.habitCompletions) && changes.habitCompletions.length > 0) {
      const rows = changes.habitCompletions.map((c) => ({
        id: `${c.habitId}_${c.date}`,
        user_id: userId,
        habit_id: c.habitId,
        date: c.date,
        completed: c.completed,
        updated_at: c.updatedAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from("habit_completions").upsert(rows, { onConflict: "user_id,habit_id,date" });
      if (!error) updatedCount += rows.length;
    }

    // 6. Settings
    if (changes.settings) {
      await supabase.from("user_settings").upsert({
        user_id: userId,
        goals: changes.settings.goals,
        unit_water: changes.settings.unitWater || "ml",
        unit_weight: changes.settings.unitWeight || "kg",
        onboarding_completed: Boolean(changes.settings.onboardingCompleted),
        schema_version: changes.settings.schemaVersion || 1,
        updated_at: new Date().toISOString(),
      });
      updatedCount++;
    }

    return { success: true, updatedCount };
  } catch (err) {
    console.error("[Supabase Delta Sync Warning]:", err);
    return { success: false, updatedCount: 0 };
  }
}
