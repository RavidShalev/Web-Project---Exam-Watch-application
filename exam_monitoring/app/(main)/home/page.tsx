"use client";

import { useEffect, useState } from "react";
import ReadyForExams from "./_components/ReadyForExams";

export default function HomePage() {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return <ReadyForExams exam={exam} />;
}
