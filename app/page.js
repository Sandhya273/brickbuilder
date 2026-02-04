"use client";

import { useState } from "react";
import {
  Loader2,
  Upload,
  Bot,
  Car,
  PawPrint,
  Volume2,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [bricks, setBricks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [instructions, setInstructions] = useState(null);           
  const [geminiInstructions, setGeminiInstructions] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setBricks([]);
    setIdeas([]);
    setSelectedIdea(null);
    setInstructions(null);
    setGeminiInstructions(null);
    setError(null);
  };

  /*  Analyze Image  */
  const analyzeImage = async () => {
    if (!file) return alert("Please select an image");

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setBricks(Array.isArray(data.bricks) ? data.bricks : []);
    } catch (err) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  /*  Generate Ideas  */
  const generateIdeas = async () => {
    if (bricks.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bricks: bricks.map((b) => `${b.name} (${b.color})`),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
    } catch (err) {
      setError(err.message || "Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  };

  const getOpenAIInstructions = async (idea) => {
    setLoading(true);
    setError(null);
    setSelectedIdea(idea);
    setInstructions(null);

    try {
      const res = await fetch("/api/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          bricks: bricks.map((b) => `${b.name} (${b.color})`),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      if (!data?.steps || !Array.isArray(data.steps)) {
        throw new Error("Invalid OpenAI instructions format");
      }

      setInstructions(data);
    } catch (err) {
      setError(err.message || "OpenAI instructions failed");
    } finally {
      setLoading(false);
    }
  };

  const getGeminiInstructions = async (idea) => {
    setLoading(true);
    setError(null);
    setSelectedIdea(idea);
    setGeminiInstructions(null);

    try {
      const res = await fetch("/api/gemini-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          bricks: bricks.map((b) => `${b.name} (${b.color})`),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      if (!data?.steps || !Array.isArray(data.steps)) {
        throw new Error("Invalid Gemini instructions format");
      }

      setGeminiInstructions(data);
    } catch (err) {
      setError(err.message || "Gemini instructions failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBuildThis = async (idea) => {
    await Promise.allSettled([
      getOpenAIInstructions(idea),
      getGeminiInstructions(idea),
    ]);
  };

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

 const playGeminiVoice = async (text) => {
  if (!text) return;

  try {
    const res = await fetch("/api/text-to-speech-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error("Voice failed");

    const blob = await res.blob();

    console.log("Audio blob size:", blob.size);

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    await audio.play(); 

    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
  } catch (err) {
    console.error(err);
    alert("Voice not available");
  }
};


  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        BrickBuilder 🧱
      </h1>

      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Upload LEGO Photo</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100"
        />

        <button
          onClick={analyzeImage}
          disabled={!file || loading}
          className="mt-4 inline-flex items-center px-6 py-2
            bg-purple-600 text-white rounded-full
            hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Bricks
            </>
          )}
        </button>
      </div>

      {/* Detected Bricks */}
      {bricks.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Detected Bricks</h2>

          <ul className="space-y-2">
            {bricks.map((brick, idx) => (
              <li
                key={idx}
                className="flex justify-between bg-gray-100 px-4 py-2 rounded"
              >
                <span className="font-medium">{brick.name}</span>
                <span className="text-sm text-gray-600">
                  {brick.color}
                  {brick.productId ? ` • ${brick.productId}` : ""}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={generateIdeas}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Ideas"}
          </button>
        </div>
      )}

      {/* Building Ideas */}
      {ideas.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Building Ideas</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {ideas.map((idea, idx) => (
              <div key={idx} className="border rounded-xl p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  {idx === 0 && <Bot className="mr-2 text-purple-600" />}
                  {idx === 1 && <Car className="mr-2 text-indigo-600" />}
                  {idx === 2 && <PawPrint className="mr-2 text-pink-600" />}
                  {idea.name}
                </h3>

                <button
                  onClick={() => handleBuildThis(idea)}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                >
                  {loading ? "Building..." : "Build This"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OpenAI vs Gemini Instructions Comparison */}
{instructions || geminiInstructions ? (
  <div className="mt-10">
    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
      OpenAI vs Gemini — Step-by-Step Instructions
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* OpenAI Card */}
      {instructions && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-shadow">
          <h3 className="text-2xl font-bold text-center mb-6 text-purple-800">
            OpenAI Version — {instructions.title || selectedIdea?.name}
          </h3>

          <div className="space-y-6">
            {instructions.steps.map((step) => (
              <div
                key={step.step}
                className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-lg">
                  {step.step}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900 leading-relaxed">{step.text}</p>

                  {step.new_pieces?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Extra pieces needed: {step.new_pieces.join(", ")}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => playVoice(step.text)}
                  className="p-3 hover:bg-purple-50 rounded-full transition-colors shrink-0"
                  title="Listen with OpenAI voice"
                  aria-label="Play step with OpenAI"
                >
                  <Volume2 className="w-7 h-7 text-purple-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gemini Card */}
      {geminiInstructions && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-200 hover:shadow-xl transition-shadow">
          <h3 className="text-2xl font-bold text-center mb-6 text-indigo-800">
            Gemini Version — {geminiInstructions.title || selectedIdea?.name}
          </h3>

          <div className="space-y-6">
            {geminiInstructions.steps.map((step) => (
              <div
                key={step.step}
                className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-lg">
                  {step.step}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900 leading-relaxed">{step.text}</p>

                  {step.new_pieces?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Extra pieces needed: {step.new_pieces.join(", ")}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => playGeminiVoice(step.text)}
                  className="p-3 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
                  title="Listen with Google voice"
                  aria-label="Play step with Google TTS"
                >
                  <Volume2 className="w-7 h-7 text-indigo-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {instructions && !geminiInstructions && (
      <p className="text-center mt-6 text-gray-500 italic">
        Gemini version is loading... or try refreshing.
      </p>
    )}
    {!instructions && geminiInstructions && (
      <p className="text-center mt-6 text-gray-500 italic">
        OpenAI version is loading... or try refreshing.
      </p>
    )}
  </div>
) : null}
      {error && (
        <p className="text-red-600 mt-6 text-center font-medium">{error}</p>
      )}
    </main>
  );
}