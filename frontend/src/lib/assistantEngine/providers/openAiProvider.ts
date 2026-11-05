import { AiProvider } from "./aiProvider";
import { AssistantChatRequest, AssistantChatResponse, ProposedAction } from "../types";

export class OpenAiCompatibleProvider implements AiProvider {
  public readonly id: string;
  public readonly name: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(options?: {
    id?: string;
    name?: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  }) {
    this.id = options?.id || "openai-compatible";
    this.apiKey =
      options?.apiKey ||
      process.env.GROQ_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      "";

    if (process.env.GROQ_API_KEY) {
      this.name = "Groq (Llama 3.3 70B)";
      this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
      this.model = options?.model || "llama-3.3-70b-versatile";
    } else if (process.env.OPENROUTER_API_KEY) {
      this.name = "OpenRouter (GPT-4o-mini)";
      this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
      this.model = options?.model || "openai/gpt-4o-mini";
    } else {
      this.name = options?.name || "OpenAI (GPT-4o-mini)";
      this.baseUrl = options?.baseUrl || "https://api.openai.com/v1/chat/completions";
      this.model = options?.model || "gpt-4o-mini";
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  public async chat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.name} API key is not configured.`);
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const messages = [
      { role: "system", content: systemPrompt },
      ...request.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${this.name} API HTTP ${res.status}: ${errText}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from AI provider.");
      }

      const parsed = JSON.parse(content.trim());
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
        model: this.model,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildSystemPrompt(request: AssistantChatRequest): string {
    const ctx = request.context || { today: new Date().toISOString().slice(0, 10) };
    return `You are SYDD's Elite AI Nutritionist & Fitness Assistant.
Your task is to analyze meals and nutrition with the highest scientific accuracy matching USDA and IFCT (Indian Food Composition Tables) standards, exactly like ChatGPT and Google Gemini.

### USER CONTEXT TODAY (${ctx.today}):
- Daily Record: Steps=${ctx.todayRecord?.steps ?? "not logged"}, Calories Consumed=${ctx.todayRecord?.caloriesConsumedKcal ?? 0} kcal, Water=${ctx.todayRecord?.waterMl ?? 0} ml
- Daily Goals: Steps=${ctx.goals?.stepsPerDay ?? 8000}, Calories=${ctx.goals?.caloriesConsumedKcalPerDay ?? 2000} kcal, Protein=${ctx.goals?.proteinGPerDay ?? 130}g, Carbs=${ctx.goals?.carbsGPerDay ?? 225}g, Fat=${ctx.goals?.fatGPerDay ?? 65}g, Water=${ctx.goals?.waterMlPerDay ?? 2000}ml
- Current Active Streak: ${ctx.streakDays ?? 0} days

### INSTRUCTIONS:
1. When estimating meals:
   - Provide an item-by-item breakdown categorized by meal (Breakfast, Lunch, Dinner, Snack).
   - For every item, specify: estimated portion/weight in grams, Calories (kcal), Protein (g), Carbohydrates (g), Fat (g).
   - Calculate exact mathematical totals for Calories, Protein, Carbs, and Fat.
   - Compare the totals against the user's daily targets (e.g. remaining protein or calories).
   - Propose an action to log the meal into SYDD.

2. Always output strictly a valid JSON object matching:
{
  "reply": "string (Rich Markdown formatted with clear headers, bullet points, and emoji tags)",
  "proposedAction": {
    "type": "add_nutrition" | "log_water" | "log_steps" | "add_workout",
    "title": "string",
    "description": "string",
    "data": {
      "name": "string",
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "isEstimate": true
    }
  } | null
}`;
  }
}

