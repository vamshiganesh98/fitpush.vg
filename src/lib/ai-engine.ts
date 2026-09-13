import { AppState, UserProfile } from "./types";
import { WORKOUT_SCHEDULE } from "./profile";
import { todayStr } from "./store";

export interface DailyAIPlan {
  meals: { mealType: string; suggestion: string; proteinHint: string }[];
  workout: { focus: string; exercises: string[]; pushMessage: string };
  coachNote: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function buildContext(state: AppState, profile: UserProfile): string {
  const today = todayStr();
  const meals = state.meals.filter((m) => m.date === today);
  const workout = state.workouts.find((w) => w.date === today);
  const day = new Date().getDay();
  const plan = WORKOUT_SCHEDULE[day];

  return JSON.stringify({
    profile: {
      name: profile.name,
      age: profile.age,
      weightKg: profile.weightKg,
      vegetarian: profile.vegetarian,
      paneerOk: profile.paneerOk,
      eggsAtHome: profile.eggsAtHome,
      targets: profile.targets,
      goals: profile.longTermGoals,
    },
    today,
    scheduledWorkout: plan,
    mealsLoggedToday: meals.map((m) => ({
      type: m.mealType,
      protein: m.totalProtein,
      foods: m.foods.map((f) => f.name).join(", "),
    })),
    workoutLoggedToday: workout
      ? { type: workout.type, exercises: workout.exercises.map((e) => e.name) }
      : null,
    recentWorkouts: state.workouts.slice(0, 5).map((w) => w.type + " " + w.date),
  });
}

export async function callGemini(apiKey: string, system: string, userPrompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gemini API failed");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

const COACH_SYSTEM = `You are FitPush AI — one app for gym + South Indian diet. Be direct, push the user hard but constructively. 
Focus: recomposition, love handles, muscle gain, posture. Vegetarian rules from profile. 
Always give actionable next steps. Short paragraphs.`;

export async function generateDailyPlan(state: AppState, profile: UserProfile, apiKey: string): Promise<DailyAIPlan> {
  const prompt = `Based on this data, return ONLY valid JSON (no markdown):
{
  "meals": [{"mealType":"breakfast|lunch|snack|dinner","suggestion":"specific South Indian foods","proteinHint":"grams estimate"}],
  "workout": {"focus":"today's gym focus","exercises":["4-6 exercises with sets"],"pushMessage":"tough love if behind"},
  "coachNote":"one paragraph daily push"
}
Data: ${buildContext(state, profile)}`;

  const raw = await callGemini(apiKey, COACH_SYSTEM, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as DailyAIPlan;
    } catch {
      /* fall through */
    }
  }

  return localDailyPlan(state, profile);
}

export async function chatWithCoach(
  state: AppState,
  profile: UserProfile,
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const history = messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`)
    .join("\n");

  const prompt = `Context: ${buildContext(state, profile)}\n\nConversation:\n${history}\n\nReply as coach:`;
  return callGemini(apiKey, COACH_SYSTEM, prompt);
}

export function localDailyPlan(state: AppState, profile: UserProfile): DailyAIPlan {
  const day = new Date().getDay();
  const plan = WORKOUT_SCHEDULE[day];
  const protein = profile.targets.protein;
  const paneer = profile.paneerOk ? "paneer or curd" : "dal + protein shake";

  return {
    meals: [
      {
        mealType: "breakfast",
        suggestion: profile.vegetarian
          ? `Dosa or idli + ${paneer}`
          : "High-protein breakfast",
        proteinHint: `aim 25g+ (${protein}g daily)`,
      },
      {
        mealType: "lunch",
        suggestion: `Rice max ${profile.targets.maxLunchRiceGrams}g + sambar + curd`,
        proteinHint: "30g+ at lunch",
      },
      {
        mealType: "dinner",
        suggestion: `Light rice + dal; post-gym whey if training`,
        proteinHint: "35g+ if gym day",
      },
    ],
    workout: {
      focus: plan,
      exercises: ["Log each exercise in Gym tab with weights from last session"],
      pushMessage:
        state.workouts.find((w) => w.date === todayStr())
          ? "Good — workout logged. Hit protein tonight."
          : `No workout logged. Today is ${plan} — get it done.`,
    },
    coachNote: `You're on FitPush — diet + gym in one place. Hit ${protein}g protein and train ${plan}. No excuses on love handles.`,
  };
}
