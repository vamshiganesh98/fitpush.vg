import { FoodItem } from "./types";

export const FOODS: FoodItem[] = [
  // Breakfast carbs
  { id: "chapati", name: "Chapati (2)", category: "breakfast", calories: 240, protein: 8, carbs: 44, fat: 4, defaultGrams: 80 },
  { id: "dosa", name: "Dosa (2)", category: "breakfast", calories: 280, protein: 8, carbs: 42, fat: 10, defaultGrams: 150, requiresProteinPairing: true },
  { id: "idli", name: "Idli (3 small)", category: "breakfast", calories: 180, protein: 6, carbs: 36, fat: 1, defaultGrams: 120, requiresProteinPairing: true },
  { id: "rava-idli", name: "Rava Idli (3)", category: "breakfast", calories: 210, protein: 7, carbs: 38, fat: 4, defaultGrams: 130, requiresProteinPairing: true },
  { id: "pongal", name: "Pongal (1 plate)", category: "breakfast", calories: 380, protein: 12, carbs: 52, fat: 14, defaultGrams: 200, requiresProteinPairing: true },
  { id: "upma", name: "Upma (1 plate)", category: "breakfast", calories: 300, protein: 8, carbs: 45, fat: 10, defaultGrams: 180, requiresProteinPairing: true },

  // Protein add-ons (home)
  { id: "curd-1cup", name: "Curd (1 cup)", category: "protein", calories: 120, protein: 8, carbs: 10, fat: 6, defaultGrams: 200 },
  { id: "paneer-60g", name: "Paneer (60g)", category: "protein", calories: 150, protein: 12, carbs: 3, fat: 11, defaultGrams: 60 },
  { id: "paneer-80g", name: "Paneer (80g)", category: "protein", calories: 200, protein: 16, carbs: 4, fat: 15, defaultGrams: 80 },
  { id: "sambar-extra", name: "Extra Sambar (2 ladles)", category: "protein", calories: 80, protein: 5, carbs: 12, fat: 2, defaultGrams: 150 },
  { id: "cosmic-half", name: "Cosmic Protein (half scoop)", category: "protein", calories: 60, protein: 12, carbs: 2, fat: 1, defaultGrams: 15 },
  { id: "cosmic-full", name: "Cosmic Plant Protein", category: "protein", calories: 120, protein: 24, carbs: 4, fat: 2, defaultGrams: 30 },
  { id: "whey-30g", name: "Whey Protein (30g)", category: "protein", calories: 120, protein: 30, carbs: 2, fat: 1, defaultGrams: 30 },
  { id: "amul-protein", name: "Amul Blueberry Protein", category: "protein", calories: 150, protein: 18, carbs: 12, fat: 3, defaultGrams: 200 },
  { id: "piola-oats", name: "Piola Protein Oats + Banana + PB", category: "snack", calories: 420, protein: 18, carbs: 55, fat: 14, defaultGrams: 250 },
  { id: "office-eggs", name: "Eggs (2, office only)", category: "protein", calories: 140, protein: 12, carbs: 1, fat: 10, defaultGrams: 100 },

  // Rice & meals
  { id: "rice-80g", name: "Rice (80g cooked)", category: "rice", calories: 104, protein: 2, carbs: 23, fat: 0, defaultGrams: 80 },
  { id: "rice-100g", name: "Rice (100g cooked)", category: "rice", calories: 130, protein: 3, carbs: 29, fat: 0, defaultGrams: 100 },
  { id: "rice-150g", name: "Rice (150g cooked)", category: "rice", calories: 195, protein: 4, carbs: 43, fat: 0, defaultGrams: 150 },
  { id: "rice-180g", name: "Rice (180g cooked)", category: "rice", calories: 234, protein: 5, carbs: 52, fat: 0, defaultGrams: 180 },
  { id: "rice-300g", name: "Rice (300g cooked) ⚠️", category: "rice", calories: 390, protein: 8, carbs: 87, fat: 0, defaultGrams: 300 },
  { id: "dal", name: "Dal (1 serving)", category: "meal", calories: 150, protein: 9, carbs: 20, fat: 4, defaultGrams: 150 },
  { id: "sambar", name: "Sambar (1 serving)", category: "meal", calories: 120, protein: 6, carbs: 18, fat: 3, defaultGrams: 150 },
  { id: "curd-side", name: "Curd (side)", category: "meal", calories: 80, protein: 5, carbs: 6, fat: 4, defaultGrams: 120 },
  { id: "creatine", name: "Creatine (3g)", category: "supplement", calories: 0, protein: 0, carbs: 0, fat: 0, defaultGrams: 3 },
];

export function getFoodById(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id);
}

export function getFoodsByCategory(category: string): FoodItem[] {
  return FOODS.filter((f) => f.category === category);
}

export function scaleFood(food: FoodItem, grams: number) {
  const base = food.defaultGrams || 100;
  const factor = grams / base;
  return {
    foodId: food.id,
    name: food.name,
    grams,
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fat: Math.round(food.fat * factor * 10) / 10,
  };
}
