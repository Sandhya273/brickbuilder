
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ideaName, inventory } = body;

    if (!ideaName) {
      return NextResponse.json(
        { error: 'Missing ideaName' },
        { status: 400 }
      );
    }

    
    const prompt = `
You are a creative LEGO builder.
Original build: ${ideaName}

Available bricks: ${inventory || "No specific bricks provided"}

Generate 4 interesting variations.
Return ONLY a valid JSON array like this:

[
  {
    "name": "Turbo Racer",
    "description": "A faster version with aerodynamic parts",
    "difficulty": "Medium",
    "brickUsageDiff": "Uses 6 more wheels and red plates"
  },
  ...
]
    `;

    const fakeVariations = [
      {
        name: "Turbo Version",
        description: "Added big wheels and spoiler for speed",
        difficulty: "Medium",
        brickUsageDiff: "Uses 4 extra wheels",
      },
      {
        name: "Tall Tower",
        description: "Built upwards into a stable tower",
        difficulty: "Easy",
        brickUsageDiff: "Uses more 2x2 and 2x4 bricks",
      },
      {
        name: "Colorful Remix",
        description: "Maximizes the colors you already have",
        difficulty: "Hard",
        brickUsageDiff: "Replaces some pieces with your existing colors",
      },
      {
        name: "Animal Style",
        description: "Transforms into a cute animal shape",
        difficulty: "Medium",
        brickUsageDiff: "Uses rounded and curved pieces if available",
      },
    ];

    
    return NextResponse.json({
      variations: fakeVariations,
    });
  } catch (error) {
    console.error('Generate variations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}