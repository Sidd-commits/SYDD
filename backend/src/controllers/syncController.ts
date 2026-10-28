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
    if (!payload || typeof payload !== "object" || !payload.data) {
      throw new Error("Invalid sync payload: missing required data field.");
    }

    const syncTimestamp = payload.timestamp || new Date().toISOString();
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
