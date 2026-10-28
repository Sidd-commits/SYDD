import test from "node:test";
import assert from "node:assert";
import {
  EXERCISE_CATALOG,
  getExerciseById,
  searchExercises,
} from "./exercises";

test("exercise catalog contains 50-80 curated exercises covering all primary muscle groups", () => {
  assert.ok(EXERCISE_CATALOG.length >= 50 && EXERCISE_CATALOG.length <= 80);

  const muscleGroups = new Set(EXERCISE_CATALOG.map((e) => e.muscleGroup));
  assert.ok(muscleGroups.has("chest"));
  assert.ok(muscleGroups.has("back"));
  assert.ok(muscleGroups.has("legs"));
  assert.ok(muscleGroups.has("shoulders"));
  assert.ok(muscleGroups.has("arms"));
  assert.ok(muscleGroups.has("core"));
});

test("searchExercises filters by text query, muscle group, and equipment", () => {
  const benchResults = searchExercises("bench");
  assert.ok(benchResults.length >= 2);
  benchResults.forEach((ex) => {
    assert.ok(ex.name.toLowerCase().includes("bench"));
  });

  const chestOnly = searchExercises("", "chest", "all");
  assert.ok(chestOnly.length >= 6);
  chestOnly.forEach((ex) => assert.strictEqual(ex.muscleGroup, "chest"));

  const barbellOnly = searchExercises("", "all", "barbell");
  assert.ok(barbellOnly.length >= 8);
  barbellOnly.forEach((ex) => assert.strictEqual(ex.equipment, "barbell"));
});

test("getExerciseById finds exercise by valid slug and returns undefined for unknown", () => {
  const squat = getExerciseById("barbell-back-squat");
  assert.ok(squat);
  assert.strictEqual(squat?.name, "Barbell Back Squat");
  assert.strictEqual(squat?.muscleGroup, "legs");

  const unknown = getExerciseById("nonexistent-exercise-slug");
  assert.strictEqual(unknown, undefined);
});
