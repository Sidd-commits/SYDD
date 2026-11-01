import test from "node:test";
import assert from "node:assert/strict";
import { IDBStorage } from "./idbStorage";

test("IDBStorage isSupported evaluates safely without throwing in server/test environments", () => {
  const supported = IDBStorage.isSupported();
  assert.strictEqual(typeof supported, "boolean");
});

test("IDBStorage methods gracefully degrade without throwing when window.indexedDB is unavailable", async () => {
  // In Node test runner without browser indexedDB, methods should resolve cleanly
  const loaded = await IDBStorage.loadAll();
  assert.strictEqual(loaded, null);

  const saved = await IDBStorage.saveAll({
    settings: {
      schemaVersion: 1,
      goals: {
        stepsPerDay: 8000,
        caloriesConsumedKcalPerDay: 2000,
        proteinGPerDay: 130,
        carbsGPerDay: 225,
        fatGPerDay: 65,
        waterMlPerDay: 2000,
        workoutMinutesPerDay: 30,
        workoutGoalEnabled: true,
      },
      onboardingCompleted: true,
      unitWater: "ml",
      unitWeight: "kg",
    },
    dailyRecords: [],
    workouts: [],
    habits: [],
    habitCompletions: [],
    nutritionEntries: [],
    workoutRoutines: [],
  });
  assert.strictEqual(typeof saved, "boolean");

  const migrated = await IDBStorage.autoMigrateFromLocalStorage();
  assert.strictEqual(typeof migrated, "boolean");

  const outbox = await IDBStorage.drainOutbox();
  assert.deepStrictEqual(outbox, []);
});
