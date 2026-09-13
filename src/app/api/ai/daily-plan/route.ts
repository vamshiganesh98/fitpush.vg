import { NextRequest, NextResponse } from "next/server";
import { generateDailyPlan, localDailyPlan } from "@/lib/ai-engine";
import { AppState, UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const body = await req.json();
  const profile = body.profile as UserProfile;
  const partial = body.state as Pick<AppState, "meals" | "workouts">;

  const state: AppState = {
    onboardingCompleted: true,
    profile,
    meals: partial.meals || [],
    workouts: partial.workouts || [],
    checkIns: [],
    coachMessages: [],
  };

  if (!key) {
    return NextResponse.json({ plan: localDailyPlan(state, profile), source: "local" });
  }

  try {
    const plan = await generateDailyPlan(state, profile, key);
    return NextResponse.json({ plan, source: "gemini" });
  } catch {
    return NextResponse.json({ plan: localDailyPlan(state, profile), source: "local" });
  }
}
