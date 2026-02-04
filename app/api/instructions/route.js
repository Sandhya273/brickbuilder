import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { idea, bricks } = await req.json();

    if (!idea?.name || !Array.isArray(bricks) || bricks.length === 0) {
      return NextResponse.json(
        { error: "Idea or bricks missing" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert LEGO instructor for 6-year-old kids.

Rules:
- Use VERY simple words
- Each step max 10 words
- 6 to 10 steps only
- Do NOT invent new bricks
- Be fun and friendly

Return STRICT JSON only in this format:

{
  "title": "Short fun title",
  "steps": [
    {
      "step": 1,
      "text": "instruction text",
      "audio_prompt": "same instruction, spoken clearly"
    }
  ]
}

Build idea: ${idea.name}
Available bricks: ${bricks.join(", ")}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: "You write LEGO instructions for children." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse failed:", content);
      throw new Error("Invalid OpenAI response format");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("INSTRUCTIONS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate OpenAI instructions" },
      { status: 500 }
    );
  }
}
