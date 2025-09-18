"use client";

import { useState } from "react";
import { uploadDocumentMetas } from "@/lib/api";

interface DocumentUploaderProps {
  onResult?: (data: any) => void; // callback when processed
}

export default function DocumentUploader({ onResult }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const response = await uploadDocumentMetas([{ name: file.name, size: file.size, type: file.type }]);
      if (onResult) onResult(response);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      {/* File picker */}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-300 
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white
                   hover:file:bg-blue-700"
      />

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Upload & Summarize"}
      </button>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
