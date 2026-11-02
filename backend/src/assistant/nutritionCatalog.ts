export interface FoodItemReference {
  keywords: string[];
  canonicalName: string;
  servingDescription: string;
  defaultServingGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  category: "indian_staple" | "protein" | "fruit" | "dairy" | "grain" | "other";
}

/**
 * Curated nutrition reference dataset.
 * Calibrated against the Indian Food Composition Tables (IFCT) and USDA FoodData Central.
 */
export const NUTRITION_CATALOG: FoodItemReference[] = [
  // Indian Breads & Grains
  {
    keywords: ["roti", "chapati", "fulka", "phulka"],
    canonicalName: "Roti / Chapati (Whole Wheat, plain)",
    servingDescription: "1 medium roti (~40g dough)",
    defaultServingGrams: 40,
    calories: 105,
    proteinG: 3.2,
    carbsG: 21,
    fatG: 0.5,
    category: "indian_staple",
  },
  {
    keywords: ["roti with ghee", "chapati with ghee", "ghee roti"],
    canonicalName: "Roti with Ghee",
    servingDescription: "1 medium roti with ~1/2 tsp ghee",
    defaultServingGrams: 43,
    calories: 135,
    proteinG: 3.2,
    carbsG: 21,
    fatG: 4.0,
    category: "indian_staple",
  },
  {
    keywords: ["paratha", "plain paratha", "parantha"],
    canonicalName: "Plain Paratha",
    servingDescription: "1 medium paratha (shallow fried)",
    defaultServingGrams: 70,
    calories: 240,
    proteinG: 4.5,
    carbsG: 32,
    fatG: 10.5,
    category: "indian_staple",
  },
  {
    keywords: ["rice", "white rice", "steamed rice", "chawal", "cooked rice"],
    canonicalName: "Cooked White Rice",
    servingDescription: "1 cup / 1 katori cooked (~150g)",
    defaultServingGrams: 150,
    calories: 195,
    proteinG: 4.0,
    carbsG: 43,
    fatG: 0.4,
    category: "grain",
  },
  {
    keywords: ["brown rice", "cooked brown rice"],
    canonicalName: "Cooked Brown Rice",
    servingDescription: "1 cup cooked (~150g)",
    defaultServingGrams: 150,
    calories: 170,
    proteinG: 4.0,
    carbsG: 36,
    fatG: 1.5,
    category: "grain",
  },
  {
    keywords: ["dal", "daal", "yellow dal", "toor dal", "moong dal", "lentils", "dal tadka"],
    canonicalName: "Cooked Dal / Lentil Soup",
    servingDescription: "1 katori / bowl (~150g)",
    defaultServingGrams: 150,
    calories: 150,
    proteinG: 9.0,
    carbsG: 22,
    fatG: 3.0,
    category: "indian_staple",
  },
  {
    keywords: ["idli", "idlis"],
    canonicalName: "Idli",
    servingDescription: "1 medium idli (~45g)",
    defaultServingGrams: 45,
    calories: 60,
    proteinG: 2.0,
    carbsG: 12,
    fatG: 0.3,
    category: "indian_staple",
  },
  {
    keywords: ["dosa", "plain dosa"],
    canonicalName: "Plain Dosa",
    servingDescription: "1 medium dosa (~80g)",
    defaultServingGrams: 80,
    calories: 135,
    proteinG: 3.0,
    carbsG: 22,
    fatG: 4.0,
    category: "indian_staple",
  },
  {
    keywords: ["sambar", "sambhar"],
    canonicalName: "Sambar",
    servingDescription: "1 katori (~150g)",
    defaultServingGrams: 150,
    calories: 95,
    proteinG: 4.0,
    carbsG: 14,
    fatG: 2.5,
    category: "indian_staple",
  },
  {
    keywords: ["poha"],
    canonicalName: "Cooked Poha",
    servingDescription: "1 plate (~150g)",
    defaultServingGrams: 150,
    calories: 220,
    proteinG: 4.0,
    carbsG: 42,
    fatG: 4.5,
    category: "indian_staple",
  },

  // Eggs & Meats
  {
    keywords: ["egg", "eggs", "boiled egg", "whole egg", "boiled eggs"],
    canonicalName: "Whole Egg (boiled / poached)",
    servingDescription: "1 large egg (~50g)",
    defaultServingGrams: 50,
    calories: 72,
    proteinG: 6.3,
    carbsG: 0.4,
    fatG: 4.8,
    category: "protein",
  },
  {
    keywords: ["egg white", "egg whites", "boiled egg white"],
    canonicalName: "Egg White (boiled)",
    servingDescription: "1 large egg white (~33g)",
    defaultServingGrams: 33,
    calories: 17,
    proteinG: 3.6,
    carbsG: 0.2,
    fatG: 0.1,
    category: "protein",
  },
  {
    keywords: ["omelette", "omelet", "fried egg"],
    canonicalName: "Egg Omelette (1 egg with 1 tsp oil)",
    servingDescription: "1 egg omelette",
    defaultServingGrams: 60,
    calories: 110,
    proteinG: 6.5,
    carbsG: 0.8,
    fatG: 9.0,
    category: "protein",
  },
  {
    keywords: ["chicken breast", "boiled chicken", "grilled chicken breast"],
    canonicalName: "Chicken Breast (boneless, cooked)",
    servingDescription: "100g cooked",
    defaultServingGrams: 100,
    calories: 165,
    proteinG: 31.0,
    carbsG: 0.0,
    fatG: 3.6,
    category: "protein",
  },
  {
    keywords: ["chicken curry", "curry chicken"],
    canonicalName: "Chicken Curry (home-style)",
    servingDescription: "1 cup / bowl (~150g)",
    defaultServingGrams: 150,
    calories: 240,
    proteinG: 22.0,
    carbsG: 6.0,
    fatG: 14.0,
    category: "protein",
  },

  // Vegetarian Protein & Dairy
  {
    keywords: ["paneer", "cottage cheese", "raw paneer"],
    canonicalName: "Paneer (fresh raw)",
    servingDescription: "100g",
    defaultServingGrams: 100,
    calories: 265,
    proteinG: 18.3,
    carbsG: 2.5,
    fatG: 20.8,
    category: "protein",
  },
  {
    keywords: ["paneer bhurji", "paneer curry", "paneer sabzi"],
    canonicalName: "Paneer Bhurji / Sabzi",
    servingDescription: "1 cup (~150g)",
    defaultServingGrams: 150,
    calories: 310,
    proteinG: 16.0,
    carbsG: 8.0,
    fatG: 24.0,
    category: "protein",
  },
  {
    keywords: ["curd", "dahi", "yogurt", "plain curd"],
    canonicalName: "Dahi / Curd (Plain whole milk)",
    servingDescription: "1 katori / cup (~150g)",
    defaultServingGrams: 150,
    calories: 90,
    proteinG: 5.0,
    carbsG: 7.0,
    fatG: 5.0,
    category: "dairy",
  },
  {
    keywords: ["milk", "whole milk", "cow milk", "glass of milk"],
    canonicalName: "Whole Milk",
    servingDescription: "1 glass (~250ml)",
    defaultServingGrams: 250,
    calories: 155,
    proteinG: 8.0,
    carbsG: 12.0,
    fatG: 8.5,
    category: "dairy",
  },
  {
    keywords: ["whey protein", "protein powder", "whey"],
    canonicalName: "Whey Protein Powder",
    servingDescription: "1 scoop (~30g powder in water)",
    defaultServingGrams: 30,
    calories: 120,
    proteinG: 24.0,
    carbsG: 2.0,
    fatG: 1.5,
    category: "protein",
  },

  // Fruits & Nuts
  {
    keywords: ["banana", "bananas", "kela"],
    canonicalName: "Banana",
    servingDescription: "1 medium banana (~118g)",
    defaultServingGrams: 118,
    calories: 105,
    proteinG: 1.3,
    carbsG: 27.0,
    fatG: 0.3,
    category: "fruit",
  },
  {
    keywords: ["apple", "apples", "seb"],
    canonicalName: "Apple",
    servingDescription: "1 medium apple (~180g)",
    defaultServingGrams: 180,
    calories: 95,
    proteinG: 0.5,
    carbsG: 25.0,
    fatG: 0.3,
    category: "fruit",
  },
  {
    keywords: ["almonds", "badam"],
    canonicalName: "Almonds",
    servingDescription: "1 handful (~12 nuts, 15g)",
    defaultServingGrams: 15,
    calories: 90,
    proteinG: 3.2,
    carbsG: 3.0,
    fatG: 7.8,
    category: "other",
  },
  {
    keywords: ["peanut butter", "pb"],
    canonicalName: "Peanut Butter",
    servingDescription: "1 tbsp (~16g)",
    defaultServingGrams: 16,
    calories: 95,
    proteinG: 4.0,
    carbsG: 3.2,
    fatG: 8.0,
    category: "other",
  },
  {
    keywords: ["oats", "oatmeal"],
    canonicalName: "Rolled Oats (raw)",
    servingDescription: "1 serving (~40g dry)",
    defaultServingGrams: 40,
    calories: 150,
    proteinG: 5.0,
    carbsG: 27.0,
    fatG: 3.0,
    category: "grain",
  },
];

/**
 * Searches the local nutrition catalog for matching food items.
 */
export function lookupFoodCatalog(foodName: string): FoodItemReference | undefined {
  const normalized = foodName.trim().toLowerCase();
  for (const item of NUTRITION_CATALOG) {
    for (const kw of item.keywords) {
      if (normalized === kw || normalized.includes(kw) || kw.includes(normalized)) {
        return item;
      }
    }
  }
  return undefined;
}
