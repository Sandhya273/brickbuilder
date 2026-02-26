"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Lightbulb } from "lucide-react";
import { Suspense } from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

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

      const sessionKey = searchParams.get("session") || `brick_session_${Date.now()}`;

      const currentStored = localStorage.getItem(sessionKey);
      let sessionData = currentStored ? JSON.parse(currentStored) : {
        bricks: [],
        uploadedImage: null,
        timestamp: Date.now(),
      };

      sessionData = {
        ...sessionData,
        bricks,
        uploadedImage,
        ideas,
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
      <div className="flex items-center justify-center min-h-[70vh] text-slate-500 text-lg">
        No bricks detected yet — try uploading a clearer photo
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
          <Header/>
    
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Your Bricks <span className="text-purple-600">🧱</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          We found these pieces in your photo. Let's turn them into cool builds!
        </p>
      </div>

      {/* Uploaded image preview */}
      {uploadedImage && (
        <div className="mb-12 text-center">
          <div className="inline-block rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-100/60 bg-white">
            <img
              src={uploadedImage}
              alt="Your uploaded LEGO bricks"
              className="max-w-full h-auto max-h-[420px] object-contain transition-transform hover:scale-[1.01]"
              onError={(e) => {
                e.target.src = "/placeholder-bricks.jpg";
              }}
            />
          </div>
          <p className="mt-4 text-sm text-slate-500 italic">
            Your original photo
          </p>
        </div>
      )}

      {/* Detected bricks section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Detected {bricks.length} brick{bricks.length !== 1 ? "s" : ""}
            </h2>

            <button
              onClick={generateIdeas}
              disabled={loading || bricks.length === 0}
              className={`
                px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 min-w-[240px]
                ${loading
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl active:scale-[0.98]"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="h-6 w-6" />
                  Generate Building Ideas
                </>
              )}
            </button>
          </div>

          {bricks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bricks.map((brick, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200"
                >
                  <div className="font-semibold text-slate-800 text-lg mb-1">
                    {brick.name}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div
                      className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0"
                      style={{
                        backgroundColor:
                          brick.color?.toLowerCase() === "black"
                            ? "#000000"
                            : brick.color?.toLowerCase() === "white"
                            ? "#ffffff"
                            : brick.color?.toLowerCase() || "#888888",
                      }}
                    />
                    <span>{brick.color || "Unknown"}</span>
                    {brick.productId && (
                      <span className="text-slate-500">• #{brick.productId}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 italic text-lg">
              No bricks were detected in this photo
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-10 bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl text-center font-medium shadow-sm">
          {error}
        </div>
      )}
    </main>
    <Footer/>
    </div>
  );
}

export default function BricksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <Loader2 className="h-14 w-14 animate-spin text-purple-600" />
        </div>
      }
    >
      <BricksContent />
    </Suspense>
  );
}