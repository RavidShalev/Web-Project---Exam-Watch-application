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
    <div dir="rtl" className="mt-10 flex justify-center px-4">
      <div
        className="
          w-full max-w-md
          rounded-3xl
          border border-[var(--border)]
          bg-[var(--bg)]
          shadow-sm
          p-6 sm:p-7
          space-y-6
        "
      >
        <h3 className="text-lg sm:text-xl font-bold text-[var(--fg)]">
          העלאת מבחנים מקובץ CSV
        </h3>

        <div className="flex flex-col gap-4">
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
            className="
              w-full
              rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              py-3
              text-sm font-medium
              text-[var(--fg)]
              hover:bg-[var(--surface-hover)]
              transition
            "
          >
            בחירת קובץ CSV
          </button>

          <div className="rounded-xl bg-[var(--surface)] px-4 py-3 text-center text-sm">
            {file ? (
              <>
                <span className="text-[var(--muted)]">נבחר קובץ</span>
                <div className="mt-1 font-mono text-[var(--fg)] break-all">
                  {file.name}
                </div>
              </>
            ) : (
              <span className="text-[var(--muted)]">לא נבחר קובץ</span>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`
              w-full
              rounded-xl
              py-3
              text-sm font-semibold
              text-white
              transition
              ${
                loading || !file
                  ? "bg-[var(--border)] cursor-not-allowed"
                  : "bg-[var(--success)] hover:brightness-110 active:scale-[0.99]"
              }
            `}
          >
            {loading ? "מעלה קובץ..." : "העלאה"}
          </button>
        </div>
      </div>
    </div>
  );
}
