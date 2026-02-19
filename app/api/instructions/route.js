import OpenAI from "openai";
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";


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
You are a super happy LEGO magic friend who makes building feel like a fun adventure for 6-year-olds!

Rules:
- Use very simple, short, cheerful words
- Make 6–10 steps only
- Never add new bricks — only use what the child has
- Every step should be clear, vivid, and exciting to imagine
- Be kind, encouraging, and make the child feel proud!

Return ONLY clean JSON — no extra text ever.

Format:

{
  "title": "Short, super-fun title that makes kids smile",
  "steps": [
    {
      "step": 1,
      "text": "Clear, colorful, vivid instruction (easy to picture)",
      "audio_prompt": "Say the same sentence with big excitement and smiles!"
    }
  ]
}

Build idea: ${idea.name}
Available bricks: ${bricks.join(", ")}

Let's make it magical!
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
