"use client";

import { useState, useRef } from "react";
import { NextResponse } from "next/server";

type UploadExamCsvProps = {
  onSuccess?: () => void;
};

export default function UploadExamCsv({ onSuccess }: UploadExamCsvProps) {  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async () => {

    if (!file) {
      alert("נא לבחור קובץ CSV");
      return;
    }

    // Prepare form data for uploading the file
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      // Send the file to the API endpoint for processing
      const res = await fetch("/api/admin/exams/upload-csv", {
        method: "POST",
        body: formData,
      });

      // Parse the JSON response
      const data = await res.json();

      if (data.success) {
        onSuccess?.();
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to process CSV");
      }

      alert(`נוספו ${data.inserted} מבחנים בהצלחה`);
    } catch (err) {
      console.error("CSV upload error FULL:", err);
      return NextResponse.json(
        {
          success: false,
          message: err instanceof Error ? err.message : "Failed to process CSV",
        },
        { status: 500 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="mt-10 flex justify-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg p-6 shadow-md">
        <h3 className="mb-4 text-right text-lg font-semibold text-fg">
          העלאת מבחנים מקובץ CSV
        </h3>

        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-border bg-bg py-2 text-sm text-fg transition hover:bg-border/40"
          >
            בחירת קובץ CSV
          </button>

          <div className="text-center text-sm text-muted">
            {file ? `נבחר קובץ: ${file.name}` : "לא נבחר קובץ"}
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="rounded-md bg-green-600 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "מעלה קובץ..." : "העלאה"}
          </button>
        </div>
      </div>
    </div>
  );
}
