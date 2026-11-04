import { NextResponse } from "next/server";
import { AssistantController } from "@/lib/assistantEngine/assistantController";

export async function GET() {
  const status = AssistantController.getStatus();
  return NextResponse.json(status);
}
