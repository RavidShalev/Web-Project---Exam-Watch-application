"use client";

import { useState } from "react";

type props = {
  attendanceRecord: any;
  onClose: () => void;
  onSave: (data: {
    examId: string;
    eventType: string;
    description?: string;
  }) => Promise<void>;
};

/**
 * ReportEvents
 * Modal component used to report general events during an active exam.
 * 
 * Responsibilities:
 * - Collect event type and description from the user 
 * - Close the modal after successful submission or cancellation
 */
export default function ReportEvents({
  attendanceRecord,
  onClose,
  onSave,
}: props) {
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
      <div
        className="
          w-full max-w-md
          rounded-2xl
          bg-[var(--bg)]
          border border-[var(--border)]
          p-5 sm:p-6
          shadow-xl
          text-right
        "
      >
        <h1 className="text-lg sm:text-xl font-bold text-[var(--fg)] mb-4 sm:mb-5">
          דיווח אירוע כללי
        </h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
              סוג האירוע
            </label>
            <select
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
              <option value="">בחר סוג אירוע</option>
              <option>אזעקה</option>
              <option>רעש חריג</option>
              <option>אירוע רפואי</option>
              <option>אחר</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
              תיאור
            </label>
            <textarea
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
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
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
            שליחה
          </button>
        </div>
      </div>
    </div>
  );
}
