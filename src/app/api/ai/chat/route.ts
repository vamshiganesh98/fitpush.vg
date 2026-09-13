import { NextRequest, NextResponse } from "next/server";
import { chatWithCoach, ChatMessage } from "@/lib/ai-engine";
import { AppState, UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "no_server_key" }, { status: 503 });
  }

  const body = await req.json();
  const profile = body.profile as UserProfile;
  const messages = body.messages as ChatMessage[];
  const partial = body.state as Pick<AppState, "meals" | "workouts">;

  const state: AppState = {
    onboardingCompleted: true,
    profile,
    meals: partial.meals || [],
    workouts: partial.workouts || [],
    checkIns: [],
    coachMessages: [],
  };

  const reply = await chatWithCoach(state, profile, key, messages);
  return NextResponse.json({ reply });
}
