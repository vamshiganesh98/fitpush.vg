"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/context";
import { WORKOUT_SCHEDULE, getDietLabel } from "@/lib/profile";
import { downloadBackup, importBackup } from "@/lib/export";
import Onboarding from "./Onboarding";
import HistoryView from "./HistoryView";

export default function ProfileView() {
  const { state, completeOnboarding, resetApp, setState } = useApp();
  const profile = state.profile!;
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  if (showHistory) {
    return (
      <div>
        <button type="button" onClick={() => setShowHistory(false)} className="mb-4 text-sm text-emerald-400">
          ← Back to profile
        </button>
        <HistoryView />
      </div>
    );
  }

  const saveGeminiKey = (key: string) => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, geminiApiKey: key.trim() || undefined } : s.profile,
    }));
  };

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">You</h1>
        <p className="text-sm text-zinc-400">One app — diet, gym, AI · free</p>
      </header>

      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
        <h2 className="mb-2 font-semibold text-violet-400">Free AI (Gemini)</h2>
        <p className="text-sm text-zinc-400">
          Get a free key at{" "}
          <a href="https://aistudio.google.com/apikey" className="underline" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          . Stored only on this device.
        </p>
        <input
          type="password"
          value={profile.geminiApiKey || ""}
          onChange={(e) => saveGeminiKey(e.target.value)}
          placeholder="Gemini API key"
          className="mt-3 w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowHistory(true)}
        className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white"
      >
        📅 History & weekly check-in
      </button>

      <button
        type="button"
        onClick={() => downloadBackup(state)}
        className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white"
      >
        ⬇️ Download backup (JSON)
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const data = await importBackup(file);
            setState(data);
            alert("Backup restored!");
          } catch {
            alert("Invalid backup file");
          }
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white"
      >
        ⬆️ Restore from backup
      </button>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500">Name</p>
            <p className="font-semibold text-white">{profile.name}</p>
          </div>
          <div>
            <p className="text-zinc-500">Diet</p>
            <p className="font-semibold text-white">{getDietLabel(profile)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold text-white">Gym week</h2>
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

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-zinc-400">
        <strong className="text-blue-400">Apple Health:</strong> live sync needs a native iOS app. Log weight in History → weekly check-in.
      </div>

      <button onClick={() => setEditing(true)} className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white">
        Edit profile
      </button>

      <button
        onClick={() => {
          if (confirm("Reset everything on this device?")) resetApp();
        }}
        className="w-full rounded-2xl border border-red-500/30 py-4 text-sm text-red-400"
      >
        Reset all data
      </button>
    </div>
  );
}
