import { GeminiProvider } from "./providers/geminiProvider";
import { OpenAiCompatibleProvider } from "./providers/openAiProvider";
import { FallbackProvider } from "./providers/fallbackProvider";
import { AssistantChatRequest, AssistantChatResponse } from "./types";

export class AssistantService {
  private static geminiProvider = new GeminiProvider();
  private static openAiProvider = new OpenAiCompatibleProvider();
  private static fallbackProvider = new FallbackProvider();

  /**
   * Dispatches a chat request to the best available provider.
   */
  public static async processChat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    if (!request || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error("Invalid chat request: messages array is required.");
    }

    // Sanitize input messages (allow up to 4,000 characters for rich full-day diet logs)
    const sanitizedMessages = request.messages.slice(-10).map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, 4000),
      proposedAction: m.proposedAction,
    }));

    const sanitizedRequest: AssistantChatRequest = {
      messages: sanitizedMessages,
      context: request.context,
    };

    // 1. Try Groq / OpenAI / OpenRouter if configured
    if (this.openAiProvider.isAvailable()) {
      try {
        return await this.openAiProvider.chat(sanitizedRequest);
      } catch (err: unknown) {
        console.warn("[AssistantService] OpenAI/Groq call failed, attempting Gemini:", (err as Error).message);
      }
    }

    // 2. Try Google Gemini if key is present
    if (this.geminiProvider.isAvailable()) {
      try {
        return await this.geminiProvider.chat(sanitizedRequest);
      } catch (err: unknown) {
        console.warn("[AssistantService] Gemini call failed, falling back to local engine:", (err as Error).message);
      }
    }

    // 3. Fallback to local heuristic engine
    const fallbackRes = await this.fallbackProvider.chat(sanitizedRequest);
    return {
      ...fallbackRes,
      reply: this.geminiProvider.isAvailable() || this.openAiProvider.isAvailable()
        ? `${fallbackRes.reply}\n\n*(Note: Cloud AI service temporarily unreachable; answered using local offline engine)*`
        : fallbackRes.reply,
    };
  }

  /**
   * Returns current assistant service status and active provider.
   */
  public static getStatus(): { activeProvider: string; hasCloudAiKey: boolean } {
    if (this.openAiProvider.isAvailable()) {
      return {
        activeProvider: this.openAiProvider.name,
        hasCloudAiKey: true,
      };
    }
    const hasGemini = this.geminiProvider.isAvailable();
    return {
      activeProvider: hasGemini ? "Google Gemini (gemini-3.5-flash)" : "SYDD Local Heuristics",
      hasCloudAiKey: hasGemini,
    };
  }
}
