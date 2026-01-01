"use client";

import { useEffect, useState } from "react";

interface Exam {
  _id: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  lecturers: string[];
  supervisors: string[];
  location: string;
  status: string;
}

type ExamsTableProps = {
  refreshKey: number;
};

// Helper function to display a value or a dash if the value is empty/null/undefined
// in case of arrays it shows a dash instead of joining the array elements
const showOrDash = (value: unknown): string => {
  if (value === null || value === undefined) return "—";

  if (Array.isArray(value)) {
    return value.length === 0 ? "—" : value.join(", ");
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "string") {
    return value.trim() === "" ? "—" : value;
  }

  return "—";
};

// Component to display a table of existing exams
export default function ExamsTable({ refreshKey }: ExamsTableProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to handle delete of an exam
  const handleDelete = async (examId: string) => {
    const confirmed = window.confirm("למחוק את המבחן?");
    if (!confirmed) return;

    // Call the API to delete the exam
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("שגיאה במחיקה");
        return;
      }

      alert("המבחן נמחק בהצלחה");

      // Update the local state to remove the deleted exam
      setExams((prev) => prev.filter((exam) => exam._id !== examId));
    } catch (err) {
      console.error("Delete exam error:", err);
      alert("שגיאה במחיקה");
    }
  };

  // Fetch existing exams from the API on component mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/admin/exams");
        const data = await res.json();
        setExams(data.exams ?? []);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [refreshKey]);

  if (loading) {
    return <p className="mt-10 text-center">טוען מבחנים…</p>;
  }

  return (
    <div dir="rtl" className="mt-10">
      <h3 className="text-lg font-semibold mb-4 text-right">
        רשימת מבחנים קיימים
      </h3>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-right border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">שם הקורס</th>
              <th className="p-2 border">קוד</th>
              <th className="p-2 border">תאריך</th>
              <th className="p-2 border">שעה</th>
              <th className="p-2 border">מרצים</th>
              <th className="p-2 border">משגיחים</th>
              <th className="p-2 border">כיתה</th>
              <th className="p-2 border">סטטוס</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  <div className="flex items-center justify-between">
                    <span>{showOrDash(exam.courseName)}</span>

                    <div className="flex flex-col gap-1 ml-6">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/edit-exam/${exam._id}`;
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        ערוך
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(exam._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-2 border">{showOrDash(exam.courseCode)}</td>
                <td className="p-2 border">{showOrDash(exam.date)}</td>

                <td className="p-2 border">
                  {exam.startTime && exam.endTime
                    ? `${exam.startTime} - ${exam.endTime}`
                    : "—"}
                </td>

                <td className="p-2 border">{showOrDash(exam.lecturers)}</td>
                <td className="p-2 border">{showOrDash(exam.supervisors)}</td>

                <td className="p-2 border">{showOrDash(exam.location)}</td>
                <td className="p-2 border">{showOrDash(exam.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
