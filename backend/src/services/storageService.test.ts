import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { BackendStorageService } from "./storageService.js";
import { SyncPayload } from "../types/index.js";

// Isolate unit tests into a dedicated temporary sandbox directory
const sandboxDataDir = path.join(
  os.tmpdir(),
  `sydd-backend-test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
);
process.env.DATA_DIR = sandboxDataDir;
BackendStorageService.resetForTesting();

test.after(() => {
  try {
    if (fs.existsSync(sandboxDataDir)) {
      fs.rmSync(sandboxDataDir, { recursive: true, force: true });
    }
  } catch {
    // Ignore cleanup errors on temp dir
  }
});

test("BackendStorageService saves and retrieves persistent backups in isolated sandbox", () => {
  const uniqueSteps = 10000 + Math.floor(Math.random() * 100000);
  const payload: SyncPayload = {
    schemaVersion: 1,
    userId: "test-user",
    timestamp: new Date().toISOString(),
    data: {
      dailyRecords: [{ date: "2026-10-28", steps: uniqueSteps }],
      workouts: [],
      habits: [],
      habitCompletions: [],
    },
  };

  const saveRes1 = BackendStorageService.saveBackup(payload);
  assert.strictEqual(saveRes1.isDuplicate, false);
  assert.ok(fs.existsSync(saveRes1.savedPath));
  assert.ok(saveRes1.savedPath.startsWith(sandboxDataDir));

  // Retrieve latest
  const latest = BackendStorageService.getLatest();
  assert.ok(latest);
  assert.strictEqual(latest?.userId, "test-user");

  // Duplicate submission test with identical data but new timestamp
  const saveRes2 = BackendStorageService.saveBackup({
    ...payload,
    timestamp: new Date(Date.now() + 5000).toISOString(),
  });
  assert.strictEqual(saveRes2.isDuplicate, true);
});

test("BackendStorageService returns storage metadata", () => {
  const meta = BackendStorageService.getStorageMetadata();
  assert.strictEqual(meta.type, "local-filesystem");
  assert.strictEqual(meta.dataDir, sandboxDataDir);
  assert.strictEqual(meta.hasBackup, true);
});

