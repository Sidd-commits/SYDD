import { AppData, DailyRecord, DaySummary, Goals, Habit, HeatmapCell, ISODate, Workout } from "@/types";
import { addDays, getPast7Days } from "./dateUtils";

/**
 * Returns the daily record for a date or undefined if none exists.
 */
export function getDailyRecord(data: AppData, date: ISODate): DailyRecord | undefined {
  return data.dailyRecords.find((r) => r.date === date);
}

/**
 * Returns all workouts for a specific date.
 */
export function getWorkoutsForDate(data: AppData, date: ISODate): Workout[] {
  return data.workouts.filter((w) => w.date === date);
}

/**
 * Returns active habits for a given date.
 * (A habit is active on `date` if it was created on or before `date` and was not archived before `date`).
 */
export function getActiveHabitsForDate(data: AppData, date: ISODate): Habit[] {
  return data.habits.filter((h) => {
    if (!h.active && !h.archivedAt) return false;
    const createdDate = h.createdAt.slice(0, 10);
    if (createdDate > date) return false;
    if (h.archivedAt) {
      const archivedDate = h.archivedAt.slice(0, 10);
      if (archivedDate < date) return false;
    }
    return true;
  });
}

/**
 * Checks if a habit was completed on a specific date.
 */
export function isHabitCompleted(data: AppData, habitId: string, date: ISODate): boolean {
  const completion = data.habitCompletions.find(
    (c) => c.habitId === habitId && c.date === date
  );
  return completion?.completed ?? false;
}

/**
 * Calculates the DaySummary for any given date.
 */
export function calculateDaySummary(data: AppData, date: ISODate): DaySummary {
  const record = getDailyRecord(data, date);
  const workouts = getWorkoutsForDate(data, date);
  const activeHabits = getActiveHabitsForDate(data, date);
  const goals: Goals = data.settings.goals;

  const steps = record?.steps ?? 0;
  const hasSteps = record?.steps !== undefined;
  const stepsGoal = goals.stepsPerDay;
  const stepsMet = hasSteps && stepsGoal > 0 && steps >= stepsGoal;

  const caloriesConsumed = record?.caloriesConsumedKcal ?? 0;

  const waterMl = record?.waterMl ?? 0;
  const hasWater = record?.waterMl !== undefined;
  const waterGoal = goals.waterMlPerDay;
  const waterMet = hasWater && waterGoal > 0 && waterMl >= waterGoal;

  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const hasWorkouts = workouts.length > 0;
  const workoutGoal = goals.workoutMinutesPerDay ?? 30;
  const workoutGoalEnabled = goals.workoutGoalEnabled;
  const workoutMet = workoutGoalEnabled && hasWorkouts && totalWorkoutMinutes >= workoutGoal;

  const completedHabits: Habit[] = [];
  const pendingHabits: Habit[] = [];

  activeHabits.forEach((habit) => {
    if (isHabitCompleted(data, habit.id, date)) {
      completedHabits.push(habit);
    } else {
      pendingHabits.push(habit);
    }
  });

  const hasHabitActivity = completedHabits.length > 0;

  // Determine if there is ANY logged data for this day
  const hasData =
    hasSteps ||
    hasWater ||
    record?.caloriesConsumedKcal !== undefined ||
    hasWorkouts ||
    hasHabitActivity ||
    (record?.notes !== undefined && record.notes.trim().length > 0);

  // Active day definition from PRD: at least 1 goal reached OR at least 1 habit completed
  const activeDay =
    stepsMet ||
    waterMet ||
    workoutMet ||
    completedHabits.length > 0;

  // Calculate Heatmap progress score
  // Collect progress ratio for each activity pillar that has logged data
  const components: number[] = [];
  const metGoalsList: boolean[] = [];

  if (hasSteps && stepsGoal > 0) {
    components.push(steps / stepsGoal);
    metGoalsList.push(stepsMet);
  }
  if (hasWater && waterGoal > 0) {
    components.push(waterMl / waterGoal);
    metGoalsList.push(waterMet);
  }
  if (workoutGoalEnabled && hasWorkouts && workoutGoal > 0) {
    components.push(totalWorkoutMinutes / workoutGoal);
    metGoalsList.push(workoutMet);
  }
  if (activeHabits.length > 0 && hasHabitActivity) {
    components.push(completedHabits.length / activeHabits.length);
    metGoalsList.push(completedHabits.length >= activeHabits.length);
  }

  let score = 0;
  let level: -1 | 0 | 1 | 2 | 3 | 4 = -1;

  if (!hasData) {
    level = -1; // No data recorded
    score = 0;
  } else if (components.length === 0) {
    // Has data (e.g. calories consumed or note), but no physical activity goals scored
    level = 0;
    score = 0;
  } else {
    const metCount = metGoalsList.filter(Boolean).length;
    const anyGoalMet = stepsMet || waterMet || workoutMet || (activeHabits.length > 0 && completedHabits.length >= activeHabits.length);
    const maxRatio = Math.max(...components);
    const avgRatio = components.reduce((a, b) => a + b, 0) / components.length;

    // Meeting a primary fitness target ensures top-tier Level 4 recognition and high score
    if (anyGoalMet || maxRatio >= 1.0) {
      score = Math.min(1.0, 0.85 + (Math.min(maxRatio, 1.5) - 1.0) * 0.15 + (metCount > 1 ? 0.15 : 0.05 * Math.min(avgRatio, 1.0)));
      level = 4;
    } else {
      score = Math.min(1.0, Math.max(0, avgRatio));

      if (score >= 0.85) {
        level = 4;
      } else if (score >= 0.60) {
        level = 3;
      } else if (score >= 0.35 || activeDay) {
        level = 2;
      } else if (score > 0) {
        level = 1;
      } else {
        level = 0;
      }
    }
  }

  return {
    date,
    steps,
    stepsGoal,
    stepsMet,
    caloriesConsumed,
    caloriesGoal: goals.caloriesConsumedKcalPerDay,
    waterMl,
    waterGoal,
    waterMet,
    workoutMinutes: totalWorkoutMinutes,
    workoutGoal,
    workoutGoalEnabled,
    workoutMet,
    completedHabits,
    pendingHabits,
    workouts,
    score,
    level,
    hasData,
    activeDay,
  };
}

