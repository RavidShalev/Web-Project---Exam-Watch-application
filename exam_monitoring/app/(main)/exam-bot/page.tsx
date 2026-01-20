"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  Clock,
  BookOpen,
  Phone,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

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

  useEffect(() => {
    // Client-side guard: only supervisors can access the bot page
    const storedUser = sessionStorage.getItem("currentUser");
    if (!storedUser) return router.push("/");
    const user = JSON.parse(storedUser);
    if (user.role !== "supervisor") router.push("/home");
    else setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    // Keep the latest message in view when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // UX: start with the input focused so the user can type immediately
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Send the question + a minimal chat history for context (role/content only)
      const response = await fetch("/api/exam-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה לא צפויה");
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for the auth check to finish to avoid rendering a flash of the UI
  if (isAuthorized === null) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] relative" dir="rtl">
      {/* soft background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[var(--info-bg)] blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-[var(--purple-bg)] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-xl shadow-[var(--ring)]">
            <Bot className="w-8 h-8 text-blue-500" />
          </div>

          <h1 className="text-3xl font-bold">בוט הבחינות</h1>
          <p className="text-muted mt-2">
            העוזר החכם שלך לנהלי בחינות והשגחה
          </p>
        </header>

        {/* Chat */}
        <div className="bg-surface border border-ui rounded-3xl shadow-xl overflow-hidden">
          <div className="h-[520px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--info-bg)] flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-[var(--info)]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">איך אפשר לעזור?</h2>
                <p className="text-muted mb-8 max-w-md">
                  שאלי כל שאלה על נהלים, התאמות ומצבים מיוחדים במהלך בחינה
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {quickActions.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(a.question)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-surface hover:bg-surface-hover border border-ui transition"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--info-bg)] flex items-center justify-center">
                        <a.icon className="w-5 h-5 text-[var(--info)]" />
                      </div>
                      <span className="text-sm">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${
                      m.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        m.role === "user"
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--info)]"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        m.role === "user"
                          ? "bg-accent text-white rounded-tr-md"
                          : "bg-surface-hover border border-ui rounded-tl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </p>
                      <span className="text-xs text-muted mt-1 block">
                        {m.timestamp.toLocaleTimeString("he-IL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--info)] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-surface-hover border border-ui rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted text-sm">חושב…</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-[var(--danger-bg)] text-[var(--danger)] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-ui p-4 bg-surface">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-3"
            >
              <input
                id="bot-question"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="שאלי שאלה על נהלי בחינות…"
                className="flex-1 bg-surface border border-ui rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 ring-accent"
                aria-label="שאל שאלה"
              />
              <button
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition"
                aria-label="שלח שאלה"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted mt-3">
              במקרה של ספק – יש לפנות למרכז הבחינות
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
