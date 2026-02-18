"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BricksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [bricks, setBricks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bricksParam = searchParams.get("bricks");
    if (bricksParam) {
      try {
        setBricks(JSON.parse(decodeURIComponent(bricksParam)));
      } catch (e) {
        setError("Invalid bricks data");
      }
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

      const bricksParam = encodeURIComponent(JSON.stringify(bricks));
      const ideasParam = encodeURIComponent(JSON.stringify(ideas));

      router.push(`/ideas?bricks=${bricksParam}&ideas=${ideasParam}`);
    } catch (err) {
      setError(err.message || "Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  };

  if (bricks.length === 0 && !error) {
    return <div className="p-10 text-center">No bricks data found. Please upload a photo first.</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Detected Bricks</h1>
      

      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            We detected {bricks.length} brick{bricks.length !== 1 ? "s" : ""}
          </h2>

          <button
            onClick={generateIdeas}
            disabled={loading}
            className="px-3 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
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
          className="mt-6 px-3 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Generating..." : "Generate Building Ideas"}
        </button>
      </div>

      {error && <p className="text-red-600 text-center mt-6">{error}</p>}
    </main>
  );
}