'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Users, FileText, AlertCircle } from 'lucide-react';

// Exam data structure
interface Exam {
  _id: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'active' | 'finished';   // Current status of exam
  supervisors?: { name: string }[];
}

/**
 * LecturerDashboard Component
 * Main dashboard for lecturer - shows all their exams
 */
export default function LecturerDashboard() {
  // State variables
  const [exams, setExams] = useState<Exam[]>([]);           // List of all exams
  const [loading, setLoading] = useState(true);             // Loading state
  const [lecturerName, setLecturerName] = useState('');     // Lecturer's name
  const [lecturerId, setLecturerId] = useState('');         // Lecturer's ID

  // Load lecturer data and their exams from API
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLecturerName(user.name || 'מרצה');
      setLecturerId(user._id);

      fetch(`/api/exams/lecturer?lecturerId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExams(data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const activeExams = exams.filter(e => e.status === 'active');
  const upcomingExams = exams.filter(e => e.status === 'scheduled');
  const pastExams = exams.filter(e => e.status === 'finished');

  if (loading) {
    return (
      <div className="p-10 text-center bg-[var(--bg)] min-h-screen">
        <div className="animate-pulse text-[var(--muted)]">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-[var(--bg)] min-h-screen" dir="rtl">
      
      {/* Header Section */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-[var(--fg)]">
              שלום, {lecturerName}
            </h1>
            <p className="text-[var(--muted)] text-sm">
              איזור מרצה • {exams.length} מבחנים בסה״כ
            </p>
          </div>
          <div className="bg-[var(--accent)/10] p-3 rounded-full text-[var(--accent)]">
            <BookOpen size={32} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] p-5 rounded-2xl shadow-sm border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--muted)] text-sm">מבחנים פעילים</p>
              <p className="text-3xl font-bold text-[var(--fg)]">{activeExams.length}</p>
            </div>
            <div className="bg-green-500/15 p-3 rounded-full">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl shadow-sm border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--muted)] text-sm">מבחנים קרובים</p>
              <p className="text-3xl font-bold text-[var(--fg)]">{upcomingExams.length}</p>
            </div>
            <div className="bg-blue-500/15 p-3 rounded-full">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl shadow-sm border-r-4 border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--muted)] text-sm">מבחנים שהסתיימו</p>
              <p className="text-3xl font-bold text-[var(--fg)]">{pastExams.length}</p>
            </div>
            <div className="bg-[var(--border)] p-3 rounded-full">
              <FileText className="text-[var(--muted)]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Exams Section */}
      {activeExams.length > 0 && (
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-[var(--fg)]">מבחנים פעילים כעת</h2>
          </div>

          <div className="grid gap-4">
            {activeExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-green-500/10 p-5 rounded-xl border border-green-500/30 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--fg)]">{exam.courseName}</h3>
                    <p className="text-sm text-[var(--muted)]">קוד: {exam.courseCode}</p>
                  </div>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    פעיל
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-[var(--muted)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {exam.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {exam.startTime} - {exam.endTime}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin size={16} />
                    {exam.location}
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = `/lecturer-view/${exam._id}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  צפייה במבחן פעיל
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Exams Section */}
      {upcomingExams.length > 0 && (
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-[var(--fg)]">מבחנים קרובים</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {upcomingExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-[var(--fg)]">{exam.courseName}</h3>
                <p className="text-xs text-[var(--muted)]">קוד: {exam.courseCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Exams Section */}
      {pastExams.length > 0 && (
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--fg)] mb-4">מבחנים שהסתיימו</h2>

          <div className="grid gap-3">
            {pastExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-[var(--surface-hover)] p-4 rounded-xl border border-[var(--border)] hover:opacity-90 transition cursor-pointer"
                onClick={() => window.location.href = `/exam-reports/${exam._id}`}
              >
                <h3 className="font-bold text-[var(--fg)]">{exam.courseName}</h3>
                <p className="text-xs text-[var(--muted)]">
                  {exam.date} • {exam.startTime} - {exam.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {exams.length === 0 && (
        <div className="bg-[var(--surface)] p-12 rounded-2xl border border-dashed border-[var(--border)] text-center">
          <BookOpen className="mx-auto text-[var(--muted)] mb-4" size={48} />
          <p className="text-[var(--muted)]">אין מבחנים רשומים</p>
        </div>
      )}
    </div>
  );
}
