import { NextResponse } from "next/server";
import initialBackupData from "@/lib/initialHistoricalData.json";

export async function GET() {
  return NextResponse.json(initialBackupData);
}
