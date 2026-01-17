"use client";

import { AttendanceRow } from "@/types/attendance";
import { useState } from "react";

type Props = {
  attendanceRecord: AttendanceRow;
  availableExams: { _id: string; location: string }[];
  onClose: () => void;
  onTransfer: (targetExamId: string) => Promise<void>;
};

export default function TransferStudentModal({
  attendanceRecord,
  availableExams,
  onClose,
  onTransfer,
}: Props) {
  const [targetExamId, setTargetExamId] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-6 space-y-4">

        <h2 className="text-lg font-bold">
          העברת סטודנט
        </h2>

        <p className="text-sm text-[var(--muted)]">
          {attendanceRecord.studentId.name} – {attendanceRecord.studentId.idNumber}
        </p>

        <select
          value={targetExamId}
          onChange={e => setTargetExamId(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        >
          <option value="">בחר כיתה חדשה</option>
          {availableExams.map(exam => (
            <option key={exam._id} value={exam._id}>
              {exam.location}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 bg-[var(--surface-hover)]"
          >
            ביטול
          </button>
          <button
            disabled={!targetExamId}
            onClick={() => onTransfer(targetExamId)}
            className="rounded-xl px-4 py-2 text-white bg-[var(--purple)] disabled:opacity-50"
          >
            העבר
          </button>
        </div>
      </div>
    </div>
  );
}
