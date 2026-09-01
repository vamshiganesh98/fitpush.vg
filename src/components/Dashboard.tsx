"use client";

import { useApp } from "@/lib/context";
import { getTodayTotals, getTodayMeals, getTodayWorkout, todayStr } from "@/lib/store";
import { getDailyCoachSummary, getPostureReminder } from "@/lib/coach";
import { WORKOUT_SCHEDULE } from "@/lib/profile";
import CoachCard from "./CoachCard";
import ProgressBar from "./ProgressBar";

export default function Dashboard() {
  const { state } = useApp();
  const profile = state.profile!;
  const totals = getTodayTotals(state.meals);
  const todayMeals = getTodayMeals(state.meals);
  const todayWorkout = getTodayWorkout(state.workouts);

  const dayOfWeek = new Date().getDay();
  const todayPlan = WORKOUT_SCHEDULE[dayOfWeek];
  const dailyCoach = getDailyCoachSummary(profile, state.meals, state.workouts, todayStr());
  const posture = getPostureReminder();

  const proteinPct = Math.round((totals.protein / profile.targets.protein) * 100);

  return (
    <div className="space-y-5 pb-4">
      <header>
        <p className="text-sm text-zinc-500">Today</p>
        <h1 className="text-2xl font-bold text-white">
          Hey {profile.name} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {todayPlan} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
        </p>
      </header>

      <CoachCard message={dailyCoach.message} tone={dailyCoach.tone} title="Daily verdict" />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-semibold text-white">Today&apos;s macros</h2>
        <ProgressBar label="Protein" current={totals.protein} target={profile.targets.protein} unit="g" />
        <ProgressBar label="Calories" current={totals.calories} target={profile.targets.calories} unit="" color="bg-blue-500" />
        <ProgressBar label="Carbs" current={totals.carbs} target={profile.targets.carbs} unit="g" color="bg-violet-500" />
        <div className="text-center">
          <span className={`text-3xl font-bold ${proteinPct >= 90 ? "text-emerald-400" : proteinPct >= 70 ? "text-amber-400" : "text-red-400"}`}>
            {proteinPct}%
          </span>
          <p className="text-xs text-zinc-500">protein goal</p>
        </div>
      </div>

      <CoachCard message={posture} tone="neutral" title="Posture check" />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-2xl font-bold text-white">{todayMeals.length}</p>
          <p className="text-xs text-zinc-500">meals logged</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-2xl font-bold text-white">{todayWorkout ? "✓" : "—"}</p>
          <p className="text-xs text-zinc-500">workout today</p>
        </div>
      </div>

      {todayMeals.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 font-semibold text-white">Recent meals</h2>
          <div className="space-y-2">
            {todayMeals.slice(0, 3).map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span className="capitalize text-zinc-300">{m.mealType}</span>
                <span className="text-zinc-500">{Math.round(m.totalProtein)}g protein</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <h2 className="mb-2 font-semibold text-emerald-400">Long-term goals</h2>
        <ul className="space-y-1">
          {profile.longTermGoals.map((g) => (
            <li key={g} className="text-sm text-zinc-300">• {g}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
