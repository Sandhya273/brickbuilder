import { openai } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json(
        { error: "No image uploaded" },
        { status: 400 }
      );
    }

    // Convert image → base64
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = image.type || "image/png";

    // Call OpenAI Vision
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are analyzing a photo of LEGO bricks.

TASK:
- Identify ALL visible unique LEGO brick types.

RETURN RULES:
- Return ONLY raw JSON
- Do NOT use markdown
- Do NOT wrap in \`\`\`
- Return an ARRAY

Each item must be:
{
  "name": string,
  "color": string,
  "productId": string | null
}
              `,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    // Extract model output
    const raw =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "[]";

    let bricks = [];

    try {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      bricks = JSON.parse(cleaned);
      if (!Array.isArray(bricks)) bricks = [];
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      console.error("RAW MODEL OUTPUT:", raw);
      bricks = [];
    }

    return NextResponse.json({ bricks });

  } catch (err) {
    console.error("ANALYZE IMAGE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to analyze image", details: err.message },
      { status: 500 }
    );
  }
}
