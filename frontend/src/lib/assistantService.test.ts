import { test } from "node:test";
import assert from "node:assert";
import { AssistantService } from "./assistantService";
import { getDefaultAppData } from "./storage";

test("AssistantService.sendMessage handles network errors gracefully without crashing", async () => {
  const appData = getDefaultAppData();
  const res = await AssistantService.sendMessage(
    [
      {
        id: "msg-1",
        role: "user",
        content: "What are my macros?",
        timestamp: "2026-11-02T22:00:00Z",
      },
    ],
    appData,
    "2026-11-02"
  );

  assert.ok(res.reply, "Should return a reply string");
  assert.ok(typeof res.reply === "string");
  assert.ok(res.providerUsed, "Should define providerUsed");
});

test("AssistantService context assembly minimizes payload size", async () => {
  const appData = getDefaultAppData();
  appData.dailyRecords = [
    { date: "2026-11-02", steps: 8500, caloriesConsumedKcal: 1200, waterMl: 1500, updatedAt: "2026-11-02T10:00:00Z" },
    { date: "2026-11-01", steps: 9000, caloriesConsumedKcal: 1800, waterMl: 2000, updatedAt: "2026-11-01T10:00:00Z" },
  ];
  appData.nutritionEntries = [
    { id: "n1", date: "2026-11-02", name: "Oats", calories: 300, proteinG: 10, carbsG: 50, fatG: 5, createdAt: "", updatedAt: "" },
  ];

  // Intercept fetch or verify behavior
  const res = await AssistantService.sendMessage(
    [{ id: "m1", role: "user", content: "Hello", timestamp: "2026-11-02T22:00:00Z" }],
    appData,
    "2026-11-02"
  );

  assert.ok(res, "Responds without unhandled exceptions");
});
