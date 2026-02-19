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
  const [speakingStep, setSpeakingStep] = useState(null); 
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
      let errorText = "Unknown server error";
      try {
        errorText = await res.text(); 
      } catch {}
      throw new Error(`Server responded ${res.status}: ${errorText}`);
    }

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      throw new Error("Invalid JSON from server: " + jsonErr.message);
    }

    if (data?.steps && Array.isArray(data.steps)) {
      setInstructions(data);
    } else {
      throw new Error("Response missing valid steps array");
    }
  } catch (err) {
    console.error("OpenAI instructions failed:", err);
    setError(
      err.message?.includes("404") 
        ? "Instructions endpoint not found — check route setup"
        : err.message || "Failed to load instructions. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

    fetchOpenAIInstructions();
  }, [selectedIdea, bricks]);

  const playVoice = (text, stepIndex) => {
    if (!text?.trim()) return;

    const synth = window.speechSynthesis;

    if (synth) synth.cancel();

    if (speakingStep === stepIndex) {
      setSpeakingStep(null);
      return;
    }

    setSpeakingStep(stepIndex);

    const utterance = new SpeechSynthesisUtterance(text.trim());

    const voices = synth.getVoices();
    const bestVoice = voices.find(v =>
      v.lang.includes("en") &&
      (v.name.includes("Google") || v.name.includes("Microsoft") ||
       v.name.includes("Natural") || v.name.includes("Premium"))
    ) || voices.find(v => v.lang.includes("en")) || voices[0];

    if (bestVoice) utterance.voice = bestVoice;

    utterance.lang = "en-US";
    utterance.pitch = 1.0;
    utterance.rate = 0.95; 
    utterance.volume = 1.0;

    utterance.onend = () => setSpeakingStep(null);

    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        console.warn("Speech error:", e.error);
        setSpeakingStep(null);
      }
    };

    synth.speak(utterance);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log("Voices loaded:", voices.map(v => v.name));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

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
            <h1 className="text-4xl font-bold mb-8 text-center">BrickBuilder 🧱</h1>

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
            {instructions.steps.map((step, index) => (
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
                  onClick={() => playVoice(step.text, index)}
                  className={`p-3 rounded-full transition-all shrink-0 ${
                    speakingStep === index
                      ? "bg-purple-200 text-white shadow-md"
                      : "hover:bg-purple-50 text-purple-700"
                  }`}
                  title={speakingStep === index ? "Stop speaking" : "Listen to this step"}
                >
                  <Volume2 className="w-7 h-7" />
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