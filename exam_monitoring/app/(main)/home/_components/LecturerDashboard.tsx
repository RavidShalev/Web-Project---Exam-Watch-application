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
    // Get current user from session storage
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLecturerName(user.name || 'מרצה');
      setLecturerId(user._id);

      // Fetch all exams for this lecturer from API
      fetch(`/api/exams/lecturer?lecturerId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExams(data.data);
          }
        })
        .catch((err) => console.error('Error fetching exams:', err))
        .finally(() => setLoading(false));
    }
  }, []);

  // Filter exams by status for different sections
  const activeExams = exams.filter(e => e.status === 'active');       // Currently running
  const upcomingExams = exams.filter(e => e.status === 'scheduled');  // Not started yet
  const pastExams = exams.filter(e => e.status === 'finished');

  if (loading) {
    return (
      <div className="p-10 text-center bg-gray-50 min-h-screen">
        <div className="animate-pulse">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-gray-50 min-h-screen" dir="rtl">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-gray-900">
              שלום, {lecturerName}
            </h1>
            <p className="text-gray-500 text-sm">
              איזור מרצה • {exams.length} מבחנים בסה״כ
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <BookOpen size={32} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Exams */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500  text-sm">מבחנים פעילים</p>
              <p className="text-3xl font-bold text-gray-900">{activeExams.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">מבחנים קרובים</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingExams.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Past Exams */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">מבחנים שהסתיימו</p>
              <p className="text-3xl font-bold text-gray-900">{pastExams.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-full">
              <FileText className="text-gray-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Exams Section - High Priority */}
      {activeExams.length > 0 && (
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900 ">מבחנים פעילים כעת</h2>
          </div>
          <div className="grid gap-4">
            {activeExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-green-50 p-5 rounded-xl border-2 border-green-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 ">{exam.courseName}</h3>
                    <p className="text-sm text-gray-600 ">קוד: {exam.courseCode}</p>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    פעיל
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700  mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    {exam.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    {exam.startTime} - {exam.endTime}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin size={16} className="text-gray-500" />
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
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600 " size={24} />
            <h2 className="text-xl font-bold text-gray-900">מבחנים קרובים</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exam.courseName}</h3>
                    <p className="text-xs text-gray-500">קוד: {exam.courseCode}</p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                    מתוכנן
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 ">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500 " />
                    {exam.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" />
                    {exam.startTime} - {exam.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    {exam.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Exams Section */}
      {pastExams.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-gray-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">מבחנים שהסתיימו</h2>
          </div>
          <div className="grid gap-3">
            {pastExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/exam-reports/${exam._id}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 ">{exam.courseName}</h3>
                    <p className="text-xs text-gray-500 ">
                      {exam.date} • {exam.startTime} - {exam.endTime}
                    </p>
                  </div>
                  <button className="text-blue-600 text-sm font-semibold hover:underline">
                    צפה בדוח →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {exams.length === 0 && (
        <div className="bg-white  p-12 rounded-2xl border border-dashed border-gray-300 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">אין מבחנים רשומים</p>
        </div>
      )}
    </div>
  );
}
