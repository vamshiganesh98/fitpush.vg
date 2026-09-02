import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { localMealAutofill } from "@/lib/local-autofill";
import { UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, profile, mealType, recentMeals } = body as {
    text: string;
    profile: UserProfile;
    mealType: string;
    recentMeals?: string[];
  };

  if (!text?.trim()) {
    return NextResponse.json({ suggestions: [], source: "none" });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({
      suggestions: localMealAutofill(text, profile),
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
          content: `You are a South Indian nutrition assistant. User profile: ${JSON.stringify({
            name: profile.name,
            vegetarian: profile.vegetarian,
            paneerOk: profile.paneerOk,
            eggsAtHome: profile.eggsAtHome,
            proteinTarget: profile.targets.protein,
            maxLunchRice: profile.targets.maxLunchRiceGrams,
          })}. Return JSON: { "suggestions": [{ "label": "short description", "items": [{ "name", "calories", "protein", "carbs", "fat", "grams" }], "totalCalories", "totalProtein", "totalCarbs", "totalFat", "tip" }] }. Give 2-3 autocomplete suggestions for what they're typing. Meal type: ${mealType}. Be realistic for Indian home food.`,
        },
        {
          role: "user",
          content: `Typing: "${text}"\nRecent meals: ${(recentMeals || []).join("; ") || "none"}`,
        },
      ],
      max_tokens: 600,
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
    return NextResponse.json({
      suggestions: parsed.suggestions || localMealAutofill(text, profile),
      source: "openai",
    });
  } catch {
    return NextResponse.json({
      suggestions: localMealAutofill(text, profile),
      source: "local",
    });
  }
}
