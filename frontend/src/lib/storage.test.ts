import test from "node:test";
import assert from "node:assert";
import {
  getDefaultAppData,
  validateAndMigrateData,
  StorageService,
} from "./storage";

test("validateAndMigrateData gracefully handles undefined, null, or garbage data", () => {
  const resultNull = validateAndMigrateData(null);
  assert.ok(resultNull.settings.goals.stepsPerDay > 0);
  assert.ok(Array.isArray(resultNull.dailyRecords));

  const resultGarbage = validateAndMigrateData({
    dailyRecords: "not-an-array",
    settings: { goals: { stepsPerDay: "invalid" } },
  });
  assert.strictEqual(resultGarbage.settings.goals.stepsPerDay, 8000);
  assert.deepStrictEqual(resultGarbage.dailyRecords, []);
});

test("exportJSON returns valid JSON string with correct schema", () => {
  const data = getDefaultAppData();
  const exported = StorageService.exportJSON(data);
  const parsed = JSON.parse(exported);
  assert.strictEqual(parsed.settings.schemaVersion, 1);
  assert.ok(Array.isArray(parsed.habits));
});

test("exportCSV returns formatted CSV with headers", () => {
  const data = getDefaultAppData();
  data.dailyRecords.push({
    date: "2026-10-27",
    steps: 8500,
    caloriesConsumedKcal: 2100,
    waterMl: 2500,
    notes: 'Walked in the park, "great session"',
    updatedAt: new Date().toISOString(),
  });

  const csv = StorageService.exportCSV(data);
  assert.ok(csv.startsWith("Date,Steps,CaloriesConsumed_kcal,Water_ml,Workout_minutes,Habits_completed,Notes"));
  assert.ok(csv.includes("2026-10-27,8500,2100,2500"));
});

test("importJSON validates and imports correctly", () => {
  const data = getDefaultAppData();
  data.settings.goals.stepsPerDay = 12000;
  const jsonStr = JSON.stringify(data);

  const importResult = StorageService.importJSON(jsonStr);
  assert.strictEqual(importResult.success, true);
  assert.strictEqual(importResult.data?.settings.goals.stepsPerDay, 12000);

  const invalidResult = StorageService.importJSON("invalid-json{}}");
  assert.strictEqual(invalidResult.success, false);
  assert.ok(invalidResult.error);
});
