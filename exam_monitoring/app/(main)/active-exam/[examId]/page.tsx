"use client";

import { Exam } from "@/types/examtypes";
import ExamTimer from "./examTimer";
import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import AttendanceList from "./attendanceList";
import { AttendanceRow } from "@/types/attendance";
import ReportEvents from "./reportEvents";
import { useRouter } from "next/navigation";

export default function ActiveExamPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const { examId } = useParams<{ examId: string }>();
  const [showReportModal, setShowReportModal] = useState(false);
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

  // Finish exam function
  async function finishExam() {
    const confirmed = window.confirm("האם את/ה בטוח/ה שברצונך לסיים את המבחן?");
    if (!confirmed) return;
    const res = await fetch(`/api/exams/${examId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
    return <div>טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-6">

      {/* Exam timer section */}
      {exam.actualStartTime && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl py-6 sm:py-10 px-4 text-center mb-6">
          <ExamTimer
            startTime={exam.actualStartTime}
            duration={exam.durationMinutes}
          />
          <p className="text-sm text-gray-500 mt-2">
            זמן שנשאר במבחן
          </p>
          <button onClick={finishExam} className="bg-red-600 text-white px-4 py-2 my-5 rounded w-full sm:w-auto">סיים מבחן</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-8">

        {/* General actions (responsive layout) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-5 mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            onClick={() => setShowReportModal(true)}
          >
            + דיווח אירוע כללי
          </button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">
            קרא למרצה
          </button>
        </div>

        {/* Attendance list title */}
        <h2 className="text-xl sm:text-2xl my-2 font-semibold mb-4 text-black">
          רשימת נוכחות
        </h2>

        {/* Attendance list */}
        <AttendanceList
          attendance={attendance}
          makePresent={makePresent}
          makeAbsent={makeAbsent}
          saveReport={saveReport}
          updateToiletTime={updateToiletTime}
          finishExamForStudent={finishExamForStudent}
        />
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
    </div>
  );
}

