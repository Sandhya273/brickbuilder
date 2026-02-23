"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, Car, PawPrint, Plane } from "lucide-react";
import { Suspense } from "react";  
function IdeasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ideas, setIdeas] = useState([]);
  const [bricks, setBricks] = useState([]);
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
        setIdeas(Array.isArray(parsed.ideas) ? parsed.ideas : []);

      } catch (e) {
        console.error("Session load error:", e);
        setError("Could not load your ideas. Please try generating again.");
      }
    } else {
      setError("No session found. Please go back and generate ideas.");
    }
  }, [searchParams]);

  const handleSelectIdea = (idea) => {
    if (!idea) return;

    const sessionKeyFromUrl = searchParams.get("session");
    if (!sessionKeyFromUrl) {
      setError("Cannot continue — session is missing.");
      return;
    }

    try {
      const sessionKey = sessionKeyFromUrl;

      const currentStored = localStorage.getItem(sessionKey);
      let sessionData = currentStored ? JSON.parse(currentStored) : {
        bricks: [],
        uploadedImage: null,
        ideas: [],
        timestamp: Date.now(),
      };

      sessionData = {
        ...sessionData,
        selectedIdea: idea,
        timestamp: Date.now(),        
      };

      localStorage.setItem(sessionKey, JSON.stringify(sessionData));

      router.push(`/build?session=${sessionKey}`);
    } catch (err) {
      console.error("Failed to save selected idea:", err);
      setError("Something went wrong while selecting this idea.");
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (ideas.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Building Ideas Yet
          </h2>
          <p className="text-gray-600 mb-8">
            Go back to the bricks page and click{" "}
            <strong>"Generate Building Ideas"</strong>.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 pb-20">
      <h1 className="text-4xl font-bold mb-8 text-center">BrickBuilder 🧱</h1>

      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center text-gray-900">
        Your LEGO Building Ideas
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ideas.map((idea, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col"
          >
            <h3 className="font-semibold text-xl mb-6 flex items-center gap-3 text-gray-800">
              {idx === 0 && <Bot className="text-purple-600" size={28} />}
              {idx === 1 && <Car className="text-indigo-600" size={28} />}
              {idx === 2 && <PawPrint className="text-pink-600" size={28} />}
              {idx === 3 && <Plane className="text-sky-600" size={28} />}
              {idea?.name || "Unnamed Idea"}
            </h3>

            <button
              onClick={() => handleSelectIdea(idea)}
              className="mt-auto py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Build This →
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function IdeasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading your LEGO ideas...</p>
          </div>
        </div>
      }
    >
      <IdeasContent />
    </Suspense>
  );
}