# Data Model and Calculation Notes
## SYDD MVP

The first version is a single-user, local-first app. Keep persistence behind a small interface so a backend can be added later without rewriting UI components.

## 1. Suggested TypeScript types

```ts
type ISODate = string; // YYYY-MM-DD in the user's local calendar

type DailyRecord = {
  date: ISODate;
  steps?: number;
  caloriesConsumedKcal?: number;
  waterMl?: number;
  notes?: string;
  updatedAt: string; // ISO timestamp
};

type Workout = {
  id: string;
  date: ISODate;
  type: "walking" | "running" | "cycling" | "strength" | "yoga" | "other";
  durationMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type Habit = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  archivedAt?: string;
};

type HabitCompletion = {
  habitId: string;
  date: ISODate;
  completed: boolean;
  updatedAt: string;
};

type Goals = {
  stepsPerDay: number;
  caloriesConsumedKcalPerDay: number;
  waterMlPerDay: number;
  workoutMinutesPerDay?: number;
  workoutGoalEnabled: boolean;
};

type AppSettings = {
  schemaVersion: number;
  goals: Goals;
  onboardingCompleted: boolean;
};

type AppData = {
  settings: AppSettings;
  dailyRecords: DailyRecord[];
  workouts: Workout[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
};
```

## 2. Storage
- Store a single versioned JSON object under a namespaced local-storage key such as `sydd:data:v1`.
- Validate data when loading; malformed data should not crash the app.
- Include schema version and a migration function placeholder.
- Do not store credentials or sensitive health data beyond what the user intentionally enters.
- Keep a JSON export/import path. Validate imported data before replacing existing data.
- Provide a clear-data action with a confirmation dialog.

## 3. Date handling
- Use `YYYY-MM-DD` for user-local calendar dates.
- Avoid converting date-only values through UTC in a way that shifts the day.
- Keep timestamps (`createdAt`, `updatedAt`) separate from date-only activity dates.
- Test daylight-saving boundaries where relevant, even if the initial audience uses one local timezone.

## 4. Daily totals
- Steps and calories are daily totals that can be edited.
- Water quick-add increments the daily total.
- Workout minutes are summed from workout entries for that date.
- Habit completion count is the number of active habits marked complete for that date.
- Never silently interpret missing values as a confirmed zero. Preserve the distinction between missing and explicitly entered zero.

## 5. Heatmap calculation
Only use configured activity goals and available data. Do not use calories consumed as a positive fitness score.

Suggested calculation:
1. `stepProgress = min(steps / stepsGoal, 1)` if steps are present and goal > 0.
2. `waterProgress = min(water / waterGoal, 1)` if water is present and goal > 0.
3. `habitProgress = completedActiveHabits / activeHabits` if at least one active habit exists and the day has habit data.
4. `workoutProgress = min(workoutMinutes / workoutGoal, 1)` only if workout goal is enabled and workout data exists.
5. Average only the available components.
6. Map the score into four intensity levels, with no-data as a separate state.
7. Mark “goal reached” based on the selected daily goal rules; show the calculation in a tooltip/help label.

Do not award a full score simply because only one tiny entry exists. If only one metric is available for a date, either label the heatmap as “recorded activity” rather than a comprehensive fitness score, or use an explicit minimum-data rule. Keep the formula transparent.

## 6. Streak definition
For MVP, define an active day as a date where at least one tracked goal is reached OR at least one habit is completed. A streak is consecutive active calendar days. Show this definition in help text. Do not treat future dates as missed days and do not use shame-based language.
