
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
        { error: "Missing idea name or bricks list" },
        { status: 400 }
      );
    }

    const planResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an expert at writing super simple LEGO instructions for 6-year-old children.
Use VERY short sentences (max 8–10 words per step).
Use only the bricks provided — do NOT invent new ones.

Output **strictly** this JSON format and nothing else:

{
  "title": "Fun short title",
  "steps": [
    {
      "step": 1,
      "text": "short instruction sentence or empty string",
      "new_pieces": ["2 red 2x4", "1 blue 1x2"],
      "image_prompt": "very detailed prompt for DALL-E to draw this exact step"
    },
    // ... 6 to 10 steps total
  ]
}

Rules for image_prompt:
- Always include: "LEGO building instruction style, clean white background, bright colors, child-friendly, isometric 3/4 view like official LEGO manuals"
- Show only the current model + NEW pieces with black arrows showing exactly where to place them
- New pieces should have a faint red glow or outline
- No extra objects or background clutter
- Consistent scale and angle across steps
- Small step number in top-right corner if possible
          `,
        },
        {
          role: "user",
          content: `
Build: ${idea.name}

Available bricks: ${bricks.join(", ")}

Create 6–10 easy steps.
Make it fun and simple!
          `,
        },
      ],
    });

    const plan = JSON.parse(planResponse.choices[0].message.content);

    const stepsWithImages = await Promise.all(
      plan.steps.map(async (step, index) => {
        const fullPrompt = `
${step.image_prompt}

Step ${step.step} of building "${idea.name}"
LEGO official instruction style for kids, clean white background, bright even lighting, isometric angled view, black arrows and dashed lines showing placement, new pieces highlighted with subtle red outline, only show current build + new pieces floating nearby, no text except tiny step number in corner, friendly and clear, plastic shine
        `.trim();

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard", 
        });

        return {
          ...step,
          imageUrl: imageResponse.data[0].url,
        };
      })
    );

    return NextResponse.json({
      title: plan.title,
      steps: stepsWithImages,
    });
  } catch (err) {
    console.error("Instructions API error:", err);
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}