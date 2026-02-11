"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

interface MessageModalProps {
  examId: string;
  supervisors: Array<{ _id: string; name: string }>;
  onClose: () => void;
}

/**
 * SendMessageModal
 * Modal component used to send messages to exam supervisors.
 *
 * Responsibilities:
 * - Display a modal dialog for composing supervisor messages
 * - Allow selecting a specific supervisor or broadcasting to all supervisors
 * - Validate message input before sending
 * - Handle message sending state and user feedback
 * - Provide accessible modal behavior (focus, labels, dismissal)
 * - Notify parent component when the modal is closed
 */
export default function SendMessageModal({
  examId,
  supervisors,
  onClose,
}: MessageModalProps) {
  const [selectedSupervisor, setSelectedSupervisor] = useState("all");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      alert("נא להזין הודעה");
      return;
    }

    setSending(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("ההודעה נשלחה בהצלחה");
      setMessage("");
      onClose();
    } catch {
      alert("שגיאה בשליחת ההודעה");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-message-title"
    >
      <div
        className="
          w-full max-w-md rounded-2xl p-6 shadow-xl
          bg-[var(--surface)]
          border border-[var(--border)]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="send-message-title" className="text-xl font-bold text-[var(--fg)]">
            שליחת הודעה למשגיח
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Supervisor Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">
              בחר משגיח
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="
                w-full rounded-lg p-3
                bg-[var(--bg)]
                text-[var(--fg)]
                border border-[var(--border)]
                focus:outline-none
                focus:ring-2 focus:ring-[var(--ring)]
              "
            >
              <option value="all">כל המשגיחים</option>
              {supervisors.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">
              הודעה
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתוב את ההודעה כאן..."
              rows={5}
              maxLength={500}
              className="
                w-full rounded-lg p-3 resize-none
                bg-[var(--bg)]
                text-[var(--fg)]
                border border-[var(--border)]
                focus:outline-none
                focus:ring-2 focus:ring-[var(--ring)]
              "
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              {message.length} / 500 תווים
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={sending}
            className="
              px-4 py-2 rounded-lg
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
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="
              px-4 py-2 rounded-lg
              bg-[var(--accent)]
              text-white
              hover:opacity-90
              transition disabled:opacity-50
              flex items-center gap-2
            "
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                שולח...
              </>
            ) : (
              <>
                <Send size={18} />
                שלח הודעה
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
