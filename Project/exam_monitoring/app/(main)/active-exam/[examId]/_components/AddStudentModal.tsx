"use client";

import { useState } from "react";

type Props = {
  examId: string;
  onClose: () => void;
  onAdd: (studentIdNumber: string) => Promise<void>;
};

/**
 * AddStudentModal
 * Modal component used to add a new student to an active exam.
 * 
 * Responsibilities:
 * - Collect student ID number from the user
 * - Validate input before submission
 * - Close the modal after successful submission or cancellation
 */
export default function AddStudentModal({ examId, onClose, onAdd }: Props) {
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!idNumber.trim()) {
      alert("יש להזין תעודת זהות");
      return;
    }

    setLoading(true);
    await onAdd(idNumber);
    setLoading(false);
    onClose();
  }

  return (
    //fixed: positions the modal relative to the viewport (not the page layout)
    //z-50: ensures the modal appears above all other page elements
    <div
      className="
        fixed inset-0 z-50 
        flex items-center justify-center
        bg-black/40 dark:bg-black/60
        px-3
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-title"
    >
      <div
        className="
          w-full max-w-md
          rounded-2xl
          bg-[var(--bg)]
          border border-[var(--border)]
          p-5 sm:p-6
          space-y-5
          shadow-xl
        "
      >
        {/* Header */}
        <div className="space-y-1">
          <h2 id="add-student-title" className="text-lg sm:text-xl font-bold">
            הוספת סטודנט למבחן
          </h2>
          <p className="text-sm text-[var(--muted)]">
            הזן תעודת זהות של הסטודנט
          </p>
        </div>

        {/* Input */}
        <div>
          <label htmlFor="student-id" className="sr-only">תעודת זהות</label>
          <input
            id="student-id"
            type="text"
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            placeholder="תעודת זהות"
            className="
              w-full
              rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              px-4 py-3
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[var(--ring)]
            "
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              rounded-xl
              px-4 py-2
              text-sm
              bg-[var(--surface-hover)]
              hover:brightness-105
              disabled:opacity-60
            "
          >
            ביטול
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              rounded-xl
              px-4 py-2
              text-sm font-semibold
              text-white
              bg-[var(--info)]
              hover:brightness-110
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading ? "מוסיף…" : "הוסף"}
          </button>
        </div>
      </div>
    </div>
  );
}
