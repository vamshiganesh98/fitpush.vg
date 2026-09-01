"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AppState, MealEntry, UserProfile, WorkoutEntry, WeeklyCheckIn } from "./types";
import { loadState, saveState, addCoachMessage, clearAllData } from "./store";

interface AppContextType {
  state: AppState;
  setState: (updater: AppState | ((prev: AppState) => AppState)) => void;
  completeOnboarding: (profile: UserProfile) => void;
  resetApp: () => void;
  addMeal: (meal: MealEntry) => void;
  addWorkout: (workout: WorkoutEntry) => void;
  addCheckIn: (checkIn: WeeklyCheckIn) => void;
  deleteMeal: (id: string) => void;
  deleteWorkout: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mb-3 text-2xl font-bold">FitPush</div>
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  const setStateSafe = (updater: AppState | ((prev: AppState) => AppState)) => {
    setState((s) => {
      if (!s) return s;
      return typeof updater === "function" ? updater(s) : updater;
    });
  };

  const completeOnboarding = (profile: UserProfile) => {
    setState((s) => (s ? { ...s, profile, onboardingCompleted: true } : s));
  };

  const resetApp = () => {
    clearAllData();
    setState(loadState());
  };

  const addMeal = (meal: MealEntry) => {
    setState((s) => {
      if (!s) return s;
      let next = { ...s, meals: [meal, ...s.meals] };
      if (meal.coachFeedback) {
        next = addCoachMessage(next, {
          date: meal.date,
          type: "meal",
          message: meal.coachFeedback,
          tone: meal.coachFeedback.includes("Weak") || meal.coachFeedback.includes("Too much") ? "warning" : "praise",
        });
      }
      return next;
    });
  };

  const addWorkout = (workout: WorkoutEntry) => {
    setState((s) => {
      if (!s) return s;
      let next = { ...s, workouts: [workout, ...s.workouts.filter((w) => w.date !== workout.date)] };
      if (workout.coachFeedback) {
        next = addCoachMessage(next, {
          date: workout.date,
          type: "workout",
          message: workout.coachFeedback,
          tone: "praise",
        });
      }
      return next;
    });
  };

  const addCheckIn = (checkIn: WeeklyCheckIn) => {
    setState((s) => {
      if (!s) return s;
      let next = { ...s, checkIns: [checkIn, ...s.checkIns] };
      if (checkIn.coachFeedback) {
        next = addCoachMessage(next, {
          date: checkIn.date,
          type: "weekly",
          message: checkIn.coachFeedback,
          tone: "neutral",
        });
      }
      return next;
    });
  };

  const deleteMeal = (id: string) => {
    setState((s) => (s ? { ...s, meals: s.meals.filter((m) => m.id !== id) } : s));
  };

  const deleteWorkout = (id: string) => {
    setState((s) => (s ? { ...s, workouts: s.workouts.filter((w) => w.id !== id) } : s));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setState: setStateSafe,
        completeOnboarding,
        resetApp,
        addMeal,
        addWorkout,
        addCheckIn,
        deleteMeal,
        deleteWorkout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useAppState() {
  const { state } = useApp();
  return state;
}
