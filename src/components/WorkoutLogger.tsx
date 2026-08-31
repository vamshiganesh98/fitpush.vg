"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { DEFAULT_EXERCISES, WORKOUT_SCHEDULE } from "@/lib/profile";
import { getWorkoutCoachFeedback } from "@/lib/coach";
import { todayStr, uid } from "@/lib/store";
import { ExerciseEntry } from "@/lib/types";
import CoachCard from "./CoachCard";

export default function WorkoutLogger() {
  const { state, addWorkout } = useApp();
  const dayOfWeek = new Date().getDay();
  const defaultType = WORKOUT_SCHEDULE[dayOfWeek] || "Custom";
  const [workoutType, setWorkoutType] = useState(defaultType);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(
    (DEFAULT_EXERCISES[defaultType] || ["Custom Exercise"]).map((name) => ({
      name,
      sets: [{ reps: 0, weight: 0 }],
    }))
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)),
            }
          : ex
      )
    );
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex
      )
    );
  };

  const changeWorkoutType = (type: string) => {
    setWorkoutType(type);
    const template = DEFAULT_EXERCISES[type];
    if (template) {
      setExercises(template.map((name) => ({ name, sets: [{ reps: 0, weight: 0 }] })));
    }
  };

  const saveWorkout = () => {
    const coach = getWorkoutCoachFeedback(
      { id: "", date: todayStr(), type: workoutType, exercises, createdAt: "" },
      state.profile
    );

    const workout = {
      id: uid(),
      date: todayStr(),
      type: workoutType,
      exercises: exercises.filter((e) => e.sets.some((s) => s.reps > 0 || s.weight > 0)),
      coachFeedback: coach.message,
      createdAt: new Date().toISOString(),
    };

    addWorkout(workout);
    setFeedback(coach.message);
  };

  const workoutTypes = Object.keys(DEFAULT_EXERCISES);

  return (
    <div className="space-y-5 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-white">Log workout</h1>
        <p className="text-sm text-zinc-400">Track sets, reps & weight for progress</p>
      </header>

      {feedback && <CoachCard message={feedback} tone="praise" title="Post-workout" />}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {workoutTypes.map((t) => (
          <button
            key={t}
            onClick={() => changeWorkoutType(t)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
              workoutType === t ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {exercises.map((ex, exIdx) => (
        <div key={ex.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 font-semibold text-white">{ex.name}</h3>
          {ex.sets.map((set, setIdx) => (
            <div key={setIdx} className="mb-2 flex items-center gap-2">
              <span className="w-8 text-sm text-zinc-500">S{setIdx + 1}</span>
              <input
                type="number"
                placeholder="kg"
                value={set.weight || ""}
                onChange={(e) => updateSet(exIdx, setIdx, "weight", Number(e.target.value))}
                className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-white"
              />
              <span className="text-zinc-500">×</span>
              <input
                type="number"
                placeholder="reps"
                value={set.reps || ""}
                onChange={(e) => updateSet(exIdx, setIdx, "reps", Number(e.target.value))}
                className="w-20 rounded-lg bg-zinc-800 px-3 py-2 text-white"
              />
            </div>
          ))}
          <button
            onClick={() => addSet(exIdx)}
            className="mt-1 text-xs text-emerald-400"
          >
            + Add set
          </button>
        </div>
      ))}

      <button
        onClick={saveWorkout}
        className="w-full rounded-2xl bg-emerald-500 py-4 font-bold text-black"
      >
        Save workout
      </button>

      {state.workouts.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 font-semibold text-white">Recent PRs</h2>
          {state.workouts.slice(0, 3).map((w) => (
            <div key={w.id} className="mb-2 text-sm">
              <p className="text-zinc-400">{w.date} — {w.type}</p>
              {w.exercises.slice(0, 2).map((e) => {
                const best = e.sets.reduce((b, s) => (s.weight > b.weight ? s : b), e.sets[0]);
                return best ? (
                  <p key={e.name} className="text-zinc-300">
                    {e.name}: {best.weight}kg × {best.reps}
                  </p>
                ) : null;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
