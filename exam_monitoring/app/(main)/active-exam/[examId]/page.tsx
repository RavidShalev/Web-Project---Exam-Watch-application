"use client";

import { Exam } from "@/types/examtypes";
import ExamTimer from "./_components/examTimer";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AttendanceList from "./_components/attendanceList";
import { AttendanceRow } from "@/types/attendance";
import ReportEvents from "./_components/reportEvents";
import SmartBotAssistant from "./_components/SmartBotAssistant";
import CallLecturerModal from "./_components/CallLecturerModal";
import AddStudentModal from "./_components/AddStudentModal";

/**
 * ActiveExamPage
 * This page displays the active exam interface for supervisors, including
 * exam timer, attendance list, reporting options, and various modals for
 * managing the exam.
 * 
 * Responsibilities:
 * - Fetch and display exam details and attendance list
 * - Handle real-time exam actions (presence, absence, finish exam)
 * - Manage exam timing (add time globally or per student)
 * - Handle student-related events (toilet breaks, reports, transfers)
 * - Allow calling and canceling lecturer assistance
 * 
 * Architechture:
 * - Acts as a central controller page
 * - UI is split into smaller components under _components
 * - API calls are handled here to keep components focused on presentation
 * 
 */
export default function ActiveExamPage() {
  // Hooks
  const [exam, setExam] = useState<Exam | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const { examId } = useParams<{ examId: string }>();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [showCallLecturerModal, setShowCallLecturerModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal]=useState(false);
  const [availableExams, setAvailableExams] = useState<{ _id: string; location: string }[]>([]);
  const [minutes, setMinutes] = useState("");
  const router = useRouter(); //used for navigating after finishing exam

  // fetch available exams when examId changes
  useEffect(() => {
  if (!examId) return;

  async function fetchAvailableClasses() {
    const res = await fetch(`/api/exams/activeByCourse/${examId}`);
    const data = await res.json();

    if (!res.ok) {
      console.error(data.message);
      return;
    }

    setAvailableExams(data.exams);
  }

  fetchAvailableClasses();
}, [examId]);

// Functions to handle attendance status updates- change status to present
  async function makePresent(attendanceId: string) {
    await fetch(`/api/exams/attendance/updateRecord/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceStatus: "present" }),
    });
 // Update local attendance state after marking the student as present
    setAttendance(prev =>
      prev.map(r =>
        r._id === attendanceId ? { ...r, attendanceStatus: "present" } : r
      )
    );
  }
// change status to absent
  async function makeAbsent(attendanceId: string) {
    await fetch(`/api/exams/attendance/updateRecord/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceStatus: "absent" }),
    });

    setAttendance(prev =>
      prev.map(r =>
        r._id === attendanceId ? { ...r, attendanceStatus: "absent" } : r
      )
    );
  }
// finish exam for specific student
  async function finishExamForStudent(attendanceId: string) {
    const record = attendance.find(r => r._id === attendanceId);
    if (record?.isOnToilet) {
      alert("לא ניתן לסמן סיום מבחן לסטודנט שנמצא בשירותים");
      return;
    }

    await fetch(`/api/exams/attendance/updateRecord/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceStatus: "finished" }),
    });

    setAttendance(prev =>
      prev.map(r =>
        r._id === attendanceId ? { ...r, attendanceStatus: "finished" } : r
      )
    );
  }

  // Functions to handle reporting
  async function saveGeneralReport(data: {
    examId: string;
    eventType: string;
    description?: string;
  }) {
    const supervisorId = sessionStorage.getItem("supervisorId");
    const res = await fetch(`/api/exams/${examId}/reporting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, supervisorId }),
    });
    return res.json();
  }
// save report for specific student
  async function saveReport(data: {
    examId: string;
    studentId: string;
    eventType: string;
    description?: string;
  }) {
    const supervisorId = sessionStorage.getItem("supervisorId");
    const res = await fetch(
      `/api/exams/${examId}/reporting/${data.studentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, supervisorId }),
      }
    );
    return res.json();
  }
// update toilet time status
  async function updateToiletTime(attendanceId: string) {
    const record = attendance.find(r => r._id === attendanceId);
    if (!record) return;

    const newStatus = !record.isOnToilet;

    await fetch(`/api/exams/attendance/updateToilet/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnToilet: newStatus }),
    });

    await saveReport({
      examId,
      studentId: record.studentId._id,
      eventType: newStatus ? "יצא לשירותים" : "חזר משירותים",
    });

    setAttendance(prev =>
      prev.map(r =>
        r._id === attendanceId ? { ...r, isOnToilet: newStatus } : r
      )
    );
  }
