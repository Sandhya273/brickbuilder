"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";   

function BricksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [bricks, setBricks] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 useEffect(() => {
  const sessionKey = searchParams.get("session");

  if (sessionKey) {
    try {
      const stored = localStorage.getItem(sessionKey);
      if (!stored) throw new Error("Session not found");

      const parsed = JSON.parse(stored);

      if (Date.now() - parsed.timestamp > 2 * 60 * 60 * 1000) {
        localStorage.removeItem(sessionKey);
        throw new Error("Session expired");
      }

      setBricks(parsed.bricks || []);
      setUploadedImage(parsed.uploadedImage || null);

    } catch (e) {
      console.error("Session load error:", e);
      setError("Could not load your bricks data. Please try uploading again.");
    }
  } else {
    setError("No session found. Please upload a photo first.");
  }
}, [searchParams]);

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
    const ideas = Array.isArray(data.ideas) ? data.ideas : [];

    
    const sessionKeyFromUrl = searchParams.get("session");
    const sessionKey = sessionKeyFromUrl || `brick_session_${Date.now()}`;

    const currentStored = localStorage.getItem(sessionKey);
    let sessionData = currentStored ? JSON.parse(currentStored) : {
      bricks: [],
      uploadedImage: null,
      timestamp: Date.now(),
    };

    sessionData = {
      ...sessionData,
      bricks: bricks,              
      uploadedImage: uploadedImage,
      ideas: ideas,                 
      timestamp: Date.now(),        
    };

    localStorage.setItem(sessionKey, JSON.stringify(sessionData));

    router.push(`/ideas?session=${sessionKey}`);

  } catch (err) {
    setError(err.message || "Failed to generate ideas");
  } finally {
    setLoading(false);
  }
};

  if (bricks.length === 0 && !error) {
    return (
      <div className="p-10 text-center">
        No bricks data found. Please upload a photo first.
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 pb-20">
      <h1 className="text-4xl font-bold mb-8 text-center">BrickBuilder 🧱</h1>

      <h1 className="text-3xl font-bold mb-8 text-center">Detected Bricks</h1>

      {uploadedImage ? (
        <div className="mb-8 text-center">
          <p className="text-lg font-semibold mb-3">Your uploaded photo</p>
          <div className="inline-block rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <img
              src={uploadedImage}
              alt="Uploaded LEGO bricks"
              className="max-w-full h-auto max-h-[300px] object-contain"
              onError={(e) => {
                console.error("Failed to load image thumbnail");
                e.target.src = "/placeholder.jpg";
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-6 italic">
          No photo preview available
        </p>
      )}

      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-lg font-semibold">
            We detected {bricks.length} brick{bricks.length !== 1 ? "s" : ""}
          </h2>

          <button
            onClick={generateIdeas}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Generating..." : "Generate Building Ideas"}
          </button>
        </div>

        <ul className="space-y-2">
          {bricks.map((brick, idx) => (
            <li key={idx} className="flex justify-between bg-gray-100 px-4 py-2 rounded">
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
          className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Generating..." : "Generate Building Ideas"}
        </button>
      </div>

      {error && <p className="text-red-600 text-center mt-6">{error}</p>}
    </main>
  );
}

export default function BricksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    }>
      <BricksContent />
    </Suspense>
  );
}