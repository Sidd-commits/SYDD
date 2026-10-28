export type ISODate = string; // YYYY-MM-DD format in local timezone

export type DailyRecord = {
  date: ISODate;
  steps?: number;
  caloriesConsumedKcal?: number;
  waterMl?: number;
  notes?: string;
  updatedAt: string; // ISO 8601 timestamp
};

export type WorkoutType = "walking" | "running" | "cycling" | "strength" | "yoga" | "other";

export type WeightUnit = "kg" | "lbs";

export type WorkoutSet = {
  id: string;
  setNumber: number;
  reps: number;
  weight?: number; // 0 or undefined for bodyweight exercises
  weightUnit?: WeightUnit;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId?: string; // Optional reference to catalog exercise
  name: string;
  sets: WorkoutSet[];
  notes?: string;
};

export type Workout = {
  id: string;
  date: ISODate;
  type: WorkoutType;
  durationMinutes: number;
  notes?: string;
  exercises?: WorkoutExercise[]; // Granular exercise & set details
  createdAt: string;
  updatedAt: string;
};

export type Habit = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  archivedAt?: string;
};

export type HabitCompletion = {
  habitId: string;
  date: ISODate;
  completed: boolean;
  updatedAt: string;
};

export type Goals = {
  stepsPerDay: number;
  caloriesConsumedKcalPerDay: number;
  waterMlPerDay: number;
  workoutMinutesPerDay: number;
  workoutGoalEnabled: boolean;
};

export type AppSettings = {
  schemaVersion: number;
  goals: Goals;
  onboardingCompleted: boolean;
  unitWater: "ml" | "l";
  unitWeight?: WeightUnit;
};

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "legs"
  | "arms"
  | "core"
  | "cardio"
  | "full_body";

export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "kettlebell"
  | "other";

export type ExerciseDefinition = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
};

export type AppData = {
  settings: AppSettings;
  dailyRecords: DailyRecord[];
  workouts: Workout[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
};

export type HeatmapCell = {
  date: ISODate;
  level: -1 | 0 | 1 | 2 | 3 | 4; // -1 = no data recorded, 0 = 0-24%, 1 = 25-49%, 2 = 50-74%, 3 = 75-99%, 4 = 100%+
  score: number; // 0.0 - 1.0 (or -1 if no data)
  hasData: boolean;
  stepProgress: number;
  waterProgress: number;
  habitProgress: number;
  workoutProgress: number;
  isGoalReached: boolean;
  record?: DailyRecord;
  workouts: Workout[];
  completedHabitsCount: number;
  totalActiveHabitsCount: number;
};

export type DaySummary = {
  date: ISODate;
  steps: number;
  stepsGoal: number;
  stepsMet: boolean;
  caloriesConsumed: number;
  caloriesGoal: number;
  waterMl: number;
  waterGoal: number;
  waterMet: boolean;
  workoutMinutes: number;
  workoutGoal: number;
  workoutGoalEnabled: boolean;
  workoutMet: boolean;
  completedHabits: Habit[];
  pendingHabits: Habit[];
  workouts: Workout[];
  score: number;
  level: -1 | 0 | 1 | 2 | 3 | 4;
  hasData: boolean;
  activeDay: boolean; // At least 1 goal met or 1 habit completed
};

export type ActiveTab = "overview" | "history" | "habits" | "settings";
