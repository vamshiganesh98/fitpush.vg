"use client";

import { AppState, CoachMessage, MealEntry, UserProfile, WeeklyCheckIn, WorkoutEntry } from "./types";

const STORAGE_KEY = "fitpush-state-v2";
const LEGACY_KEY = "fitpush-state-v1";

function emptyState(): AppState {
  return {
    onboardingCompleted: false,
    profile: null,
    meals: [],
    workouts: [],
    checkIns: [],
    coachMessages: [],
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return {
        ...emptyState(),
        ...parsed,
        profile: parsed.profile ?? null,
      };
    }

    // Migrate legacy users who already had data saved
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { profile?: UserProfile } & Omit<AppState, "onboardingCompleted" | "profile">;
      if (parsed.profile?.name) {
        return {
          onboardingCompleted: true,
          profile: parsed.profile,
          meals: parsed.meals ?? [],
          workouts: parsed.workouts ?? [],
          checkIns: parsed.checkIns ?? [],
          coachMessages: parsed.coachMessages ?? [],
        };
      }
    }
  } catch {
    // fall through
  }

  return emptyState();
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
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
