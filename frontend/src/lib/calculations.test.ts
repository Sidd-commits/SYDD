import test from "node:test";
import assert from "node:assert";
import { AppData } from "@/types";
import {
  calculateDaySummary,
  calculateHeatmapCell,
  calculateStreaks,
  calculateWeeklyRecap,
  calculateWorkoutStats,
} from "./calculations";
import { getDefaultAppData } from "./storage";

function createMockData(): AppData {
  const data = getDefaultAppData();
  data.settings.goals = {
    stepsPerDay: 8000,
    caloriesConsumedKcalPerDay: 2000,
    waterMlPerDay: 2000,
    workoutMinutesPerDay: 30,
    workoutGoalEnabled: true,
  };
  return data;
}

test("distinguishes missing data from logged zero", () => {
  const data = createMockData();
  const date = "2026-10-20";

  // No record at all
  const summaryEmpty = calculateDaySummary(data, date);
  assert.strictEqual(summaryEmpty.hasData, false);
  assert.strictEqual(summaryEmpty.level, -1);

  // Log explicit zero steps
  data.dailyRecords.push({
    date,
    steps: 0,
    updatedAt: new Date().toISOString(),
  });

  const summaryZero = calculateDaySummary(data, date);
  assert.strictEqual(summaryZero.hasData, true);
  assert.strictEqual(summaryZero.steps, 0);
  assert.strictEqual(summaryZero.level, 0); // Logged data, but 0 progress
});

test("calories consumed do not increase the fitness heatmap score", () => {
  const data = createMockData();
  const date = "2026-10-21";

  // Only calories logged
  data.dailyRecords.push({
    date,
    caloriesConsumedKcal: 1800,
    updatedAt: new Date().toISOString(),
  });

  const summary = calculateDaySummary(data, date);
  assert.strictEqual(summary.hasData, true);
  assert.strictEqual(summary.caloriesConsumed, 1800);
  // Score should be 0 because calories are purely informational and not a fitness achievement score
  assert.strictEqual(summary.score, 0);
  assert.strictEqual(summary.level, 0);
});

test("goals met map to level 4 and active day", () => {
  const data = createMockData();
  const date = "2026-10-22";

  data.dailyRecords.push({
    date,
    steps: 10000, // Goal is 8000
    waterMl: 2200, // Goal is 2000
    updatedAt: new Date().toISOString(),
  });

  const summary = calculateDaySummary(data, date);
  assert.strictEqual(summary.stepsMet, true);
  assert.strictEqual(summary.waterMet, true);
  assert.strictEqual(summary.activeDay, true);
  assert.strictEqual(summary.level, 4);
});

test("habit completion marks active day and boosts habit progress", () => {
  const data = createMockData();
  const date = "2026-10-23";

  // Check off 1 habit
  data.habitCompletions.push({
    habitId: data.habits[0].id,
    date,
    completed: true,
    updatedAt: new Date().toISOString(),
  });

  const summary = calculateDaySummary(data, date);
  assert.strictEqual(summary.completedHabits.length, 1);
  assert.strictEqual(summary.activeDay, true);
  assert.ok(summary.level >= 1);
});

test("workout minutes contribute to workout progress and active day", () => {
  const data = createMockData();
  const date = "2026-10-24";

  data.workouts.push({
    id: "w-1",
    date,
    type: "strength",
    durationMinutes: 45, // Goal is 30
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const summary = calculateDaySummary(data, date);
  assert.strictEqual(summary.workoutMinutes, 45);
  assert.strictEqual(summary.workoutMet, true);
  assert.strictEqual(summary.activeDay, true);
});

test("streaks accurately calculate consecutive active days", () => {
  const data = createMockData();

  // Create 3 consecutive active days
  ["2026-10-24", "2026-10-25", "2026-10-26"].forEach((date) => {
    data.dailyRecords.push({
      date,
      steps: 8500,
      updatedAt: new Date().toISOString(),
    });
  });

  const streaks = calculateStreaks(data);
  assert.strictEqual(streaks.totalActiveDays, 3);
  assert.ok(streaks.bestStreak >= 3);
});

test("weekly recap calculates averages correctly", () => {
  const data = createMockData();
  const refDate = "2026-10-27";

  data.dailyRecords.push(
    { date: "2026-10-25", steps: 8000, waterMl: 2000, updatedAt: "" },
    { date: "2026-10-26", steps: 10000, waterMl: 3000, updatedAt: "" }
  );

  const recap = calculateWeeklyRecap(data, refDate);
  assert.strictEqual(recap.averageSteps, 9000); // (8000 + 10000) / 2
  assert.strictEqual(recap.averageWaterMl, 2500); // (2000 + 3000) / 2
  assert.strictEqual(recap.activeDaysCount, 2);
});

test("calculateHeatmapCell returns complete cell details", () => {
  const data = createMockData();
  const date = "2026-10-27";
  data.dailyRecords.push({ date, steps: 8000, waterMl: 2000, updatedAt: "" });

  const cell = calculateHeatmapCell(data, date);
  assert.strictEqual(cell.date, date);
  assert.strictEqual(cell.hasData, true);
  assert.strictEqual(cell.isGoalReached, true);
  assert.strictEqual(cell.level, 4);
});

test("calculateWorkoutStats accurately calculates total exercises, sets, and volume load", () => {
  // Simple workout without exercises
  const simpleWorkout = {
    id: "w-simple",
    date: "2026-10-28",
    type: "walking" as const,
    durationMinutes: 30,
    createdAt: "",
    updatedAt: "",
  };
  const simpleStats = calculateWorkoutStats(simpleWorkout);
  assert.strictEqual(simpleStats.hasGranularSets, false);
  assert.strictEqual(simpleStats.totalVolume, 0);
  assert.strictEqual(simpleStats.totalSets, 0);

  // Granular strength workout
  const granularWorkout = {
    id: "w-granular",
    date: "2026-10-28",
    type: "strength" as const,
    durationMinutes: 50,
    exercises: [
      {
        id: "ex-1",
        name: "Barbell Bench Press",
        sets: [
          { id: "s-1", setNumber: 1, reps: 10, weight: 60, weightUnit: "kg" as const, completed: true }, // 600 kg
          { id: "s-2", setNumber: 2, reps: 8, weight: 70, weightUnit: "kg" as const, completed: true },  // 560 kg
          { id: "s-3", setNumber: 3, reps: 6, weight: 80, weightUnit: "kg" as const, completed: false }, // not completed -> 0
        ],
      },
      {
        id: "ex-2",
        name: "Push-ups",
        sets: [
          { id: "s-4", setNumber: 1, reps: 20, weight: 0, weightUnit: "kg" as const, completed: true },   // bodyweight -> 0 kg volume
        ],
      },
    ],
    createdAt: "",
    updatedAt: "",
  };

  const granularStats = calculateWorkoutStats(granularWorkout);
  assert.strictEqual(granularStats.hasGranularSets, true);
  assert.strictEqual(granularStats.totalExercises, 2);
  assert.strictEqual(granularStats.totalSets, 4);
  assert.strictEqual(granularStats.completedSets, 3);
  // Volume: (60 * 10) + (70 * 8) = 600 + 560 = 1160 kg
  assert.strictEqual(granularStats.totalVolume, 1160);
});
