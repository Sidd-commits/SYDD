import { AiProvider } from "./providers/aiProvider.js";
import { GeminiProvider } from "./providers/geminiProvider.js";
import { FallbackProvider } from "./providers/fallbackProvider.js";
import { AssistantChatRequest, AssistantChatResponse } from "./types.js";

export class AssistantService {
  private static geminiProvider = new GeminiProvider();
  private static fallbackProvider = new FallbackProvider();

  /**
   * Dispatches a chat request to the best available provider.
   */
  public static async processChat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    if (!request || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error("Invalid chat request: messages array is required.");
    }

    // Sanitize input messages
    const sanitizedMessages = request.messages.slice(-10).map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, 2000), // Cap each message at 2k chars to prevent DoS
      proposedAction: m.proposedAction,
    }));

    const sanitizedRequest: AssistantChatRequest = {
      messages: sanitizedMessages,
      context: request.context,
    };

    // Use Gemini if API key is present
    if (this.geminiProvider.isAvailable()) {
      try {
        return await this.geminiProvider.chat(sanitizedRequest);
      } catch (err: unknown) {
        console.warn("[AssistantService] Gemini call failed, falling back to local engine:", (err as Error).message);
        // Seamless fallback to local heuristic engine
        const fallbackRes = await this.fallbackProvider.chat(sanitizedRequest);
        return {
          ...fallbackRes,
          reply: `${fallbackRes.reply}\n\n*(Note: Cloud AI service temporarily unreachable; answered using local offline engine)*`,
        };
      }
    }

    // Otherwise use local heuristic engine
    return await this.fallbackProvider.chat(sanitizedRequest);
  }

  /**
   * Returns current assistant service status and active provider.
   */
  public static getStatus(): { activeProvider: string; hasCloudAiKey: boolean } {
    const hasKey = this.geminiProvider.isAvailable();
    return {
      activeProvider: hasKey ? "Google Gemini (gemini-3.5-flash-lite)" : "SYDD Local Heuristics",
      hasCloudAiKey: hasKey,
    };
  }
}

