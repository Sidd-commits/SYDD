export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  proposedAction?: ProposedAction | null;
  timestamp?: string;
}

export type ProposedActionType = "add_nutrition" | "log_water" | "log_steps" | "add_workout";

export interface ProposedNutritionData {
  name: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  date?: string; // YYYY-MM-DD
  time?: string;
  isEstimate?: boolean;
  notes?: string;
}

export interface ProposedWaterData {
  amountMl: number;
  mode: "add" | "set";
  date?: string;
}

export interface ProposedStepsData {
  steps: number;
  date?: string;
}

export interface ProposedWorkoutData {
  type: "walking" | "running" | "cycling" | "strength" | "yoga" | "other";
  durationMinutes: number;
  notes?: string;
  date?: string;
}

export interface ProposedAction {
  id: string;
  type: ProposedActionType;
  title: string;
  description: string;
  data: ProposedNutritionData | ProposedWaterData | ProposedStepsData | ProposedWorkoutData;
  status: "pending" | "confirmed" | "dismissed";
}

export interface AssistantChatContext {
  today: string;
  todayRecord?: {
    steps?: number;
    caloriesConsumedKcal?: number;
    waterMl?: number;
    notes?: string;
  };
  goals?: {
    stepsPerDay: number;
    caloriesConsumedKcalPerDay: number;
    proteinGPerDay?: number;
    carbsGPerDay?: number;
    fatGPerDay?: number;
    waterMlPerDay: number;
    workoutMinutesPerDay: number;
    workoutGoalEnabled: boolean;
  };
  todayNutrition?: Array<{
    name: string;
    calories: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
  }>;
  recentWorkouts?: Array<{
    date: string;
    type: string;
    durationMinutes: number;
  }>;
  streakDays?: number;
  totalActiveDays?: number;
}

export interface AssistantChatRequest {
  messages: ChatMessage[];
  context?: AssistantChatContext;
}

export interface AssistantChatResponse {
  reply: string;
  proposedAction?: ProposedAction | null;
  providerUsed: string;
  model?: string;
}

