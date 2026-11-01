import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SyncPayload } from "../types/index.js";

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

