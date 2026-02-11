"use client";

import { AttendanceRow } from "@/types/attendance";
import { useState } from "react";

type Props = {
  attendanceRecord: AttendanceRow;
  availableExams: { _id: string; location: string }[];
  onClose: () => void;
  onTransfer: (targetExamId: string) => Promise<void>;
};

/**
 * 
 * TransferStudentModal
 * Modal component used to transfer a student to another exam. (same exam different location)
 * 
 * Responsibilities:
 * - Display a list of available exams to transfer the student to
 * - Allow selection of a target exam
 * - Close the modal after successful submission or cancellation
 */
export default function TransferStudentModal({
  attendanceRecord,
  availableExams,
  onClose,
  onTransfer,
}: Props) {
  const [targetExamId, setTargetExamId] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="transfer-title">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-6 space-y-4">

        <h2 id="transfer-title" className="text-lg font-bold">
          העברת סטודנט
        </h2>

        <p className="text-sm text-[var(--muted)]">
          {attendanceRecord.studentId.name} – {attendanceRecord.studentId.idNumber}
        </p>

        <div>
          <label htmlFor="target-exam" className="sr-only">בחר כיתה חדשה</label>
          <select
            id="target-exam"
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
        </div>

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
