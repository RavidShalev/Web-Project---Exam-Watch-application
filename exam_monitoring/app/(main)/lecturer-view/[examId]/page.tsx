"use client";

import { Exam } from "@/types/examtypes";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AttendanceRow } from "@/types/attendance";
import { Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle2, XCircle, User, MessageSquare, Bell, Activity, TrendingUp, Send } from "lucide-react";
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
        // Get exam details
        const examRes = await fetch(`/api/exams/${examId}`);
        const examData = await examRes.json();
        setExam(examData);

        // Get attendance list (who is present/absent)
        const attendanceRes = await fetch(`/api/exams/attendance/${examId}`);
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);

        // Get incident reports
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

    // Auto-refresh: fetch new data every 10 seconds
    const interval = setInterval(fetchExamData, 10000);
    // Cleanup: stop auto-refresh when component unmounts
    return () => clearInterval(interval);
  }, [examId]);

  // Check for unusual situations and create alerts
  useEffect(() => {
    const newAlerts: string[] = [];
    
    // Find students who are in toilet - might be suspicious if too long
    const toiletStudents = attendance.filter(a => a.isOnToilet);
    toiletStudents.forEach(student => {
      newAlerts.push(`${student.studentId.name} נמצא בשירותים`);
    });

    // Count how many students are absent
    const absentCount = attendance.filter(a => a.attendanceStatus === 'absent').length;
    if (absentCount > 0) {
      newAlerts.push(`${absentCount} סטודנטים נעדרים`);
    }

    // Update alerts state
    setAlerts(newAlerts);
  }, [attendance]); // Run this when attendance changes

  // Calculate statistics for display
  const stats = {
    total: attendance.length,                                                 // Total students
    present: attendance.filter(a => a.attendanceStatus === 'present').length, // Currently present
    absent: attendance.filter(a => a.attendanceStatus === 'absent').length,   // Absent students
    finished: attendance.filter(a => a.attendanceStatus === 'finished').length, // Finished exam
    onToilet: attendance.filter(a => a.isOnToilet).length,                   // In toilet now
  };

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-xl">טוען נתונים...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl">מבחן לא נמצא</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.courseName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              פעיל
            </span>
            <Activity className="text-green-600" size={24} />
          </div>
        </div>
        
        {/* Action Button - Send Message */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowMessageModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Send size={20} />
            שלח הודעה למשגיחים
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">סה"כ סטודנטים</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">נוכחים</p>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
            </div>
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-r-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">נעדרים</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
            </div>
            <XCircle className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">סיימו</p>
              <p className="text-2xl font-bold text-gray-900">{stats.finished}</p>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-r-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">בשירותים</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onToilet}</p>
            </div>
            <AlertCircle className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Attendance List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="text-yellow-600" size={20} />
                <h3 className="font-bold text-yellow-900">התראות</h3>
              </div>
              <ul className="space-y-1 text-sm text-yellow-800">
                {alerts.map((alert, idx) => (
                  <li key={idx}>• {alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Attendance List */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={24} />
              רשימת נוכחות
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2">
                  <tr>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">#</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">שם</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">ת.ז</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendance.map((record, idx) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-600">{idx + 1}</td>
                      <td className="p-3 text-sm font-medium text-gray-900">
                        {record.studentId.name}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {record.studentId.idNumber}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {record.attendanceStatus === 'present' && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                              נוכח
                            </span>
                          )}
                          {record.attendanceStatus === 'absent' && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                              נעדר
                            </span>
                          )}
                          {record.attendanceStatus === 'finished' && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                              סיים
                            </span>
                          )}
                          {record.isOnToilet && (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                              בשירותים
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Reports & Info */}
        <div className="space-y-6">
          {/* Supervisors Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <User size={20} />
              משגיחים
            </h3>
            <div className="space-y-2">
              {exam.supervisors && exam.supervisors.map((supervisor: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                    {supervisor.name.charAt(0)}
                  </div>
                  <span className="text-gray-700">{supervisor.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <MessageSquare size={20} />
              דיווחים אחרונים
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.length === 0 ? (
                <p className="text-sm text-gray-500">אין דיווחים עדיין</p>
              ) : (
                reports.slice(0, 10).map((report) => (
                  <div key={report._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{report.eventType}</p>
                        {report.studentId && (
                          <p className="text-xs text-gray-600 mt-1">
                            סטודנט: {report.studentId.name}
                          </p>
                        )}
                        {report.description && (
                          <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(report.timestamp).toLocaleTimeString('he-IL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <SendMessageModal
          examId={examId}
          supervisors={(exam.supervisors || []).map(supervisor => 
            typeof supervisor === 'string' 
              ? { _id: supervisor, name: 'משגיח' }
              : supervisor
          )}
          onClose={() => setShowMessageModal(false)}
        />
      )}
      </div>
    </ToastProvider>
  );
}
