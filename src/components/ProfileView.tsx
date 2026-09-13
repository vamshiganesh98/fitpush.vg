"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { WORKOUT_SCHEDULE, getDietLabel } from "@/lib/profile";
import Onboarding from "./Onboarding";

export default function ProfileView() {
  const { state, completeOnboarding, resetApp } = useApp();
  const profile = state.profile!;
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Onboarding
        initial={profile}
        onCancel={() => setEditing(false)}
        onComplete={(updated) => {
          completeOnboarding(updated);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Your profile</h1>
        <p className="text-sm text-zinc-400">Saved on this device only</p>
      </header>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500">Name</p>
            <p className="font-semibold text-white">{profile.name}</p>
          </div>
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
            <p className="font-semibold text-white">{getDietLabel(profile)}</p>
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
        <h2 className="mb-3 font-semibold text-white">Your goals</h2>
        <ul className="space-y-1 text-sm text-zinc-300">
          {profile.longTermGoals.map((g) => (
            <li key={g}>• {g}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold text-white">Diet preferences</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          {profile.vegetarian && <li>✓ Vegetarian</li>}
          {profile.paneerOk && <li>✓ Paneer / dairy ok</li>}
          {!profile.eggsAtHome && profile.vegetarian && <li>✗ No eggs at home</li>}
          {profile.eggsAtHome && <li>✓ Eggs at home</li>}
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

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
        <h2 className="mb-2 font-semibold text-violet-400">Workouts — openGym</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          For serious gym tracking, AI plans (Gemini/OpenAI), progression, and data on{" "}
          <strong>your server</strong>, use{" "}
          <a
            href="https://opengym.duarte-santos.ch/demo/"
            className="text-violet-300 underline"
            target="_blank"
            rel="noreferrer"
          >
            openGym
          </a>
          . Import your split: see <code className="text-xs">opengym-integration/</code> in this repo.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
        <h2 className="mb-2 font-semibold text-blue-400">Apple Health</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          FitPush (web) <strong>cannot read Apple Health</strong> from Safari — HealthKit needs a native app.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li>✓ Log weight & waist in <strong>History → Weekly check-in</strong></li>
          <li>✓ <strong>openGym</strong> can import body weight from an Apple Health export</li>
          <li>✗ Live sync steps / HR / sleep from Apple Watch — not on web</li>
        </ul>
      </div>

      <button
        onClick={() => setEditing(true)}
        className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white"
      >
        Edit profile
      </button>

      <button
        onClick={() => {
          if (confirm("Reset everything? Your profile, meals, and workouts will be deleted from this browser.")) {
            resetApp();
          }
        }}
        className="w-full rounded-2xl border border-red-500/30 py-4 text-sm font-medium text-red-400"
      >
        Reset all data on this device
      </button>
    </div>
  );
}
