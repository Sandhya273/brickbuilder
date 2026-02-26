"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, Car, PawPrint, Plane, Lightbulb, Loader2 } from "lucide-react";
import { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

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

    const sessionKey = searchParams.get("session");
    if (!sessionKey) {
      setError("Cannot continue — session is missing.");
      return;
    }

    try {
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
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-red-500 mb-4">
            <Bot size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops!</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-slate-200">
          <Lightbulb size={56} className="mx-auto text-purple-500 mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            No Building Ideas Yet
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Go back to the detected bricks page and click
            <span className="font-semibold text-indigo-600"> "Generate Building Ideas"</span>.
          </p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Return to Bricks
          </button>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen flex flex-col">
          <Header/>

    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Creative Build Ideas <span className="text-purple-600">🧱</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Choose one of these fun LEGO builds you can create with your bricks!
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-2xl hover:border-indigo-300/60 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 sm:p-7 flex flex-col flex-grow">
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 group-hover:scale-110 transition-transform">
                    {idx === 0 && <Bot size={28} />}
                    {idx === 1 && <Car size={28} />}
                    {idx === 2 && <PawPrint size={28} />}
                    {idx === 3 && <Plane size={28} />}
                    {idx > 3 && <Lightbulb size={28} />}
                  </div>

                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-indigo-700 transition-colors">
                    {idea?.name || `Creative Idea ${idx + 1}`}
                  </h3>
                </div>

                {/* Optional: short description if your idea object has it */}
                {idea?.description && (
                  <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">
                    {idea.description}
                  </p>
                )}

                <button
                  onClick={() => handleSelectIdea(idea)}
                  className="mt-auto w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Build This
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer/>
    </div>
  );
}

export default function IdeasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="text-center">
            <Loader2 className="h-14 w-14 animate-spin text-purple-600 mx-auto mb-6" />
            <p className="text-xl font-medium text-slate-700">
              Loading your creative LEGO ideas...
            </p>
          </div>
        </div>
      }
    >
      <IdeasContent />
    </Suspense>
  );
}