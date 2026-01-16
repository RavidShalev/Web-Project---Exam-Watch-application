"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, X, Send, Bell, CheckCircle, AlertTriangle, Clock, MessageCircle, ChevronDown, Volume2 } from "lucide-react";
import { AttendanceRow } from "@/types/attendance";

// Simple function to play notification sound
function playNotificationSound(type: "alert" | "warning" | "info" = "info") {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different alert types
    const frequencies = { alert: 880, warning: 660, info: 440 };
    oscillator.frequency.value = frequencies[type];
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Double beep for alerts
    if (type === "alert") {
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 880;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 200);
    }
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Types for bot messages
type MessageType = "user" | "bot" | "alert" | "check-in" | "summary";

type BotMessage = {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  requiresResponse?: boolean;
  responseOptions?: string[];
  responded?: boolean;
};

type AlertConfig = {
  id: string;
  triggerMinutesBefore: number; // minutes before end
  message: string;
  triggered: boolean;
  type: "time" | "checkpoint";
};

type CheckInConfig = {
  id: string;
  triggerMinutesAfterStart: number;
  question: string;
  options: string[];
  triggered: boolean;
};

type Props = {
  examId: string;
  examStartTime: string;
  durationMinutes: number;
  attendance: AttendanceRow[];
  courseName: string;
};

