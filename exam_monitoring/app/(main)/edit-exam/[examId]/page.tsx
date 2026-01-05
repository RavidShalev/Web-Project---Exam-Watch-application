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

// Edit Exam Page Component
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

    // Update students list
    setStudents(
      data.exam.students?.map((s: { name: string; idNumber: string }) => ({
        name: s.name,
        idNumber: s.idNumber,
      })) || []
    );
  };

  // Fetch exam data on component mount
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { examId } = await params;
        const cleanExamId = String(examId).trim();

        setExamId(cleanExamId);

        // Fetch exam details from API
        const res = await fetch(`/api/exams/${cleanExamId}`);

        if (!res.ok) {
          alert("שגיאה בטעינת המבחן");
          return;
        }

        // Parse response data
        const data = await res.json();

        // Build rules object
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

        // Set exam form data - STUDENTS ARE UPDATED SEPARATELY
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
      } catch (error) {
        console.error("Failed to load exam:", error);
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
    return <p className="text-center mt-10">טוען מבחן…</p>;
  }

  if (!exam || !examId) {
    return <p className="text-center mt-10">מבחן לא נמצא</p>;
  }

  return (
    <div className="mt-10">
      <EditExam exam={exam} examId={examId} />

      <UploadStudentsCsv examId={examId} onSuccess={refreshStudents} />

      <ExamStudentsTable students={students} />
    </div>
  );
}
