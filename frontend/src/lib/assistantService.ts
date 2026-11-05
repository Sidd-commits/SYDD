import { AppData, ChatMessage, ISODate, ProposedAction } from "@/types";
import { calculateStreaks } from "./calculations";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || ""
).replace(/\/+$/, "");

export interface AssistantChatResponse {
  reply: string;
  proposedAction?: ProposedAction | null;
  providerUsed: string;
}

export class AssistantService {
  /**
   * Sends the user conversation and minimal relevant context to the secure backend AI API.
   */
  public static async sendMessage(
    messages: ChatMessage[],
    appData: AppData,
    today: ISODate
  ): Promise<AssistantChatResponse> {
    const todayRecord = appData.dailyRecords.find((r) => r.date === today);
    const todayNutrition = (appData.nutritionEntries || [])
      .filter((e) => e.date === today)
      .map((e) => ({
        name: e.name,
        calories: e.calories,
        proteinG: e.proteinG,
        carbsG: e.carbsG,
        fatG: e.fatG,
      }));

    const recentWorkouts = (appData.workouts || [])
      .slice(-5)
      .map((w) => ({
        date: w.date,
        type: w.type,
        durationMinutes: w.durationMinutes,
      }));

    const { currentStreak, totalActiveDays } = calculateStreaks(appData, today);

    // Minimal relevant contextual snapshot (zero database dumps)
    const context = {
      today,
      todayRecord: todayRecord
        ? {
            steps: todayRecord.steps,
            caloriesConsumedKcal: todayRecord.caloriesConsumedKcal,
            waterMl: todayRecord.waterMl,
            notes: todayRecord.notes,
          }
        : undefined,
      goals: appData.settings.goals,
      todayNutrition,
      recentWorkouts,
      streakDays: currentStreak,
      totalActiveDays,
    };

    const payloadMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
      proposedAction: m.proposedAction,
    }));

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < 2) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Generous 45s timeout for AI reasoning & multi-item calculations

      try {
        const res = await fetch(`${BACKEND_URL}/api/assistant/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            messages: payloadMessages,
            context,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          // If server error or transient timeout and we have attempts left, retry once
          if ((res.status === 503 || res.status === 504) && attempts < 2) {
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }

          const errorText = await res.text();
          let errorMsg = `Server error (HTTP ${res.status})`;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.error) errorMsg = parsed.error;
          } catch {
            // Keep default message
          }
          throw new Error(errorMsg);
        }

        return await res.json();
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));

        // If it was aborted or network glitch, retry once
        if (attempts < 2) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
      }
    }

    const msg = lastError?.message || "Failed to connect to assistant service.";
    return {
      reply: `⚠️ **Unable to reach assistant service:** ${msg}\n\n*Please check your internet connection or try asking again in a moment.*`,
      providerUsed: "error",
    };
  }

  /**
   * Retrieves active AI provider status from backend.
   */
  public static async getStatus(): Promise<{ activeProvider: string; hasCloudAiKey: boolean } | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assistant/status`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }
}

