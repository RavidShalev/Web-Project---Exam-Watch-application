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
import { exportToPDF } from "@/app/lib/exportUtils";

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
        // API returns { success: true, exam: {...} } or just exam directly
        const fetchedExam = examData.exam || examData;
        
        // Debug: Log what we got from API
        console.log("Fetched exam data from API:", fetchedExam);
        console.log("Exam fields check:", {
          courseName: fetchedExam?.courseName,
          courseCode: fetchedExam?.courseCode,
          date: fetchedExam?.date,
          startTime: fetchedExam?.startTime,
          endTime: fetchedExam?.endTime,
          location: fetchedExam?.location
        });
        
        setExam(fetchedExam);

        const attendanceRes = await fetch(`/api/exams/attendance/${examId}`);
        const attendanceData = await attendanceRes.json();
        // API might return { attendance: [...] } or just array
        setAttendance(attendanceData.attendance || attendanceData);

        const reportsRes = await fetch(`/api/exams/${examId}/reporting`);
        const reportsData = await reportsRes.json();
        if (reportsData.success) {
          setReports(reportsData.data);
        } else if (Array.isArray(reportsData)) {
          setReports(reportsData);
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

  const handleExportPDF = async () => {
    if (!exam) {
      alert("אין נתוני מבחן לייצוא");
      return;
    }
    
    // Debug: Check exam data
    console.log("Exporting PDF with exam data:", exam);
    
    try {
      await exportToPDF({
        exam,
        attendance,
        reports,
        stats,
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("אירעה שגיאה בייצוא ל-PDF. נסה שוב.");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-fg">
        <div className="animate-pulse text-xl">טוען דוח...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-fg">
        <div className="text-xl">מבחן לא נמצא</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-6 text-fg" dir="rtl">
      {/* Header */}
      <div className="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
        {/* Title and Export Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="text-accent" size={28} />
            <h1 className="text-2xl font-bold">דוח מבחן</h1>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ backgroundColor: "var(--danger)" }}
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Exam Details */}
        <div className="border-t border-border pt-4">
          <h2 className="text-xl font-semibold mb-3">{exam.courseName}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{exam.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{exam.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{exam.startTime} - {exam.endTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'סה"כ סטודנטים', value: stats.total, icon: Users, bg: 'var(--info-bg)', color: 'var(--info)' },
          { label: 'נוכחו', value: stats.present, icon: CheckCircle2, bg: 'var(--success-bg)', color: 'var(--success)' },
          { label: 'נעדרו', value: stats.absent, icon: XCircle, bg: 'var(--danger-bg)', color: 'var(--danger)' },
          { label: 'סיימו', value: stats.finished, icon: TrendingUp, bg: 'var(--purple-bg)', color: 'var(--purple)' },
          { label: '% נוכחות', value: `${stats.attendanceRate}%`, icon: BarChart3, bg: 'var(--warning-bg)', color: 'var(--warning)' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="p-5 rounded-xl shadow-sm border border-border flex items-center justify-between"
            style={{ backgroundColor: bg }}
          >
            <div>
              <p className="text-xs text-muted mb-1">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
            <Icon size={28} style={{ color }} />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Table */}
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={24} />
            רשימת נוכחות מלאה
          </h2>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-hover border-b sticky top-0">
                <tr>
                  <th className="text-right p-3 font-semibold text-muted">#</th>
                  <th className="text-right p-3 font-semibold text-muted">שם</th>
                  <th className="text-right p-3 font-semibold text-muted">ת.ז</th>
                  <th className="text-right p-3 font-semibold text-muted">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendance.map((record, idx) => (
                  <tr key={record._id} className="hover:bg-surface-hover">
                    <td className="p-3 text-muted">{idx + 1}</td>
                    <td className="p-3 font-medium">{record.studentId.name}</td>
                    <td className="p-3 text-muted">{record.studentId.idNumber}</td>
                    <td className="p-3">
                      {record.attendanceStatus === 'present' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                          נוכח
                        </span>
                      )}
                      {record.attendanceStatus === 'absent' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                          נעדר
                        </span>
                      )}
                      {record.attendanceStatus === 'finished' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple)' }}>
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
          <div className="bg-surface rounded-2xl shadow-sm p-6 border border-border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: 'var(--warning)' }}>
              <AlertCircle size={24} />
              סיכום דיווחים ({reports.length})
            </h2>

            {Object.keys(reportsByType).length === 0 ? (
              <p className="text-muted text-center py-8">לא נרשמו דיווחים במבחן זה</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(reportsByType).map(([type, reportsOfType]: [string, any]) => (
                  <div
                    key={type}
                    className="p-4 rounded-lg border border-border"
                    style={{ backgroundColor: 'var(--warning-bg)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{type}</span>
                      <span className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                        {reportsOfType.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl shadow-sm p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">כל הדיווחים</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {reports.length === 0 ? (
                <p className="text-muted text-center py-4">אין דיווחים</p>
              ) : (
                reports.map((report) => (
                  <div
                    key={report._id}
                    className="p-4 rounded-lg border border-border"
                    style={{ backgroundColor: 'var(--warning-bg)' }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{report.eventType}</p>

                        {report.studentId && (
                          <p className="text-sm mt-1">
                            <span className="font-semibold">סטודנט:</span> {report.studentId.name} ({report.studentId.idNumber})
                          </p>
                        )}

                        {report.supervisorId && (
                          <p className="text-sm text-muted mt-1">
                            <span className="font-semibold">משגיח:</span> {report.supervisorId.name}
                          </p>
                        )}

                        {report.description && (
                          <p className="text-sm mt-2 bg-bg p-2 rounded border border-border">
                            {report.description}
                          </p>
                        )}

                        <p className="text-xs text-muted mt-2">
                          {new Date(report.timestamp).toLocaleString('he-IL')}
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
