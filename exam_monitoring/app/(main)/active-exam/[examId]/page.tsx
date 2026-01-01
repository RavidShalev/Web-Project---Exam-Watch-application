"use client";

import { Exam } from "@/types/Exam";
import ExamTimer from "./examTimer";
import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import AttendanceList from "./attendanceList";
import { AttendanceRow } from "@/types/attendance";

export default function ActiveExamPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const { examId } = useParams<{ examId: string }>();

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
    <div className="min-h-screen bg-gray-50 px-6 py-6">

      {exam.actualStartTime && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl py-10 mn-8 text-center">
        <ExamTimer
          startTime={exam.actualStartTime}
          duration={exam.durationMinutes}
        />
        <p className="text-sm text-gray-500 mt-2">זמן שנשאר במבחן</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-4">רשימת נוכחות</h2>
        <AttendanceList attendance={attendance} makePresent={makePresent} makeAbsent={makeAbsent} />
      </div>
    </div>
  );
}


