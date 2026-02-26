"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Camera, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, etc.)");
      return;
    }

    setFile(uploadedFile);
    setError(null);

    const objectUrl = URL.createObjectURL(uploadedFile);
    setPreview(objectUrl);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const analyzeImage = async () => {
    if (!file) {
      setError("Please select or capture an image first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error (${response.status})`);
      }

      const data = await response.json();
      const bricks = Array.isArray(data.bricks) ? data.bricks : [];

      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(file);
      });

      const sessionKey = `brick_session_${Date.now()}`;

      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          bricks,
          uploadedImage: imageBase64,
          timestamp: Date.now(),
        })
      );

      router.push(`/bricks?session=${sessionKey}`);
    } catch (err) {
      const message = err?.message || "An unexpected error occurred";
      console.error("Analysis failed:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-20 sm:pt-24 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Scan Your Bricks <span className="text-purple-600">🧱</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Upload or snap a photo of your LEGO pieces — our AI will detect them and help you build something awesome!
            </p>
          </div>

          {/* Main upload card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/70 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-6 sm:p-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center sm:text-left">
                Step 1: Add Your LEGO Photo
              </h2>

              {/* Preview / Placeholder */}
              <div className="mb-10">
                {preview ? (
                  <div className="relative rounded-2xl overflow-hidden border-4 border-purple-100 bg-purple-50/30 shadow-inner group">
                    <img
                      src={preview}
                      alt="Preview of your LEGO bricks"
                      className="w-full h-72 sm:h-96 object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={clearFile}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-red-600 p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                      aria-label="Remove image"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  <div className="border-4 border-dashed border-slate-300 rounded-2xl h-72 sm:h-96 flex flex-col items-center justify-center bg-slate-50/60 text-slate-500 transition-colors hover:border-purple-400 hover:bg-purple-50/30">
                    <ImageIcon className="h-20 w-20 mb-6 opacity-60" />
                    <p className="text-xl font-semibold mb-2">No photo yet</p>
                    <p className="text-base opacity-80 px-6 text-center">
                      Upload from your device or take a quick photo of your bricks
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center gap-3 py-5 px-8 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-2xl border-2 border-purple-200 font-semibold text-lg transition-all active:scale-[0.98] shadow-sm">
                    <Upload className="h-6 w-6" />
                    Upload Photo
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <label className="cursor-pointer">
                  <div className="flex items-center justify-center gap-3 py-5 px-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-2xl border-2 border-indigo-200 font-semibold text-lg transition-all active:scale-[0.98] shadow-sm">
                    <Camera className="h-6 w-6" />
                    Take Photo
                  </div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Analyze button */}
              <button
                onClick={analyzeImage}
                disabled={!file || loading}
                className={`
                  w-full py-6 px-10 rounded-2xl font-bold text-xl text-white shadow-xl transition-all duration-300
                  ${loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : file
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] hover:shadow-2xl"
                    : "bg-slate-300 cursor-not-allowed opacity-70"}
                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-7 w-7 animate-spin" />
                    Scanning bricks...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Upload className="h-7 w-7" />
                    Analyze My Bricks
                  </div>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 mt-6">
                For best results: spread bricks out, good lighting, minimal shadows or overlap
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-10 bg-red-50 border border-red-200 text-red-800 px-6 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-sm">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}