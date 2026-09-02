import { FOODS } from "./foods";
import { UserProfile } from "./types";

export interface ParsedFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
}

export interface MealSuggestion {
  label: string;
  items: ParsedFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tip?: string;
}

export interface WorkoutSuggestion {
  name: string;
  sets: { reps: number; weight: number }[];
  note?: string;
}

function scoreMatch(text: string, foodName: string): number {
  const t = text.toLowerCase();
  const n = foodName.toLowerCase();
  if (t.includes(n) || n.includes(t)) return 10;
  const words = n.split(/\s+/);
  return words.filter((w) => w.length > 2 && t.includes(w)).length;
}

export function localMealAutofill(text: string, profile: UserProfile): MealSuggestion[] {
  if (!text.trim()) return [];

  const suggestions: MealSuggestion[] = [];
  const matched = FOODS.map((f) => ({ food: f, score: scoreMatch(text, f.name) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (matched.length > 0) {
    const items: ParsedFoodItem[] = matched.map(({ food }) => ({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      grams: food.defaultGrams || 100,
    }));
    const totals = items.reduce(
      (a, i) => ({
        calories: a.calories + i.calories,
        protein: a.protein + i.protein,
        carbs: a.carbs + i.carbs,
        fat: a.fat + i.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    suggestions.push({
      label: items.map((i) => i.name).join(" + "),
      items,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      tip: `Target ${profile.targets.protein}g protein today`,
    });
  }

  suggestions.push({
    label: text.trim(),
    items: [
      {
        name: text.trim(),
        calories: 300,
        protein: 15,
        carbs: 40,
        fat: 8,
        grams: 100,
      },
    ],
    totalCalories: 300,
    totalProtein: 15,
    totalCarbs: 40,
    totalFat: 8,
    tip: "Estimate — adjust after logging if needed",
  });

  return suggestions.slice(0, 3);
}

export function localWorkoutAutofill(
  text: string,
  history: { name: string; sets: { reps: number; weight: number }[] }[]
): WorkoutSuggestion[] {
  const q = text.toLowerCase().trim();
  if (!q) return [];

  const fromHistory = history
    .filter((e) => e.name.toLowerCase().includes(q) || q.includes(e.name.toLowerCase()))
    .slice(0, 3)
    .map((e) => ({
      name: e.name,
      sets: e.sets.filter((s) => s.reps > 0 || s.weight > 0),
      note: "From your last session",
    }));

  if (fromHistory.length > 0) return fromHistory;

  return [
    {
      name: text.trim(),
      sets: [{ reps: 10, weight: 0 }],
      note: "New exercise — enter weight",
    },
  ];
}
