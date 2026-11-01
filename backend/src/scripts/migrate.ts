import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

interface MigrationReport {
  timestamp: string;
  sourceFile: string;
  sourceHash: string;
  recordsCount: {
    dailyRecords: number;
    workouts: number;
    workoutExercises: number;
    workoutSets: number;
    nutritionEntries: number;
    habits: number;
    habitCompletions: number;
    workoutRoutines: number;
  };
  checksumTotals: {
    totalSteps: number;
    totalCaloriesConsumed: number;
    totalWorkoutMinutes: number;
  };
  legacyRecords: {
    daysWithLegacyCaloriesOnly: number;
    workoutsWithoutSets: number;
  };
  quarantinedRecords: Array<{ collection: string; record: unknown; reason: string }>;
  status: "success" | "partial" | "failed";
}

export function runMigration(
  sourcePath: string = path.resolve(process.cwd(), "data", "latest-backup.json"),
  outputSqlPath?: string
): MigrationReport {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Migration source file not found: ${sourcePath}`);
  }

  const raw = fs.readFileSync(sourcePath, "utf-8");
  const sourceHash = crypto.createHash("sha256").update(raw).digest("hex");
  const parsed = JSON.parse(raw);
  const data = parsed.data || parsed;

  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    sourceFile: sourcePath,
    sourceHash,
    recordsCount: {
      dailyRecords: 0,
      workouts: 0,
      workoutExercises: 0,
      workoutSets: 0,
      nutritionEntries: 0,
      habits: 0,
      habitCompletions: 0,
      workoutRoutines: 0,
    },
    checksumTotals: {
      totalSteps: 0,
      totalCaloriesConsumed: 0,
      totalWorkoutMinutes: 0,
    },
    legacyRecords: {
      daysWithLegacyCaloriesOnly: 0,
      workoutsWithoutSets: 0,
    },
    quarantinedRecords: [],
    status: "success",
  };

  const sqlStatements: string[] = [
    "-- ==============================================================================",
    `-- SYDD MIGRATION SQL GENERATED AT ${report.timestamp}`,
    `-- Source: ${path.basename(sourcePath)} (SHA-256: ${sourceHash})`,
    "-- ==============================================================================",
    "BEGIN TRANSACTION;",
    "",
  ];

  const defaultUserId = "00000000-0000-0000-0000-000000000001";
  sqlStatements.push(
    `INSERT INTO users (id, email) VALUES ('${defaultUserId}', 'local-user@sydd.internal') ON CONFLICT (id) DO NOTHING;`
  );

  // 1. Settings
  if (data.settings) {
    const goalsJson = JSON.stringify(data.settings.goals || {}).replace(/'/g, "''");
    const unitWater = data.settings.unitWater === "l" ? "l" : "ml";
    const unitWeight = data.settings.unitWeight === "lbs" ? "lbs" : "kg";
    const onboarding = Boolean(data.settings.onboardingCompleted);

    sqlStatements.push(
      `INSERT INTO user_settings (user_id, goals, unit_water, unit_weight, onboarding_completed, schema_version) ` +
        `VALUES ('${defaultUserId}', '${goalsJson}'::jsonb, '${unitWater}', '${unitWeight}', ${onboarding}, 1) ` +
        `ON CONFLICT (user_id) DO UPDATE SET goals = EXCLUDED.goals, unit_water = EXCLUDED.unit_water, unit_weight = EXCLUDED.unit_weight;`
    );
  }

  // 2. Daily Records
  const nutritionDates = new Set(
    Array.isArray(data.nutritionEntries) ? data.nutritionEntries.map((n: any) => n.date) : []
  );

  if (Array.isArray(data.dailyRecords)) {
    for (const r of data.dailyRecords) {
      if (!r || typeof r.date !== "string") {
        report.quarantinedRecords.push({ collection: "dailyRecords", record: r, reason: "Missing date field" });
        continue;
      }

      report.recordsCount.dailyRecords++;
      const steps = Math.max(0, Number(r.steps) || 0);
      const calories = typeof r.caloriesConsumedKcal === "number" ? Math.max(0, r.caloriesConsumedKcal) : "NULL";
      const water = typeof r.waterMl === "number" ? Math.max(0, r.waterMl) : "NULL";
      const notes = typeof r.notes === "string" ? `'${r.notes.replace(/'/g, "''")}'` : "NULL";
      const updatedAt = r.updatedAt ? `'${r.updatedAt}'` : "now()";

      report.checksumTotals.totalSteps += steps;
      if (typeof r.caloriesConsumedKcal === "number") {
        report.checksumTotals.totalCaloriesConsumed += r.caloriesConsumedKcal;
        if (!nutritionDates.has(r.date)) {
          report.legacyRecords.daysWithLegacyCaloriesOnly++;
        }
      }

      const recId = `dr_${r.date}`;
      sqlStatements.push(
        `INSERT INTO daily_records (id, user_id, date, steps, calories_consumed_kcal, water_ml, notes, updated_at) ` +
          `VALUES ('${recId}', '${defaultUserId}', '${r.date}', ${steps}, ${calories}, ${water}, ${notes}, ${updatedAt}) ` +
          `ON CONFLICT (user_id, date) DO UPDATE SET steps = EXCLUDED.steps, calories_consumed_kcal = EXCLUDED.calories_consumed_kcal, water_ml = EXCLUDED.water_ml, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at;`
      );
    }
  }

  // 3. Workouts, Exercises, Sets
  if (Array.isArray(data.workouts)) {
    for (const w of data.workouts) {
      if (!w || typeof w.id !== "string" || typeof w.date !== "string") {
        report.quarantinedRecords.push({ collection: "workouts", record: w, reason: "Missing id or date" });
        continue;
      }

      report.recordsCount.workouts++;
      const duration = Math.max(1, Number(w.durationMinutes) || 1);
      report.checksumTotals.totalWorkoutMinutes += duration;
      const type = (w.type || "other").replace(/'/g, "''");
      const notes = typeof w.notes === "string" ? `'${w.notes.replace(/'/g, "''")}'` : "NULL";
      const createdAt = w.createdAt ? `'${w.createdAt}'` : "now()";
      const updatedAt = w.updatedAt ? `'${w.updatedAt}'` : "now()";

      sqlStatements.push(
        `INSERT INTO workouts (id, user_id, date, type, duration_minutes, notes, created_at, updated_at) ` +
          `VALUES ('${w.id}', '${defaultUserId}', '${w.date}', '${type}', ${duration}, ${notes}, ${createdAt}, ${updatedAt}) ` +
          `ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, duration_minutes = EXCLUDED.duration_minutes, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at;`
      );

      if (Array.isArray(w.exercises) && w.exercises.length > 0) {
        let sortOrder = 1;
        for (const ex of w.exercises) {
          if (!ex || !ex.name) continue;
          report.recordsCount.workoutExercises++;
          const exId = ex.id || `ex_${w.id}_${sortOrder}`;
          const exSlug = ex.exerciseId ? `'${ex.exerciseId.replace(/'/g, "''")}'` : "NULL";
          const exName = ex.name.replace(/'/g, "''");
          const exNotes = ex.notes ? `'${ex.notes.replace(/'/g, "''")}'` : "NULL";

          sqlStatements.push(
            `INSERT INTO workout_exercises (id, workout_id, exercise_id, name, sort_order, notes) ` +
              `VALUES ('${exId}', '${w.id}', ${exSlug}, '${exName}', ${sortOrder}, ${exNotes}) ` +
              `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, notes = EXCLUDED.notes;`
          );

          if (Array.isArray(ex.sets)) {
            for (const s of ex.sets) {
              report.recordsCount.workoutSets++;
              const setId = s.id || `s_${exId}_${s.setNumber || 1}`;
              const setNum = Math.max(1, Number(s.setNumber) || 1);
              const reps = Math.max(0, Number(s.reps) || 0);
              const weight = typeof s.weight === "number" ? Math.max(0, s.weight) : "NULL";
              const unit = s.weightUnit === "lbs" ? "lbs" : "kg";
              const completed = s.completed !== false;

              sqlStatements.push(
                `INSERT INTO workout_sets (id, exercise_id, set_number, reps, weight, weight_unit, completed) ` +
                  `VALUES ('${setId}', '${exId}', ${setNum}, ${reps}, ${weight}, '${unit}', ${completed}) ` +
                  `ON CONFLICT (id) DO UPDATE SET reps = EXCLUDED.reps, weight = EXCLUDED.weight, completed = EXCLUDED.completed;`
              );
            }
          }
          sortOrder++;
        }
      } else {
        report.legacyRecords.workoutsWithoutSets++;
      }
    }
  }

  // 4. Nutrition Entries
  if (Array.isArray(data.nutritionEntries)) {
    for (const n of data.nutritionEntries) {
      if (!n || typeof n.id !== "string" || typeof n.date !== "string") {
        report.quarantinedRecords.push({ collection: "nutritionEntries", record: n, reason: "Missing id or date" });
        continue;
      }

      report.recordsCount.nutritionEntries++;
      const name = (n.name || "Meal").replace(/'/g, "''");
      const calories = Math.max(0, Number(n.calories) || 0);
      const protein = typeof n.proteinG === "number" ? Math.max(0, n.proteinG) : "NULL";
      const carbs = typeof n.carbsG === "number" ? Math.max(0, n.carbsG) : "NULL";
      const fat = typeof n.fatG === "number" ? Math.max(0, n.fatG) : "NULL";
      const time = n.time ? `'${n.time.replace(/'/g, "''")}'` : "NULL";
      const createdAt = n.createdAt ? `'${n.createdAt}'` : "now()";
      const updatedAt = n.updatedAt ? `'${n.updatedAt}'` : "now()";

      sqlStatements.push(
        `INSERT INTO nutrition_entries (id, user_id, date, name, calories, protein_g, carbs_g, fat_g, time, created_at, updated_at) ` +
          `VALUES ('${n.id}', '${defaultUserId}', '${n.date}', '${name}', ${calories}, ${protein}, ${carbs}, ${fat}, ${time}, ${createdAt}, ${updatedAt}) ` +
          `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, calories = EXCLUDED.calories, protein_g = EXCLUDED.protein_g, carbs_g = EXCLUDED.carbs_g, fat_g = EXCLUDED.fat_g, updated_at = EXCLUDED.updated_at;`
      );
    }
  }

  // 5. Habits & Habit Completions
  if (Array.isArray(data.habits)) {
    for (const h of data.habits) {
      if (!h || typeof h.id !== "string") continue;
      report.recordsCount.habits++;
      const name = (h.name || "Habit").replace(/'/g, "''");
      const active = h.active !== false;
      const createdAt = h.createdAt ? `'${h.createdAt}'` : "now()";
      const archivedAt = h.archivedAt ? `'${h.archivedAt}'` : "NULL";

      sqlStatements.push(
        `INSERT INTO habits (id, user_id, name, active, created_at, archived_at) ` +
          `VALUES ('${h.id}', '${defaultUserId}', '${name}', ${active}, ${createdAt}, ${archivedAt}) ` +
          `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active, archived_at = EXCLUDED.archived_at;`
      );
    }
  }

  if (Array.isArray(data.habitCompletions)) {
    for (const c of data.habitCompletions) {
      if (!c || !c.habitId || !c.date) continue;
      report.recordsCount.habitCompletions++;
      const compId = `${c.habitId}_${c.date}`;
      const completed = Boolean(c.completed);
      const updatedAt = c.updatedAt ? `'${c.updatedAt}'` : "now()";

      sqlStatements.push(
        `INSERT INTO habit_completions (id, user_id, habit_id, date, completed, updated_at) ` +
          `VALUES ('${compId}', '${defaultUserId}', '${c.habitId}', '${c.date}', ${completed}, ${updatedAt}) ` +
          `ON CONFLICT (user_id, habit_id, date) DO UPDATE SET completed = EXCLUDED.completed, updated_at = EXCLUDED.updated_at;`
      );
    }
  }

  // 6. Workout Routines
  if (Array.isArray(data.workoutRoutines)) {
    for (const r of data.workoutRoutines) {
      if (!r || !r.id || !r.name) continue;
      report.recordsCount.workoutRoutines++;
      const name = r.name.replace(/'/g, "''");
      const type = (r.type || "strength").replace(/'/g, "''");
      const duration = r.durationMinutes ? r.durationMinutes : "NULL";
      const notes = r.notes ? `'${r.notes.replace(/'/g, "''")}'` : "NULL";
      const exercisesJson = JSON.stringify(r.exercises || []).replace(/'/g, "''");
      const createdAt = r.createdAt ? `'${r.createdAt}'` : "now()";
      const updatedAt = r.updatedAt ? `'${r.updatedAt}'` : "now()";

      sqlStatements.push(
        `INSERT INTO workout_routines (id, user_id, name, type, duration_minutes, notes, exercises, created_at, updated_at) ` +
          `VALUES ('${r.id}', '${defaultUserId}', '${name}', '${type}', ${duration}, ${notes}, '${exercisesJson}'::jsonb, ${createdAt}, ${updatedAt}) ` +
          `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, exercises = EXCLUDED.exercises, updated_at = EXCLUDED.updated_at;`
      );
    }
  }

  sqlStatements.push("COMMIT;");

  if (report.quarantinedRecords.length > 0) {
    report.status = "partial";
    const quarantinePath = path.resolve(process.cwd(), "data", "quarantine.json");
    fs.writeFileSync(quarantinePath, JSON.stringify(report.quarantinedRecords, null, 2), "utf-8");
  }

  const outPath = outputSqlPath || path.resolve(process.cwd(), "sql", "migrated_data.sql");
  fs.writeFileSync(outPath, sqlStatements.join("\n"), "utf-8");

  return report;
}

// Direct CLI invocation
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  try {
    const report = runMigration();
    console.log("=== SYDD MIGRATION COMPLETE ===");
    console.log(`Source SHA-256: ${report.sourceHash}`);
    console.log(`Daily Records: ${report.recordsCount.dailyRecords}`);
    console.log(`Workouts: ${report.recordsCount.workouts} (${report.recordsCount.workoutExercises} exercises, ${report.recordsCount.workoutSets} sets)`);
    console.log(`Nutrition Entries: ${report.recordsCount.nutritionEntries}`);
    console.log(`Habits: ${report.recordsCount.habits} (${report.recordsCount.habitCompletions} completions)`);
    console.log(`Routines: ${report.recordsCount.workoutRoutines}`);
    console.log(`Checksum Totals: ${report.checksumTotals.totalSteps.toLocaleString()} steps, ${report.checksumTotals.totalCaloriesConsumed.toLocaleString()} kcal, ${report.checksumTotals.totalWorkoutMinutes} workout mins`);
    console.log(`Quarantined: ${report.quarantinedRecords.length}`);
    console.log(`Status: ${report.status}`);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}
