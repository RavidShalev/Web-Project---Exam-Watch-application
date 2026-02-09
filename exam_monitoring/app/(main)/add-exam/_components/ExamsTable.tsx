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


/**
 * ExamsTable
 * Table and card component used to display and manage existing exams.
 *
 * Responsibilities:
 * - Fetch and display the list of exams from the server
 * - Render exams in a responsive layout (table for desktop, cards for mobile)
 * - Display formatted exam details with graceful fallbacks for missing data
 * - Allow exam deletion with user confirmation
 * - Allow navigation to the exam edit page
 * - Refresh displayed data when the refresh key changes
 */
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
      <p className="mt-10 text-center text-[var(--muted)]">
        טוען מבחנים…
      </p>
    );
  }

  return (
    <div dir="rtl" className="mt-10 space-y-4">
      <h3 className="text-lg sm:text-xl font-bold text-[var(--fg)]">
        רשימת מבחנים קיימים
      </h3>

      {/*  DESKTOP TABLE */}
      {/* show in desktop view as table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
        <table className="min-w-full text-sm text-right">
          <caption className="sr-only">רשימת מבחנים קיימים במערכת</caption>
          <thead className="bg-[var(--surface-hover)] text-[var(--muted)] font-semibold">
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
                  scope="col"
                  className="px-4 py-3 border-b border-[var(--border)] whitespace-nowrap"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {exams.map((exam) => (
              <tr
                key={exam._id}
                className="transition hover:bg-[var(--surface-hover)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--fg)]">
                  <div className="flex items-start justify-between gap-3">
                    <span>{showOrDash(exam.courseName)}</span>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          (window.location.href = `/edit-exam/${exam._id}`)
                        }
                        className="
                          rounded-lg
                          bg-[var(--accent)]
                          px-2 py-1
                          text-xs
                          font-semibold
                          text-white
                          hover:brightness-110
                        "
                        aria-label={`ערוך בחינה ${exam.courseName}`}
                      >
                        ערוך
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(exam._id)}
                        className="
                          rounded-lg
                          bg-[var(--danger)]
                          px-2 py-1
                          text-xs
                          font-semibold
                          text-white
                          hover:brightness-110
                        "
                        aria-label={`מחק בחינה ${exam.courseName}`}
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">{showOrDash(exam.courseCode)}</td>
                <td className="px-4 py-3">{showOrDash(exam.date)}</td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {exam.startTime && exam.endTime
                    ? `${exam.startTime} - ${exam.endTime}`
                    : "—"}
                </td>

                <td className="px-4 py-3 max-w-[220px] truncate">
                  {showOrDash(exam.lecturers)}
                </td>

                <td className="px-4 py-3 max-w-[220px] truncate">
                  {showOrDash(exam.supervisors)}
                </td>

                <td className="px-4 py-3">{showOrDash(exam.location)}</td>
                <td className="px-4 py-3">{showOrDash(exam.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      {/* show in mobile view as cards */}
      <div className="sm:hidden space-y-3">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="
              rounded-2xl
              border border-[var(--border)]
              bg-[var(--surface)]
              p-4
              space-y-2
            "
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-[var(--fg)]">
                  {showOrDash(exam.courseName)}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  קוד: {showOrDash(exam.courseCode)}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = `/edit-exam/${exam._id}`)
                  }
                  className="rounded-lg bg-[var(--accent)] px-2 py-1 text-xs font-semibold text-white"
                >
                  ערוך
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(exam._id)}
                  className="rounded-lg bg-[var(--danger)] px-2 py-1 text-xs font-semibold text-white"
                >
                  מחק
                </button>
              </div>
            </div>

            <div className="text-sm text-[var(--muted)]">
              📅 {showOrDash(exam.date)} · ⏰{" "}
              {exam.startTime && exam.endTime
                ? `${exam.startTime} - ${exam.endTime}`
                : "—"}
            </div>

            <div className="text-sm">
              📍 {showOrDash(exam.location)}
            </div>

            <div className="text-xs text-[var(--muted)]">
              מרצים: {showOrDash(exam.lecturers)}
            </div>

            <div className="text-xs text-[var(--muted)]">
              משגיחים: {showOrDash(exam.supervisors)}
            </div>

            <div className="text-xs text-[var(--muted)]">
              סטטוס: {showOrDash(exam.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
