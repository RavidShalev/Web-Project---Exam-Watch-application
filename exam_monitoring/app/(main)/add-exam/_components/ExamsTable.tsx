"use client";

import { useEffect, useState } from "react";

interface Exam {
  _id: string;
  courseName: string;
  courseCode: number;
  date: string;
  startTime: string;
  endTime: string;
  lecturers: { _id: string; name: string }[];
  supervisors: { _id: string; name: string }[];
  location: string;
  status: string;
}

type ExamsTableProps = {
  refreshKey: number;
};

// Helper function to display a value or a dash if the value is empty/null/undefined
const showOrDash = (value: unknown): string => {
  if (value === null || value === undefined) return "—";

  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (
      typeof value[0] === "object" &&
      value[0] !== null &&
      "name" in value[0]
    ) {
      return (value as { name: string }[])
        .map((u) => u.name)
        .join(", ");
    }
    return "—";
  }

  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return value.trim() === "" ? "—" : value;

  return "—";
};

export default function ExamsTable({ refreshKey }: ExamsTableProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (examId: string) => {
    const confirmed = window.confirm("למחוק את המבחן?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("שגיאה במחיקה");
        return;
      }

      alert("המבחן נמחק בהצלחה");
      setExams((prev) => prev.filter((exam) => exam._id !== examId));
    } catch (err) {
      console.error("Delete exam error:", err);
      alert("שגיאה במחיקה");
    }
  };

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
    return (
      <p className="mt-10 text-center text-fg">
        טוען מבחנים…
      </p>
    );
  }

  return (
    <div dir="rtl" className="mt-10">
      <h3 className="mb-4 text-lg font-semibold text-fg text-right">
        רשימת מבחנים קיימים
      </h3>

      <div className="overflow-x-auto rounded-lg border border-border bg-bg">
        <table className="w-full border-collapse text-sm text-right text-fg">
          <thead className="bg-border/40">
            <tr>
              {[
                "שם הקורס",
                "קוד",
                "תאריך",
                "שעה",
                "מרצים",
                "משגיחים",
                "כיתה",
                "סטטוס",
              ].map((title) => (
                <th
                  key={title}
                  className="p-2 border border-border font-semibold text-fg"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => (
              <tr
                key={exam._id}
                className="hover:bg-border/20 transition-colors"
              >
                <td className="p-2 border border-border">
                  <div className="flex items-center justify-between">
                    <span>{showOrDash(exam.courseName)}</span>

                    <div className="ml-6 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          (window.location.href = `/edit-exam/${exam._id}`)
                        }
                        className="rounded bg-accent px-2 py-1 text-xs text-white hover:opacity-90"
                      >
                        ערוך
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(exam._id)}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:opacity-90"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </td>

                <td className="p-2 border border-border">
                  {showOrDash(exam.courseCode)}
                </td>

                <td className="p-2 border border-border">
                  {showOrDash(exam.date)}
                </td>

                <td className="p-2 border border-border">
                  {exam.startTime && exam.endTime
                    ? `${exam.startTime} - ${exam.endTime}`
                    : "—"}
                </td>

                <td className="p-2 border border-border">
                  {showOrDash(exam.lecturers)}
                </td>

                <td className="p-2 border border-border">
                  {showOrDash(exam.supervisors)}
                </td>

                <td className="p-2 border border-border">
                  {showOrDash(exam.location)}
                </td>

                <td className="p-2 border border-border">
                  {showOrDash(exam.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
