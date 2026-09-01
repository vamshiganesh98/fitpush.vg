"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { getWeeklyCoachFeedback } from "@/lib/coach";
import { getLatestCheckIn, todayStr, uid } from "@/lib/store";
import CoachCard from "./CoachCard";

export default function WeeklyCheckIn() {
  const { state, addCheckIn } = useApp();
  const profile = state.profile!;
  const latest = getLatestCheckIn(state.checkIns);
  const [weight, setWeight] = useState(profile.weightKg.toString());
  const [waist, setWaist] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [postureNotes, setPostureNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"praise" | "warning" | "neutral">("neutral");

  const bmi = weight ? (Number(weight) / Math.pow(profile.heightCm / 100, 2)).toFixed(1) : "—";

  const submit = () => {
    if (!weight || !waist) return;

    const checkIn = {
      id: uid(),
      date: todayStr(),
      weight: Number(weight),
      waist: Number(waist),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      postureNotes: postureNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    const coach = getWeeklyCoachFeedback(checkIn, latest, profile);
    addCheckIn({ ...checkIn, coachFeedback: coach.message });
    setFeedback(coach.message);
    setFeedbackTone(coach.tone);
  };

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Weekly check-in</h1>
        <p className="text-sm text-zinc-400">Sunday morning, empty stomach</p>
      </header>

      {feedback && <CoachCard message={feedback} tone={feedbackTone} title="Weekly report" />}

      {latest && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-400">Last check-in</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-white">{latest.weight} kg</p>
              <p className="text-xs text-zinc-500">weight</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{latest.waist} cm</p>
              <p className="text-xs text-zinc-500">waist</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{latest.bodyFat ?? "—"}%</p>
              <p className="text-xs text-zinc-500">body fat</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
          />
          <p className="mt-1 text-xs text-zinc-500">BMI: {bmi}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-400">Waist at navel (cm) — key for love handles</label>
          <input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="e.g. 82"
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-400">Body fat % (optional)</label>
          <input
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="Smart scale reading"
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-400">Posture notes</label>
          <textarea
            value={postureNotes}
            onChange={(e) => setPostureNotes(e.target.value)}
            placeholder="Shoulders rounded? Lower back pain? Slouching at desk?"
            rows={3}
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
          />
        </div>

        <button
          onClick={submit}
          disabled={!weight || !waist}
          className="w-full rounded-2xl bg-emerald-500 py-4 font-bold text-black disabled:opacity-40"
        >
          Submit weekly check-in
        </button>
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
        <h2 className="mb-2 font-semibold text-violet-400">Muscle goal tracker</h2>
        <p className="text-sm text-zinc-300">
          Current: ~{profile.muscleMassKg} kg → Goal: {profile.muscleGoalKg} kg
        </p>
        <div className="mt-2 h-2 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{
              width: `${Math.min(100, (profile.muscleMassKg / profile.muscleGoalKg) * 100)}%`,
            }}
          />
        </div>
      </div>

      {state.checkIns.length > 1 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 font-semibold text-white">Waist trend</h2>
          <div className="space-y-2">
            {[...state.checkIns]
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(-6)
              .map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{c.date}</span>
                  <span className="text-white">{c.waist} cm</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
