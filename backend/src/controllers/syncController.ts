import { BackendStorageService } from "../services/storageService.js";
import { SyncPayload, SyncResponse, HealthResponse } from "../types/index.js";

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

    const syncTimestamp =
      typeof payload.timestamp === "string" && !isNaN(Date.parse(payload.timestamp))
        ? payload.timestamp
        : new Date().toISOString();

    const enrichedPayload: SyncPayload = {
      ...payload,
      timestamp: syncTimestamp,
    };

    // Save persistently to filesystem
    const { isDuplicate } = BackendStorageService.saveBackup(enrichedPayload);

    const records = Array.isArray((payload.data as { dailyRecords?: unknown[] }).dailyRecords)
      ? (payload.data as { dailyRecords: unknown[] }).dailyRecords.length
      : 0;

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
};
