"use client";

import { useState } from "react";
import { Loader2, Upload, Bot, Car, PawPrint } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [bricks, setBricks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [instructions, setInstructions] = useState(null); 
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
    setError(null);
  };


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
      setError(err.message);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const getInstructions = async (idea) => {
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
        throw new Error("Invalid instructions format");
      }

      setInstructions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        BrickBuilder 🧱
      </h1>

      {/* Upload */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          1. Upload LEGO Photo
        </h2>

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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Analyze Bricks
        </button>
      </div>

      {/* Bricks */}
      {bricks.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Detected Bricks
          </h2>

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
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            Generate Ideas
          </button>
        </div>
      )}

      {/* Ideas */}
      {ideas.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">
            Building Ideas
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {ideas.map((idea, idx) => (
              <div key={idx} className="border rounded-xl p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  {idx === 0 && <Bot className="mr-2" />}
                  {idx === 1 && <Car className="mr-2" />}
                  {idx === 2 && <PawPrint className="mr-2" />}
                  {idea.name}
                </h3>

                <button
                  onClick={() => getInstructions(idea)}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-full"
                >
                  Build This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {instructions && (
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {instructions.title || selectedIdea?.name}
          </h2>

          {instructions.steps.map((step) => (
            <div key={step.step} className="mb-10">
              <p className="font-semibold mb-2">
                Step {step.step}: {step.text}
              </p>

              <img
                src={step.imageUrl}
                alt={`Step ${step.step}`}
                className="w-full max-w-md mx-auto rounded-lg shadow"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-lego.png";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 mt-4 text-center">
          {error}
        </p>
      )}
    </main>
  );
}
