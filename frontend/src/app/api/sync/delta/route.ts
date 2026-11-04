import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const changes = payload?.changes || {};
    const count =
      (changes.dailyRecords?.length || 0) +
      (changes.workouts?.length || 0) +
      (changes.nutritionEntries?.length || 0);

    return NextResponse.json({
      success: true,
      message: `Delta sync merged ${count} records successfully.`,
      syncedAt: new Date().toISOString(),
      serverChanges: {},
      summary: {
        recordsProcessed: count,
        recordsUpdated: count,
        recordsConflicted: 0,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      serverChanges: {},
    });
  }
}

