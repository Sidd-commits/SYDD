import { AiProvider } from "./aiProvider.js";
import { AssistantChatRequest, AssistantChatResponse, ProposedAction } from "../types.js";
import { NUTRITION_CATALOG, lookupFoodCatalog } from "../nutritionCatalog.js";

export class FallbackProvider implements AiProvider {
  public readonly id = "local-heuristic";
  public readonly name = "SYDD Offline Heuristics Engine";

  public isAvailable(): boolean {
    return true; // Always available
  }

  public async chat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    const lastMessage = request.messages[request.messages.length - 1];
    const userText = lastMessage?.content?.trim().toLowerCase() || "";
    const ctx = request.context || { today: new Date().toISOString().slice(0, 10) };

    // 1. Check for Macro / Calorie Inquiry: "How many calories have I consumed today?"
    if (
      userText.includes("how many calories") ||
      userText.includes("calories consumed") ||
      userText.includes("calories today") ||
      userText.includes("calories have i had")
    ) {
      const consumed = ctx.todayRecord?.caloriesConsumedKcal ?? 0;
      const goal = ctx.goals?.caloriesConsumedKcalPerDay ?? 2000;
      const diff = goal - consumed;

      return {
        reply: `You have consumed **${consumed.toLocaleString()} kcal** today.\n\n` +
          `• **Daily Goal:** ${goal.toLocaleString()} kcal\n` +
          `• **Remaining:** ${diff >= 0 ? `${diff.toLocaleString()} kcal to reach your goal` : `${Math.abs(diff).toLocaleString()} kcal over your goal`}`,
        providerUsed: this.id,
      };
    }

    // 2. Check for Protein / Macro Remaining Inquiry: "How much protein do I still need today?"
    if (
      userText.includes("how much protein") ||
      userText.includes("protein remaining") ||
      userText.includes("protein need") ||
      userText.includes("protein left")
    ) {
      const loggedProtein = (ctx.todayNutrition || []).reduce(
        (sum, item) => sum + (item.proteinG || 0),
        0
      );
      const proteinGoal = ctx.goals?.proteinGPerDay ?? 130;
      const remainingProtein = Math.max(0, Math.round((proteinGoal - loggedProtein) * 10) / 10);

      return {
        reply: `You have logged **${Math.round(loggedProtein)}g** of protein today.\n\n` +
          `• **Protein Goal:** ${proteinGoal}g\n` +
          `• **Remaining Needed:** **${remainingProtein}g**\n\n` +
          `*Tip: High-protein sources like whole eggs (~6g/egg), chicken breast (~31g/100g), paneer (~18g/100g), or whey (~24g/scoop) can help close the gap.*`,
        providerUsed: this.id,
      };
    }

    // 3. Check for Macros So Far Inquiry: "What are my macros so far?"
    if (
      userText.includes("macros so far") ||
      userText.includes("my macros") ||
      userText.includes("macro breakdown")
    ) {
      const items = ctx.todayNutrition || [];
      const totalCalories = ctx.todayRecord?.caloriesConsumedKcal ?? items.reduce((s, i) => s + i.calories, 0);
      const totalProtein = Math.round(items.reduce((s, i) => s + (i.proteinG || 0), 0));
      const totalCarbs = Math.round(items.reduce((s, i) => s + (i.carbsG || 0), 0));
      const totalFat = Math.round(items.reduce((s, i) => s + (i.fatG || 0), 0));

      const proteinGoal = ctx.goals?.proteinGPerDay ?? 130;
      const carbsGoal = ctx.goals?.carbsGPerDay ?? 225;
      const fatGoal = ctx.goals?.fatGPerDay ?? 65;

      return {
        reply: `Here is your macro summary for today:\n\n` +
          `• **Calories:** ${totalCalories.toLocaleString()} / ${ctx.goals?.caloriesConsumedKcalPerDay ?? 2000} kcal\n` +
          `• **Protein:** ${totalProtein}g / ${proteinGoal}g (${Math.round((totalProtein / proteinGoal) * 100)}%)\n` +
          `• **Carbohydrates:** ${totalCarbs}g / ${carbsGoal}g (${Math.round((totalCarbs / carbsGoal) * 100)}%)\n` +
          `• **Fat:** ${totalFat}g / ${fatGoal}g (${Math.round((totalFat / fatGoal) * 100)}%)\n\n` +
          `*Based on ${items.length} logged nutrition entries today.*`,
        providerUsed: this.id,
      };
    }

