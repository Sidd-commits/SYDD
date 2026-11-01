import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SyncPayload, DeltaSyncPayload, DeltaSyncResponse } from "../types/index.js";

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), "data");
const MAX_SNAPSHOTS = 10;

export class BackendStorageService {
  private static isInitialized = false;
  private static cachedBackup: SyncPayload | null = null;
  private static cachedDataHash = "";

  public static getDataDir(): string {
    return process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : DEFAULT_DATA_DIR;
  }

  public static getBackupsDir(): string {
    return path.join(this.getDataDir(), "backups");
  }

  public static getLatestBackupPath(): string {
    return path.join(this.getDataDir(), "latest-backup.json");
  }

  /**
   * Resets internal caching and initialization state (used in isolated unit tests).
   */
  public static resetForTesting(): void {
    this.isInitialized = false;
    this.cachedBackup = null;
    this.cachedDataHash = "";
  }

  /**
   * Initializes the filesystem data directories and loads the latest backup.
   */
  public static init(): void {
    if (this.isInitialized) return;

    const dataDir = this.getDataDir();
    const backupsDir = this.getBackupsDir();
    const latestPath = this.getLatestBackupPath();

    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      // Load existing latest backup from disk if available
      if (fs.existsSync(latestPath)) {
        const raw = fs.readFileSync(latestPath, "utf-8");
        this.cachedBackup = JSON.parse(raw);
        this.cachedDataHash = this.cachedBackup?.data
          ? this.computeHash(JSON.stringify(this.cachedBackup.data))
          : "";
        console.log(`[SYDD Backend] Loaded latest backup from disk (${this.cachedBackup?.timestamp})`);
      }
    } catch (err) {
      console.error("[SYDD Backend] Storage init warning:", err);
    }

