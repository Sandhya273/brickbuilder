"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Upload,
  Bot,
  Car,
  PawPrint,
  Volume2,
  Camera, 
} from "lucide-react";

function VariationsSection({ selectedIdea, inventoryText, onSelectVariation }) {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!selectedIdea?.name || variations.length > 0) return;

    let mounted = true;
    setLoading(true);

    const generateVariations = async () => {
      try {
        const res = await fetch("/api/generate-variations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaName: selectedIdea.name,
            inventory: inventoryText,
          }),
        });

        if (!res.ok) throw new Error("Failed to generate variations");

        const data = await res.json();
        const vars = Array.isArray(data.variations) ? data.variations : [];

        if (mounted) {
          const varsWithId = vars.map((v, i) => ({ ...v, id: `var-${i}` }));
          setVariations(varsWithId);
          if (varsWithId.length > 0) {
            setActiveId(varsWithId[0].id);
            onSelectVariation(varsWithId[0]);
          }
        }
      } catch (err) {
        console.error("Variations error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    generateVariations();

    return () => {
      mounted = false;
    };
  }, [selectedIdea?.name, inventoryText]);

  if (!selectedIdea) return null;

  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Variations of {selectedIdea.name}</h2>

      {loading && (
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Generating creative variations...
        </div>
      )}

      {!loading && variations.length === 0 && (
        <p className="text-gray-500">No variations could be generated at this time.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {variations.map((varItem) => (
          <div
            key={varItem.id}
            onClick={() => {
              setActiveId(varItem.id);
              onSelectVariation(varItem);
            }}
            className={`p-5 border rounded-xl cursor-pointer transition-all ${
              activeId === varItem.id
                ? "border-indigo-600 bg-indigo-50 shadow-md"
                : "hover:border-indigo-300 bg-white shadow-sm"
            }`}
          >
            <h3 className="font-semibold text-lg mb-1">{varItem.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {varItem.description}
            </p>
            <div className="text-xs text-gray-500 flex flex-wrap gap-3">
              <span>Difficulty: <strong>{varItem.difficulty}</strong></span>
              {varItem.brickUsageDiff && (
                <span className="text-indigo-700">{varItem.brickUsageDiff}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [bricks, setBricks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [geminiInstructions, setGeminiInstructions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentInstructions, setCurrentInstructions] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const inventoryText = bricks
    .map((b) => `${b.name} (${b.color})`)
    .join(", ") || "No bricks detected yet";

  const handleFileChange = (e) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setBricks([]);
    setIdeas([]);
    setSelectedIdea(null);
    setInstructions(null);
    setGeminiInstructions(null);
    setCurrentInstructions([]);
    setSelectedVariation(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!file) return alert("Please select or take a photo");

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
      setCurrentInstructions(data.steps.map((s) => s.text || s));
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
    await Promise.allSettled([getOpenAIInstructions(idea), getGeminiInstructions(idea)]);
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
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Voice not available");
    }
  };

  useEffect(() => {
    if (selectedIdea) {
      setSelectedVariation(null);
      if (instructions?.steps) {
        setCurrentInstructions(instructions.steps.map((s) => s.text || s));
      }
    }
  }, [selectedIdea, instructions]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">BrickBuilder 🧱</h1>

      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Upload or Take LEGO Photo</h2>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Upload from gallery */}
          <label className="cursor-pointer flex-1">
            <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-sm">
              <Upload className="mr-2 h-5 w-5" />
              Upload Photo
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Take photo with camera */}
          <label className="cursor-pointer flex-1">
            <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
              <Camera className="mr-2 h-5 w-5" />
              Take Photo
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment" 
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <button
          onClick={analyzeImage}
          disabled={!file || loading}
          className="mt-6 w-full inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Analyze Bricks
            </>
          )}
        </button>

        {/* Small hint for mobile users */}
        <p className="mt-3 text-xs text-center text-gray-500">
          On mobile: "Take Photo" opens your camera directly
        </p>
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

      {selectedIdea && (
        <div className="mt-12 bg-white shadow-md rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6">{selectedIdea.name}</h2>

          <VariationsSection
            selectedIdea={selectedIdea}
            inventoryText={inventoryText}
            onSelectVariation={setSelectedVariation}
          />

          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-5">
              {selectedVariation
                ? `Instructions — ${selectedVariation.name}`
                : "Original Instructions"}
            </h3>

            {currentInstructions.length > 0 ? (
              <ol className="list-decimal pl-6 space-y-4 text-gray-800">
                {currentInstructions.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 italic">
                Select a variation or wait for instructions...
              </p>
            )}
          </div>
        </div>
      )}

      {/* OpenAI vs Gemini Comparison */}
      {(instructions || geminiInstructions) && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            OpenAI vs Gemini — Step-by-Step Instructions
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {instructions && (
              <div className="bg-white rounded-2xl shadow-lg p-7 border border-purple-200 hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-center mb-8 text-purple-800">
                  OpenAI Version
                </h3>
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
              </div>
            )}

            {geminiInstructions && (
              <div className="bg-white rounded-2xl shadow-lg p-7 border border-indigo-200 hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-center mb-8 text-indigo-800">
                  Gemini Version
                </h3>
                <div className="space-y-6">
                  {geminiInstructions.steps.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start gap-5 border-b border-gray-200 pb-5 last:border-0"
                    >
                      <div className="bg-indigo-600 text-white w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 text-xl">
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
                        onClick={() => playGeminiVoice(step.text)}
                        className="p-3 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
                        title="Listen with Google voice"
                      >
                        <Volume2 className="w-7 h-7 text-indigo-700" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 mt-8 text-center font-medium">{error}</p>
      )}
    </main>
  );
}