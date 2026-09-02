"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/context";
import { DEFAULT_EXERCISES, WORKOUT_SCHEDULE } from "@/lib/profile";
import { getWorkoutCoachFeedback } from "@/lib/coach";
import { todayStr, uid } from "@/lib/store";
import { ExerciseEntry } from "@/lib/types";
import { apiUrl } from "@/lib/api-client";
import { WorkoutSuggestion, localWorkoutAutofill } from "@/lib/local-autofill";
import { useAbortableFetch, useDebouncedValue } from "@/hooks/useDebounced";
import CoachCard from "./CoachCard";
import DatePicker from "./DatePicker";

export default function WorkoutLogger() {
  const { state, addWorkout } = useApp();
  const profile = state.profile!;
  const [logDate, setLogDate] = useState(todayStr());
  const dayOfWeek = new Date(logDate + "T12:00:00").getDay();
  const defaultType = WORKOUT_SCHEDULE[dayOfWeek] || "Custom";
  const [workoutType, setWorkoutType] = useState(defaultType);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [exerciseInput, setExerciseInput] = useState("");
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const debouncedInput = useDebouncedValue(exerciseInput, 450);
  const fetchAI = useAbortableFetch();

  const exerciseHistory = useMemo(() => {
    const map = new Map<string, { reps: number; weight: number }[]>();
    for (const w of state.workouts) {
      for (const ex of w.exercises) {
        if (ex.sets.some((s) => s.weight > 0 || s.reps > 0)) {
          map.set(ex.name.toLowerCase(), ex.sets);
        }
      }
    }
    return Array.from(map.entries()).map(([name, sets]) => ({
      name: state.workouts.flatMap((w) => w.exercises).find((e) => e.name.toLowerCase() === name)?.name || name,
      sets,
    }));
  }, [state.workouts]);

  useEffect(() => {
    setWorkoutType(WORKOUT_SCHEDULE[dayOfWeek] || "Custom");
  }, [logDate, dayOfWeek]);

  useEffect(() => {
    if (!debouncedInput.trim() || debouncedInput.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchAI<{ suggestions: WorkoutSuggestion[] }>(
        apiUrl("/api/ai/autofill-workout"),
        { text: debouncedInput, profile, workoutType, history: exerciseHistory }
      );
      if (cancelled) return;
      setSuggestions(result?.suggestions ?? localWorkoutAutofill(debouncedInput, exerciseHistory));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedInput, workoutType, profile, exerciseHistory, fetchAI]);

  const addExerciseFromSuggestion = (s: WorkoutSuggestion) => {
    if (exercises.some((e) => e.name === s.name)) return;
    setExercises((prev) => [...prev, { name: s.name, sets: s.sets.length ? s.sets : [{ reps: 10, weight: 0 }] }]);
    setExerciseInput("");
    setSuggestions([]);
  };

  const loadTemplate = () => {
    const template = DEFAULT_EXERCISES[workoutType];
    if (template) {
      setExercises(
        template.map((name) => {
          const hist = exerciseHistory.find((h) => h.name.toLowerCase() === name.toLowerCase());
          return { name, sets: hist?.sets.length ? hist.sets : [{ reps: 0, weight: 0 }] };
        })
      );
    }
  };

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) } : ex
      )
    );
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex))
    );
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveWorkout = () => {
    const logged = exercises.filter((e) => e.sets.some((s) => s.reps > 0 || s.weight > 0));
    if (logged.length === 0) return;

    const coach = getWorkoutCoachFeedback(
      { id: "", date: logDate, type: workoutType, exercises: logged, createdAt: "" },
      profile
    );

    addWorkout({
      id: uid(),
      date: logDate,
      type: workoutType,
      exercises: logged,
      coachFeedback: coach.message,
      createdAt: new Date().toISOString(),
    });
    setFeedback(coach.message);
    setExercises([]);
  };

  const workoutTypes = Object.keys(DEFAULT_EXERCISES);

  return (
    <div className="space-y-5 pb-28">
      <header>
        <h1 className="text-2xl font-bold text-white">Log workout</h1>
        <p className="text-sm text-zinc-400">Type exercise name — AI fills weight & reps from history</p>
      </header>

      {feedback && <CoachCard message={feedback} tone="praise" title="Post-workout" />}

      <DatePicker value={logDate} onChange={setLogDate} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {workoutTypes.map((t) => (
          <button
            key={t}
            onClick={() => setWorkoutType(t)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${
              workoutType === t ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button type="button" onClick={loadTemplate} className="text-sm text-emerald-400">
        Load {workoutType} template (with your last weights)
      </button>

      <div>
        <label className="mb-1.5 block text-sm text-zinc-400">Add exercise (type to autofill)</label>
        <input
          value={exerciseInput}
          onChange={(e) => setExerciseInput(e.target.value)}
          placeholder="e.g. Incline DB Press"
          className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
        />
        {loading && <p className="mt-1 text-xs text-emerald-400">AI thinking...</p>}
        {suggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addExerciseFromSuggestion(s)}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800 px-3 py-2 text-left text-sm"
              >
                <span className="text-white">{s.name}</span>
                <span className="text-zinc-500">
                  {s.sets[0] ? `${s.sets[0].weight}kg × ${s.sets[0].reps}` : "+"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {exercises.map((ex, exIdx) => (
        <div key={`${ex.name}-${exIdx}`} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">{ex.name}</h3>
            <button type="button" onClick={() => removeExercise(exIdx)} className="text-xs text-red-400">
              Remove
            </button>
          </div>
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
          <button type="button" onClick={() => addSet(exIdx)} className="mt-1 text-xs text-emerald-400">
            + Add set
          </button>
        </div>
      ))}

      <button
        onClick={saveWorkout}
        disabled={exercises.length === 0}
        className="fixed bottom-20 left-4 right-4 mx-auto max-w-lg rounded-2xl bg-emerald-500 py-4 font-bold text-black disabled:opacity-40 safe-bottom"
      >
        Save workout
      </button>
    </div>
  );
}
