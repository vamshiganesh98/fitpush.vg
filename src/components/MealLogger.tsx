"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import { getMealCoachFeedback } from "@/lib/coach";
import { getTodayMeals, todayStr, uid } from "@/lib/store";
import { MealType } from "@/lib/types";
import { apiUrl } from "@/lib/api-client";
import { MealSuggestion, localMealAutofill } from "@/lib/local-autofill";
import { useAbortableFetch, useDebouncedValue } from "@/hooks/useDebounced";
import CoachCard from "./CoachCard";
import DatePicker from "./DatePicker";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export default function MealLogger() {
  const { state, addMeal } = useApp();
  const profile = state.profile!;
  const [logDate, setLogDate] = useState(todayStr());
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>("");
  const [selected, setSelected] = useState<MealSuggestion | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"praise" | "warning" | "neutral">("neutral");

  const debouncedText = useDebouncedValue(text, 500);
  const fetchAI = useAbortableFetch();

  useEffect(() => {
    if (!debouncedText.trim() || debouncedText.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const recentMeals = state.meals
        .filter((m) => m.date === logDate)
        .map((m) => m.foods.map((f) => f.name).join(", "));

      const result = await fetchAI<{ suggestions: MealSuggestion[]; source: string }>(
        apiUrl("/api/ai/autofill-meal"),
        { text: debouncedText, profile, mealType, recentMeals }
      );

      if (cancelled) return;
      setSuggestions(result?.suggestions ?? localMealAutofill(debouncedText, profile));
      setAiSource(result?.source ?? "local");
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedText, mealType, logDate, profile, state.meals, fetchAI]);

  const logMeal = () => {
    if (!selected) return;

    const foods = selected.items.map((item, i) => ({
      foodId: `custom-${i}`,
      name: item.name,
      grams: item.grams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    }));

    const dayMeals = state.meals.filter((m) => m.date === logDate);
    const draft = {
      id: uid(),
      date: logDate,
      mealType,
      foods,
      totalCalories: selected.totalCalories,
      totalProtein: selected.totalProtein,
      totalCarbs: selected.totalCarbs,
      totalFat: selected.totalFat,
      createdAt: new Date().toISOString(),
    };

    const coach = getMealCoachFeedback(draft, profile, dayMeals);
    addMeal({ ...draft, coachFeedback: coach.message });
    setFeedback(coach.message);
    setFeedbackTone(coach.tone);
    setText("");
    setSelected(null);
    setSuggestions([]);
  };

  return (
    <div className="space-y-5 pb-28">
      <header>
        <h1 className="text-2xl font-bold text-white">Log meal</h1>
        <p className="text-sm text-zinc-400">Type what you ate — AI autofill as you go</p>
      </header>

      {feedback && <CoachCard message={feedback} tone={feedbackTone} title="Post-meal feedback" />}

      <DatePicker value={logDate} onChange={setLogDate} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize ${
              mealType === t ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative">
        <label className="mb-1.5 block text-sm text-zinc-400">What did you eat?</label>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSelected(null);
          }}
          placeholder="e.g. 2 idli, sambar, curd"
          className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-600"
          autoComplete="off"
        />
        {loading && <p className="mt-1 text-xs text-emerald-400">AI thinking...</p>}
        {aiSource === "openai" && suggestions.length > 0 && (
          <p className="mt-1 text-xs text-violet-400">✨ AI suggestions</p>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-400">Tap to autofill</p>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(s)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selected?.label === s.label
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <p className="font-medium text-white">{s.label}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {Math.round(s.totalCalories)} kcal · {Math.round(s.totalProtein)}g protein
              </p>
              {s.tip && <p className="mt-1 text-xs text-zinc-400">{s.tip}</p>}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-sm font-semibold text-emerald-400">Ready to log</p>
          <p className="mt-1 text-white">{selected.label}</p>
          <p className="text-xs text-zinc-400">
            {Math.round(selected.totalProtein)}g protein · {Math.round(selected.totalCalories)} kcal
          </p>
        </div>
      )}

      <button
        onClick={logMeal}
        disabled={!selected}
        className="fixed bottom-20 left-4 right-4 mx-auto max-w-lg rounded-2xl bg-emerald-500 py-4 text-center font-bold text-black disabled:opacity-40 safe-bottom"
      >
        Log {mealType}
      </button>
    </div>
  );
}
