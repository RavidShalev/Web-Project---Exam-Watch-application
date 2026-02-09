"use client";

import { useEffect, useState } from "react";
import EditExam from "../_components/EditExam";
import { ExamFormData } from "../../../../types/examtypes";
import ExamStudentsTable from "../_components/ExamStudentsTable";
import UploadStudentsCsv from "../_components/UploadStudentsCsv";

type PageProps = {
  params: Promise<{
    examId: string;
  }>;
};

/**
 * EditExamPage
 * Admin page for editing an existing exam and managing its registered students.
 *
 * Responsibilities:
 * - Retrieve the exam ID from route parameters
 * - Fetch and initialize exam data for editing
 * - Display and manage the exam edit form
 * - Fetch and display students registered for the exam
 * - Allow bulk student registration via CSV upload
 * - Refresh student data after successful updates
 * - Handle loading and error states gracefully
 */
export default function EditExamPage({ params }: PageProps) {
  const [examId, setExamId] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<
    { name: string; idNumber: string }[]
  >([]);

  const refreshStudents = async () => {
    if (!examId) return;

    const res = await fetch(`/api/admin/exams/${examId}`);
    if (!res.ok) return;

    const data = await res.json();

    setStudents(
      data.exam.students?.map((s: { name: string; idNumber: string }) => ({
        name: s.name,
        idNumber: s.idNumber,
      })) || []
    );
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { examId } = await params;
        const cleanExamId = String(examId).trim();
        setExamId(cleanExamId);

        const res = await fetch(`/api/exams/${cleanExamId}`);
        if (!res.ok) {
          alert("שגיאה בטעינת המבחן");
          return;
        }

        const data = await res.json();

        const rules: ExamFormData["rules"] = {
          calculator: false,
          computer: false,
          headphones: false,
          openBook: false,
        };

        data.exam.rules?.forEach((r: { id: string; allowed: boolean }) => {
          if (r.id in rules) {
            rules[r.id as keyof typeof rules] = r.allowed;
          }
        });

        setExam({
          courseName: data.exam.courseName,
          courseCode: data.exam.courseCode,
          date: data.exam.date,
          startTime: data.exam.startTime,
          endTime: data.exam.endTime,
          location: data.exam.location,
          supervisors: data.exam.supervisors
            .map((u: { idNumber: string }) => u.idNumber)
            .join(", "),
          lecturers: data.exam.lecturers
            .map((u: { idNumber: string }) => u.idNumber)
            .join(", "),
          rules,
        });
      } catch (err) {
        console.error(err);
        alert("שגיאת שרת");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [params]);

  useEffect(() => {
    if (!examId) return;
    refreshStudents();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
        טוען מבחן…
      </div>
    );
  }

  if (!exam || !examId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
        מבחן לא נמצא
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* ===== Edit Exam Section ===== */}
        <section>
          <EditExam exam={exam} examId={examId} />
        </section>

        {/* ===== Students Management Section ===== */}
        <section
          className="
            rounded-3xl
            bg-[var(--bg)]
            border border-[var(--border)]
            p-6 sm:p-8
            space-y-8
          "
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--fg)]">
              סטודנטים רשומים למבחן
            </h3>

            <span className="text-sm text-[var(--muted)]">
              סה״כ: {students.length}
            </span>
          </div>

          <UploadStudentsCsv
            examId={examId}
            onSuccess={refreshStudents}
          />

          <ExamStudentsTable students={students} />
        </section>
      </div>
    </div>
  );
}
