import { NextResponse } from "next/server";
import { AssistantController } from "@/lib/assistantEngine/assistantController";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const payload = await req.json();
    const result = await AssistantController.handleChat(payload);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal chat error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

