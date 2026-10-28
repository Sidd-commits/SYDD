import { Goals, AppSettings, Habit } from "@/types";

export const STORAGE_KEY = "sydd:data:v1";

export const DEFAULT_GOALS: Goals = {
  stepsPerDay: 8000,
  caloriesConsumedKcalPerDay: 2000,
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
