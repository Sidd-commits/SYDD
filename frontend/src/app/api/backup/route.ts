import { NextResponse } from "next/server";
import { getCloudAppData } from "@/lib/supabaseStorage";

export async function GET() {
  const data = await getCloudAppData();
  return NextResponse.json({
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    data,
  });
}
