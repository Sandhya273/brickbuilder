import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("REQUEST BODY:", body);

    return NextResponse.json({
      ideas: [
        { name: "Simple Robot" },
        { name: "Small Car" },
        { name: "Cute Animal" },
      ],
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "generate-ideas crashed" },
      { status: 500 }
    );
  }
}
