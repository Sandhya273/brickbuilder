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
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    const ideasParam = searchParams.get("ideas");
    const bricksParam = searchParams.get("bricks");

    console.log("Raw ideas param:", ideasParam);
    console.log("Raw bricks param:", bricksParam);

    setParseError(null);

    try {
      if (ideasParam) {
        const decoded = decodeURIComponent(ideasParam);
        const parsed = JSON.parse(decoded);
        console.log("Parsed ideas:", parsed);
        setIdeas(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error("Failed to parse ideas:", err);
      setParseError("Could not read the list of ideas from the URL");
    }

    try {
      if (bricksParam) {
        const decoded = decodeURIComponent(bricksParam);
        const parsed = JSON.parse(decoded);
        console.log("Parsed bricks:", parsed);
        setBricks(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error("Failed to parse bricks:", err);
      setParseError((prev) =>
        prev ? `${prev} and bricks` : "Could not read bricks from the URL"
      );
    }
  }, [searchParams]);

  const handleSelectIdea = (idea) => {
    if (!idea) return;

    try {
      const ideaParam = encodeURIComponent(JSON.stringify(idea));
      const bricksParam = encodeURIComponent(JSON.stringify(bricks));
      console.log("Navigating to build → idea:", idea.name);
      router.push(`/build?idea=${ideaParam}&bricks=${bricksParam}`);
    } catch (err) {
      console.error("Failed to encode navigation params:", err);
      alert("Something went wrong while selecting this idea. Please try again.");
    }
  };

  if (parseError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Loading Error</h2>
          <p className="text-gray-700 mb-6">{parseError}</p>
          <p className="text-sm text-gray-500 mb-8">
            Try going back to the previous page and generating ideas again.
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