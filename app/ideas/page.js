"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, Car, PawPrint, Plane, Lightbulb, Loader2 } from "lucide-react";
import { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";

function IdeasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ideas, setIdeas] = useState([]);
  const [bricks, setBricks] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionKey = searchParams.get("session");

    if (!sessionKey) {
      setError("No session found in URL. Please go back and generate ideas.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        console.log("[Ideas] Loading session:", sessionKey);

        let localIdeas = [], localBricks = [], localSelected = null;
        const stored = localStorage.getItem(sessionKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp > 2 * 60 * 60 * 1000) {
              localStorage.removeItem(sessionKey);
              throw new Error("Session expired");
            }

            localIdeas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
            localBricks = parsed.bricks || [];
            localSelected = parsed.selectedIdea || null;
          } catch (parseErr) {
            console.warn("[Ideas] LocalStorage parse failed:", parseErr);
          }
        }

        setIdeas(localIdeas);
        setBricks(localBricks);
        setSelectedIdea(localSelected);

        const sessionId = sessionKey.replace("brick_session_", "");
        if (!sessionId || sessionId.length !== 36) {
          throw new Error("Invalid session ID");
        }

        const { data: session, error: sessionErr } = await supabase
          .from("sessions")
          .select("id, selected_idea")
          .eq("id", sessionId)
          .single();

        if (!sessionErr && session?.selected_idea) {
          setSelectedIdea(session.selected_idea);
        }

        const { data: bricksRows } = await supabase
          .from("detected_bricks")
          .select("bricks")
          .eq("session_id", sessionId);

        if (bricksRows?.length > 0) {
          setBricks(bricksRows.flatMap(r => r.bricks || []));
        }

        const { data: ideasRows } = await supabase
          .from("ideas")
          .select("ideas")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (ideasRows?.[0]?.ideas) {
          setIdeas(ideasRows[0].ideas);
        }

      } catch (err) {
        console.error("[Ideas] Load error:", err);
        setError(err.message || "Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleSelectIdea = async (idea) => {
    if (!idea) return;

    const sessionKey = searchParams.get("session");
    if (!sessionKey) {
      setError("Session missing.");
      return;
    }

    const sessionId = sessionKey.replace("brick_session_", "");

    setLoading(true);

    try {
      const { error: updateErr } = await supabase
        .from("sessions")
        .update({ selected_idea: idea })
        .eq("id", sessionId);

      if (updateErr) throw updateErr;

      const res = await fetch("/api/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          bricks,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `API error ${res.status}`);
      }

      const { title, steps } = await res.json();

      if (!steps || !Array.isArray(steps)) {
        throw new Error("Invalid instructions format");
      }

      const { error: insertErr } = await supabase
        .from("instructions")
        .insert({
          session_id: sessionId,
          instructions: { title, steps },
        });

      if (insertErr) throw insertErr;

      console.log("[Ideas] Instructions saved:", steps.length, "steps");

      const stored = localStorage.getItem(sessionKey);
      const sessionData = stored ? JSON.parse(stored) : {};
      sessionData.selectedIdea = idea;
      sessionData.instructions = { title, steps };
      sessionData.timestamp = Date.now();
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));

      router.push(`/build?session=${sessionKey}`);
    } catch (err) {
      console.error("[Ideas] Select error:", err);
      setError(err.message || "Failed to prepare build instructions.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl border">
          <Bot size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white p-10 rounded-2xl shadow-xl border">
          <Lightbulb size={56} className="mx-auto text-purple-500 mb-6 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">No Ideas Yet</h2>
          <p className="text-slate-600 mb-8">
            Go back and generate some building ideas first!
          </p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700"
          >
            Return to Bricks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Creative Build Ideas <span className="text-purple-600">🧱</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Choose one of these fun LEGO builds you can create with your bricks!
            </p>
          </div>

          {selectedIdea && (
            <div className="mb-12 p-6 bg-white rounded-2xl shadow-xl border border-purple-200">
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-xl bg-purple-100 text-purple-600">
                  <Lightbulb size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Selected: {selectedIdea.name || "Your Chosen Build"}
                  </h2>
                  {selectedIdea.description && (
                    <p className="text-slate-600 mb-4">{selectedIdea.description}</p>
                  )}
                  <button
                    onClick={() => router.push(`/build?session=${searchParams.get("session")}`)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                  >
                    Continue Building
                  </button>
                </div>
              </div>
            </div>
          )}

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

      <Footer />
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