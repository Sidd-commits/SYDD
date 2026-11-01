import { Goals, AppSettings, Habit, WorkoutRoutine } from "@/types";

export const STORAGE_KEY = "sydd:data:v1";

export const DEFAULT_GOALS: Goals = {
  stepsPerDay: 8000,
  caloriesConsumedKcalPerDay: 2000,
  proteinGPerDay: 130,
  carbsGPerDay: 225,
  fatGPerDay: 65,
  waterMlPerDay: 2000,
  workoutMinutesPerDay: 30,
  workoutGoalEnabled: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: 1,
  goals: DEFAULT_GOALS,
  onboardingCompleted: false,
  unitWater: "ml",
  unitWeight: "kg",
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit-1",
    name: "Morning mobility stretch",
    active: true,
    createdAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "habit-2",
    name: "Post-lunch 10-min walk",
    active: true,
    createdAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "habit-3",
    name: "Screen-free bedtime routine",
    active: true,
    createdAt: "2026-01-01T08:00:00.000Z",
  },
];

export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: "routine-push",
    name: "Push Focus (Chest, Delts & Triceps)",
    type: "strength",
    durationMinutes: 45,
    notes: "Focus on controlled eccentrics and full range of motion.",
    exercises: [
      {
        id: "r-ex-1",
        exerciseId: "barbell-bench-press",
        name: "Barbell Bench Press",
        sets: [
          { id: "r-s-1", setNumber: 1, reps: 10, weight: 60, weightUnit: "kg", completed: true },
          { id: "r-s-2", setNumber: 2, reps: 8, weight: 65, weightUnit: "kg", completed: true },
          { id: "r-s-3", setNumber: 3, reps: 8, weight: 65, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-2",
        exerciseId: "dumbbell-shoulder-press",
        name: "Dumbbell Shoulder Press",
        sets: [
          { id: "r-s-4", setNumber: 1, reps: 10, weight: 18, weightUnit: "kg", completed: true },
          { id: "r-s-5", setNumber: 2, reps: 10, weight: 18, weightUnit: "kg", completed: true },
          { id: "r-s-6", setNumber: 3, reps: 8, weight: 20, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-3",
        exerciseId: "incline-dumbbell-press",
        name: "Incline Dumbbell Press",
        sets: [
          { id: "r-s-7", setNumber: 1, reps: 10, weight: 20, weightUnit: "kg", completed: true },
          { id: "r-s-8", setNumber: 2, reps: 10, weight: 20, weightUnit: "kg", completed: true },
          { id: "r-s-9", setNumber: 3, reps: 8, weight: 22, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-4",
        exerciseId: "triceps-rope-pushdown",
        name: "Triceps Rope Pushdown",
        sets: [
          { id: "r-s-10", setNumber: 1, reps: 12, weight: 25, weightUnit: "kg", completed: true },
          { id: "r-s-11", setNumber: 2, reps: 12, weight: 25, weightUnit: "kg", completed: true },
        ],
      },
    ],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "routine-pull",
    name: "Pull Focus (Back & Biceps)",
    type: "strength",
    durationMinutes: 45,
    notes: "Drive elbows down and squeeze shoulder blades.",
    exercises: [
      {
        id: "r-ex-5",
        exerciseId: "lat-pulldown",
        name: "Lat Pulldown",
        sets: [
          { id: "r-s-12", setNumber: 1, reps: 10, weight: 55, weightUnit: "kg", completed: true },
          { id: "r-s-13", setNumber: 2, reps: 10, weight: 60, weightUnit: "kg", completed: true },
          { id: "r-s-14", setNumber: 3, reps: 8, weight: 65, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-6",
        exerciseId: "bent-over-row",
        name: "Barbell Bent-Over Row",
        sets: [
          { id: "r-s-15", setNumber: 1, reps: 10, weight: 50, weightUnit: "kg", completed: true },
          { id: "r-s-16", setNumber: 2, reps: 8, weight: 55, weightUnit: "kg", completed: true },
          { id: "r-s-17", setNumber: 3, reps: 8, weight: 55, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-7",
        exerciseId: "dumbbell-bicep-curl",
        name: "Dumbbell Bicep Curl",
        sets: [
          { id: "r-s-18", setNumber: 1, reps: 12, weight: 14, weightUnit: "kg", completed: true },
          { id: "r-s-19", setNumber: 2, reps: 10, weight: 14, weightUnit: "kg", completed: true },
          { id: "r-s-20", setNumber: 3, reps: 10, weight: 14, weightUnit: "kg", completed: true },
        ],
      },
    ],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "routine-legs",
    name: "Legs & Core Power",
    type: "strength",
    durationMinutes: 50,
    notes: "Deep squat depth and solid core bracing.",
    exercises: [
      {
        id: "r-ex-8",
        exerciseId: "barbell-back-squat",
        name: "Barbell Back Squat",
        sets: [
          { id: "r-s-21", setNumber: 1, reps: 8, weight: 70, weightUnit: "kg", completed: true },
          { id: "r-s-22", setNumber: 2, reps: 8, weight: 80, weightUnit: "kg", completed: true },
          { id: "r-s-23", setNumber: 3, reps: 6, weight: 85, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-9",
        exerciseId: "romanian-deadlift",
        name: "Romanian Deadlift",
        sets: [
          { id: "r-s-24", setNumber: 1, reps: 10, weight: 60, weightUnit: "kg", completed: true },
          { id: "r-s-25", setNumber: 2, reps: 10, weight: 65, weightUnit: "kg", completed: true },
          { id: "r-s-26", setNumber: 3, reps: 8, weight: 70, weightUnit: "kg", completed: true },
        ],
      },
      {
        id: "r-ex-10",
        exerciseId: "hanging-leg-raise",
        name: "Hanging Leg Raise",
        sets: [
          { id: "r-s-27", setNumber: 1, reps: 12, weight: 0, weightUnit: "kg", completed: true },
          { id: "r-s-28", setNumber: 2, reps: 12, weight: 0, weightUnit: "kg", completed: true },
        ],
      },
    ],
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
  },
];
