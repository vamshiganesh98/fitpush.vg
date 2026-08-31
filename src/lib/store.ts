"use client";

import { AppState, CoachMessage, MealEntry, WeeklyCheckIn, WorkoutEntry } from "./types";
import { DEFAULT_PROFILE } from "./profile";

const STORAGE_KEY = "fitpush-state-v1";

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return { profile: DEFAULT_PROFILE, meals: [], workouts: [], checkIns: [], coachMessages: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { profile: DEFAULT_PROFILE, meals: [], workouts: [], checkIns: [], coachMessages: [] };
    }
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...parsed,
      profile: { ...DEFAULT_PROFILE, ...parsed.profile },
    };
  } catch {
    return { profile: DEFAULT_PROFILE, meals: [], workouts: [], checkIns: [], coachMessages: [] };
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTodayMeals(meals: MealEntry[]) {
  return meals.filter((m) => m.date === todayStr());
}

export function getTodayWorkout(workouts: WorkoutEntry[]) {
  return workouts.find((w) => w.date === todayStr());
}

export function getTodayTotals(meals: MealEntry[]) {
  const today = getTodayMeals(meals);
  return today.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totalCalories,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fat: acc.fat + m.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function addCoachMessage(
  state: AppState,
  msg: Omit<CoachMessage, "id" | "createdAt">
): AppState {
  const entry: CoachMessage = {
    ...msg,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    coachMessages: [entry, ...state.coachMessages].slice(0, 50),
  };
}

export function getLatestCheckIn(checkIns: WeeklyCheckIn[]) {
  return [...checkIns].sort((a, b) => b.date.localeCompare(a.date))[0];
}
