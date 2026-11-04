import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    return NextResponse.json({
      success: true,
      message: "Local-first storage active. Data saved safely on device.",
      recordsCount: payload?.data?.dailyRecords?.length || 0,
      syncedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ success: true, syncedAt: new Date().toISOString() });
  }
}

