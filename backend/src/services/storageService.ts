import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SyncPayload } from "../types/index.js";

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR;
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const LATEST_BACKUP_PATH = path.join(DATA_DIR, "latest-backup.json");
const MAX_SNAPSHOTS = 10;

export class BackendStorageService {
  private static isInitialized = false;
  private static cachedBackup: SyncPayload | null = null;
  private static cachedHash = "";

  /**
   * Initializes the filesystem data directories and loads the latest backup.
   */
  public static init(): void {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }

      // Load existing latest backup from disk if available
      if (fs.existsSync(LATEST_BACKUP_PATH)) {
        const raw = fs.readFileSync(LATEST_BACKUP_PATH, "utf-8");
        this.cachedBackup = JSON.parse(raw);
        this.cachedHash = this.computeHash(raw);
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

    const jsonString = JSON.stringify(payload, null, 2);
    const newHash = this.computeHash(jsonString);

    // Idempotent deduplication: skip writing if payload is identical
    if (newHash === this.cachedHash && this.cachedBackup) {
      return { isDuplicate: true, savedPath: LATEST_BACKUP_PATH };
    }

    // 1. Atomic write to latest-backup.json
    const tempPath = `${LATEST_BACKUP_PATH}.tmp-${Date.now()}`;
    fs.writeFileSync(tempPath, jsonString, "utf-8");
    fs.renameSync(tempPath, LATEST_BACKUP_PATH);

    // 2. Write rotating snapshot
    const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotPath = path.join(BACKUPS_DIR, `backup-${safeDate}.json`);
    fs.writeFileSync(snapshotPath, jsonString, "utf-8");

    // 3. Update memory cache
    this.cachedBackup = payload;
    this.cachedHash = newHash;

    // 4. Prune older snapshots
    this.pruneSnapshots();

    return { isDuplicate: false, savedPath: LATEST_BACKUP_PATH };
  }

  /**
   * Keeps only the latest MAX_SNAPSHOTS rotating files.
   */
  private static pruneSnapshots(): void {
    try {
      const files = fs
        .readdirSync(BACKUPS_DIR)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
        .sort()
        .reverse();

      if (files.length > MAX_SNAPSHOTS) {
        const toDelete = files.slice(MAX_SNAPSHOTS);
        for (const file of toDelete) {
          fs.unlinkSync(path.join(BACKUPS_DIR, file));
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
      dataDir: DATA_DIR,
      hasBackup: !!this.cachedBackup,
      lastBackupTimestamp: this.cachedBackup?.timestamp || null,
    };
  }
}

