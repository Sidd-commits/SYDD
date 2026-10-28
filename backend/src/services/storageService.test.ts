import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { BackendStorageService } from "./storageService.js";
import { SyncPayload } from "../types/index.js";

test("BackendStorageService saves and retrieves persistent backups", () => {
  const payload: SyncPayload = {
    schemaVersion: 1,
    userId: "test-user",
    timestamp: new Date().toISOString(),
    data: {
      dailyRecords: [{ date: "2026-10-28", steps: 10000 }],
      workouts: [],
      habits: [],
      habitCompletions: [],
    },
  };

  const saveRes1 = BackendStorageService.saveBackup(payload);
  assert.strictEqual(saveRes1.isDuplicate, false);
  assert.ok(fs.existsSync(saveRes1.savedPath));

  // Retrieve latest
  const latest = BackendStorageService.getLatest();
  assert.ok(latest);
  assert.strictEqual(latest?.userId, "test-user");

  // Duplicate submission test
  const saveRes2 = BackendStorageService.saveBackup(payload);
  assert.strictEqual(saveRes2.isDuplicate, true);
});

test("BackendStorageService returns storage metadata", () => {
  const meta = BackendStorageService.getStorageMetadata();
  assert.strictEqual(meta.type, "local-filesystem");
  assert.ok(meta.dataDir);
  assert.strictEqual(meta.hasBackup, true);
});