    // 4. Check for Consistency Inquiry: "How consistent was I this week?"
    if (
      userText.includes("consistent") ||
      userText.includes("consistency") ||
      userText.includes("streak") ||
      userText.includes("how was my week")
    ) {
      const streak = ctx.streakDays ?? 0;
      const totalDays = ctx.totalActiveDays ?? 0;
      const recentWorkouts = ctx.recentWorkouts?.length ?? 0;

      return {
        reply: `Here is your consistency check:\n\n` +
          `🔥 **Current Streak:** ${streak} consecutive active ${streak === 1 ? "day" : "days"}\n` +
          `🏆 **Total Active Days:** ${totalDays} days on record\n` +
          `💪 **Recent Workouts:** ${recentWorkouts} logged in the past week\n\n` +
          (streak > 0
            ? `You are building great momentum. Keep showing up and stacking days!`
            : `Log today's workout, steps, or habits to start a new streak!`),
        providerUsed: this.id,
      };
    }

    // 5. Check for Goals Focus Inquiry: "What should I focus on to reach my daily goals?"
    if (
      userText.includes("what should i focus on") ||
      userText.includes("reach my goals") ||
      userText.includes("daily goals") ||
      userText.includes("what do i need")
    ) {
      const steps = ctx.todayRecord?.steps ?? 0;
      const stepsGoal = ctx.goals?.stepsPerDay ?? 8000;
      const water = ctx.todayRecord?.waterMl ?? 0;
      const waterGoal = ctx.goals?.waterMlPerDay ?? 2000;
      const calories = ctx.todayRecord?.caloriesConsumedKcal ?? 0;
      const calorieGoal = ctx.goals?.caloriesConsumedKcalPerDay ?? 2000;

      const suggestions: string[] = [];
      if (steps < stepsGoal) {
        suggestions.push(`👟 **Steps:** ${steps.toLocaleString()} / ${stepsGoal.toLocaleString()} (${stepsGoal - steps} steps remaining)`);
      }
      if (water < waterGoal) {
        suggestions.push(`💧 **Hydration:** ${water}ml / ${waterGoal}ml (${waterGoal - water}ml needed)`);
      }
      if (calories < calorieGoal) {
        suggestions.push(`🍽️ **Nutrition:** ${calories} / ${calorieGoal} kcal (${calorieGoal - calories} kcal remaining)`);
      }

      return {
        reply: suggestions.length > 0
          ? `Here is your focus checklist for today:\n\n${suggestions.map((s) => `• ${s}`).join("\n")}\n\n*You are making steady progress!*`
          : `🎉 **Awesome work!** You have met all your primary daily targets for steps, hydration, and nutrition today!`,
        providerUsed: this.id,
      };
    }

    // 6. Natural Language Food Analysis (e.g. "I ate 3 eggs, 2 rotis and a banana")
    const foodProposal = this.parseFoodInput(lastMessage?.content || "", ctx.today);
    if (foodProposal) {
      const { items, totalCalories, totalProtein, totalCarbs, totalFat, proposedAction } = foodProposal;

      const itemLines = items
        .map(
          (i) =>
            `• **${i.quantity}x ${i.name}**: ~${Math.round(i.calories)} kcal (P: ${i.proteinG}g, C: ${i.carbsG}g, F: ${i.fatG}g)`
        )
        .join("\n");

      return {
        reply:
          `Here is the nutritional estimate for your meal:\n\n` +
          `${itemLines}\n\n` +
          `📊 **Total Estimate:**\n` +
          `• **Calories:** **~${totalCalories} kcal**\n` +
          `• **Protein:** **~${totalProtein} g**\n` +
          `• **Carbohydrates:** **~${totalCarbs} g**\n` +
          `• **Fat:** **~${totalFat} g**\n\n` +
          `*Note: Nutritional estimates are approximate based on standard serving sizes. Would you like to log this to today's nutrition log?*`,
        proposedAction,
        providerUsed: this.id,
      };
    }

