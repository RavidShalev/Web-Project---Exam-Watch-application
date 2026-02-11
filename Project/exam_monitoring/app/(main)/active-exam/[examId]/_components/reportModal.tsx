"use client";

import { useState } from "react";

type props = {
  attendanceRecord: any;
  onClose: () => void;
  onSave: (data: {
    examId: string;
    studentId: string;
    eventType: string;
    description?: string;
  }) => Promise<void>;
};

/**
 * ReportEvents
 * Modal component used to report general events during an active exam.
 * 
 *  Responsibilities:
 * - Collect event type and description from the user 
 * - Close the modal after successful submission or cancellation
 */
export default function ReportModal({
  attendanceRecord,
  onClose,
  onSave,
}: props) {
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div
        className="
          w-full max-w-md
          rounded-2xl
          bg-[var(--bg)]
          border border-[var(--border)]
          p-5 sm:p-6
          shadow-xl
          text-right
          space-y-4
        "
      >
        <h2 id="report-title" className="text-lg sm:text-xl font-bold text-[var(--fg)]">
          דיווח על סטודנט
        </h2>

        <div className="text-sm text-[var(--muted)] leading-snug">
          {attendanceRecord.studentId.name} –{" "}
          {attendanceRecord.studentId.idNumber}
        </div>

        <div>
          <label htmlFor="event-type" className="sr-only">סוג אירוע חריג</label>
          <select
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="
              w-full
              rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              px-3 py-2
              text-sm sm:text-base
              text-[var(--fg)]
              focus:outline-none
              focus:ring-2
              focus:ring-[var(--ring)]
            "
          >
            <option value="">בחר סוג אירוע חריג</option>
            <option>איחור</option>
            <option>עזיבה מוקדמת</option>
            <option>יצא מהכיתה</option>
            <option>חשד להעתקה (תיאור חובה)</option>
            <option>אחר</option>
          </select>
        </div>

        <div>
          <label htmlFor="event-description" className="sr-only">תיאור האירוע</label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="מלא תיאור על האירוע אם יש צורך"
            rows={4}
            className="
              w-full
              rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              px-3 py-2
              text-sm sm:text-base
              text-[var(--fg)]
              placeholder:text-[var(--muted)]
              focus:outline-none
              focus:ring-2
              focus:ring-[var(--ring)]
            "
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <button
            onClick={onClose}
            className="
              rounded-xl
              px-4 sm:px-5 py-2
              text-sm font-semibold
              text-[var(--fg)]
              bg-[var(--surface-hover)]
              hover:brightness-105
            "
          >
            ביטול
          </button>

          <button
            onClick={async () => {
              await onSave({
                examId: attendanceRecord.examId,
                studentId: attendanceRecord.studentId._id,
                eventType,
                description,
              });
              onClose();
            }}
            className="
              rounded-xl
              px-4 sm:px-5 py-2
              text-sm font-semibold
              text-white
              bg-[var(--danger)]
              hover:brightness-110
            "
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
