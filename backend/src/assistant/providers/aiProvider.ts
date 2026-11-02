import { AssistantChatRequest, AssistantChatResponse } from "../types.js";

export interface AiProvider {
  readonly id: string;
  readonly name: string;
  isAvailable(): boolean;
  chat(request: AssistantChatRequest): Promise<AssistantChatResponse>;
}