    // 7. Check for Direct Logging Requests: "Log 500ml water"
    const waterMatch = userText.match(/(?:log|drank|drink|add)\s+(\d{2,4})\s*(?:ml|milliliters?)/i);
    if (waterMatch) {
      const ml = parseInt(waterMatch[1], 10);
      const action: ProposedAction = {
        id: `act-water-${Date.now()}`,
        type: "log_water",
        title: "Log Hydration",
        description: `Add ${ml} ml to today's water intake`,
        data: {
          amountMl: ml,
          mode: "add",
          date: ctx.today,
        },
        status: "pending",
      };
      return {
        reply: `I have prepared a water entry of **+${ml} ml** for today. Please confirm below to save it.`,
        proposedAction: action,
        providerUsed: this.id,
      };
    }

    // 8. General fallback response
    return {
      reply:
        `I am your SYDD AI Fitness Assistant! Here is what I can help you with:\n\n` +
        `• **Estimate Meals & Macros:** *"I had 3 eggs, 2 rotis and a banana"* or *"1 bowl dal and rice"*\n` +
        `• **Daily Check-Ins:** *"How many calories have I consumed today?"* or *"What are my macros so far?"*\n` +
        `• **Goal Guidance:** *"How much protein do I still need?"* or *"What should I focus on?"*\n` +
        `• **Quick Logging:** *"Log 500ml water"*\n\n` +
        `💡 *To enable full generative conversational intelligence with Google Gemini, add your \`GEMINI_API_KEY\` to \`backend/.env\`.*`,
      providerUsed: this.id,
    };
  }

  /**
   * Parses natural language input for multiple food items and quantities.
   */
  private parseFoodInput(
    text: string,
    today: string
  ): {
    items: Array<{ name: string; quantity: number; calories: number; proteinG: number; carbsG: number; fatG: number }>;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    proposedAction: ProposedAction;
  } | null {
    // Splits on commas, "and", "&", "plus"
    const segments = text
      .replace(/^(i ate|i had|i consumed|log|estimate|calculate|for breakfast|for lunch|for dinner)\s+/gi, "")
      .split(/,|\band\b|&|\+/gi)
      .map((s) => s.trim())
      .filter(Boolean);

    const detected: Array<{
      name: string;
      quantity: number;
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
    }> = [];

    for (const seg of segments) {
      // Look for leading number or quantity word (e.g. "3 eggs", "2 rotis", "a banana", "one cup dal")
      const qtyMatch = seg.match(/^(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six)\s+(.+)$/i);
      let qty = 1;
      let foodTerm = seg;

      if (qtyMatch) {
        const rawQty = qtyMatch[1].toLowerCase();
        if (rawQty === "a" || rawQty === "an" || rawQty === "one") qty = 1;
        else if (rawQty === "two") qty = 2;
        else if (rawQty === "three") qty = 3;
        else if (rawQty === "four") qty = 4;
        else if (rawQty === "five") qty = 5;
        else if (rawQty === "six") qty = 6;
        else qty = parseFloat(rawQty) || 1;
        foodTerm = qtyMatch[2].trim();
      }

      // Catalog lookup
      const ref = lookupFoodCatalog(foodTerm);
      if (ref) {
        detected.push({
          name: ref.canonicalName,
          quantity: qty,
          calories: Math.round(ref.calories * qty),
          proteinG: Math.round(ref.proteinG * qty * 10) / 10,
          carbsG: Math.round(ref.carbsG * qty * 10) / 10,
          fatG: Math.round(ref.fatG * qty * 10) / 10,
        });
      }
    }

    if (detected.length === 0) return null;

    const totalCalories = detected.reduce((s, i) => s + i.calories, 0);
    const totalProtein = Math.round(detected.reduce((s, i) => s + i.proteinG, 0) * 10) / 10;
    const totalCarbs = Math.round(detected.reduce((s, i) => s + i.carbsG, 0) * 10) / 10;
    const totalFat = Math.round(detected.reduce((s, i) => s + i.fatG, 0) * 10) / 10;

    const mealName = detected.map((i) => `${i.quantity}x ${i.name.split(" ")[0]}`).join(", ");

    const proposedAction: ProposedAction = {
      id: `act-nutr-${Date.now()}`,
      type: "add_nutrition",
      title: "Add Nutrition Entry",
      description: `Log "${mealName}" (~${totalCalories} kcal, ${totalProtein}g P, ${totalCarbs}g C, ${totalFat}g F)`,
      data: {
        name: mealName,
        calories: totalCalories,
        proteinG: totalProtein,
        carbsG: totalCarbs,
        fatG: totalFat,
        date: today,
        isEstimate: true,
      },
      status: "pending",
    };

    return {
      items: detected,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      proposedAction,
    };
  }
}
