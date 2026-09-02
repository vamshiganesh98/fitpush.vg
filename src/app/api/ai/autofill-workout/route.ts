import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { localWorkoutAutofill } from "@/lib/local-autofill";
import { UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, profile, workoutType, history } = body as {
    text: string;
    profile: UserProfile;
    workoutType: string;
    history: { name: string; sets: { reps: number; weight: number }[] }[];
  };

  if (!text?.trim()) {
    return NextResponse.json({ suggestions: [], source: "none" });
  }

  const flatHistory = history || [];

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({
      suggestions: localWorkoutAutofill(text, flatHistory),
      source: "local",
    });
  }

  try {
    const openai = new OpenAI({ apiKey: key });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Fitness coach for ${profile.name}. Workout day: ${workoutType}. Suggest exercise autofill based on typed text and history. Return JSON: { "suggestions": [{ "name", "sets": [{ "reps", "weight" }], "note" }] }. Use kg. Max 3 suggestions.`,
        },
        {
          role: "user",
          content: `Typing exercise: "${text}"\nHistory: ${JSON.stringify(flatHistory.slice(0, 15))}`,
        },
      ],
      max_tokens: 400,
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
    return NextResponse.json({
      suggestions: parsed.suggestions || localWorkoutAutofill(text, flatHistory),
      source: "openai",
    });
  } catch {
    return NextResponse.json({
      suggestions: localWorkoutAutofill(text, flatHistory),
      source: "local",
    });
  }
}
