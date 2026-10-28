export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  uptimeSeconds: number;
  timestamp: string;
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
}