// add time to exam
  async function handleAddTime() {
    const minutesToAdd = parseInt(minutes, 10);
    if (isNaN(minutesToAdd) || minutesToAdd <= 0) {
      alert("אנא הזן מספר תקין");
      return;
    }

    const res = await fetch(`/api/exams/${examId}/addTime`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minutesToAdd,
        userId: sessionStorage.getItem("supervisorId"),
      }),
    });

    const data = await res.json();
    setExam(data.exam);
    setMinutes("");
    setShowAddTimeModal(false);
  }
// add student to exam
  async function addStudentToExam(studentIdNumber: string) {
    const res = await fetch(`/api/exams/attendance/addNewAttendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId,
        studentIdNumber,
        userId: sessionStorage.getItem("supervisorId"),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "שגיאה בהוספת סטודנט");
      return;
    }

    setAttendance(prev => [...prev, data.attendance]);
  }
// transfer student to another active exam (same course)
async function transferStudent(attendanceId: string, targetExamId: string) 
{
  const res = await fetch("/api/exams/attendance/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attendanceId,
      targetExamId,
      userId: sessionStorage.getItem("supervisorId"),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  setAttendance(prev =>
    prev.map(a =>
      a._id === attendanceId
        ? { ...a, attendanceStatus: "transferred" }
        : a
    )
  );
}


// add time for specific student
  async function handleAddTimeForStudent(
    attendanceId: string,
    minutesToAdd: number
  ) {
    await fetch(`/api/exams/attendance/addTime/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutesToAdd }),
    });

    setAttendance(prev =>
      prev.map(r =>
        r._id === attendanceId
          ? { ...r, extraTimeMinutes: r.extraTimeMinutes + minutesToAdd }
          : r
      )
    );
  }
// finish entire exam
  async function finishExam() {
    const active = attendance.filter(a => a.attendanceStatus === "present");
    if (active.length > 0) {
      alert(`יש ${active.length} סטודנטים שעדיין נוכחים`);
      return;
    }

    if (!window.confirm("האם לסיים את המבחן?")) return;

    await fetch(`/api/exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: sessionStorage.getItem("supervisorId"),
      }),
    });

    router.push("/home");
  }
// call lecturer function
  async function handleCallLecturer() {
    if (!exam) return;

    // lecturer can be either an ID string or an full object
    type LecturerRef = string | { _id: string; idNumber?: string; name?: string };
    // get lecturers from the exam (or empty array if none)
    const lecturers = (exam as Exam & { lecturers?: LecturerRef[] }).lecturers || [];
    // Ensure all lecturers have the same object structure
    const lecturersArray = lecturers.map((l: LecturerRef) =>
      typeof l === 'string' ? { _id: l } : l
    );

    if (lecturersArray.length === 0) {
      alert("אין מרצים משובצים למבחן זה");
      return;
    }

    // Call the first lecturer (all lecturers will be notified in their view)
    const lecturerId = lecturersArray[0]._id;
    const supervisorId = sessionStorage.getItem("supervisorId");

    try {
      const res = await fetch(`/api/exams/${examId}/call-lecturer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lecturerId,
          supervisorId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "אירעה שגיאה בקריאה למרצה");
        return;
      }

      const lecturersNames = lecturersArray.map(l => typeof l === 'object' && l.name ? l.name : 'מרצה').join(', ');
      alert(`כל המרצים נקראו בהצלחה! (${lecturersNames})`);
      
      // Refresh exam data
      fetch(`/api/exams/${examId}`)
        .then(res => res.json())
        .then(data => setExam(data.exam ?? data));
    } catch (error) {
      console.error("Error calling lecturer:", error);
      alert("אירעה שגיאה בקריאה למרצה");
    }
  }
// cancel lecturer call function
  async function handleCancelLecturerCall() {
    if (!exam) return;

    if (!window.confirm("האם לבטל את הקריאה למרצה?")) return;

    const supervisorId = sessionStorage.getItem("supervisorId");

    try {
      const res = await fetch(`/api/exams/${examId}/call-lecturer`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: supervisorId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "אירעה שגיאה בביטול הקריאה");
        return;
      }

      alert("הקריאה בוטלה בהצלחה!");
      
      // Refresh exam data
      fetch(`/api/exams/${examId}`)
        .then(res => res.json())
        .then(data => setExam(data.exam ?? data));
    } catch (error) {
      console.error("Error canceling call:", error);
      alert("אירעה שגיאה בביטול הקריאה");
    }
  }