export default function SmartBotAssistant({
  examId,
  examStartTime,
  durationMinutes,
  attendance,
  courseName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScreenAlert, setShowScreenAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Alert configurations - minutes before exam ends
  const [alerts, setAlerts] = useState<AlertConfig[]>([
    { id: "60min", triggerMinutesBefore: 60, message: "נשארה שעה אחת לסיום הבחינה. וודא שכל הסטודנטים מודעים לזמן.", triggered: false, type: "time" },
    { id: "30min", triggerMinutesBefore: 30, message: "⚠️ נשארו 30 דקות לסיום הבחינה! הכרז על כך בכיתה.", triggered: false, type: "time" },
    { id: "15min", triggerMinutesBefore: 15, message: "⏰ נשארו 15 דקות! הזכר לסטודנטים להתחיל לסכם.", triggered: false, type: "time" },
    { id: "10min", triggerMinutesBefore: 10, message: "🔔 נשארו 10 דקות לסיום! הכרז בכיתה: \"נשארו 10 דקות\"", triggered: false, type: "time" },
    { id: "5min", triggerMinutesBefore: 5, message: "⚡ נשארו 5 דקות בלבד! וודא שכולם מוכנים להגיש.", triggered: false, type: "time" },
    { id: "1min", triggerMinutesBefore: 1, message: "🚨 דקה אחת לסיום! התכונן לאסוף את המחברות.", triggered: false, type: "time" },
  ]);

  // Check-in configurations - minutes after exam starts
  const [checkIns, setCheckIns] = useState<CheckInConfig[]>([
    { 
      id: "attendance-check", 
      triggerMinutesAfterStart: 5, 
      question: "האם כל הסטודנטים הרשומים הגיעו לבחינה?",
      options: ["כן, כולם הגיעו", "יש סטודנטים חסרים", "עדיין בודק"],
      triggered: false 
    },
    { 
      id: "materials-check", 
      triggerMinutesAfterStart: 10, 
      question: "האם כל הסטודנטים קיבלו את חומרי הבחינה?",
      options: ["כן", "לא, יש בעיה"],
      triggered: false 
    },
    { 
      id: "30min-check", 
      triggerMinutesAfterStart: 30, 
      question: "עברו 30 דקות מתחילת הבחינה. האם הכל מתנהל כשורה?",
      options: ["הכל בסדר", "יש בעיה", "צריך עזרה"],
      triggered: false 
    },
    { 
      id: "halfway-check", 
      triggerMinutesAfterStart: Math.floor(durationMinutes / 2), 
      question: "אתה באמצע הבחינה! איך הכל מתנהל?",
      options: ["הכל תקין", "יש אירוע חריג", "צריך להתייעץ"],
      triggered: false 
    },
  ]);

  // Toilet tracking state
  const [lastToiletAlert, setLastToiletAlert] = useState<string | null>(null);

  // Calculate elapsed and remaining time
  const getTimeInfo = useCallback(() => {
    const startTime = new Date(examStartTime).getTime();
    const now = Date.now();
    const endTime = startTime + durationMinutes * 60 * 1000;
    
    const elapsedMs = now - startTime;
    const remainingMs = Math.max(0, endTime - now);
    
    return {
      elapsedMinutes: Math.floor(elapsedMs / (1000 * 60)),
      remainingMinutes: Math.floor(remainingMs / (1000 * 60)),
      isFinished: remainingMs <= 0,
    };
  }, [examStartTime, durationMinutes]);

  // Add a message to the chat
  const addMessage = useCallback((message: Omit<BotMessage, "id" | "timestamp">, playSound: boolean = true) => {
    const newMessage: BotMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (message.type !== "user" && !isOpen) {
      setUnreadCount(prev => prev + 1);
      setHasNewAlert(true);
    }

    // Play sound and show screen alert for important messages
    if (playSound && soundEnabled && message.type !== "user" && message.type !== "bot") {
      if (message.type === "alert") {
        playNotificationSound("alert");
        // Show full-screen alert for critical time alerts
        if (message.content.includes("דקות") || message.content.includes("דקה")) {
          setShowScreenAlert(message.content);
          setTimeout(() => setShowScreenAlert(null), 5000);
        }
      } else if (message.type === "check-in") {
        playNotificationSound("warning");
      }
    }
  }, [isOpen, soundEnabled]);

  // Welcome message on mount
  useEffect(() => {
    const welcomeMessage: BotMessage = {
      id: "welcome",
      type: "bot",
      content: `שלום! אני הבוט החכם שלך לבחינה "${courseName}". אני אלווה אותך במהלך הבחינה, אזכיר לך זמנים חשובים, ואעזור לך עם כל שאלה. בהצלחה! 🎓`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [courseName]);

  // Time-based alerts checker
  useEffect(() => {
    const checkAlerts = () => {
      const { remainingMinutes, isFinished } = getTimeInfo();
      
      // Generate final summary when exam is finished
      if (isFinished) {
        const hasEndSummary = messages.some(m => m.content.includes("סיכום סופי"));
        if (!hasEndSummary) {
          const presentCount = attendance.filter(a => a.attendanceStatus === "present").length;
          const absentCount = attendance.filter(a => a.attendanceStatus === "absent").length;
          
          addMessage({
            type: "summary",
            content: `🏁 סיכום סופי - הבחינה הסתיימה!

📊 נתוני נוכחות סופיים:
• סה"כ נבחנים שהגיעו: ${presentCount}
• נעדרים: ${absentCount}

📝 משימות לסיום:
1. אסוף את כל המחברות
2. ודא שכל סטודנט החזיר את כל החומרים
3. ספור את המחברות ווודא התאמה לרשימה
4. מלא את טופס מהלך הבחינה
5. החזר את החומרים למרכז ההשגחה

תודה על עבודתך! 🙏`,
          }, true);
          
          playNotificationSound("alert");
          setShowScreenAlert("🏁 הבחינה הסתיימה!\n\nאנא אסוף את כל המחברות");
        }
        return;
      }

      setAlerts(prevAlerts => {
        let hasChanges = false;
        const updatedAlerts = prevAlerts.map(alert => {
          if (!alert.triggered && remainingMinutes <= alert.triggerMinutesBefore) {
            hasChanges = true;
            // Add the alert message
            addMessage({
              type: "alert",
              content: alert.message,
            });
            return { ...alert, triggered: true };
          }
          return alert;
        });
        
        return hasChanges ? updatedAlerts : prevAlerts;
      });
    };

    const interval = setInterval(checkAlerts, 10000); // Check every 10 seconds
    checkAlerts(); // Initial check
    
    return () => clearInterval(interval);
  }, [getTimeInfo, addMessage, messages, attendance]);

  // Check-in questions checker
  useEffect(() => {
    const checkCheckIns = () => {
      const { elapsedMinutes, isFinished } = getTimeInfo();
      
      if (isFinished) return;

      setCheckIns(prevCheckIns => {
        let hasChanges = false;
        const updatedCheckIns = prevCheckIns.map(checkIn => {
          if (!checkIn.triggered && elapsedMinutes >= checkIn.triggerMinutesAfterStart) {
            hasChanges = true;
            // Add the check-in question
            addMessage({
              type: "check-in",
              content: checkIn.question,
              requiresResponse: true,
              responseOptions: checkIn.options,
            });
            return { ...checkIn, triggered: true };
          }
          return checkIn;
        });
        
        return hasChanges ? updatedCheckIns : prevCheckIns;
      });
    };

    const interval = setInterval(checkCheckIns, 15000); // Check every 15 seconds
    checkCheckIns(); // Initial check
    
    return () => clearInterval(interval);
  }, [getTimeInfo, addMessage]);

  // Monitor toilet breaks - alert if someone is out too long
  useEffect(() => {
    const studentsOnToilet = attendance.filter(a => a.isOnToilet);
    
    if (studentsOnToilet.length > 0 && lastToiletAlert !== studentsOnToilet.map(s => s._id).join(",")) {
      const names = studentsOnToilet.map(s => s.studentId.name).join(", ");
      
      // Alert about students currently in bathroom
      if (studentsOnToilet.length === 1) {
        addMessage({
          type: "alert",
          content: `📍 תזכורת: ${names} יצא/ה לשירותים. זכור לוודא שחזר/ה בזמן סביר.`,
        });
      } else {
        addMessage({
          type: "alert",
          content: `⚠️ שים לב: ${studentsOnToilet.length} סטודנטים בשירותים כרגע (${names}). לפי הנהלים, לא יותר מסטודנט אחד בשירותים בו-זמנית!`,
        });
      }
      
      setLastToiletAlert(studentsOnToilet.map(s => s._id).join(","));
    } else if (studentsOnToilet.length === 0) {
      setLastToiletAlert(null);
    }
  }, [attendance, addMessage, lastToiletAlert]);

  // Handle user response to check-in
  const handleCheckInResponse = (messageId: string, response: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, responded: true } : msg
    ));

    // Add user's response
    addMessage({
      type: "user",
      content: response,
    });

    // Bot follow-up based on response
    setTimeout(() => {
      if (response.includes("בעיה") || response.includes("חסרים") || response.includes("עזרה")) {
        addMessage({
          type: "bot",
          content: "הבנתי. אם יש בעיה דחופה, אל תהסס לפנות למרכז ההשגחה. אני כאן אם תצטרך מידע על הנהלים.",
        });
      } else {
        addMessage({
          type: "bot",
          content: "מצוין! ממשיכים. אני כאן אם תצטרך משהו. 👍",
        });
      }
    }, 500);
  };

  // Send message to AI bot
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    addMessage({
      type: "user",
      content: userMessage,
    });

    setIsLoading(true);

    try {
      // Build history for context
      const history = messages
        .filter(m => m.type === "user" || m.type === "bot")
        .map(m => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.content,
        }));

      const response = await fetch("/api/exam-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בקבלת תשובה");
      }

      addMessage({
        type: "bot",
        content: data.response,
      });
    } catch (error) {
      addMessage({
        type: "bot",
        content: "מצטער, נתקלתי בבעיה. נסה שוב או פנה למרכז ההשגחה.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate exam summary
  const generateSummary = () => {
    const { elapsedMinutes, remainingMinutes } = getTimeInfo();
    const presentCount = attendance.filter(a => a.attendanceStatus === "present").length;
    const absentCount = attendance.filter(a => a.attendanceStatus === "absent").length;
    const onToiletCount = attendance.filter(a => a.isOnToilet).length;

    const summaryContent = `📊 סיכום ביניים - ${courseName}

⏱️ זמן שעבר: ${elapsedMinutes} דקות
⏳ זמן שנותר: ${remainingMinutes} דקות

👥 נוכחות:
• נוכחים: ${presentCount}
• נעדרים: ${absentCount}
• בשירותים כרגע: ${onToiletCount}

${presentCount === attendance.length ? "✅ כל הסטודנטים הרשומים נוכחים!" : `⚠️ ${absentCount} סטודנטים חסרים`}`;

    addMessage({
      type: "summary",
      content: summaryContent,
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setHasNewAlert(false);
    }
  }, [isOpen]);

  // Get message icon and style based on type
  const getMessageStyle = (type: MessageType) => {
    switch (type) {
      case "alert":
        return {
          icon: <Bell className="w-4 h-4" />,
          bgColor: "bg-[var(--warning-bg)] border-[var(--warning)] ",
          textColor: "text-[var(--fg)] ",
        };
      case "check-in":
        return {
          icon: <MessageCircle className="w-4 h-4" />,
          bgColor: "bg-[var(--info-bg)] border-[var(--info)]",
          textColor: "text-[var(--fg)]",
        };
      case "summary":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-[var(--success-bg)] border-[var(--success)]",
          textColor: "text-[var(--fg)]",
        };
      case "user":
        return {
          icon: null,
          bgColor: "bg-[var(--accent)]",
          textColor: "text-white",
        };
      default:
        return {
          icon: <Bot className="w-4 h-4" />,
          bgColor: "bg-[var(--surface-hover)] border-[var(--border)] ",
          textColor: "text-[var(--fg)]",
        };
    }
  };

  return (
    <div>
      {/* Full Screen Alert Overlay */}
      {showScreenAlert && (
        <div 
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowScreenAlert(null)}
        >
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-8 max-w-lg w-full text-center animate-pulse shadow-xl">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">התראה חשובה!</h2>
            <p className="text-xl text-gray-700 whitespace-pre-wrap">{showScreenAlert}</p>
            <button 
              onClick={() => setShowScreenAlert(null)}
              className="mt-6 px-6 py-3 bg-[var(--warning)] hover:brightness-110 text-white rounded-full font-semibold"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 ${
          hasNewAlert 
            ? "bg-amber-500 animate-bounce" 
            : "bg-[var(--accent)] hover:brightness-110"
        }`}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <Bot className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
          <div
            className={`fixed bottom-4 left-4
              w-[90vw] sm:w-96
              h-[70vh] sm:h-[500px]
              bg-[var(--bg)] rounded-2xl border border-[var(--border)] shadow-xl z-50
              flex flex-col overflow-hidden
              transition-all duration-300
              ${isMinimized ? "h-14" : ""}
            `}
            dir="rtl"
          >

          {/* Header */}
          <div 
            className="bg-[var(--accent)] text-white p-4 flex items-center justify-between cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">בוט הבחינות</h3>
                <p className="text-xs text-emerald-100">מלווה אותך במבחן</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playNotificationSound("info");
                }}
                className={`p-1 rounded transition-colors ${soundEnabled ? "bg-white/20" : "bg-red-500/50"}`}
                title={soundEnabled ? "השתק התראות" : "הפעל התראות"}
              >
                <Volume2 className={`w-5 h-5 ${soundEnabled ? "" : "opacity-50"}`} />
              </button>
              <ChevronDown className={`w-5 h-5 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-2 bg-[var(--surface)] border-b border-[var(--border)] flex gap-2 overflow-x-auto">
                <button
                  onClick={generateSummary}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--border)] hover:brightness-105 border rounded-full text-sm whitespace-nowrap"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  סיכום ביניים
                </button>
                <button
                  onClick={() => {
                    const { remainingMinutes } = getTimeInfo();
                    addMessage({
                      type: "bot",
                      content: `⏰ נשארו ${remainingMinutes} דקות לסיום הבחינה.`,
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--border)] hover:brightness-105 border rounded-full text-sm whitespace-nowrap"
                >
                  <Clock className="w-4 h-4 text-blue-500" />
                  כמה זמן נשאר?
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => {
                  const style = getMessageStyle(message.type);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 border ${style.bgColor} ${style.textColor} ${
                          message.type === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                        }`}
                      >
                        {style.icon && (
                          <div className="flex items-center gap-2 mb-1 opacity-70">
                            {style.icon}
                            <span className="text-xs">
                              {message.type === "alert" && "התראה"}
                              {message.type === "check-in" && "בדיקה"}
                              {message.type === "summary" && "סיכום"}
                            </span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        
                        {/* Response options for check-ins */}
                        {message.requiresResponse && !message.responded && message.responseOptions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.responseOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleCheckInResponse(message.id, option)}
                               className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-hover)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-colors" >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <span className="text-[10px] opacity-50 mt-1 block">
                          {message.timestamp.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {isLoading && (
                  <div className="flex justify-end">
                    <div className="bg-gray-100  rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="שאל שאלה על נהלים..."
                    className="flex-1 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 bg-[var(--surface-hover)] focus:ring-[var(--ring)]"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="w-10 h-10 bg-[var(--warning)] hover:brightness-110 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
