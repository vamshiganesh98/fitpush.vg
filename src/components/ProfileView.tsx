"use client";

import { useApp } from "@/lib/context";
import { WORKOUT_SCHEDULE } from "@/lib/profile";

export default function ProfileView() {
  const { state } = useApp();
  const { profile } = state;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Your profile</h1>
        <p className="text-sm text-zinc-400">Personalized for your goals</p>
      </header>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500">Age</p>
            <p className="font-semibold text-white">{profile.age}</p>
          </div>
          <div>
            <p className="text-zinc-500">Height</p>
            <p className="font-semibold text-white">{profile.heightCm} cm</p>
          </div>
          <div>
            <p className="text-zinc-500">Weight</p>
            <p className="font-semibold text-white">{profile.weightKg} kg</p>
          </div>
          <div>
            <p className="text-zinc-500">Diet</p>
            <p className="font-semibold text-white">Vegetarian</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold text-white">Daily targets</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-zinc-400">Protein</span><span className="text-white">{profile.targets.protein}g</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Calories</span><span className="text-white">{profile.targets.calories}</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Max lunch rice</span><span className="text-white">{profile.targets.maxLunchRiceGrams}g</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold text-white">Diet rules</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>✓ Paneer & curd for protein at home</li>
          <li>✗ No eggs or non-veg at home</li>
          <li>✓ Eggs optional at office (Tue–Thu)</li>
          <li>✓ Post-workout whey within 1 hour</li>
          <li>✓ Breakfast: carb + protein always</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold text-white">Workout schedule</h2>
        <div className="space-y-2 text-sm">
          {Object.entries(WORKOUT_SCHEDULE).map(([day, plan]) => {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return (
              <div key={day} className="flex justify-between">
                <span className="text-zinc-400">{days[Number(day)]}</span>
                <span className="text-white">{plan}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 font-semibold text-white">Stats</h2>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-xl font-bold text-emerald-400">{state.meals.length}</p>
            <p className="text-zinc-500">meals logged</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-400">{state.workouts.length}</p>
            <p className="text-zinc-500">workouts</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-400">{state.checkIns.length}</p>
            <p className="text-zinc-500">check-ins</p>
          </div>
        </div>
      </div>
    </div>
  );
}
