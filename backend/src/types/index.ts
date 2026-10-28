export interface StorageInfo {
  type: string;
  dataDir: string;
  hasBackup: boolean;
  lastBackupTimestamp: string | null;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  storage: StorageInfo;
}

export interface SyncPayload {
  schemaVersion: number;
  userId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  syncedAt: string;
  recordsCount?: number;
  isDuplicate?: boolean;
}