    this.isInitialized = true;
  }

  /**
   * Returns the cached or loaded latest backup.
   */
  public static getLatest(): SyncPayload | null {
    this.init();
    return this.cachedBackup;
  }

  /**
   * Computes a SHA-256 hash for deduplication.
   */
  private static computeHash(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Atomically saves the incoming sync payload to disk.
   */
  public static saveBackup(payload: SyncPayload): { isDuplicate: boolean; savedPath: string } {
    this.init();

    const dataHash = payload.data ? this.computeHash(JSON.stringify(payload.data)) : "";

    const latestPath = this.getLatestBackupPath();
    const backupsDir = this.getBackupsDir();

    // Idempotent deduplication: skip writing if actual data content is identical
    if (dataHash && dataHash === this.cachedDataHash && this.cachedBackup) {
      return { isDuplicate: true, savedPath: latestPath };
    }

    const jsonString = JSON.stringify(payload, null, 2);

    // 1. Atomic write to latest-backup.json
    const tempPath = `${latestPath}.tmp-${Date.now()}`;
    fs.writeFileSync(tempPath, jsonString, "utf-8");
    fs.renameSync(tempPath, latestPath);

    // 2. Write rotating snapshot
    const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotPath = path.join(backupsDir, `backup-${safeDate}.json`);
    fs.writeFileSync(snapshotPath, jsonString, "utf-8");

    // 3. Update memory cache
    this.cachedBackup = payload;
    this.cachedDataHash = dataHash;

    // 4. Prune older snapshots
    this.pruneSnapshots();

    return { isDuplicate: false, savedPath: latestPath };
  }

  /**
   * Applies record-level delta synchronization.
   * Merges incoming changed records into the stored snapshot based on individual record timestamps.
   */
  public static applyDeltaSync(delta: DeltaSyncPayload): DeltaSyncResponse {
    this.init();

    const existing = this.getLatest()?.data || {};
    const existingDaily = Array.isArray(existing.dailyRecords) ? [...existing.dailyRecords] : [];
    const existingWorkouts = Array.isArray(existing.workouts) ? [...existing.workouts] : [];
    const existingNutrition = Array.isArray(existing.nutritionEntries) ? [...existing.nutritionEntries] : [];
    const existingHabits = Array.isArray(existing.habits) ? [...existing.habits] : [];
    const existingCompletions = Array.isArray(existing.habitCompletions) ? [...existing.habitCompletions] : [];
    const existingRoutines = Array.isArray(existing.workoutRoutines) ? [...existing.workoutRoutines] : [];
    const existingSettings = typeof existing.settings === "object" && existing.settings ? { ...existing.settings } : {};

    const serverChanges: DeltaSyncResponse["serverChanges"] = {};
    let processed = 0;
    let updated = 0;
    let conflicted = 0;

    // 1. Merge dailyRecords (keyed by date)
    if (Array.isArray(delta.changes.dailyRecords)) {
      for (const inc of delta.changes.dailyRecords) {
        processed++;
        const idx = existingDaily.findIndex((r: any) => r && r.date === inc.date);
        if (idx >= 0) {
          const ex = existingDaily[idx] as any;
          const exTime = Date.parse(ex.updatedAt || "") || 0;
          const incTime = Date.parse((inc as any).updatedAt || "") || 0;
          if (incTime >= exTime) {
            existingDaily[idx] = { ...ex, ...inc };
            updated++;
          } else {
            conflicted++;
            if (!serverChanges.dailyRecords) serverChanges.dailyRecords = [];
            serverChanges.dailyRecords.push(ex);
          }
        } else {
          existingDaily.push(inc);
          updated++;
        }
      }
    }

    // 2. Merge workouts (keyed by id)
    if (Array.isArray(delta.changes.workouts)) {
      for (const inc of delta.changes.workouts) {
        processed++;
        const idx = existingWorkouts.findIndex((w: any) => w && w.id === inc.id);
        if (idx >= 0) {
          const ex = existingWorkouts[idx] as any;
          const exTime = Date.parse(ex.updatedAt || ex.createdAt || "") || 0;
          const incTime = Date.parse((inc as any).updatedAt || (inc as any).createdAt || "") || 0;
          if (incTime >= exTime) {
            existingWorkouts[idx] = { ...ex, ...inc };
            updated++;
          } else {
            conflicted++;
            if (!serverChanges.workouts) serverChanges.workouts = [];
            serverChanges.workouts.push(ex);
          }
        } else {
          existingWorkouts.push(inc);
          updated++;
        }
      }
    }

    // 3. Merge nutritionEntries (keyed by id)
    if (Array.isArray(delta.changes.nutritionEntries)) {
      for (const inc of delta.changes.nutritionEntries) {
        processed++;
        const idx = existingNutrition.findIndex((n: any) => n && n.id === inc.id);
        if (idx >= 0) {
          const ex = existingNutrition[idx] as any;
          const exTime = Date.parse(ex.updatedAt || ex.createdAt || "") || 0;
          const incTime = Date.parse((inc as any).updatedAt || (inc as any).createdAt || "") || 0;
          if (incTime >= exTime) {
            existingNutrition[idx] = { ...ex, ...inc };
            updated++;
          } else {
            conflicted++;
            if (!serverChanges.nutritionEntries) serverChanges.nutritionEntries = [];
            serverChanges.nutritionEntries.push(ex);
          }
        } else {
          existingNutrition.push(inc);
          updated++;
        }
      }
    }

    // 4. Merge habits (keyed by id)
    if (Array.isArray(delta.changes.habits)) {
      for (const inc of delta.changes.habits) {
        processed++;
        const idx = existingHabits.findIndex((h: any) => h && h.id === inc.id);
        if (idx >= 0) {
          existingHabits[idx] = { ...(existingHabits[idx] as any), ...inc };
          updated++;
        } else {
          existingHabits.push(inc);
          updated++;
        }
      }
    }

    // 5. Merge habitCompletions (keyed by habitId + date)
    if (Array.isArray(delta.changes.habitCompletions)) {
      for (const inc of delta.changes.habitCompletions) {
        processed++;
        const idx = existingCompletions.findIndex(
          (c: any) => c && c.habitId === inc.habitId && c.date === inc.date
        );
        if (idx >= 0) {
          const ex = existingCompletions[idx] as any;
          const exTime = Date.parse(ex.updatedAt || "") || 0;
          const incTime = Date.parse((inc as any).updatedAt || "") || 0;
          if (incTime >= exTime) {
            existingCompletions[idx] = { ...ex, ...inc };
            updated++;
          } else {
            conflicted++;
            if (!serverChanges.habitCompletions) serverChanges.habitCompletions = [];
            serverChanges.habitCompletions.push(ex);
          }
        } else {
          existingCompletions.push(inc);
          updated++;
        }
      }
    }

    // 6. Merge workoutRoutines (keyed by id)
    if (Array.isArray(delta.changes.workoutRoutines)) {
      for (const inc of delta.changes.workoutRoutines) {
        processed++;
        const idx = existingRoutines.findIndex((r: any) => r && r.id === inc.id);
        if (idx >= 0) {
          const ex = existingRoutines[idx] as any;
          const exTime = Date.parse(ex.updatedAt || ex.createdAt || "") || 0;
          const incTime = Date.parse((inc as any).updatedAt || (inc as any).createdAt || "") || 0;
          if (incTime >= exTime) {
            existingRoutines[idx] = { ...ex, ...inc };
            updated++;
          } else {
            conflicted++;
            if (!serverChanges.workoutRoutines) serverChanges.workoutRoutines = [];
            serverChanges.workoutRoutines.push(ex);
          }
        } else {
          existingRoutines.push(inc);
          updated++;
        }
      }
    }

    // 7. Settings
    let nextSettings = existingSettings;
    if (delta.changes.settings && typeof delta.changes.settings === "object") {
      nextSettings = { ...existingSettings, ...delta.changes.settings };
      updated++;
    }

    const mergedData = {
      settings: nextSettings,
      dailyRecords: existingDaily,
      workouts: existingWorkouts,
      habits: existingHabits,
      habitCompletions: existingCompletions,
      nutritionEntries: existingNutrition,
      workoutRoutines: existingRoutines,
    };

    const syncTimestamp = new Date().toISOString();
    this.saveBackup({
      schemaVersion: delta.schemaVersion || 1,
      userId: delta.userId,
      timestamp: syncTimestamp,
      data: mergedData,
    });

    return {
      success: true,
      message: `Delta sync merged ${updated} records successfully.`,
      syncedAt: syncTimestamp,
      serverChanges,
      summary: {
        recordsProcessed: processed,
        recordsUpdated: updated,
        recordsConflicted: conflicted,
      },
    };
  }

  /**
   * Keeps only the latest MAX_SNAPSHOTS rotating files.
   */
  private static pruneSnapshots(): void {
    const backupsDir = this.getBackupsDir();
    try {
      if (!fs.existsSync(backupsDir)) return;
      const files = fs
        .readdirSync(backupsDir)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
        .sort()
        .reverse();

      if (files.length > MAX_SNAPSHOTS) {
        const toDelete = files.slice(MAX_SNAPSHOTS);
        for (const file of toDelete) {
          fs.unlinkSync(path.join(backupsDir, file));
        }
      }
    } catch (err) {
      console.warn("[SYDD Backend] Snapshot prune warning:", err);
    }
  }

  /**
   * Returns metadata about storage persistence.
   */
  public static getStorageMetadata() {
    this.init();
    return {
      type: "local-filesystem",
      dataDir: this.getDataDir(),
      hasBackup: !!this.cachedBackup,
      lastBackupTimestamp: this.cachedBackup?.timestamp || null,
    };
  }
}

