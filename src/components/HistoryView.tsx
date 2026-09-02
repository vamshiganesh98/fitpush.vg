"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/context";
import WeeklyCheckIn from "./WeeklyCheckIn";
import DatePicker from "./DatePicker";
import { todayStr } from "@/lib/store";

export default function HistoryView() {
  const { state } = useApp();
  const profile = state.profile!;
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showWeekly, setShowWeekly] = useState(false);

  const dates = useMemo(() => {
    const set = new Set<string>();
    state.meals.forEach((m) => set.add(m.date));
    state.workouts.forEach((w) => set.add(w.date));
    state.checkIns.forEach((c) => set.add(c.date));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [state.meals, state.workouts, state.checkIns]);

  const dayMeals = state.meals.filter((m) => m.date === selectedDate);
  const dayWorkout = state.workouts.find((w) => w.date === selectedDate);
  const dayCheckIn = state.checkIns.find((c) => c.date === selectedDate);

  const dayProtein = dayMeals.reduce((s, m) => s + m.totalProtein, 0);
  const dayCals = dayMeals.reduce((s, m) => s + m.totalCalories, 0);

  if (showWeekly) {
    return (
      <div>
        <button type="button" onClick={() => setShowWeekly(false)} className="mb-4 text-sm text-emerald-400">
          ← Back to history
        </button>
        <WeeklyCheckIn />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-sm text-zinc-400">All your data, date by date</p>
        </div>
        <button
          type="button"
          onClick={() => setShowWeekly(true)}
          className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
        >
          Weekly check-in
        </button>
      </header>

      <DatePicker value={selectedDate} onChange={setSelectedDate} label="Pick a date" />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-900 p-3 text-center">
          <p className="text-lg font-bold text-white">{Math.round(dayProtein)}g</p>
          <p className="text-xs text-zinc-500">protein / {profile.targets.protein}g</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-3 text-center">
          <p className="text-lg font-bold text-white">{Math.round(dayCals)}</p>
          <p className="text-xs text-zinc-500">calories</p>
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-semibold text-white">Meals</h2>
        {dayMeals.length === 0 ? (
          <p className="text-sm text-zinc-500">No meals logged this day</p>
        ) : (
          <div className="space-y-2">
            {dayMeals.map((m) => (
              <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <div className="flex justify-between">
                  <span className="capitalize font-medium text-white">{m.mealType}</span>
                  <span className="text-sm text-zinc-400">{Math.round(m.totalProtein)}g protein</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {m.foods.map((f) => f.name).join(", ")}
                </p>
                {m.coachFeedback && (
                  <p className="mt-2 text-xs text-zinc-400 border-t border-zinc-800 pt-2">{m.coachFeedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-white">Workout</h2>
        {!dayWorkout ? (
          <p className="text-sm text-zinc-500">No workout logged this day</p>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <p className="font-medium text-white">{dayWorkout.type}</p>
            {dayWorkout.exercises.map((ex) => (
              <p key={ex.name} className="mt-1 text-sm text-zinc-400">
                {ex.name}: {ex.sets.map((s) => `${s.weight}kg×${s.reps}`).join(", ")}
              </p>
            ))}
          </div>
        )}
      </section>

      {dayCheckIn && (
        <section>
          <h2 className="mb-2 font-semibold text-white">Body metrics</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm">
            <p>Weight: {dayCheckIn.weight} kg</p>
            <p>Waist: {dayCheckIn.waist} cm</p>
            {dayCheckIn.bodyFat != null && <p>Body fat: {dayCheckIn.bodyFat}%</p>}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-semibold text-white">All logged dates</h2>
        <div className="flex flex-wrap gap-2">
          {dates.length === 0 ? (
            <p className="text-sm text-zinc-500">Start logging meals & workouts</p>
          ) : (
            dates.slice(0, 20).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`rounded-full px-3 py-1 text-xs ${
                  d === selectedDate ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {d}
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
