"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Users, AlertCircle, MessageSquare, Clock, Wifi, WifiOff } from "lucide-react";
import { useP2PChat, P2PMessage } from "@/app/lib/useP2PChat";

type Message = {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    idNumber: string;
  };
  message: string;
  messageType: "message" | "status_update" | "emergency";
  createdAt: string;
  readBy?: Array<{ userId: string; readAt: string }>;
  isP2P?: boolean;
};

type SupervisorStatus = {
  _id: string;
  supervisorId: {
    _id: string;
    name: string;
    idNumber: string;
  };
  status: "available" | "busy" | "on_break" | "away";
  lastSeen: string;
  location?: string;
};

type CommunicationPanelProps = {
  examId: string;
  currentSupervisorId: string;
  supervisorName?: string;
  supervisorIdNumber?: string;
};

const statusLabels: Record<string, string> = {
  available: "פנוי",
  busy: "עסוק",
  on_break: "בהפסקה",
  away: "לא נוכח",
};

const statusColors: Record<string, string> = {
  available: "bg-green-500",
  busy: "bg-yellow-500",
  on_break: "bg-blue-500",
  away: "bg-gray-500",
};

export default function CommunicationPanel({
  examId,
  currentSupervisorId,
  supervisorName = "משגיח",
  supervisorIdNumber = "",
}: CommunicationPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [statuses, setStatuses] = useState<SupervisorStatus[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"available" | "busy" | "on_break" | "away">("available");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "status">("messages");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Keep a ref to P2P messages so they persist across polling
  const p2pMessagesRef = useRef<Message[]>([]);

  // P2P Chat Hook - handles peer-to-peer messaging
  const handleP2PMessage = useCallback((message: P2PMessage) => {
    const msgWithP2P = { ...message, isP2P: true } as Message;
    // Save to ref so it persists across polling
    if (!p2pMessagesRef.current.some((m) => m._id === message._id)) {
      p2pMessagesRef.current = [...p2pMessagesRef.current, msgWithP2P];
    }
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m._id === message._id)) {
        return prev;
      }
      return [...prev, msgWithP2P];
    });
  }, []);

  const {
    isConnected: isP2PConnected,
    connectedPeers,
    sendP2PMessage,
    error: p2pError,
  } = useP2PChat({
    examId,
    supervisorId: currentSupervisorId,
    supervisorName,
    supervisorIdNumber,
    onMessage: handleP2PMessage,
  });

  // Fetch messages and statuses
  useEffect(() => {
    if (!examId) return;

    async function fetchData() {
      try {
        // Fetch messages
        const messagesRes = await fetch(`/api/exams/${examId}/messages`);
        const messagesData = await messagesRes.json();
        if (messagesData.success) {
          const serverMessages = messagesData.messages || [];
          // Use ref to get P2P messages - this is more reliable than state closure
          const serverMessageIds = new Set(serverMessages.map((m: Message) => m._id));
          // Filter P2P messages from ref that don't exist in server response
          const uniqueP2PMessages = p2pMessagesRef.current.filter((m) => !serverMessageIds.has(m._id));
          // Combine server messages with unique P2P messages and sort by date
          const allMessages = [...serverMessages, ...uniqueP2PMessages];
          allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setMessages(allMessages);
        }

        // Fetch supervisor statuses
        const statusRes = await fetch(`/api/exams/${examId}/supervisor-status`);
        const statusData = await statusRes.json();
        if (statusData.success) {
          setStatuses(statusData.statuses || []);
        }
      } catch (error) {
        console.error("Error fetching communication data:", error);
      }
    }

    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [examId]);

  // Update current supervisor status on mount and when it changes
  useEffect(() => {
    if (!examId || !currentSupervisorId) return;

    async function updateStatus() {
      try {
        await fetch(`/api/exams/${examId}/supervisor-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supervisorId: currentSupervisorId,
            status: currentStatus,
          }),
        });
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }

    updateStatus();
  }, [examId, currentSupervisorId, currentStatus]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim()) {
      return; // אין הודעה לשלוח
    }

    if (!examId) {
      alert("שגיאה: מזהה מבחן חסר");
      return;
    }

    if (!currentSupervisorId) {
      alert("שגיאה: לא זוהה משתמש. נא להתחבר מחדש.");
      return;
    }

    // Send via P2P if connected
    if (isP2PConnected) {
      const p2pMessage = sendP2PMessage(newMessage.trim(), "message");
      const msgWithP2P = { ...p2pMessage, isP2P: true } as Message;
      // Save to ref so it persists across polling
      p2pMessagesRef.current = [...p2pMessagesRef.current, msgWithP2P];
      // Add to local messages immediately
      setMessages((prev) => [...prev, msgWithP2P]);
      setNewMessage("");
      return;
    }

    // Fallback to server if P2P not available
    try {
      const res = await fetch(`/api/exams/${examId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentSupervisorId,
          message: newMessage.trim(),
          messageType: "message",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "שגיאה בשליחת ההודעה");
      }

      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        // Message will be added by polling
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error instanceof Error ? error.message : "שגיאה בשליחת ההודעה");
    }
  }

  async function handleStatusChange(newStatus: "available" | "busy" | "on_break" | "away") {
    setCurrentStatus(newStatus);

    try {
      await fetch(`/api/exams/${examId}/supervisor-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisorId: currentSupervisorId,
          status: newStatus,
        }),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async function sendEmergencyAlert() {
    if (!examId) {
      alert("שגיאה: מזהה מבחן חסר");
      return;
    }

    if (!currentSupervisorId) {
      alert("שגיאה: לא זוהה משתמש. נא להתחבר מחדש.");
      return;
    }

    const emergencyMessage = "🚨 התראה: דרושה תשומת לב מיידית!";

    // Send via P2P if connected
    if (isP2PConnected) {
      const p2pMessage = sendP2PMessage(emergencyMessage, "emergency");
      setMessages((prev) => [...prev, p2pMessage as Message]);
      return;
    }

    // Fallback to server
    try {
      const res = await fetch(`/api/exams/${examId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentSupervisorId,
          message: emergencyMessage,
          messageType: "emergency",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "שגיאה בשליחת התראה");
      }
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      alert(error instanceof Error ? error.message : "שגיאה בשליחת התראה");
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[var(--accent)] text-white rounded-full p-4 shadow-2xl hover:brightness-110 hover:scale-110 transition-transform flex items-center gap-2 relative"
          title="פתיחת תקשורת עם משגיחים - לחץ לפתיחה"
        >
          <MessageSquare className="w-6 h-6" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
              {messages.length}
            </span>
          )}
          <span className="absolute -right-20 top-1/2 -translate-y-1/2 bg-[var(--surface)] text-[var(--fg)] px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap shadow-lg border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            תקשורת משגיחים
          </span>
        </button>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-[90vw] sm:w-[400px] max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="font-bold">תקשורת משגיחים</h3>
              {/* P2P Connection Status Indicator */}
              <div className="flex items-center gap-1" title={isP2PConnected ? `P2P מחובר (${connectedPeers.length} משגיחים)` : "מתחבר לרשת P2P..."}>
                {isP2PConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-yellow-500 animate-pulse" />
                )}
                <span className="text-xs text-[var(--muted)]">
                  {isP2PConnected ? "P2P" : "..."}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--fg)]"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 p-3 text-sm font-semibold ${activeTab === "messages"
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
            >
              הודעות
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex-1 p-3 text-sm font-semibold ${activeTab === "status"
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
            >
              סטטוס משגיחים
            </button>
          </div>

          {/* Messages List or Status List */}
          {activeTab === "messages" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
              {messages.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8">
                  אין הודעות עדיין
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId._id === currentSupervisorId;
                  const isEmergency = msg.messageType === "emergency";

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                        className={`rounded-xl p-3 max-w-[80%] ${isMine
                          ? "bg-[var(--accent)] text-white"
                          : isEmergency
                            ? "bg-red-100 text-red-900 border-2 border-red-500"
                            : "bg-[var(--surface-hover)]"
                          }`}
                      >
                        {!isMine && (
                          <div className="text-xs font-semibold mb-1">
                            {msg.senderId.name}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.message}
                        </div>
                        <div
                          className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-[var(--muted)]"
                            }`}
                        >
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[350px]">
              {statuses.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8">
                  אין משגיחים נוכחים
                </div>
              ) : (
                statuses.map((status) => {
                  const isMe = status.supervisorId._id === currentSupervisorId;
                  const lastSeenText = formatTime(status.lastSeen);

                  return (
                    <div
                      key={status._id}
                      className={`p-3 rounded-lg border ${isMe
                        ? "bg-[var(--accent)]/10 border-[var(--accent)]"
                        : "bg-[var(--surface-hover)] border-[var(--border)]"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${statusColors[status.status]}`}
                          />
                          <span className={`font-semibold ${isMe ? "text-[var(--accent)]" : ""}`}>
                            {status.supervisorId.name}
                            {isMe && " (אני)"}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {statusLabels[status.status]}
                        </span>
                      </div>
                      {status.location && (
                        <div className="text-xs text-[var(--muted)] mt-1">
                          מיקום: {status.location}
                        </div>
                      )}
                      <div className="text-xs text-[var(--muted)] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        נראה לאחרונה: {lastSeenText}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Status Update Section - Show in both tabs */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--bg)]">
            <div className="text-xs text-[var(--muted)] mb-2">סטטוס נוכחי:</div>
            <div className="flex gap-2 mb-3">
              {(["available", "busy", "on_break", "away"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${currentStatus === status
                      ? `${statusColors[status]} text-white`
                      : "bg-[var(--surface-hover)] text-[var(--fg)]"
                      }`}
                  >
                    {statusLabels[status]}
                  </button>
                )
              )}
            </div>

            {/* Message Input - Only show in messages tab */}
            {activeTab === "messages" && (
              <>
                {/* Emergency Button */}
                <button
                  onClick={sendEmergencyAlert}
                  className="w-full mb-2 px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  שליחת התראה דחופה
                </button>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                    placeholder="הקלד הודעה..."
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    dir="rtl"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[var(--accent)] text-white rounded-lg px-4 py-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Supervisors Status */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--bg)]">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" />
              משגיחים נוכחים ({statuses.length})
            </div>
            <div className="space-y-1 max-h-[100px] overflow-y-auto">
              {statuses.map((status) => (
                <div
                  key={status._id}
                  className="flex items-center justify-between text-xs"
                >
                  <span>{status.supervisorId.name}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${statusColors[status.status]}`}
                    />
                    <span className="text-[var(--muted)]">
                      {statusLabels[status.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
