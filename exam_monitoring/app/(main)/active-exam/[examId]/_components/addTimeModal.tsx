"use client";

import { useState } from "react";

type props = {
  attendanceRecord: any;
  onClose: () => void;
  onSave: (minuteToAdd: number) => Promise<void>;
};

/**
 * AddTimeModal
 * Modal component used to add extra time for a specific student during an exam.
 * 
 * Responsibilities:
 * - Collect the number of minutes to add from the user
 * - Validate input before submission
 * - Close the modal after successful submission or cancellation
 * 
*/
export default function AddTimeModal({
  attendanceRecord,
  onClose,
  onSave,
}: props) {
  const [minuteToAdd, setMinuteToAdd] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3" role="dialog" aria-modal="true" aria-labelledby="add-time-title">
      <div
        className="
          w-full max-w-md
          rounded-2xl
          bg-[var(--bg)]
          border border-[var(--border)]
          shadow-xl
          p-5 sm:p-6
          space-y-4 sm:space-y-5
          text-right
        "
      >
        <h2 id="add-time-title" className="text-lg sm:text-xl font-bold text-[var(--fg)]">
          הוספת זמן לסטודנט
        </h2>

        <div className="text-sm text-[var(--muted)] leading-snug">
          {attendanceRecord.studentId.name} –{" "}
          {attendanceRecord.studentId.idNumber}
        </div>

        <div>
          <label htmlFor="minutes-to-add" className="sr-only">כמה דקות להוסיף</label>
          <input
            id="minutes-to-add"
            type="number"
            min={1}
            value={minuteToAdd}
            onChange={(e) => setMinuteToAdd(e.target.value)}
            placeholder="כמה דקות להוסיף?"
            className="
              w-full
              rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              px-3 sm:px-4 py-3
              text-sm sm:text-base
              text-[var(--fg)]
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
              const value = parseInt(minuteToAdd, 10);
              if (isNaN(value) || value <= 0) {
                alert("אנא הזן/י מספר דקות תקין");
                return;
              }

              await onSave(value);
              onClose();
            }}
            className="
              rounded-xl
              px-4 sm:px-5 py-2
              text-sm font-semibold
              text-white
              bg-[var(--warning)]
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
