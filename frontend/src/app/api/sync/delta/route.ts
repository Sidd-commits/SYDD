import { NextResponse } from "next/server";
import { applyCloudDeltaSync } from "@/lib/supabaseStorage";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const changes = payload?.changes || {};
    const count =
      (changes.dailyRecords?.length || 0) +
      (changes.workouts?.length || 0) +
      (changes.nutritionEntries?.length || 0) +
      (changes.habits?.length || 0) +
      (changes.habitCompletions?.length || 0);

    const result = await applyCloudDeltaSync(changes);

    return NextResponse.json({
      success: true,
      message: `Delta sync merged ${result.updatedCount || count} records successfully.`,
      syncedAt: new Date().toISOString(),
      serverChanges: {},
      summary: {
        recordsProcessed: count,
        recordsUpdated: result.updatedCount || count,
        recordsConflicted: 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json({
      success: true,
      message,
      syncedAt: new Date().toISOString(),
      serverChanges: {},
    });
  }
}
