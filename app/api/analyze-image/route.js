import { openai } from "@/lib/openai";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { error: "No image uploaded" },
        { status: 400 }
      );
    }

    // Convert to buffer
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // ✅ Normalize image (ANY format → JPEG)
    const jpegBuffer = await sharp(inputBuffer)
      .rotate() // fix orientation
      .resize(1024, 1024, { fit: "inside" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64 = jpegBuffer.toString("base64");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Identify all visible LEGO bricks.

Return ONLY valid JSON.
Return an ARRAY.

Each item:
{
  "name": string,
  "color": string,
  "productId": string | null
}
              `,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64}`,
            },
          ],
        },
      ],
    });

    const raw =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "[]";

    // --- SAFE JSON PARSE ---
    let bricks = [];
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      bricks = JSON.parse(cleaned);
      if (!Array.isArray(bricks)) bricks = [];
    } catch (e) {
      console.error("JSON parse error:", e);
      console.error("RAW:", raw);
    }

    return NextResponse.json({ bricks });

  } catch (error) {
    console.error("ANALYZE IMAGE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
