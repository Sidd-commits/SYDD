import { BackendStorageService } from "../services/storageService.js";
import { SyncPayload, SyncResponse, HealthResponse, DeltaSyncPayload, DeltaSyncResponse } from "../types/index.js";

const serverStartTime = Date.now();

export const SyncController = {
  getHealth(): HealthResponse {
    const storageMeta = BackendStorageService.getStorageMetadata();
    return {
      status: "ok",
      service: "sydd-backend",
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      timestamp: new Date().toISOString(),
      storage: storageMeta,
    };
  },

  handleSync(payload: SyncPayload): SyncResponse {
    if (!payload || typeof payload !== "object" || !payload.data || typeof payload.data !== "object") {
      throw new Error("Invalid sync payload: payload and payload.data must be valid objects.");
    }

    const dataObj = payload.data as Record<string, unknown>;

    // Cardinality and type guards to prevent resource exhaustion / malformed snapshots
    if (dataObj.dailyRecords !== undefined && !Array.isArray(dataObj.dailyRecords)) {
      throw new Error("Invalid sync payload: dailyRecords must be an array.");
    }
    if (Array.isArray(dataObj.dailyRecords) && dataObj.dailyRecords.length > 50000) {
      throw new Error("Payload rejected: dailyRecords exceeds 50,000 item safety limit.");
    }

    if (dataObj.workouts !== undefined && !Array.isArray(dataObj.workouts)) {
      throw new Error("Invalid sync payload: workouts must be an array.");
    }
    if (Array.isArray(dataObj.workouts) && dataObj.workouts.length > 50000) {
      throw new Error("Payload rejected: workouts exceeds 50,000 item safety limit.");
    }

    if (dataObj.habits !== undefined && !Array.isArray(dataObj.habits)) {
      throw new Error("Invalid sync payload: habits must be an array.");
    }
    if (Array.isArray(dataObj.habits) && dataObj.habits.length > 1000) {
      throw new Error("Payload rejected: habits exceeds 1,000 item safety limit.");
    }

    if (dataObj.nutritionEntries !== undefined && !Array.isArray(dataObj.nutritionEntries)) {
      throw new Error("Invalid sync payload: nutritionEntries must be an array.");
    }
    if (Array.isArray(dataObj.nutritionEntries) && dataObj.nutritionEntries.length > 50000) {
      throw new Error("Payload rejected: nutritionEntries exceeds 50,000 item safety limit.");
    }

    if (dataObj.workoutRoutines !== undefined && !Array.isArray(dataObj.workoutRoutines)) {
      throw new Error("Invalid sync payload: workoutRoutines must be an array.");
    }
    if (Array.isArray(dataObj.workoutRoutines) && dataObj.workoutRoutines.length > 1000) {
      throw new Error("Payload rejected: workoutRoutines exceeds 1,000 item safety limit.");
    }

    const syncTimestamp =
      typeof payload.timestamp === "string" && !isNaN(Date.parse(payload.timestamp))
        ? payload.timestamp
        : new Date().toISOString();

    const incomingRecordsCount =
      (Array.isArray((payload.data as { dailyRecords?: unknown[] }).dailyRecords)
        ? (payload.data as { dailyRecords: unknown[] }).dailyRecords.length
        : 0) +
      (Array.isArray((payload.data as { workouts?: unknown[] }).workouts)
        ? (payload.data as { workouts: unknown[] }).workouts.length
        : 0) +
      (Array.isArray((payload.data as { nutritionEntries?: unknown[] }).nutritionEntries)
        ? (payload.data as { nutritionEntries: unknown[] }).nutritionEntries.length
        : 0);

    // Defense-in-depth: Guard against accidental overwrite of populated backup with empty payload
    const existingBackup = BackendStorageService.getLatest();
    if (existingBackup && existingBackup.data && !payload.forceOverwrite) {
      const existingObj = existingBackup.data as Record<string, unknown>;
      const existingCount =
        (Array.isArray(existingObj.dailyRecords) ? existingObj.dailyRecords.length : 0) +
        (Array.isArray(existingObj.workouts) ? existingObj.workouts.length : 0) +
        (Array.isArray(existingObj.nutritionEntries) ? existingObj.nutritionEntries.length : 0);

      if (existingCount > 0 && incomingRecordsCount === 0) {
        throw new Error(
          `Safety guard: Cannot overwrite populated backup containing ${existingCount} records with an empty payload. Set forceOverwrite: true if intentional.`
        );
      }
    }

    const enrichedPayload: SyncPayload = {
      schemaVersion: typeof payload.schemaVersion === "number" ? payload.schemaVersion : 1,
      userId: typeof payload.userId === "string" ? payload.userId.slice(0, 100) : undefined,
      timestamp: syncTimestamp,
      data: payload.data,
      forceOverwrite: payload.forceOverwrite,
    };

    // Save persistently to filesystem
    const { isDuplicate } = BackendStorageService.saveBackup(enrichedPayload);

    const records =
      (Array.isArray((payload.data as { dailyRecords?: unknown[] }).dailyRecords)
        ? (payload.data as { dailyRecords: unknown[] }).dailyRecords.length
        : 0) +
      (Array.isArray((payload.data as { workouts?: unknown[] }).workouts)
        ? (payload.data as { workouts: unknown[] }).workouts.length
        : 0) +
      (Array.isArray((payload.data as { nutritionEntries?: unknown[] }).nutritionEntries)
        ? (payload.data as { nutritionEntries: unknown[] }).nutritionEntries.length
        : 0);

    return {
      success: true,
      message: isDuplicate
        ? "Backup is already up-to-date with identical payload."
        : "Data persistently backed up to local server storage.",
      syncedAt: syncTimestamp,
      recordsCount: records,
      isDuplicate,
    };
  },

  getLatestBackup(): SyncPayload | null {
    return BackendStorageService.getLatest();
  },

  handleDeltaSync(payload: DeltaSyncPayload): DeltaSyncResponse {
    if (!payload || typeof payload !== "object" || !payload.changes || typeof payload.changes !== "object") {
      throw new Error("Invalid delta sync payload: payload and payload.changes must be valid objects.");
    }

    const changes = payload.changes;

    // Safety cardinality limits
    if (changes.dailyRecords !== undefined && !Array.isArray(changes.dailyRecords)) {
      throw new Error("Invalid delta payload: dailyRecords must be an array.");
    }
    if (Array.isArray(changes.dailyRecords) && changes.dailyRecords.length > 50000) {
      throw new Error("Delta payload rejected: dailyRecords exceeds 50,000 item safety limit.");
    }

    if (changes.workouts !== undefined && !Array.isArray(changes.workouts)) {
      throw new Error("Invalid delta payload: workouts must be an array.");
    }
    if (Array.isArray(changes.workouts) && changes.workouts.length > 50000) {
      throw new Error("Delta payload rejected: workouts exceeds 50,000 item safety limit.");
    }

    if (changes.nutritionEntries !== undefined && !Array.isArray(changes.nutritionEntries)) {
      throw new Error("Invalid delta payload: nutritionEntries must be an array.");
    }
    if (Array.isArray(changes.nutritionEntries) && changes.nutritionEntries.length > 50000) {
      throw new Error("Delta payload rejected: nutritionEntries exceeds 50,000 item safety limit.");
    }

    if (changes.habits !== undefined && !Array.isArray(changes.habits)) {
      throw new Error("Invalid delta payload: habits must be an array.");
    }
    if (Array.isArray(changes.habits) && changes.habits.length > 1000) {
      throw new Error("Delta payload rejected: habits exceeds 1,000 item safety limit.");
    }

    if (changes.habitCompletions !== undefined && !Array.isArray(changes.habitCompletions)) {
      throw new Error("Invalid delta payload: habitCompletions must be an array.");
    }
    if (Array.isArray(changes.habitCompletions) && changes.habitCompletions.length > 50000) {
      throw new Error("Delta payload rejected: habitCompletions exceeds 50,000 item safety limit.");
    }

    if (changes.workoutRoutines !== undefined && !Array.isArray(changes.workoutRoutines)) {
      throw new Error("Invalid delta payload: workoutRoutines must be an array.");
    }
    if (Array.isArray(changes.workoutRoutines) && changes.workoutRoutines.length > 1000) {
      throw new Error("Delta payload rejected: workoutRoutines exceeds 1,000 item safety limit.");
    }

    return BackendStorageService.applyDeltaSync(payload);
  },
};
