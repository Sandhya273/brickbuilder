"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function OpenAIInstructionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [bricks, setBricks] = useState([]);
  const [instructions, setInstructions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speakingStep, setSpeakingStep] = useState(null);

  useEffect(() => {
    const sessionKey = searchParams.get("session");

    if (!sessionKey) {
      setError("No session found. Please select an idea first.");
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(sessionKey);
      if (!stored) throw new Error("Session data not found");

      const parsed = JSON.parse(stored);

      if (Date.now() - parsed.timestamp > 4 * 60 * 60 * 1000) {
        localStorage.removeItem(sessionKey);
        throw new Error("Session expired");
      }

      const idea = parsed.selectedIdea;
      if (!idea) throw new Error("No selected idea found in session");

      setSelectedIdea(idea);
      setBricks(Array.isArray(parsed.bricks) ? parsed.bricks : []);
    } catch (err) {
      console.error("Build page session error:", err);
      setError(err.message || "Failed to load selected idea. Please try again.");
    } finally {
      setLoading(false);
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
          const errorText = await res.text().catch(() => "Unknown error");
          throw new Error(`Server error ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        if (data?.steps && Array.isArray(data.steps)) {
          setInstructions(data);
        } else {
          throw new Error("Invalid response format from instructions API");
        }
      } catch (err) {
        console.error("OpenAI instructions failed:", err);
        setError(
          err.message?.includes("404")
            ? "Instructions service not found — check your API route"
            : err.message || "Failed to generate step-by-step instructions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOpenAIInstructions();
  }, [selectedIdea, bricks]);

  const playVoice = (text, stepIndex) => {
    if (!text?.trim() || typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();

    if (speakingStep === stepIndex) {
      setSpeakingStep(null);
      return;
    }

    setSpeakingStep(stepIndex);

    const utterance = new SpeechSynthesisUtterance(text.trim());

    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      v.lang.includes("en") &&
      (v.name.includes("Google") || v.name.includes("Microsoft") ||
       v.name.includes("Natural") || v.name.includes("Premium"))
    ) || voices.find(v => v.lang.includes("en")) || voices[0];

    if (preferred) utterance.voice = preferred;

    utterance.lang = "en-US";
    utterance.pitch = 1.0;
    utterance.rate = 0.92;
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
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  if (loading && !selectedIdea) {
    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-14 w-14 animate-spin text-purple-600 mx-auto mb-6" />
          <p className="text-xl font-medium text-slate-700">
            Preparing your build instructions...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedIdea || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          <AlertCircle className="h-14 w-14 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error || "No idea selected"}</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
            <div className="min-h-screen flex flex-col">
              <Header/>

    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Build Guide <span className="text-purple-600">🧱</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
            {selectedIdea.name || "Your Selected Build"}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Follow these clear steps to bring your creation to life!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/70 overflow-hidden">
          <div className="p-6 sm:p-10">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mr-4" />
                <span className="text-xl font-medium text-slate-700">
                  Generating detailed steps...
                </span>
              </div>
            ) : instructions?.steps?.length > 0 ? (
              <div className="space-y-8">
                {instructions.steps.map((step, index) => (
                  <div
                    key={step.step || index}
                    className="flex items-start gap-5 sm:gap-6 pb-8 border-b border-slate-200 last:border-0 last:pb-0 group"
                  >
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md">
                        {step.step || index + 1}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed mb-3">
                        {step.text}
                      </p>

                      {step.new_pieces?.length > 0 && (
                        <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <span className="font-semibold text-purple-700">New pieces needed:</span>{" "}
                          {step.new_pieces.join(", ")}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => playVoice(step.text, index)}
                      className={`
                        shrink-0 p-3.5 rounded-full transition-all duration-200
                        ${speakingStep === index
                          ? "bg-purple-600 text-white shadow-lg scale-110"
                          : "bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-105 active:scale-95"
                        }
                      `}
                      title={speakingStep === index ? "Stop reading" : "Read this step aloud"}
                      aria-label={speakingStep === index ? "Stop speech" : "Speak step"}
                    >
                      {speakingStep === index ? (
                        <VolumeX className="w-7 h-7" />
                      ) : (
                        <Volume2 className="w-7 h-7" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-xl text-slate-500 italic">
                  No detailed instructions could be generated yet.
                </p>
                <p className="text-slate-600 mt-3">
                  Try selecting a different idea or refreshing the page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
    <Footer/>
    </div>
  );
}

export default function OpenAIInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="text-center">
            <Loader2 className="h-14 w-14 animate-spin text-purple-600 mx-auto mb-6" />
            <p className="text-xl font-medium text-slate-700">
              Preparing your step-by-step LEGO build guide...
            </p>
          </div>
        </div>
      }
    >
      <OpenAIInstructionsContent />
    </Suspense>
  );
}