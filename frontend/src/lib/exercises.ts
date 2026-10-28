import { EquipmentType, ExerciseDefinition, MuscleGroup } from "@/types";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  legs: "Legs",
  arms: "Arms",
  core: "Core & Abs",
  cardio: "Cardio",
  full_body: "Full Body",
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  bodyweight: "Bodyweight",
  kettlebell: "Kettlebell",
  other: "Other",
};

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  // Chest
  { id: "barbell-bench-press", name: "Barbell Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { id: "incline-barbell-bench-press", name: "Incline Barbell Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { id: "dumbbell-bench-press", name: "Dumbbell Bench Press", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "push-ups", name: "Push-ups", muscleGroup: "chest", equipment: "bodyweight" },
  { id: "chest-dips", name: "Chest Dips", muscleGroup: "chest", equipment: "bodyweight" },
  { id: "cable-chest-flyes", name: "Cable Chest Flyes", muscleGroup: "chest", equipment: "cable" },
  { id: "pec-deck-machine", name: "Pec Deck Machine", muscleGroup: "chest", equipment: "machine" },

  // Back
  { id: "barbell-deadlift", name: "Barbell Deadlift", muscleGroup: "back", equipment: "barbell" },
  { id: "barbell-bent-over-row", name: "Barbell Bent-Over Row", muscleGroup: "back", equipment: "barbell" },
  { id: "pull-ups", name: "Pull-ups", muscleGroup: "back", equipment: "bodyweight" },
  { id: "chin-ups", name: "Chin-ups", muscleGroup: "back", equipment: "bodyweight" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "back", equipment: "cable" },
  { id: "seated-cable-row", name: "Seated Cable Row", muscleGroup: "back", equipment: "cable" },
  { id: "one-arm-dumbbell-row", name: "One-Arm Dumbbell Row", muscleGroup: "back", equipment: "dumbbell" },
  { id: "t-bar-row", name: "T-Bar Row", muscleGroup: "back", equipment: "barbell" },
  { id: "face-pull", name: "Face Pull", muscleGroup: "back", equipment: "cable" },
  { id: "back-hyperextension", name: "Back Hyperextension", muscleGroup: "back", equipment: "bodyweight" },

  // Shoulders
  { id: "overhead-barbell-press", name: "Overhead Barbell Press", muscleGroup: "shoulders", equipment: "barbell" },
  { id: "seated-dumbbell-shoulder-press", name: "Seated Dumbbell Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "cable-lateral-raise", name: "Cable Lateral Raise", muscleGroup: "shoulders", equipment: "cable" },
  { id: "dumbbell-front-raise", name: "Dumbbell Front Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "rear-delt-dumbbell-fly", name: "Rear Delt Dumbbell Fly", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "arnold-press", name: "Arnold Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "dumbbell-shrugs", name: "Dumbbell Shrugs", muscleGroup: "shoulders", equipment: "dumbbell" },

  // Legs
  { id: "barbell-back-squat", name: "Barbell Back Squat", muscleGroup: "legs", equipment: "barbell" },
  { id: "barbell-front-squat", name: "Barbell Front Squat", muscleGroup: "legs", equipment: "barbell" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs", equipment: "machine" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", muscleGroup: "legs", equipment: "barbell" },
  { id: "dumbbell-romanian-deadlift", name: "Dumbbell Romanian Deadlift", muscleGroup: "legs", equipment: "dumbbell" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", muscleGroup: "legs", equipment: "dumbbell" },
  { id: "goblet-squat", name: "Goblet Squat", muscleGroup: "legs", equipment: "dumbbell" },
  { id: "walking-lunges", name: "Walking Lunges", muscleGroup: "legs", equipment: "dumbbell" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs", equipment: "machine" },
  { id: "lying-leg-curl", name: "Lying Leg Curl", muscleGroup: "legs", equipment: "machine" },
  { id: "barbell-hip-thrust", name: "Barbell Hip Thrust", muscleGroup: "legs", equipment: "barbell" },
  { id: "standing-calf-raise", name: "Standing Calf Raise", muscleGroup: "legs", equipment: "machine" },
  { id: "bodyweight-air-squats", name: "Bodyweight Air Squats", muscleGroup: "legs", equipment: "bodyweight" },

  // Arms
  { id: "barbell-bicep-curl", name: "Barbell Bicep Curl", muscleGroup: "arms", equipment: "barbell" },
  { id: "dumbbell-alternating-curl", name: "Dumbbell Alternating Curl", muscleGroup: "arms", equipment: "dumbbell" },
  { id: "dumbbell-hammer-curl", name: "Dumbbell Hammer Curl", muscleGroup: "arms", equipment: "dumbbell" },
  { id: "incline-dumbbell-curl", name: "Incline Dumbbell Curl", muscleGroup: "arms", equipment: "dumbbell" },
  { id: "cable-bicep-curl", name: "Cable Bicep Curl", muscleGroup: "arms", equipment: "cable" },
  { id: "tricep-rope-pushdown", name: "Tricep Rope Pushdown", muscleGroup: "arms", equipment: "cable" },
  { id: "skull-crushers", name: "Skull Crushers", muscleGroup: "arms", equipment: "barbell" },
  { id: "overhead-tricep-extension", name: "Overhead Tricep Extension", muscleGroup: "arms", equipment: "dumbbell" },
  { id: "close-grip-bench-press", name: "Close-Grip Bench Press", muscleGroup: "arms", equipment: "barbell" },
  { id: "bench-dips", name: "Bench Dips", muscleGroup: "arms", equipment: "bodyweight" },

  // Core & Abs
  { id: "plank", name: "Plank", muscleGroup: "core", equipment: "bodyweight" },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", muscleGroup: "core", equipment: "bodyweight" },
  { id: "ab-wheel-rollout", name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "bodyweight" },
  { id: "cable-woodchoppers", name: "Cable Woodchoppers", muscleGroup: "core", equipment: "cable" },
  { id: "russian-twists", name: "Russian Twists", muscleGroup: "core", equipment: "bodyweight" },
  { id: "crunches", name: "Crunches", muscleGroup: "core", equipment: "bodyweight" },
  { id: "bicycle-crunches", name: "Bicycle Crunches", muscleGroup: "core", equipment: "bodyweight" },

  // Full Body & Conditioning
  { id: "kettlebell-swings", name: "Kettlebell Swings", muscleGroup: "full_body", equipment: "kettlebell" },
  { id: "barbell-clean-and-press", name: "Barbell Clean & Press", muscleGroup: "full_body", equipment: "barbell" },
  { id: "burpees", name: "Burpees", muscleGroup: "full_body", equipment: "bodyweight" },
  { id: "jump-rope", name: "Jump Rope", muscleGroup: "cardio", equipment: "other" },
  { id: "farmers-walk", name: "Farmer's Walk", muscleGroup: "full_body", equipment: "dumbbell" },
  { id: "mountain-climbers", name: "Mountain Climbers", muscleGroup: "core", equipment: "bodyweight" },
];

/**
 * Filter exercises by query and optional muscle group / equipment
 */
export function searchExercises(
  query: string,
  muscleGroup?: MuscleGroup | "all",
  equipment?: EquipmentType | "all"
): ExerciseDefinition[] {
  const q = query.trim().toLowerCase();

  return EXERCISE_CATALOG.filter((ex) => {
    if (muscleGroup && muscleGroup !== "all" && ex.muscleGroup !== muscleGroup) {
      return false;
    }
    if (equipment && equipment !== "all" && ex.equipment !== equipment) {
      return false;
    }
    if (q.length === 0) {
      return true;
    }
    return (
      ex.name.toLowerCase().includes(q) ||
      MUSCLE_GROUP_LABELS[ex.muscleGroup].toLowerCase().includes(q) ||
      EQUIPMENT_LABELS[ex.equipment].toLowerCase().includes(q)
    );
  });
}

/**
 * Look up exercise by ID
 */
export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return EXERCISE_CATALOG.find((e) => e.id === id);
}
