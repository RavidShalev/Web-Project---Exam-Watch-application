"use client";

import { Exam } from "@/types/Exam";
import ExamTimer from "./examTimer";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ActiveExamPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const { examId } = useParams<{ examId: string }>();

  useEffect(() => {
    async function fetchExam() {
      const res = await fetch(`/api/exams/${examId}`);
      const data = await res.json();
      setExam(data.exam ?? data);
    }

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  if (!exam) {
    return <div>טוען...</div>;
  }
console.log(exam)
  return (
    <div>
      <h1>בחינה פעילה</h1>

      {exam.actualStartTime && (
        <ExamTimer
          startTime={exam.actualStartTime}
          duration={exam.durationMinutes}
        />
      )}
    </div>
  );
}