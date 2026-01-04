"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Clock, BookOpen, Phone } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

// Quick action buttons for common questions
const quickActions = [
  { icon: Clock, label: "סטודנט מאחר", question: "מה עושים כשסטודנט מגיע באיחור למבחן?" },
  { icon: AlertCircle, label: "חשד להעתקה", question: "מה עושים במקרה של חשד להעתקה?" },
  { icon: BookOpen, label: "יציאה לשירותים", question: "מה הנהלים לגבי יציאה לשירותים במהלך בחינה?" },
  { icon: Phone, label: "טלפונים ניידים", question: "מה הכללים לגבי טלפונים ניידים בבחינה?" },
];

export default function ExamBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check authorization on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === "supervisor") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.push("/home");
      }
    } else {
      setIsAuthorized(false);
      router.push("/");
    }
  }, [router]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Build history from previous messages (excluding the current one)
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/exam-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText.trim(),
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בקבלת תשובה");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (question: string) => {
    sendMessage(question);
  };

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Don't render if not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25 mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">בוט הבחינות</h1>
          <p className="text-slate-400">
            העוזר החכם שלך לכל שאלה על נהלי בחינות והשגחה
          </p>
        </header>

        {/* Chat Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {messages.length === 0 ? (
              // Empty state with quick actions
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  איך אפשר לעזור?
                </h2>
                <p className="text-slate-400 mb-8 max-w-md">
                  אני כאן לעזור לך עם כל שאלה על נהלי בחינות, התאמות, או מצבים
                  מיוחדים במהלך ההשגחה
                </p>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.question)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-emerald-500/30 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-600/50 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                        <action.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors text-right">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Message list
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-blue-500"
                          : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white rounded-tr-md"
                          : "bg-slate-700/50 text-slate-100 rounded-tl-md border border-slate-600/30"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <span
                        className={`text-xs mt-2 block ${
                          message.role === "user"
                            ? "text-blue-200"
                            : "text-slate-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("he-IL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-700/50 rounded-2xl rounded-tl-md px-4 py-3 border border-slate-600/30">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span className="text-slate-400 text-sm">חושב...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="שאל שאלה על נהלי בחינות..."
                disabled={isLoading}
                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-2xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </form>

            {/* Helper text */}
            <p className="text-center text-xs text-slate-500 mt-3">
              הבוט מספק מידע על נהלי בחינות במכללת בראודה. במקרה של ספק, פנה למרכז
              הבחינות.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}