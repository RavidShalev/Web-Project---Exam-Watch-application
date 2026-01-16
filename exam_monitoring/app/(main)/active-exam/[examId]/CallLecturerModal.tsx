"use client";

import { useState } from "react";
import { X, User } from "lucide-react";

interface Lecturer {
  _id: string;
  idNumber: string;
  name: string;
}

interface CallLecturerModalProps {
  examId: string;
  lecturers: Lecturer[];
  calledLecturer?: Lecturer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CallLecturerModal({
  examId,
  lecturers,
  calledLecturer,
  onClose,
  onSuccess,
}: CallLecturerModalProps) {
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>(
    calledLecturer?._id || ""
  );
  const [calling, setCalling] = useState(false);

  const handleCallLecturer = async () => {
    if (!selectedLecturerId) {
      alert("נא לבחור מרצה");
      return;
    }

    setCalling(true);

    try {
      const supervisorId = localStorage.getItem("supervisorId");
      
      const res = await fetch(`/api/exams/${examId}/call-lecturer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lecturerId: selectedLecturerId,
          supervisorId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "אירעה שגיאה בקריאה למרצה");
        return;
      }

      alert(data.message || "המרצה נקרא בהצלחה!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error calling lecturer:", error);
      alert("אירעה שגיאה בקריאה למרצה");
    } finally {
      setCalling(false);
    }
  };

  if (lecturers.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--fg)]">
              קרא למרצה
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-[var(--muted)]">
            אין מרצים משובצים למבחן זה
          </p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 bg-[var(--surface-hover)] hover:brightness-105"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--fg)]">
            קרא למרצה
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">

          {calledLecturer && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>מרצה נוכחי:</strong> {calledLecturer.name}
              </p>
              <button
                onClick={async () => {
                  setCalling(true);
                  try {
                    const supervisorId = localStorage.getItem("supervisorId");
                    
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

                    alert(data.message || "הקריאה בוטלה בהצלחה!");
                    onSuccess();
                    onClose();
                  } catch (error) {
                    console.error("Error canceling call:", error);
                    alert("אירעה שגיאה בביטול הקריאה");
                  } finally {
                    setCalling(false);
                  }
                }}
                disabled={calling}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
              >
                {calling ? "מבטל..." : "בטל קריאה"}
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">
              בחר מרצה
            </label>
            <select
              value={selectedLecturerId}
              onChange={(e) => setSelectedLecturerId(e.target.value)}
              className="
                w-full rounded-lg p-3
                bg-[var(--surface)]
                text-[var(--fg)]
                border border-[var(--border)]
                focus:outline-none
                focus:ring-2 focus:ring-[var(--ring)]
              "
            >
              <option value="">-- בחר מרצה --</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.name} ({lecturer.idNumber})
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-[var(--muted)]">
            לאחר בחירת המרצה, הוא יסומן כנקרא לכיתה זו ויופיע במפת הכיתות.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={calling}
            className="
              px-4 py-2 rounded-xl
              border border-[var(--border)]
              text-[var(--fg)]
              bg-[var(--surface)]
              hover:bg-[var(--surface-hover)]
              transition disabled:opacity-50
            "
          >
            ביטול
          </button>

          <button
            onClick={handleCallLecturer}
            disabled={calling || !selectedLecturerId}
            className="
              px-4 py-2 rounded-xl
              bg-[var(--accent)]
              text-white
              hover:opacity-90
              transition disabled:opacity-50
              flex items-center gap-2
            "
          >
            {calling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                קורא...
              </>
            ) : (
              <>
                <User size={18} />
                קרא למרצה
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
