"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { FOODS, getFoodById, scaleFood } from "@/lib/foods";
import { getMealCoachFeedback } from "@/lib/coach";
import { getTodayMeals, todayStr, uid } from "@/lib/store";
import { MealType } from "@/lib/types";
import CoachCard from "./CoachCard";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

const CATEGORIES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "protein", label: "Protein add-ons" },
  { key: "rice", label: "Rice" },
  { key: "meal", label: "Dal / Sambar / Curd" },
  { key: "snack", label: "Snacks" },
  { key: "supplement", label: "Supplements" },
];

export default function MealLogger() {
  const { state, addMeal } = useApp();
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"praise" | "warning" | "neutral">("neutral");

  const toggleFood = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const logMeal = () => {
    if (selected.length === 0) return;

    const foods = selected.map((id) => {
      const food = getFoodById(id)!;
      return scaleFood(food, food.defaultGrams || 100);
    });

    const totals = foods.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fat: acc.fat + f.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const todayMeals = getTodayMeals(state.meals);
    const draft = {
      id: uid(),
      date: todayStr(),
      mealType,
      foods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      createdAt: new Date().toISOString(),
    };

    const coach = getMealCoachFeedback(draft, state.profile, todayMeals);
    const meal = { ...draft, coachFeedback: coach.message };

    addMeal(meal);
    setFeedback(coach.message);
    setFeedbackTone(coach.tone);
    setSelected([]);
  };

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Log meal</h1>
        <p className="text-sm text-zinc-400">Coach responds after every meal</p>
      </header>

      {feedback && <CoachCard message={feedback} tone={feedbackTone} title="Post-meal feedback" />}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              mealType === t
                ? "bg-emerald-500 text-black"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {CATEGORIES.map((cat) => {
        const items = FOODS.filter((f) => f.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key}>
            <h2 className="mb-2 text-sm font-semibold text-zinc-400">{cat.label}</h2>
            <div className="grid grid-cols-1 gap-2">
              {items.map((food) => (
                <button
                  key={food.id}
                  onClick={() => toggleFood(food.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    selected.includes(food.id)
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{food.name}</p>
                    <p className="text-xs text-zinc-500">
                      {food.calories} kcal · {food.protein}g protein
                    </p>
                  </div>
                  <span className="text-lg">{selected.includes(food.id) ? "✓" : "+"}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <button
        onClick={logMeal}
        disabled={selected.length === 0}
        className="fixed bottom-20 left-4 right-4 mx-auto max-w-lg rounded-2xl bg-emerald-500 py-4 text-center font-bold text-black transition disabled:opacity-40 safe-bottom"
      >
        Log {mealType} ({selected.length} items)
      </button>
    </div>
  );
}