// Fetch exam and attendance data on component mount and when examId changes
  useEffect(() => {
    if (!examId) return;
    
    async function fetchExamData() {
      const res = await fetch(`/api/exams/${examId}`);
      const data = await res.json();
      setExam(data.exam ?? data);
    }
    
    fetchExamData();
    
    // Auto-refresh exam data every 10 seconds to catch lecturer call changes
    const interval = setInterval(fetchExamData, 10000);
    return () => clearInterval(interval);
  }, [examId]);

  // Fetch attendance data
  useEffect(() => {
    if (!examId) return;
    fetch(`/api/exams/attendance/${examId}`)
      .then(res => res.json())
      .then(data => setAttendance(data.attendance ?? data));
  }, [examId]);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
        טוען…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">

      {exam.actualStartTime && (
        <div className="max-w-4xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 text-center shadow-sm space-y-4 sm:space-y-6">

          <ExamTimer
            startTime={exam.actualStartTime}
            duration={exam.durationMinutes}
          />

          <p className="text-sm text-[var(--muted)]">
           זמן שנותר למבחן
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowAddTimeModal(true)}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white bg-[var(--warning)] hover:brightness-110"
            >
              הוספת זמן לבחינה
            </button>

            <button
              onClick={finishExam}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white bg-[var(--danger)] hover:brightness-110"
            >
              סיים מבחן
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white bg-[var(--accent)] hover:brightness-110"
          >
            + דיווח אירוע כללי
          </button>

          <button onClick={() => setShowAddStudentModal(true)}
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white bg-[var(--info)]">
            + הוספת סטודנט
         </button>

          {((exam as Exam & { calledLecturer?: { _id: string } | null }).calledLecturer) ? (
            <button
              onClick={handleCancelLecturerCall}
              className="rounded-xl px-5 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700"
            >
              ביטול קריאה למרצה
            </button>
          ) : (
            <button
              onClick={handleCallLecturer}
              className="rounded-xl px-5 py-2 text-sm font-semibold bg-[var(--surface-hover)] hover:brightness-105"
            >
              קרא למרצה
            </button>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold">
          רשימת נוכחות
        </h2>

        <AttendanceList
          attendance={attendance}
          makePresent={makePresent}
          makeAbsent={makeAbsent}
          saveReport={saveReport}
          updateToiletTime={updateToiletTime}
          finishExamForStudent={finishExamForStudent}
          addTimeForStudent={handleAddTimeForStudent}
          onOpenTransfer={transferStudent}
          availableExams={availableExams}
        />
      </div>

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

      {exam.actualStartTime && (
        <SmartBotAssistant
          examId={examId}
          examStartTime={exam.actualStartTime}
          durationMinutes={exam.durationMinutes}
          attendance={attendance}
          courseName={exam.courseName}
        />
      )}

      {showAddTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90vw] max-w-md rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-5 sm:p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold">הוספת זמן למבחן</h2>

            <input
              type="number"
              min={1}
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="כמה דקות להוסיף?"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowAddTimeModal(false)}
                className="rounded-xl px-4 py-2 bg-[var(--surface-hover)] hover:brightness-105"
              >
                ביטול
              </button>
              <button
                onClick={handleAddTime}
                className="rounded-xl px-4 py-2 text-white bg-[var(--warning)] hover:brightness-110"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {showCallLecturerModal && exam && (
        <CallLecturerModal
          examId={examId}
          lecturers={
            ((exam as Exam & { lecturers?: Array<string | { _id: string; idNumber?: string; name?: string }> }).lecturers || [])
              .map((l) =>
                typeof l === 'string' ? { _id: l, idNumber: '', name: '' } : l
              )
          }
          calledLecturer={((exam as Exam & { calledLecturer?: { _id: string; idNumber?: string; name?: string } | null }).calledLecturer || null) as { _id: string; idNumber: string; name: string } | null}
          onClose={() => setShowCallLecturerModal(false)}
          onSuccess={() => {
            // Refresh exam data
            fetch(`/api/exams/${examId}`)
              .then(res => res.json())
              .then(data => setExam(data.exam ?? data));
          }}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          examId={examId}
          onClose={() => setShowAddStudentModal(false)}
          onAdd={addStudentToExam}
        />
      )}

    </div>
  );
}
