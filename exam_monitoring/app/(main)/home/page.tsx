"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReadyForExams from "./_components/ReadyForExams";
import { Exam } from "@/types/Exam";



export default function HomePage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function handleStartExam() {
    if (!exam) return;
    const res = await fetch("/api/exams/activate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ examId: exam._id })
    });
    const updatedExam = await res.json();
    setExam(updatedExam.exam);
    // Navigate to active exam page
    router.push(`/active-exam/${exam._id}`);
}

  // run once on component mount
  useEffect(() => {
    async function fetchClosestExam() {
      try {
        // get supervisorId from localStorage
        const supervisorId = localStorage.getItem("supervisorId");

        // API call to get the closest exam for the supervisor
        const res = await fetch(
          `/api/exams/closest?supervisorId=${supervisorId}`
        );

        const data = await res.json();

        const findedExam = data.closestExam;

        if (findedExam && findedExam.status === "active") {
          // if there is an active exam, navigate directly to its page
          router.push(`/active-exam/${findedExam._id}`);
          return;
        }

        setExam(data.closestExam);
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClosestExam();
  }, []);

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!exam) {
    return <div>אין מבחנים קרובים</div>;
  }

  return <ReadyForExams exam={exam} onStartExam={handleStartExam} />;
}
