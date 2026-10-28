import { SyncPayload, SyncResponse, HealthResponse } from "../types/index.js";

// In-memory sync store (can be persisted to SQLite / Postgres in production)
let latestBackup: SyncPayload | null = null;
const serverStartTime = Date.now();

export const SyncController = {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "sydd-backend",
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  },

  handleSync(payload: SyncPayload): SyncResponse {
    if (!payload || typeof payload !== "object" || !payload.data) {
      throw new Error("Invalid sync payload: missing required data field.");
    }

    latestBackup = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    const records = Array.isArray((payload.data as { dailyRecords?: unknown[] }).dailyRecords)
      ? (payload.data as { dailyRecords: unknown[] }).dailyRecords.length
      : 0;

    return {
      success: true,
      message: "Data synced and backed up successfully.",
      syncedAt: latestBackup.timestamp,
      recordsCount: records,
    };
  },

  getLatestBackup(): SyncPayload | null {
    return latestBackup;
  },
};
