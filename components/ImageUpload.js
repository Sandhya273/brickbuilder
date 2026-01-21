"use client";
import { useState } from "react";

export default function ImageUpload({ onAnalyze }) {
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("/api/analyze-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Image analysis failed");
      return;
    }

    const data = await res.json();
    onAnalyze(data.bricks);
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-6 mb-6 text-center">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-purple-50 file:text-purple-700
                   hover:file:bg-purple-100"
      />

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full
                   hover:bg-purple-700 transition"
      >
        Analyze Bricks
      </button>
    </div>
  );
}
