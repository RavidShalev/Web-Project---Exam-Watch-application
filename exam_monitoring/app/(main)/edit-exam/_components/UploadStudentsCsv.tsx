"use client";

import { useState, useRef } from "react";

type Props = {
  examId: string;
  onSuccess: () => void;
};

// Component for uploading a CSV file containing student ID numbers
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

      // Send the file to the server API for processing
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

      onSuccess(); // Refresh parent component data
      alert("הסטודנטים הועלו בהצלחה");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "שגיאת שרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="mt-10 flex justify-center">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-right">
          העלאת סטודנטים מקובץ CSV
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
            className="border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition text-sm"
          >
            בחירת קובץ CSV
          </button>

          <div className="text-sm text-gray-600 text-center">
            {file ? `נבחר קובץ: ${file.name}` : "לא נבחר קובץ"}
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-md
                       hover:bg-green-700 transition font-medium"
          >
            {loading ? "מעלה קובץ..." : "העלאה"}
          </button>
        </div>
      </div>
    </div>
  );
}
