
export async function generateVariations(buildName, inventoryText) {
  if (!buildName) return [];

  const prompt = `
You are a creative LEGO builder AI.

Original build: ${buildName}

Available bricks (ONLY use these or note very minimal missing ones):
${inventoryText || "No brick inventory provided"}

Generate **exactly 4** interesting variations of the original build.
Each variation must have:
- catchy name (short and fun)
- short description (1 sentence)
- difficulty: "Easy" OR "Medium" OR "Hard"
- brickUsageDiff: short explanation of brick changes (e.g. "Uses more wheels", "Replaces roof with your green pieces")
- missingBricks: array of objects like [{ "type": "1x2", "color": "black", "qty": 2 }] — empty [] if no missing pieces

Return **only** a valid JSON array — nothing else:

[
  {
    "name": "Racing Version",
    "description": "A faster version with spoiler and stripes.",
    "difficulty": "Medium",
    "brickUsageDiff": "Uses 4 more red 1x4 tiles",
    "missingBricks": []
  },
  ...
]
`;

  try {
    const res = await fetch('/api/openai', {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || data.text || '';

    content = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');

    const parsed = JSON.parse(content);
    return Array.isArray(parsed)
      ? parsed.map((v, i) => ({ ...v, id: `var-${i}` }))
      : [];
  } catch (err) {
    console.error('Variations failed:', err);
    return [];
  }
}