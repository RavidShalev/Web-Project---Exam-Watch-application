"use client";

import { useState, useRef } from "react";

type Props = {
  examId: string;
  onSuccess: () => void;
};

export default function UploadStudentsCsv({ examId, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) {
      alert("נא לבחור קובץ CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/exams/${examId}/upload-students-csv`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "שגיאה בעיבוד הקובץ");
      }

      onSuccess();
      alert("הסטודנטים הועלו בהצלחה");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "שגיאת שרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="mt-10 flex justify-center px-4">
      <div
        className="
          w-full max-w-md
          rounded-2xl
          bg-[var(--bg)]
          border border-[var(--border)]
          shadow-sm
          p-6
          space-y-5
        "
      >
        <h3 className="text-lg sm:text-xl font-bold text-[var(--fg)] text-right">
          העלאת סטודנטים מקובץ CSV
        </h3>

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

        <div className="text-center text-sm text-[var(--muted)]">
          {file ? (
            <>
              נבחר קובץ:
              <span className="block mt-1 font-mono text-[var(--fg)]">
                {file.name}
              </span>
            </>
          ) : (
            "לא נבחר קובץ"
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
                : "bg-[var(--success)] hover:brightness-110"
            }
          `}
        >
          {loading ? "מעלה קובץ..." : "העלאה"}
        </button>
      </div>
    </div>
  );
}
