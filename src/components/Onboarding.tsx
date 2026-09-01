"use client";

import { useState } from "react";
import { GoalType, OnboardingInput, buildProfile, calculateTargets } from "@/lib/targets";
import { UserProfile } from "@/lib/types";

interface Props {
  onComplete: (profile: UserProfile) => void;
  initial?: UserProfile | null;
  onCancel?: () => void;
}

const STEPS = ["About you", "Your goals", "Diet", "Review"];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Onboarding({ onComplete, initial, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingInput>({
    name: initial?.name ?? "",
    age: initial?.age ?? 27,
    heightCm: initial?.heightCm ?? 170,
    weightKg: initial?.weightKg ?? 70,
    muscleMassKg: initial?.muscleMassKg,
    muscleGoalKg: initial?.muscleGoalKg,
    goalType: "recomposition",
    vegetarian: initial?.vegetarian ?? true,
    eggsAtHome: initial?.eggsAtHome ?? false,
    paneerOk: initial?.paneerOk ?? true,
    officeDays: initial?.officeDays ?? [],
    customGoals: initial?.longTermGoals?.[1] ?? "",
  });

  const update = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOfficeDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      officeDays: prev.officeDays.includes(day)
        ? prev.officeDays.filter((d) => d !== day)
        : [...prev.officeDays, day],
    }));
  };

  const targets = calculateTargets(form);
  const preview = buildProfile(form);

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0 && form.age > 0 && form.heightCm > 0 && form.weightKg > 0;
    return true;
  };

  const finish = () => {
    onComplete(buildProfile(form));
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-8 pt-10 text-white">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-sm font-medium text-emerald-400">FitPush</p>
          <h1 className="mt-1 text-2xl font-bold">
            {initial ? "Update your profile" : "Welcome — let's set you up"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your details stay on this device only. Each person who opens this link gets their own profile.
          </p>
        </header>

        <div className="mb-6 flex gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-zinc-800"}`} />
              <p className={`mt-1 text-[10px] ${i === step ? "text-emerald-400" : "text-zinc-600"}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          {step === 0 && (
            <>
              <Field label="Your name">
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Vamshi"
                  className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Age">
                  <input type="number" value={form.age || ""} onChange={(e) => update("age", Number(e.target.value))} className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white" />
                </Field>
                <Field label="Height (cm)">
                  <input type="number" value={form.heightCm || ""} onChange={(e) => update("heightCm", Number(e.target.value))} className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white" />
                </Field>
                <Field label="Weight (kg)">
                  <input type="number" value={form.weightKg || ""} onChange={(e) => update("weightKg", Number(e.target.value))} className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white" />
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Primary goal">
                <div className="space-y-2">
                  {(
                    [
                      ["recomposition", "Lose fat + gain muscle"],
                      ["muscle", "Gain muscle"],
                      ["fat_loss", "Lose fat / get lean"],
                    ] as [GoalType, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update("goalType", value)}
                      className={`w-full rounded-xl border p-3 text-left text-sm ${
                        form.goalType === value ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Muscle mass now (kg, optional)">
                  <input
                    type="number"
                    value={form.muscleMassKg ?? ""}
                    onChange={(e) => update("muscleMassKg", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 32"
                    className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
                  />
                </Field>
                <Field label="Muscle goal (kg, optional)">
                  <input
                    type="number"
                    value={form.muscleGoalKg ?? ""}
                    onChange={(e) => update("muscleGoalKg", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 35"
                    className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
                  />
                </Field>
              </div>
              <Field label="Anything else you're working toward?">
                <textarea
                  value={form.customGoals}
                  onChange={(e) => update("customGoals", e.target.value)}
                  placeholder="e.g. Lose love handles, fix posture"
                  rows={2}
                  className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
                />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Toggle label="Vegetarian" checked={form.vegetarian} onChange={(v) => update("vegetarian", v)} />
              <Toggle label="Paneer / dairy ok" checked={form.paneerOk} onChange={(v) => update("paneerOk", v)} />
              <Toggle label="Eggs at home" checked={form.eggsAtHome} onChange={(v) => update("eggsAtHome", v)} />
              <Field label="Office days (optional — for meal reminders)">
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleOfficeDay(i)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        form.officeDays.includes(i) ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <p className="text-zinc-400">Coach targets calculated for <strong className="text-white">{form.name}</strong>:</p>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Protein" value={`${targets.protein}g/day`} />
                <Stat label="Calories" value={`${targets.calories}/day`} />
                <Stat label="Max lunch rice" value={`${targets.maxLunchRiceGrams}g`} />
                <Stat label="BMI" value={preview.weightKg && preview.heightCm ? (preview.weightKg / (preview.heightCm / 100) ** 2).toFixed(1) : "—"} />
              </div>
              <p className="text-xs text-zinc-500">
                Data is saved in this browser only. Clearing browser data will reset your profile.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {(step > 0 || onCancel) && (
            <button
              type="button"
              onClick={() => (step > 0 ? setStep((s) => s - 1) : onCancel?.())}
              className="flex-1 rounded-2xl border border-zinc-700 py-4 font-semibold"
            >
              {step > 0 ? "Back" : "Cancel"}
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-2xl bg-emerald-500 py-4 font-bold text-black disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button type="button" onClick={finish} className="flex-1 rounded-2xl bg-emerald-500 py-4 font-bold text-black">
              {initial ? "Save changes" : "Start tracking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border p-3 ${
        checked ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-700"
      }`}
    >
      <span className="text-sm">{label}</span>
      <span className={`text-lg ${checked ? "text-emerald-400" : "text-zinc-600"}`}>{checked ? "✓" : "○"}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-800 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}
