import { AssistantService } from "./assistantService";
import { AssistantChatRequest, AssistantChatResponse } from "./types";

export const AssistantController = {
  getStatus() {
    return AssistantService.getStatus();
  },

  async handleChat(payload: AssistantChatRequest): Promise<AssistantChatResponse> {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid request: payload must be a JSON object.");
    }

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      throw new Error("Invalid request: payload.messages must be a non-empty array.");
    }

    return await AssistantService.processChat(payload);
  },
};

