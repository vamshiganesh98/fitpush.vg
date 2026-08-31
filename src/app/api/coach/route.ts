import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, context, message } = body;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      message: message || "AI coach available with OPENAI_API_KEY. Rule-based coach is active.",
      source: "rules",
    });
  }

  const systemPrompt = `You are FitPush, a strict but supportive fitness coach for a 27-year-old South Indian vegetarian male (68kg, 179cm). Goals: lose love handles, gain muscle to 35-36kg, improve posture. No eggs/nonveg at home. Paneer and curd for protein. Lunch rice max 180g. Protein target 145g/day. Be direct and actionable. Never shame — push hard with specific fixes.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Type: ${type}\nContext: ${JSON.stringify(context)}` },
        ],
        max_tokens: 200,
      }),
    });

    const data = await res.json();
    const aiMessage = data.choices?.[0]?.message?.content || message;

    return NextResponse.json({ message: aiMessage, source: "openai" });
  } catch {
    return NextResponse.json({ message: message || "Coach unavailable", source: "fallback" });
  }
}
