"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

// Props passed to this modal component
interface MessageModalProps {
  examId: string;                                        // ID of current exam
  supervisors: Array<{ _id: string; name: string }>;    // List of supervisors to send to
  onClose: () => void;                                   // Function to close modal
}

/**
 * SendMessageModal Component
 * Modal popup that allows lecturer to send message to supervisors during exam
 */
export default function SendMessageModal({ examId, supervisors, onClose }: MessageModalProps) {
  const [selectedSupervisor, setSelectedSupervisor] = useState("all");  // Which supervisor to send to
  const [message, setMessage] = useState("");                            // Message text
  const [sending, setSending] = useState(false);                         // Is currently sending?

  // Handle send button click
  const handleSend = async () => {
    // Validate: message must not be empty
    if (!message.trim()) {
      alert("נא להזין הודעה");
      return;
    }

    setSending(true); // Show loading state
    
    try {
      // Simulate API call (replace with real API later)
      // TODO: Create API endpoint at /api/exams/${examId}/messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, call:
      // POST /api/exams/${examId}/messages
      // Body: { supervisorId: selectedSupervisor, message }
      
      alert("ההודעה נשלחה בהצלחה");
      setMessage(""); // Clear message
      onClose();      // Close modal
    } catch (error) {
      alert("שגיאה בשליחת ההודעה");
    } finally {
      setSending(false); // Hide loading state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">שליחת הודעה למשגיח</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Supervisor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              בחר משגיח
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              הודעה
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתוב את ההודעה כאן..."
              rows={5}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length} / 500 תווים
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            ביטול
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
