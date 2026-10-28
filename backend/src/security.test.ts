import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { SyncController } from "./controllers/syncController.js";

test("SyncController.handleSync rejects malformed or unvalidated payloads", () => {
  // Missing data field
  assert.throws(() => {
    SyncController.handleSync({} as any);
  }, /Invalid sync payload/);

  // Non-object data
  assert.throws(() => {
    SyncController.handleSync({ data: "string-payload" } as any);
  }, /must be valid objects/);

  // Non-array dailyRecords
  assert.throws(() => {
    SyncController.handleSync({ data: { dailyRecords: "not-an-array" } } as any);
  }, /dailyRecords must be an array/);

  // Excessive cardinality
  const hugeRecords = new Array(50001).fill({ date: "2026-01-01" });
  assert.throws(() => {
    SyncController.handleSync({ data: { dailyRecords: hugeRecords } } as any);
  }, /safety limit/);
});

test("SyncController.handleSync accepts valid payloads and produces enriched metadata", () => {
  const result = SyncController.handleSync({
    schemaVersion: 1,
    data: {
      settings: { goals: { stepsPerDay: 8000 } },
      dailyRecords: [{ date: "2026-10-28", steps: 9000 }],
      workouts: [],
      habits: [],
    },
  } as any);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.recordsCount, 1);
  assert.ok(result.syncedAt);
});

