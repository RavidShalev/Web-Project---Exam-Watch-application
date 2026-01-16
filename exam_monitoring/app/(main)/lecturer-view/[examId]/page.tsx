"use client";

import { Exam } from "@/types/examtypes";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AttendanceRow } from "@/types/attendance";
import {Calendar,Clock,MapPin,Users,AlertCircle,CheckCircle2,XCircle,User,MessageSquare,Bell,Activity,TrendingUp,Send,} from "lucide-react";
import SendMessageModal from "./SendMessageModal";
import { ToastProvider } from "@/app/components/ToastProvider";

// Interface for report structure from database
interface Report {
  _id: string;
  eventType: string;
  description: string;
  timestamp: string;
  supervisorId?: { name: string };
  studentId?: { name: string; idNumber: string };
}

/**
 * LecturerViewExam Component
 * This page shows real-time view of active exam for lecturer
 * Updates automatically every 10 seconds
 */
export default function LecturerViewExam() {
  // State variables to store exam data
  const [exam, setExam] = useState<Exam | null>(null);                      // Exam details
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);        // List of students attendance
  const [reports, setReports] = useState<Report[]>([]);                     // List of incident reports
  const [loading, setLoading] = useState(true);                             // Loading state
  const [alerts, setAlerts] = useState<string[]>([]);                       // Alert messages to show
  const [showMessageModal, setShowMessageModal] = useState(false);          // Show/hide message modal
  const { examId } = useParams<{ examId: string }>();                       // Get examId from URL

  // Fetch exam data from API - runs on component load
  useEffect(() => {
    async function fetchExamData() {
      try {
        const examRes = await fetch(`/api/exams/${examId}`);
        const examData = await examRes.json();
        setExam(examData);

        const attendanceRes = await fetch(`/api/exams/attendance/${examId}`);
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);

        const reportsRes = await fetch(`/api/exams/${examId}/reporting`);
        const reportsData = await reportsRes.json();
        if (reportsData.success) {
          setReports(reportsData.data);
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExamData();
    const interval = setInterval(fetchExamData, 10000);
    return () => clearInterval(interval);
  }, [examId]);

  // Check for unusual situations and create alerts
  useEffect(() => {
    const newAlerts: string[] = [];

    const toiletStudents = attendance.filter(a => a.isOnToilet);
    toiletStudents.forEach(student => {
      newAlerts.push(`${student.studentId.name} נמצא בשירותים`);
    });

    const absentCount = attendance.filter(a => a.attendanceStatus === "absent").length;
    if (absentCount > 0) {
      newAlerts.push(`${absentCount} סטודנטים נעדרים`);
    }

    setAlerts(newAlerts);
  }, [attendance]);

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.attendanceStatus === "present").length,
    absent: attendance.filter(a => a.attendanceStatus === "absent").length,
    finished: attendance.filter(a => a.attendanceStatus === "finished").length,
    onToilet: attendance.filter(a => a.isOnToilet).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="animate-pulse text-xl text-[var(--muted)]">
          טוען נתונים...
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="text-xl text-[var(--muted)]">
          מבחן לא נמצא
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--bg)] p-4 md:p-6" dir="rtl">

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm p-6 mb-6 border border-[var(--border)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--fg)] mb-2">
                {exam.courseName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {exam.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {exam.startTime} - {exam.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {exam.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-green-500/15 text-green-600 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                פעיל
              </span>
              <Activity className="text-green-600" size={24} />
            </div>
          </div>

          {/* Action Button - Send Message */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <button
              onClick={() => setShowMessageModal(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2
                bg-[var(--accent)] text-white
                px-6 py-3 rounded-xl font-semibold
                hover:opacity-90 transition"
            >
              <Send size={20} />
              שלח הודעה למשגיחים
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            ["סה\"כ סטודנטים", stats.total, Users, "blue"],
            ["נוכחים", stats.present, CheckCircle2, "green"],
            ["נעדרים", stats.absent, XCircle, "red"],
            ["סיימו", stats.finished, TrendingUp, "purple"],
            ["בשירותים", stats.onToilet, AlertCircle, "yellow"],
          ].map(([label, value, Icon, color]: any, idx) => (
            <div
              key={idx}
              className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border-r-4 border-[var(--border)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
                  <p className="text-2xl font-bold text-[var(--fg)]">{value}</p>
                </div>
                <Icon className={`text-${color}-600`} size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <SendMessageModal
            examId={examId}
            supervisors={(exam.supervisors || []).map((s: any) =>
              typeof s === "string" ? { _id: s, name: "משגיח" } : s
            )}
            onClose={() => setShowMessageModal(false)}
          />
        )}
      </div>
    </ToastProvider>
  );
}
