
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { idea, bricks } = await req.json();

    if (!idea?.name || !Array.isArray(bricks) || bricks.length === 0) {
      return NextResponse.json(
        { error: "Idea name or bricks list is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a LEGO instructor for 6-year-old kids.

Rules:
- Very simple words
- Short sentences (max 10 words)
- 6 to 10 steps
- Use ONLY given bricks
- Friendly tone

Return STRICT JSON only:

{
  "title": "Fun title",
  "steps": [
    {
      "step": 1,
      "text": "instruction sentence",
      "audio_prompt": "same sentence for voice"
    }
  ]
}

Build idea: ${idea.name}
Available bricks: ${bricks.join(", ")}
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini API error:", res.status, errorText);
      throw new Error(`Gemini API failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log("Gemini full response:", JSON.stringify(data, null, 2));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("GEMINI ROUTE ERROR:", err);
    return NextResponse.json(
      {
        error: "Failed to generate instructions",
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}