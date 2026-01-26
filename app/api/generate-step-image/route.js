import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { prompt } = await req.json();

  const image = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `
LEGO instruction manual style.
Simple, clean, child-friendly.
White background.
${prompt}
`,
    size: "512x512",
  });

  return NextResponse.json({
    imageUrl: image.data[0].url,
  });
}
