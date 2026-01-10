"use client";

import { Exam } from "@/types/examtypes";
import ExamTimer from "./examTimer";
import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import AttendanceList from "./attendanceList";
import { AttendanceRow } from "@/types/attendance";
import ReportEvents from "./reportEvents";
import { useRouter } from "next/navigation";
import SmartBotAssistant from "./SmartBotAssistant";

export default function ActiveExamPage() {
  // hooks and states
  const [exam, setExam] = useState<Exam | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const { examId } = useParams<{ examId: string }>();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [minutes, setMinutes] = useState("");
  const router = useRouter();

  // this function will update a record attendance status to present
  async function makePresent(attendanceId: string) {
    const res = await fetch(`/api/exams/attendance/updateRecord/${attendanceId}`, {
      // change in attendance status to present
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({attendanceStatus: "present"}),
    });
    setAttendance((prevAttendance) => {
      // search for the attendance record and update its status without update all records
      const updatedAttendance = prevAttendance.map((record) => {
        if (record._id === attendanceId) {
          return { ...record, attendanceStatus: "present" as const };
        }
        return record;
      });
      return updatedAttendance;
    });
  };

  // this function will update a record attendance status to absent
  async function makeAbsent(attendanceId: string) {
    const res = await fetch(`/api/exams/attendance/updateRecord/${attendanceId}`, {
      // change in attendance status to absent
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({attendanceStatus: "absent"}),
    });
    setAttendance((prevAttendance) => {
      // search for the attendance record and update its status without update all records
      const updatedAttendance = prevAttendance.map((record) => {
        if (record._id === attendanceId) {
          return { ...record, attendanceStatus: "absent" as const };
        }
        return record;
      });
      return updatedAttendance;
    });
  };

  // Finish exam for specific student
  async function finishExamForStudent(attendanceId: string) {
    const res = await fetch(`/api/exams/attendance/updateRecord/${attendanceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({attendanceStatus: "finished"}),
    });
    // update attendance state to reflect the change
     setAttendance(prevAttendance =>
      prevAttendance.map(record =>
      record._id === attendanceId
        ? { ...record, attendanceStatus: "finished" as const }
        : record
    )
  );
  }

  // save general report to the DB (not specific student)
  async function saveGeneralReport(data: {examId: string; eventType: string; description?: string}) {
    const supervisorId = localStorage.getItem("supervisorId");
    const res = await fetch(`/api/exams/${examId}/reporting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...data, supervisorId}),
    });
    const result = await res.json();
    return result;
  }

  // save report to the DB (only report on specific student)
  async function saveReport(data: {examId: string; studentId: string; eventType: string; description?: string;
}) {
    const supervisorId = localStorage.getItem("supervisorId");
    const res = await fetch(`/api/exams/${examId}/reporting/${data.studentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...data, supervisorId}),
    });
    const result = await res.json();
    return result;
  }

  // update toilet time for specific attendance record (send report as well)
  async function updateToiletTime(attendanceId: string) {
    const currentRecord = attendance.find(record => record._id === attendanceId);
    if (!currentRecord) return;
    const newToiletStatus = currentRecord && !currentRecord.isOnToilet;
    const res = await fetch(`/api/exams/attendance/updateToilet/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnToilet: newToiletStatus }),
    });
    // send report about toilet event
    await saveReport({
      examId: examId,
      studentId: currentRecord.studentId._id,
      eventType: newToiletStatus ? "יצא לשירותים" : "חזר משירותים",
      description: "",
    });
    // Update local state
    setAttendance(prevAttendance =>
    prevAttendance.map(record =>
      record._id === attendanceId
        ? { ...record, isOnToilet: newToiletStatus }
        : record
    )
  );
  }

  // Add time to exam function
  async function handleAddTime() {
    const minutesToAdd = parseInt(minutes, 10);
    if (isNaN(minutesToAdd) || minutesToAdd <= 0) {
      alert("אנא הזן מספר תקין של דקות.");
      return;
    }
    const res = await fetch(`/api/exams/${examId}/addTime`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ minutesToAdd, userId: localStorage.getItem("supervisorId") }),
    });
    const data = await res.json();
    setExam(data.exam);
    setMinutes("");
    setShowAddTimeModal(false);
  }

  // Finish exam function
  async function finishExam() {
    const confirmed = window.confirm("האם את/ה בטוח/ה שברצונך לסיים את המבחן?");
    if (!confirmed) return;
    const res = await fetch(`/api/exams/${examId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({userId: localStorage.getItem("supervisorId") }),
    });
    const result = await res.json();
    setExam(result.exam);
    router.push(`/home/`);
  }

  // Fetch exam details
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

  // Fetch attendance records
  useEffect(() => {
    async function fetchAttendance() {
      const res = await fetch(`/api/exams/attendance/${examId}`);
      const data = await res.json();
      console.log("attendance response:", data);
      setAttendance(data.attendance ?? data);
    }

    if (examId) {
      fetchAttendance();
    }
  }, [examId]);

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner spinner-lg"></div>
          <p className="text-gray-500">טוען נתוני בחינה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-6" dir="rtl">

      {/* Header with exam info */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{exam.courseName}</h1>
              <p className="text-gray-500 text-sm mt-1">קוד קורס: {exam.courseCode} • {exam.location}</p>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                בחינה פעילה
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      {exam.actualStartTime && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">זמן שנותר</p>
              <ExamTimer
                startTime={exam.actualStartTime}
                duration={exam.durationMinutes}
              />
            </div>
            
            {/* Action buttons - organized in a row */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <button 
                onClick={() => setShowAddTimeModal(true)} 
                className="btn btn-secondary flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                הוספת זמן
              </button>
              <button 
                onClick={finishExam} 
                className="btn btn-danger flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                סיים בחינה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        
        {/* Quick Actions Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="btn btn-outline flex items-center justify-center gap-2 flex-1"
              onClick={() => setShowReportModal(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              דיווח אירוע כללי
            </button>

            <button className="btn btn-outline flex items-center justify-center gap-2 flex-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              קרא למרצה
            </button>
          </div>
        </div>

        {/* Attendance Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">
              {attendance.filter(a => a.attendanceStatus === "present").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">נוכחים</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-red-500">
              {attendance.filter(a => a.attendanceStatus === "absent").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">נעדרים</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {attendance.filter(a => a.attendanceStatus === "finished").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">סיימו</p>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">רשימת נוכחות</h2>
            <p className="text-sm text-gray-500">{attendance.length} סטודנטים רשומים</p>
          </div>
          
          <AttendanceList
            attendance={attendance}
            makePresent={makePresent}
            makeAbsent={makeAbsent}
            saveReport={saveReport}
            updateToiletTime={updateToiletTime}
            finishExamForStudent={finishExamForStudent}
          />
        </div>
      </div>

      {/* General report modal */}
      {showReportModal && (
        <ReportEvents
          attendanceRecord={{ examId }}
          onClose={() => setShowReportModal(false)}
          onSave={async ({ examId, eventType, description }) => {
            await saveGeneralReport({ examId, eventType, description });
            setShowReportModal(false);
          }}
        />
      )}

      {/* Smart Bot Assistant */}
      {exam.actualStartTime && (
        <SmartBotAssistant
          examId={examId}
          examStartTime={exam.actualStartTime}
          durationMinutes={exam.durationMinutes}
          attendance={attendance}
          courseName={exam.courseName}
        />
      )}

      {/* Add time modal */}
      {showAddTimeModal && (
        <div className="modal-overlay" dir="rtl">
          <div className="modal">
            <div className="modal-header">
              <h2 className="text-lg font-bold text-gray-900">הוספת זמן לבחינה</h2>
              <button
                onClick={() => setShowAddTimeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כמה דקות להוסיף?
              </label>
              <input 
                type="number" 
                min={1}
                max={120}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="לדוגמה: 15"
                className="input"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                הזמן יתווסף לכל הסטודנטים בבחינה
              </p>
            </div>
            
            <div className="modal-footer flex-row-reverse">
              <button
                onClick={handleAddTime}
                disabled={!minutes || parseInt(minutes) <= 0}
                className="btn btn-primary"
              >
                הוסף זמן
              </button>
              <button
                onClick={() => setShowAddTimeModal(false)}
                className="btn btn-outline"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

