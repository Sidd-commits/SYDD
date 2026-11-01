import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { BackendStorageService } from "./services/storageService.js";
import { SyncController } from "./controllers/syncController.js";

// Sandbox isolation
const sandboxDataDir = path.join(
  os.tmpdir(),
  `sydd-delta-test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
);
process.env.DATA_DIR = sandboxDataDir;
BackendStorageService.resetForTesting();

test.after(() => {
  try {
    if (fs.existsSync(sandboxDataDir)) {
      fs.rmSync(sandboxDataDir, { recursive: true, force: true });
    }
  } catch {}
});

test("handleDeltaSync merges new discrete records without overwriting whole database", () => {
  // 1. Initial full state setup
  SyncController.handleSync({
    schemaVersion: 1,
    data: {
      settings: { goals: { stepsPerDay: 8000 } },
      dailyRecords: [{ date: "2026-10-27", steps: 8500, updatedAt: "2026-10-27T10:00:00.000Z" }],
      workouts: [{ id: "w-1", date: "2026-10-27", type: "strength", durationMinutes: 45, updatedAt: "2026-10-27T10:00:00.000Z" }],
      nutritionEntries: [],
      habits: [],
      habitCompletions: [],
    },
  } as any);

  // 2. Client logs a meal and a new day's steps via delta sync
  const deltaRes = SyncController.handleDeltaSync({
    schemaVersion: 1,
    clientTimestamp: "2026-10-28T12:00:00.000Z",
    changes: {
      dailyRecords: [{ date: "2026-10-28", steps: 11000, updatedAt: "2026-10-28T12:00:00.000Z" }],
      nutritionEntries: [{ id: "n-1", date: "2026-10-28", name: "Oatmeal", calories: 450, updatedAt: "2026-10-28T12:00:00.000Z" }],
    },
  });

  assert.strictEqual(deltaRes.success, true);
  assert.strictEqual(deltaRes.summary.recordsUpdated, 2);

  // 3. Verify that w-1 from Oct 27 was NOT overwritten or dropped
  const latest = SyncController.getLatestBackup();
  assert.ok(latest && latest.data);
  const data = latest.data as any;

  // Both days exist
  assert.strictEqual(data.dailyRecords.length, 2);
  // Workout w-1 is safely preserved
  assert.strictEqual(data.workouts.length, 1);
  assert.strictEqual(data.workouts[0].id, "w-1");
  // Nutrition entry n-1 was appended
  assert.strictEqual(data.nutritionEntries.length, 1);
  assert.strictEqual(data.nutritionEntries[0].id, "n-1");
});

test("handleDeltaSync resolves conflicts using record-level timestamps", () => {
  // Existing state has workout w-1 updated at 12:00
  SyncController.handleSync({
    schemaVersion: 1,
    forceOverwrite: true,
    data: {
      settings: {},
      dailyRecords: [],
      workouts: [{ id: "w-1", date: "2026-10-28", durationMinutes: 60, updatedAt: "2026-10-28T12:00:00.000Z" }],
      nutritionEntries: [],
    },
  } as any);

  // Client attempts to sync a stale edit from 10:00 (e.g. offline device with older modification)
  const staleDelta = SyncController.handleDeltaSync({
    schemaVersion: 1,
    clientTimestamp: "2026-10-28T12:30:00.000Z",
    changes: {
      workouts: [{ id: "w-1", date: "2026-10-28", durationMinutes: 30, updatedAt: "2026-10-28T10:00:00.000Z" }],
    },
  });

  // Stale edit should NOT overwrite the server's newer 60-min workout
  const latest = SyncController.getLatestBackup()?.data as any;
  assert.strictEqual(latest.workouts[0].durationMinutes, 60);

  // Server informs client about the newer record
  assert.strictEqual(staleDelta.summary.recordsConflicted, 1);
  assert.ok(staleDelta.serverChanges.workouts);
  assert.strictEqual(staleDelta.serverChanges.workouts[0].id, "w-1");
  assert.strictEqual((staleDelta.serverChanges.workouts[0] as any).durationMinutes, 60);
});

test("handleDeltaSync rejects malformed delta payloads", () => {
  assert.throws(() => {
    SyncController.handleDeltaSync({} as any);
  }, /Invalid delta sync payload/);

  assert.throws(() => {
    SyncController.handleDeltaSync({ changes: "invalid" } as any);
  }, /Invalid delta sync payload/);
});
