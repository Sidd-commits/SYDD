import { AiProvider } from "./aiProvider.js";
import { AssistantChatRequest, AssistantChatResponse, ProposedAction } from "../types.js";
import { NUTRITION_CATALOG } from "../nutritionCatalog.js";

export class GeminiProvider implements AiProvider {
  public readonly id = "gemini";
  public readonly name = "Google Gemini (gemini-2.5-flash)";
  private readonly apiKey: string;
  private readonly primaryModel = "gemini-2.5-flash";
  private readonly fallbackModel = "gemini-1.5-flash";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  public async chat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    if (!this.isAvailable()) {
      throw new Error("Gemini API key is not configured.");
    }

    const systemInstruction = this.buildSystemPrompt(request);
    const contents = this.formatMessagesForGemini(request);

    // Attempt primary model first, fallback to 1.5-flash if needed
    try {
      return await this.callGeminiApi(this.primaryModel, systemInstruction, contents);
    } catch (err: unknown) {
      console.warn(`[GeminiProvider] Primary model ${this.primaryModel} failed, trying fallback:`, (err as Error).message);
      return await this.callGeminiApi(this.fallbackModel, systemInstruction, contents);
    }
  }

  private async callGeminiApi(
    model: string,
    systemInstruction: string,
    contents: Array<{ role: string; parts: Array<{ text: string }> }>
  ): Promise<AssistantChatResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.2, // Low temperature for high precision and consistent nutrition metrics
        responseMimeType: "application/json",
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini API returned HTTP ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("No candidate content received from Gemini.");
      }

      const parsed = JSON.parse(rawText);
      const proposedAction: ProposedAction | null = parsed.proposedAction
        ? {
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: parsed.proposedAction.type,
            title: parsed.proposedAction.title || "Proposed Action",
            description: parsed.proposedAction.description || "",
            data: parsed.proposedAction.data,
            status: "pending",
          }
        : null;

      return {
        reply: parsed.reply || "I have analyzed your request.",
        proposedAction,
        providerUsed: this.id,
        model,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildSystemPrompt(request: AssistantChatRequest): string {
    const ctx = request.context || { today: new Date().toISOString().slice(0, 10) };
    const catalogSummary = NUTRITION_CATALOG.slice(0, 20)
      .map((c) => `- ${c.canonicalName}: ${c.servingDescription} = ${c.calories} kcal (P: ${c.proteinG}g, C: ${c.carbsG}g, F: ${c.fatG}g)`)
      .join("\n");

    return `You are SYDD's built-in AI Fitness Assistant. SYDD is a personal fitness and health tracking web application.
Your mission is to provide accurate, concise, helpful conversational fitness support, estimate nutrition with high precision, and answer questions using SYDD data.

### RELEVANT USER SYDD CONTEXT TODAY (${ctx.today}):
- Daily Record: Steps=${ctx.todayRecord?.steps ?? "not logged"}, Calories Consumed=${ctx.todayRecord?.caloriesConsumedKcal ?? 0} kcal, Water=${ctx.todayRecord?.waterMl ?? 0} ml
- Daily Goals: Steps=${ctx.goals?.stepsPerDay ?? 8000}, Calories=${ctx.goals?.caloriesConsumedKcalPerDay ?? 2000} kcal, Protein=${ctx.goals?.proteinGPerDay ?? 130}g, Carbs=${ctx.goals?.carbsGPerDay ?? 225}g, Fat=${ctx.goals?.fatGPerDay ?? 65}g, Water=${ctx.goals?.waterMlPerDay ?? 2000}ml
- Current Active Streak: ${ctx.streakDays ?? 0} days
- Recent Workouts Logged: ${ctx.recentWorkouts?.length ?? 0}

### NUTRITIONAL BASELINE REFERENCE (IFCT & USDA standard portions):
${catalogSummary}

### CRITICAL RULES:
1. Always format your output strictly as a JSON object matching this schema:
{
  "reply": "string (Clean markdown conversational reply)",
  "proposedAction": {
    "type": "add_nutrition" | "log_water" | "log_steps" | "add_workout",
    "title": "string",
    "description": "string",
    "data": { ... }
  } | null
}
2. When the user mentions food they ate or want to log:
   - Break down each food item and quantity.
   - Estimate Calories (kcal), Protein (g), Carbohydrates (g), and Fat (g).
   - If quantities are ambiguous (e.g. "a bowl of dal"), assume standard medium portion and note the assumption gently.
   - Set "proposedAction" with type "add_nutrition" and data: { name, calories, proteinG, carbsG, fatG, isEstimate: true }.
   - In your reply, always make it clear that nutritional values are approximate estimates and ask if they would like to confirm logging it.
3. When the user asks about their SYDD data (e.g. "How many calories have I consumed today?", "How much protein do I still need?"):
   - Calculate exact values using the user context provided above.
   - Set "proposedAction": null.
4. When the user asks to log water or workout:
   - Set "proposedAction" accordingly (e.g. type: "log_water", data: { amountMl: 500, mode: "add" }).
5. NEVER claim you have modified or saved the database. You only PROPOSE actions for the user to confirm.`;
  }

  private formatMessagesForGemini(
    request: AssistantChatRequest
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    const formatted: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const msg of request.messages) {
      if (msg.role === "system") continue;
      formatted.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    if (formatted.length === 0) {
      formatted.push({ role: "user", parts: [{ text: "Hello" }] });
    }

    return formatted;
  }
}
