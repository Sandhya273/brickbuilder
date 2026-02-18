"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Camera } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleFileChange = (e) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
    }
  };

  const analyzeImage = async () => {
    if (!file) {
      alert("Please select or take a photo");
      return;
    }

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
      const bricks = Array.isArray(data.bricks) ? data.bricks : [];

      const bricksParam = encodeURIComponent(JSON.stringify(bricks));
      router.push(`/bricks?bricks=${bricksParam}`);
    } catch (err) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">BrickBuilder 🧱</h1>

      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Upload or Take LEGO Photo</h2>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <label className="cursor-pointer flex-1">
            <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-sm">
              <Upload className="mr-2 h-5 w-5" />
              Upload Photo
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

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

        <p className="mt-4 text-sm text-center text-gray-600">
  Scanning your LEGO bricks... just a moment
</p>
      </div>

      {error && <p className="text-red-600 mt-8 text-center font-medium">{error}</p>}
    </main>
  );
}