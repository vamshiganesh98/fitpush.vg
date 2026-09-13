"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import {
  chatWithCoach,
  generateDailyPlan,
  DailyAIPlan,
  ChatMessage,
  localDailyPlan,
} from "@/lib/ai-engine";
import { apiUrl } from "@/lib/api-client";
import CoachCard from "./CoachCard";

export default function CoachAI() {
  const { state, setState } = useApp();
  const profile = state.profile!;
  const [plan, setPlan] = useState<DailyAIPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const hasKey = !!profile.geminiApiKey?.trim();

  const runWithKey = async (fn: (key: string) => Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      let key = profile.geminiApiKey?.trim();
      if (!key) {
        const res = await fetch(apiUrl("/api/ai/status"));
        const status = await res.json().catch(() => ({}));
        if (status.hasServerKey) {
          await fn("server");
          return;
        }
        setPlan(localDailyPlan(state, profile));
        setError("Add your free Gemini key in You → AI settings for full AI.");
        return;
      }
      await fn(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed — using local coach");
      setPlan(localDailyPlan(state, profile));
    } finally {
      setLoading(false);
    }
  };

  const loadDailyPlan = () =>
    runWithKey(async (key) => {
      if (key === "server") {
        const res = await fetch(apiUrl("/api/ai/daily-plan"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, state: { meals: state.meals, workouts: state.workouts } }),
        });
        const data = await res.json();
        setPlan(data.plan || localDailyPlan(state, profile));
      } else {
        setPlan(await generateDailyPlan(state, profile, key));
      }
    });

  const sendChat = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", text: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let reply: string;
      const key = profile.geminiApiKey?.trim();
      if (key) {
        reply = await chatWithCoach(state, profile, key, next);
      } else {
        const res = await fetch(apiUrl("/api/ai/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, messages: next, state: { meals: state.meals, workouts: state.workouts } }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
        } else {
          reply =
            "I'm your local coach. Add a free Gemini API key in Profile for smarter answers. For now: hit protein, log meals in Meals tab, and train today.";
        }
      }
      setMessages([...next, { role: "assistant", text: reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          text: "Couldn't reach AI. Check your Gemini key or try again. Keep logging — discipline beats motivation.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = (key: string) => {
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, geminiApiKey: key.trim() || undefined } : s.profile,
    }));
  };

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">AI Coach</h1>
        <p className="text-sm text-zinc-400">Gym + diet in one place — plans & push</p>
      </header>

      {!hasKey && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-amber-400">Free AI with Gemini</p>
          <p className="mt-1 text-zinc-400">
            Get a free key at{" "}
            <a href="https://aistudio.google.com/apikey" className="underline" target="_blank" rel="noreferrer">
              Google AI Studio
            </a>{" "}
            — paste below. Stays on your phone only.
          </p>
          <input
            type="password"
            placeholder="Paste Gemini API key"
            className="mt-3 w-full rounded-xl bg-zinc-800 px-4 py-3 text-white"
            onBlur={(e) => saveKey(e.target.value)}
          />
        </div>
      )}

      {error && <CoachCard message={error} tone="warning" title="AI" />}

      <button
        type="button"
        onClick={loadDailyPlan}
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-500 py-4 font-bold text-black disabled:opacity-50"
      >
        {loading ? "Thinking..." : "✨ Plan my day (meals + workout)"}
      </button>

      {plan && (
        <div className="space-y-3">
          <CoachCard message={plan.coachNote} tone="neutral" title="Today's push" />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="mb-2 font-semibold text-white">Meal ideas (you log manually)</h2>
            {plan.meals.map((m) => (
              <div key={m.mealType} className="mb-3 border-b border-zinc-800 pb-3 last:border-0">
                <p className="capitalize font-medium text-emerald-400">{m.mealType}</p>
                <p className="text-sm text-zinc-300">{m.suggestion}</p>
                <p className="text-xs text-zinc-500">{m.proteinHint}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="mb-2 font-semibold text-white">Gym — {plan.workout.focus}</h2>
            <ul className="list-disc pl-5 text-sm text-zinc-300">
              {plan.workout.exercises.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-amber-400/90">{plan.workout.pushMessage}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 font-semibold text-white">Ask anything</h2>
        <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-zinc-500">e.g. &quot;Am I eating enough protein?&quot; &quot;What should I train today?&quot;</p>
          )}
          {messages.map((m, i) => (
            <p key={i} className={`text-sm ${m.role === "user" ? "text-zinc-400" : "text-zinc-100"}`}>
              {m.role === "user" ? "You: " : "Coach: "}
              {m.text}
            </p>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Ask coach..."
            className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-white"
          />
          <button
            type="button"
            onClick={sendChat}
            disabled={loading}
            className="rounded-xl bg-zinc-700 px-4 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
