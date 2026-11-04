import { NextResponse } from "next/server";
import { applyCloudDeltaSync } from "@/lib/supabaseStorage";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = payload?.data || {};

    const result = await applyCloudDeltaSync({
      dailyRecords: data.dailyRecords,
      workouts: data.workouts,
      nutritionEntries: data.nutritionEntries,
      habits: data.habits,
      habitCompletions: data.habitCompletions,
      workoutRoutines: data.workoutRoutines,
      settings: data.settings,
    });

    return NextResponse.json({
      success: true,
      message: `Data synchronized to cloud successfully (${result.updatedCount} records).`,
      recordsCount: result.updatedCount,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json({
      success: true,
      message,
      syncedAt: new Date().toISOString(),
    });
  }
}
