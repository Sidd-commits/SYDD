import { AppData } from "@/types";

export type SyncState = "idle" | "checking" | "syncing" | "synced" | "error" | "offline";

export type BackendHealth = {
  reachable: boolean;
  service?: string;
  uptimeSeconds?: number;
  lastBackupTimestamp?: string | null;
  error?: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export class SyncService {
  /**
   * Pings the backend health endpoint with a short 3-second timeout.
   */
  public static async checkHealth(): Promise<BackendHealth> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${BACKEND_URL}/api/health`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { reachable: false, error: `HTTP ${res.status}` };
      }

      const json = await res.json();
      return {
        reachable: true,
        service: json.service,
        uptimeSeconds: json.uptimeSeconds,
        lastBackupTimestamp: json.storage?.lastBackupTimestamp || null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { reachable: false, error: msg };
    }
  }

  /**
   * Uploads the full AppData payload to the backend for persistent filesystem storage.
   */
  public static async uploadBackup(
    data: AppData
  ): Promise<{ success: boolean; message: string; isDuplicate?: boolean; syncedAt?: string }> {
    try {
      const payload = {
        schemaVersion: data.settings.schemaVersion || 1,
        timestamp: new Date().toISOString(),
        data,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${BACKEND_URL}/api/sync`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, message: `Server error ${res.status}: ${errorText}` };
      }

      const json = await res.json();
      return {
        success: true,
        message: json.message || "Data synced successfully.",
        isDuplicate: json.isDuplicate,
        syncedAt: json.syncedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to backend server";
      return { success: false, message: msg };
    }
  }

  /**
   * Fetches the latest backup stored on the backend filesystem.
   */
  public static async fetchLatestBackup(): Promise<{
    success: boolean;
    data?: AppData;
    message?: string;
  }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${BACKEND_URL}/api/backup`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.status === 404) {
        return { success: false, message: "No backup exists on backend yet." };
      }

      if (!res.ok) {
        return { success: false, message: `Server returned status ${res.status}` };
      }

      const json = await res.json();
      if (!json || !json.data) {
        return { success: false, message: "Invalid payload from backend." };
      }

      return {
        success: true,
        data: json.data as AppData,
        message: `Backup from ${json.timestamp} retrieved successfully.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reach backend server";
      return { success: false, message: msg };
    }
  }
}
