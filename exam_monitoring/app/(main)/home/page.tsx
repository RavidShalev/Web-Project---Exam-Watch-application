"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReadyForExams from "./_components/ReadyForExams";
import StudentDashboard from "./_components/StudentDashboard"; 
import { Exam } from "@/types/examtypes";
import { Calendar, AlertCircle } from "lucide-react";

export default function HomePage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const router = useRouter();

  async function handleStartExam() {
    if (!exam) return;
    const res = await fetch("/api/exams/activate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ examId: exam._id, userId: localStorage.getItem("supervisorId") }),
    });
    const updatedExam = await res.json();
    setExam(updatedExam.exam);
    router.push(`/active-exam/${exam._id}`);
  }

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
        
        if (user.role === 'student') {
            setLoading(false);
            return; 
        }
    }

    async function fetchClosestExam() {
      try {
        const supervisorId = localStorage.getItem("supervisorId");
        const res = await fetch(`/api/exams/closest?supervisorId=${supervisorId}`);
        const data = await res.json();
        const findedExam = data.closestExam;

        if (findedExam && findedExam.status === "active") {
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

  // Loading State : Informative Feedback
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#17cf97] to-[#0ea97a] shadow-lg shadow-[#17cf97]/25 mb-4 animate-pulse">
            <Calendar size={32} className="text-white" />
          </div>
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">טוען נתונים...</p>
          <p className="text-gray-400 text-sm mt-1">אנא המתן</p>
        </div>
      </div>
    );
  }

  // Student Dashboard
  if (userRole === 'student') {
      return <StudentDashboard />;
  }

  // No Exams State
  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <AlertCircle size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">אין בחינות קרובות</h2>
          <p className="text-gray-500 mb-6">
            לא נמצאו בחינות מתוכננות עבורך בזמן הקרוב.
            <br />
            בדוק שוב מאוחר יותר או פנה למנהל המערכת.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            רענן עמוד
          </button>
        </div>
      </div>
    );
  }

  return <ReadyForExams exam={exam} onStartExam={handleStartExam} />;
}