"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Volume2 } from "lucide-react";

export default function OpenAIInstructionsPage() {
  const searchParams = useSearchParams();

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [bricks, setBricks] = useState([]);
  const [instructions, setInstructions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchParams) return;

    try {
      const ideaParam = searchParams.get("idea");
      const bricksParam = searchParams.get("bricks");

      if (ideaParam) {
        const parsed = JSON.parse(decodeURIComponent(ideaParam));
        setSelectedIdea(parsed);
      }

      if (bricksParam) {
        const parsedBricks = JSON.parse(decodeURIComponent(bricksParam));
        setBricks(Array.isArray(parsedBricks) ? parsedBricks : []);
      }
    } catch (err) {
      console.error("Failed to parse params:", err);
      setError("Failed to load idea or bricks from URL");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedIdea) return;

    const fetchOpenAIInstructions = async () => {
      setLoading(true);
      setError(null);
      setInstructions(null);

      try {
        const res = await fetch("/api/instructions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: selectedIdea,
            bricks: bricks.map((b) => `${b.name} (${b.color})`),
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();

        if (data?.steps && Array.isArray(data.steps)) {
          setInstructions(data);
        } else {
          throw new Error("Invalid OpenAI instructions format");
        }
      } catch (err) {
        console.error("OpenAI instructions failed:", err);
        setError(err.message || "Failed to load OpenAI instructions");
      } finally {
        setLoading(false);
      }
    };

    fetchOpenAIInstructions();
  }, [selectedIdea, bricks]);

  const playVoice = async (text) => {
    if (!text) return;
    try {
      const res = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("OpenAI TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("OpenAI voice not available right now");
    }
  };

  if (!selectedIdea) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            No idea selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please go back and select an idea first.
          </p>
          <a
            href="/build"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Back to Build
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 pb-20">
      <div className="mt-8 bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
          Step-by-step Instructions for {selectedIdea.name}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
            <span className="text-gray-600 font-medium">Loading instructions...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700 font-medium">
            {error}
          </div>
        ) : instructions ? (
          <div className="space-y-6">
            {instructions.steps.map((step) => (
              <div
                key={step.step}
                className="flex items-start gap-5 border-b border-gray-200 pb-5 last:border-0"
              >
                <div className="bg-purple-600 text-white w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 text-xl">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 leading-relaxed">
                    {step.text}
                  </p>
                  {step.new_pieces?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Extra pieces: {step.new_pieces.join(", ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => playVoice(step.text)}
                  className="p-3 hover:bg-purple-50 rounded-full transition-colors shrink-0"
                  title="Listen with OpenAI voice"
                >
                  <Volume2 className="w-7 h-7 text-purple-700" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            No instructions available yet.
          </p>
        )}
      </div>
    </main>
  );
}