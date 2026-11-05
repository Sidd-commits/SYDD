import { AiProvider } from "./aiProvider";
import { AssistantChatRequest, AssistantChatResponse, ProposedAction } from "../types";
import { NUTRITION_CATALOG } from "../nutritionCatalog";

export class GeminiProvider implements AiProvider {
  public readonly id = "gemini";
  public readonly name = "Google Gemini (gemini-3.5-flash)";
  private readonly configuredKey: string;
  private readonly candidateModels = [
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ];

  constructor(apiKey?: string) {
    this.configuredKey = apiKey || "";
  }

  private getApiKey(): string {
    return this.configuredKey || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
  }

  public isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 10);
  }

  public async chat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    if (!this.isAvailable()) {
      throw new Error("Gemini API key is not configured.");
    }

    const systemInstruction = this.buildSystemPrompt(request);
    const contents = this.formatMessagesForGemini(request);

    let lastError: Error | null = null;
    for (const model of this.candidateModels) {
      try {
        return await this.callGeminiApi(model, systemInstruction, contents);
      } catch (err: unknown) {
        lastError = err as Error;
        console.warn(`[GeminiProvider] Model ${model} failed (${lastError.message}), attempting next candidate...`);
      }
    }

    throw lastError || new Error("All Gemini candidate models failed.");
  }

  private async callGeminiApi(
    model: string,
    systemInstruction: string,
    contents: Array<{ role: string; parts: Array<{ text: string }> }>
  ): Promise<AssistantChatResponse> {
    const key = this.getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

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

    let attempt = 0;
    while (attempt < 2) {
      attempt++;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout for detailed dietary analysis

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        // If high demand spike, retry once after short delay
        if ((res.status === 503 || res.status === 429) && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Gemini API returned HTTP ${res.status}: ${errBody}`);
        }

        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("No candidate content received from Gemini.");
        }

        // Defensive cleanup: strip markdown code blocks if present
        const cleanedText = rawText
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleanedText);
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

    throw new Error(`Model ${model} request exceeded retry attempts.`);
  }

  private buildSystemPrompt(request: AssistantChatRequest): string {
    const ctx = request.context || { today: new Date().toISOString().slice(0, 10) };
    const catalogSummary = NUTRITION_CATALOG.slice(0, 25)
      .map((c) => `- ${c.canonicalName}: ${c.servingDescription} = ${c.calories} kcal (P: ${c.proteinG}g, C: ${c.carbsG}g, F: ${c.fatG}g)`)
      .join("\n");

    return `You are SYDD's Elite AI Nutritionist & Fitness Assistant. SYDD is a personal fitness and health tracking web application.
Your mission is to provide accurate, item-by-item, scientifically reliable nutrition estimates matching USDA and IFCT (Indian Food Composition Tables) standards, exactly like ChatGPT and Google Gemini.

### USER CONTEXT TODAY (${ctx.today}):
- Daily Record: Steps=${ctx.todayRecord?.steps ?? "not logged"}, Calories Consumed=${ctx.todayRecord?.caloriesConsumedKcal ?? 0} kcal, Water=${ctx.todayRecord?.waterMl ?? 0} ml
- Daily Goals: Steps=${ctx.goals?.stepsPerDay ?? 8000}, Calories=${ctx.goals?.caloriesConsumedKcalPerDay ?? 2000} kcal, Protein=${ctx.goals?.proteinGPerDay ?? 130}g, Carbs=${ctx.goals?.carbsGPerDay ?? 225}g, Fat=${ctx.goals?.fatGPerDay ?? 65}g, Water=${ctx.goals?.waterMlPerDay ?? 2000}ml
- Current Active Streak: ${ctx.streakDays ?? 0} days
- Recent Workouts: ${ctx.recentWorkouts?.length ?? 0} logged

### CALIBRATED STANDARD REFERENCES:
${catalogSummary}

### CRITICAL RULES:
1. When the user mentions food/meals they ate or want to evaluate:
   - Break down every meal (Breakfast, Lunch, Dinner, Snack) with itemized bullet points.
   - For every single food item, list: assumed portion/weight (in grams), Calories (kcal), Protein (g), Carbohydrates (g), and Fat (g).
   - Compute exact totals for Calories, Protein, Carbs, and Fat. Ensure 4*P + 4*C + 9*F matches the calories closely.
   - Display a clean summary comparison of totals against the user's daily goals (e.g., remaining protein or calories).
   - Set "proposedAction" with type "add_nutrition" and data: { name, calories, proteinG, carbsG, fatG, isEstimate: true }.
   - If multiple foods are mentioned, aggregate the totals into a unified entry so the user can log it in one click.

2. When the user asks about their SYDD data (e.g. "How many calories have I consumed today?", "How much protein do I still need?"):
   - Calculate exact values using the user context provided above.
   - Set "proposedAction": null.

3. When the user asks to log water or workout:
   - Set "proposedAction" accordingly (e.g. type: "log_water", data: { amountMl: 500, mode: "add" }).

4. Always output strictly a valid JSON object matching this schema:
{
  "reply": "string (Clean markdown formatted with emoji tags, meal headers, and bullet points)",
  "proposedAction": {
    "type": "add_nutrition" | "log_water" | "log_steps" | "add_workout",
    "title": "string",
    "description": "string",
    "data": { ... }
  } | null
}
5. NEVER claim you have modified or saved the database. You only PROPOSE actions for the user to confirm with one click.`;
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
