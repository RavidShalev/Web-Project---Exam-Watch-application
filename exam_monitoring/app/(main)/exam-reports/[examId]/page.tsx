"use client";

import { Exam } from "@/types/examtypes";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AttendanceRow } from "@/types/attendance";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download,
  TrendingUp,
  BarChart3,
  ArrowRight
} from "lucide-react";

interface Report {
  _id: string;
  eventType: string;
  description: string;
  timestamp: string;
  supervisorId?: { name: string };
  studentId?: { name: string; idNumber: string };
}

export default function ExamReportPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();

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
  }, [examId]);

  // Statistics
  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.attendanceStatus === 'present' || a.attendanceStatus === 'finished').length,
    absent: attendance.filter(a => a.attendanceStatus === 'absent').length,
    finished: attendance.filter(a => a.attendanceStatus === 'finished').length,
    attendanceRate: attendance.length > 0 
      ? Math.round((attendance.filter(a => a.attendanceStatus === 'present' || a.attendanceStatus === 'finished').length / attendance.length) * 100)
      : 0,
  };

  // Group reports by type
  const reportsByType = reports.reduce((acc: any, report) => {
    const type = report.eventType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(report);
    return acc;
  }, {});

  const handleExportPDF = () => {
    alert("ייצוא ל-PDF - פיצ'ר זה ייבנה בהמשך");
  };

  const handleExportExcel = () => {
    alert("ייצוא ל-Excel - פיצ'ר זה ייבנה בהמשך");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-xl">טוען דוח...</div>
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm font-semibold"
        >
          <ArrowRight size={18} />
          חזרה
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">דוח מבחן</h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-3">{exam.courseName}</h2>
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
          
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Download size={18} />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Download size={18} />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">סה"כ סטודנטים</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="text-blue-600" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">נוכחו</p>
              <p className="text-3xl font-bold text-gray-900">{stats.present}</p>
            </div>
            <CheckCircle2 className="text-green-600" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">נעדרו</p>
              <p className="text-3xl font-bold text-gray-900">{stats.absent}</p>
            </div>
            <XCircle className="text-red-600" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">סיימו</p>
              <p className="text-3xl font-bold text-gray-900">{stats.finished}</p>
            </div>
            <TrendingUp className="text-purple-600" size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">% נוכחות</p>
              <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
            </div>
            <BarChart3 className="text-orange-600" size={28} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={24} />
            רשימת נוכחות מלאה
          </h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 sticky top-0">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Section */}
        <div className="space-y-6">
          {/* Reports Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={24} />
              סיכום דיווחים ({reports.length})
            </h2>
            
            {Object.keys(reportsByType).length === 0 ? (
              <p className="text-gray-500 text-center py-8">לא נרשמו דיווחים במבחן זה</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(reportsByType).map(([type, reportsOfType]: [string, any]) => (
                  <div key={type} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{type}</span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        {reportsOfType.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Reports */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">כל הדיווחים</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-4">אין דיווחים</p>
              ) : (
                reports.map((report) => (
                  <div key={report._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-orange-500 flex-shrink-0 mt-1" size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{report.eventType}</p>
                        
                        {report.studentId && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-semibold">סטודנט:</span> {report.studentId.name} ({report.studentId.idNumber})
                          </p>
                        )}
                        
                        {report.supervisorId && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">משגיח:</span> {report.supervisorId.name}
                          </p>
                        )}
                        
                        {report.description && (
                          <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border">
                            {report.description}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(report.timestamp).toLocaleString('he-IL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
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
    </div>
  );
}
