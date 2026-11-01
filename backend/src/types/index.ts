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
  forceOverwrite?: boolean;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  syncedAt: string;
  recordsCount?: number;
  isDuplicate?: boolean;
}

export interface DeltaSyncPayload {
  schemaVersion: number;
  userId?: string;
  lastSyncTimestamp?: string;
  clientTimestamp: string;
  changes: {
    dailyRecords?: Array<{ date: string; [key: string]: unknown }>;
    workouts?: Array<{ id: string; date: string; [key: string]: unknown }>;
    nutritionEntries?: Array<{ id: string; date: string; calories: number; [key: string]: unknown }>;
    habits?: Array<{ id: string; name: string; [key: string]: unknown }>;
    habitCompletions?: Array<{ habitId: string; date: string; completed: boolean; [key: string]: unknown }>;
    workoutRoutines?: Array<{ id: string; name: string; [key: string]: unknown }>;
    settings?: Record<string, unknown>;
  };
}

export interface DeltaSyncResponse {
  success: boolean;
  message: string;
  syncedAt: string;
  serverChanges: {
    dailyRecords?: Array<Record<string, unknown>>;
    workouts?: Array<Record<string, unknown>>;
    nutritionEntries?: Array<Record<string, unknown>>;
    habits?: Array<Record<string, unknown>>;
    habitCompletions?: Array<Record<string, unknown>>;
    workoutRoutines?: Array<Record<string, unknown>>;
    settings?: Record<string, unknown>;
  };
  summary: {
    recordsProcessed: number;
    recordsUpdated: number;
    recordsConflicted: number;
  };
}
