import { AppData, DailyRecord, Habit, HabitCompletion, NutritionEntry, Workout, WorkoutRoutine } from "@/types";
import { STORAGE_KEY } from "./constants";

const DB_NAME = "sydd_db";
const DB_VERSION = 1;

/**
 * Native IndexedDB storage layer for high-capacity, non-blocking, offline persistence.
 * Zero external dependencies. Fully compatible with SSR and strict private browsing.
 */
class IndexedDBService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  public isSupported(): boolean {
    return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
  }

  private getDB(): Promise<IDBDatabase | null> {
    if (!this.isSupported()) return Promise.resolve(null);
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains("dailyRecords")) {
            db.createObjectStore("dailyRecords", { keyPath: "date" });
          }
          if (!db.objectStoreNames.contains("workouts")) {
            const s = db.createObjectStore("workouts", { keyPath: "id" });
            s.createIndex("by_date", "date", { unique: false });
          }
          if (!db.objectStoreNames.contains("nutritionEntries")) {
            const s = db.createObjectStore("nutritionEntries", { keyPath: "id" });
            s.createIndex("by_date", "date", { unique: false });
          }
          if (!db.objectStoreNames.contains("habits")) {
            db.createObjectStore("habits", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("habitCompletions")) {
            const s = db.createObjectStore("habitCompletions", { keyPath: "id" });
            s.createIndex("by_date", "date", { unique: false });
          }
          if (!db.objectStoreNames.contains("workoutRoutines")) {
            db.createObjectStore("workoutRoutines", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("syncOutbox")) {
            db.createObjectStore("syncOutbox", { keyPath: "id", autoIncrement: true });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn("[SYDD IDB] IndexedDB open error, falling back to localStorage.");
          resolve(null);
        };
        req.onblocked = () => {
          console.warn("[SYDD IDB] Database open blocked.");
          resolve(null);
        };
      } catch (err) {
        console.warn("[SYDD IDB] IndexedDB initialization exception:", err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Loads full AppData from IndexedDB if populated.
   */
  public async loadAll(): Promise<AppData | null> {
    const db = await this.getDB();
    if (!db) return null;

    try {
      const tx = db.transaction(
        ["settings", "dailyRecords", "workouts", "habits", "habitCompletions", "nutritionEntries", "workoutRoutines"],
        "readonly"
      );

      const getStore = <T>(name: string): Promise<T[]> => {
        return new Promise((resolve) => {
          const req = tx.objectStore(name).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      };

      const [dailyRecords, workouts, habits, habitCompletions, nutritionEntries, workoutRoutines, settingsArr] =
        await Promise.all([
          getStore<DailyRecord>("dailyRecords"),
          getStore<Workout>("workouts"),
          getStore<Habit>("habits"),
          getStore<HabitCompletion>("habitCompletions"),
          getStore<NutritionEntry>("nutritionEntries"),
          getStore<WorkoutRoutine>("workoutRoutines"),
          getStore<{ id: string; data: AppData["settings"] }>("settings"),
        ]);

      // If IDB has no records yet, return null to allow migration from localStorage
      if (
        dailyRecords.length === 0 &&
        workouts.length === 0 &&
        nutritionEntries.length === 0 &&
        habits.length === 0
      ) {
        return null;
      }

      const settings = settingsArr.find((s) => s.id === "user_settings")?.data || undefined;

      return {
        settings: settings || {
          schemaVersion: 1,
          goals: {
            stepsPerDay: 8000,
            caloriesConsumedKcalPerDay: 2000,
            proteinGPerDay: 130,
            carbsGPerDay: 225,
            fatGPerDay: 65,
            waterMlPerDay: 2000,
            workoutMinutesPerDay: 30,
            workoutGoalEnabled: true,
          },
          onboardingCompleted: false,
          unitWater: "ml",
          unitWeight: "kg",
        },
        dailyRecords,
        workouts,
        habits,
        habitCompletions: habitCompletions.map((c) => ({
          habitId: c.habitId,
          date: c.date,
          completed: Boolean(c.completed),
          updatedAt: c.updatedAt,
        })),
        nutritionEntries,
        workoutRoutines,
      };
    } catch (err) {
      console.warn("[SYDD IDB] Failed reading from IndexedDB:", err);
      return null;
    }
  }

  /**
   * Persists the entire AppData state to discrete IndexedDB stores in an atomic transaction.
   */
  public async saveAll(data: AppData): Promise<boolean> {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(
          ["settings", "dailyRecords", "workouts", "habits", "habitCompletions", "nutritionEntries", "workoutRoutines"],
          "readwrite"
        );

        // 1. Settings
        const sStore = tx.objectStore("settings");
        sStore.put({ id: "user_settings", data: data.settings });

        // 2. Daily Records
        const drStore = tx.objectStore("dailyRecords");
        drStore.clear();
        for (const dr of data.dailyRecords || []) {
          drStore.put(dr);
        }

        // 3. Workouts
        const wStore = tx.objectStore("workouts");
        wStore.clear();
        for (const w of data.workouts || []) {
          wStore.put(w);
        }

        // 4. Habits
        const hStore = tx.objectStore("habits");
        hStore.clear();
        for (const h of data.habits || []) {
          hStore.put(h);
        }

        // 5. Habit Completions
        const hcStore = tx.objectStore("habitCompletions");
        hcStore.clear();
        for (const c of data.habitCompletions || []) {
          hcStore.put({ id: `${c.habitId}_${c.date}`, ...c });
        }

        // 6. Nutrition Entries
        const nStore = tx.objectStore("nutritionEntries");
        nStore.clear();
        for (const n of data.nutritionEntries || []) {
          nStore.put(n);
        }

        // 7. Workout Routines
        const wrStore = tx.objectStore("workoutRoutines");
        wrStore.clear();
        for (const r of data.workoutRoutines || []) {
          wrStore.put(r);
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => {
          console.warn("[SYDD IDB] Transaction save error");
          resolve(false);
        };
        tx.onabort = () => resolve(false);
      } catch (err) {
        console.warn("[SYDD IDB] saveAll exception:", err);
        resolve(false);
      }
    });
  }

  /**
   * Queues an offline mutation in the sync outbox.
   */
  public async queueOutbox(mutation: {
    type: "dailyRecords" | "workouts" | "nutritionEntries" | "habits" | "habitCompletions" | "workoutRoutines" | "settings";
    action: "upsert" | "delete";
    data: unknown;
    timestamp: string;
  }): Promise<void> {
    const db = await this.getDB();
    if (!db) return;

    try {
      const tx = db.transaction("syncOutbox", "readwrite");
      tx.objectStore("syncOutbox").add(mutation);
    } catch (err) {
      console.warn("[SYDD IDB] Outbox queue error:", err);
    }
  }

  /**
   * Fetches and clears all pending outbox mutations.
   */
  public async drainOutbox(): Promise<Array<{
    type: string;
    action: string;
    data: unknown;
    timestamp: string;
  }>> {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction("syncOutbox", "readwrite");
        const store = tx.objectStore("syncOutbox");
        const req = store.getAll();

        req.onsuccess = () => {
          const items = req.result || [];
          store.clear();
          resolve(items);
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Migrates existing localStorage data into IndexedDB on first launch.
   */
  public async autoMigrateFromLocalStorage(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        await this.saveAll(parsed);
        return true;
      }
    } catch {
      // ignore parsing error
    }
    return false;
  }
}

export const IDBStorage = new IndexedDBService();
