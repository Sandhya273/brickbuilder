import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { idea, bricks } = await req.json();

    const prompt = `
Using only these bricks:
${bricks.join(", ")}

Generate clear 10-step building instructions for:
${idea.name}

Instructions must be simple for a 6-year-old.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      instructions: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("INSTRUCTIONS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}
