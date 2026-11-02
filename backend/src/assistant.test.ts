import { test } from "node:test";
import assert from "node:assert";
import { AssistantService } from "./assistant/assistantService.js";
import { AssistantController } from "./assistant/assistantController.js";
import { lookupFoodCatalog } from "./assistant/nutritionCatalog.js";

test("lookupFoodCatalog finds Indian and global staples", () => {
  const roti = lookupFoodCatalog("roti");
  assert.ok(roti, "Roti should be found");
  assert.strictEqual(roti?.calories, 105);
  assert.strictEqual(roti?.proteinG, 3.2);

  const egg = lookupFoodCatalog("boiled egg");
  assert.ok(egg, "Egg should be found");
  assert.strictEqual(egg?.calories, 72);
  assert.strictEqual(egg?.proteinG, 6.3);

  const banana = lookupFoodCatalog("banana");
  assert.ok(banana, "Banana should be found");
  assert.strictEqual(banana?.calories, 105);

  const paneer = lookupFoodCatalog("paneer");
  assert.ok(paneer, "Paneer should be found");
  assert.strictEqual(paneer?.calories, 265);

  const unknown = lookupFoodCatalog("unknown_extraterrestrial_dish_xyz");
  assert.strictEqual(unknown, undefined);
});

test("AssistantService parses food input and proposes structured nutrition entry", async () => {
  const res = await AssistantService.processChat({
    messages: [
      {
        role: "user",
        content: "I ate 3 eggs, 2 rotis and a banana for breakfast.",
      },
    ],
    context: {
      today: "2026-11-02",
      todayRecord: { caloriesConsumedKcal: 500 },
      goals: {
        stepsPerDay: 8000,
        caloriesConsumedKcalPerDay: 2000,
        proteinGPerDay: 130,
        carbsGPerDay: 225,
        fatGPerDay: 65,
        waterMlPerDay: 2000,
        workoutMinutesPerDay: 30,
        workoutGoalEnabled: true,
      },
    },
  });

  assert.ok(res.reply.includes("Calories:"), "Reply should list calories");
  assert.ok(res.proposedAction, "Proposed action should be created");
  assert.strictEqual(res.proposedAction?.type, "add_nutrition");
  assert.strictEqual(res.proposedAction?.status, "pending");

  const data = res.proposedAction?.data as any;
  assert.ok(data.calories > 400 && data.calories < 650, `Calories (${data.calories}) should be in expected range`);
  assert.ok(data.proteinG > 20, "Protein should be estimated from 3 eggs and 2 rotis");
  assert.strictEqual(data.date, "2026-11-02");
});

test("AssistantService calculates remaining daily macros and answers questions using SYDD context", async () => {
  const res = await AssistantService.processChat({
    messages: [
      {
        role: "user",
        content: "How many calories have I consumed today?",
      },
    ],
    context: {
      today: "2026-11-02",
      todayRecord: { caloriesConsumedKcal: 1450 },
      goals: {
        stepsPerDay: 8000,
        caloriesConsumedKcalPerDay: 2000,
        proteinGPerDay: 130,
        carbsGPerDay: 225,
        fatGPerDay: 65,
        waterMlPerDay: 2000,
        workoutMinutesPerDay: 30,
        workoutGoalEnabled: true,
      },
    },
  });

  assert.ok(res.reply.includes("1,450 kcal"), "Reply should state exact calories consumed");
  assert.ok(res.reply.includes("550 kcal to reach your goal"), "Reply should state remaining calories");
  assert.strictEqual(res.proposedAction, undefined, "Read-only query should not generate proposed action");
});

test("AssistantService calculates remaining protein needed", async () => {
  const res = await AssistantService.processChat({
    messages: [
      {
        role: "user",
        content: "How much protein do I still need today?",
      },
    ],
    context: {
      today: "2026-11-02",
      goals: {
        stepsPerDay: 8000,
        caloriesConsumedKcalPerDay: 2000,
        proteinGPerDay: 130,
        carbsGPerDay: 225,
        fatGPerDay: 65,
        waterMlPerDay: 2000,
        workoutMinutesPerDay: 30,
        workoutGoalEnabled: true,
      },
      todayNutrition: [
        { name: "Eggs", calories: 216, proteinG: 18.9 },
        { name: "Whey shake", calories: 120, proteinG: 24.0 },
      ],
    },
  });

  assert.ok(res.reply.includes("43g"), "Reply should identify ~43g protein logged");
  assert.ok(res.reply.includes("87.1g"), "Reply should calculate ~87.1g protein needed");
});

test("AssistantService proposes water logging with explicit confirmation", async () => {
  const res = await AssistantService.processChat({
    messages: [
      {
        role: "user",
        content: "Log 500ml water",
      },
    ],
    context: {
      today: "2026-11-02",
    },
  });

  assert.ok(res.proposedAction, "Water action should be proposed");
  assert.strictEqual(res.proposedAction?.type, "log_water");
  const data = res.proposedAction?.data as any;
  assert.strictEqual(data.amountMl, 500);
});

test("AssistantController rejects invalid payloads", async () => {
  await assert.rejects(
    async () => {
      await AssistantController.handleChat({} as any);
    },
    /Invalid request: payload.messages must be a non-empty array/
  );
});