/**
 * Builds heatmap cell details for a date.
 */
export function calculateHeatmapCell(data: AppData, date: ISODate): HeatmapCell {
  const summary = calculateDaySummary(data, date);
  const activeHabits = getActiveHabitsForDate(data, date);

  return {
    date,
    level: summary.level,
    score: summary.score,
    hasData: summary.hasData,
    stepProgress: summary.stepsGoal > 0 ? summary.steps / summary.stepsGoal : 0,
    waterProgress: summary.waterGoal > 0 ? summary.waterMl / summary.waterGoal : 0,
    habitProgress: activeHabits.length > 0 ? summary.completedHabits.length / activeHabits.length : 0,
    workoutProgress: summary.workoutGoal > 0 ? summary.workoutMinutes / summary.workoutGoal : 0,
    isGoalReached: summary.level === 4,
    record: getDailyRecord(data, date),
    workouts: summary.workouts,
    completedHabitsCount: summary.completedHabits.length,
    totalActiveHabitsCount: activeHabits.length,
  };
}

/**
 * Calculates streaks and overall statistics.
 * "A streak is based on at least one configured activity/habit goal completed on a calendar day"
 */
export function calculateStreaks(data: AppData, referenceToday?: ISODate): {
  currentStreak: number;
  bestStreak: number;
  totalActiveDays: number;
} {
  const today = referenceToday || "2026-10-27";

  // Find all dates that have active days
  const activeDatesSet = new Set<ISODate>();

  // Check all dates with records, workouts, or habit completions
  const candidateDates = new Set<ISODate>();
  data.dailyRecords.forEach((r) => candidateDates.add(r.date));
  data.workouts.forEach((w) => candidateDates.add(w.date));
  data.habitCompletions.forEach((c) => {
    if (c.completed) candidateDates.add(c.date);
  });

  candidateDates.forEach((date) => {
    if (date <= today) {
      const summary = calculateDaySummary(data, date);
      if (summary.activeDay) {
        activeDatesSet.add(date);
      }
    }
  });

  const totalActiveDays = activeDatesSet.size;

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = today;

  // If today is not active yet, check if yesterday was active to keep streak alive
  if (!activeDatesSet.has(today)) {
    const yesterday = addDays(today, -1);
    if (activeDatesSet.has(yesterday)) {
      checkDate = yesterday;
    } else {
      checkDate = ""; // No current streak
    }
  }

  if (checkDate) {
    while (activeDatesSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  }

  // Calculate best streak historically
  let bestStreak = 0;
  if (activeDatesSet.size > 0) {
    const sortedDates = Array.from(activeDatesSet).sort();
    let tempStreak = 0;
    let prevDate: ISODate | null = null;

    for (const d of sortedDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diff = Math.round(
          (new Date(d).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      prevDate = d;
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalActiveDays,
  };
}

/**
 * Calculates 7-day weekly recap ending on referenceDate (default today).
 */
export function calculateWeeklyRecap(data: AppData, referenceDate: ISODate = "2026-10-27") {
  const dates = getPast7Days(referenceDate);
  let totalSteps = 0;
  let daysWithSteps = 0;
  let totalWater = 0;
  let daysWithWater = 0;
  let totalWorkoutMinutes = 0;
  let activeDaysCount = 0;

  dates.forEach((date) => {
    const summary = calculateDaySummary(data, date);
    if (summary.hasData) {
      if (summary.steps > 0) {
        totalSteps += summary.steps;
        daysWithSteps++;
      }
      if (summary.waterMl > 0) {
        totalWater += summary.waterMl;
        daysWithWater++;
      }
    }
    totalWorkoutMinutes += summary.workoutMinutes;
    if (summary.activeDay) {
      activeDaysCount++;
    }
  });

  return {
    averageSteps: daysWithSteps > 0 ? Math.round(totalSteps / daysWithSteps) : 0,
    averageWaterMl: daysWithWater > 0 ? Math.round(totalWater / daysWithWater) : 0,
    totalWorkoutMinutes,
    activeDaysCount,
    daysTracked: dates.filter((d) => calculateDaySummary(data, d).hasData).length,
  };
}
