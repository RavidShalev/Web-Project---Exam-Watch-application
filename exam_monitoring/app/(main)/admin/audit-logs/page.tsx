"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Filter,
  RefreshCw,
  User,
  FileText,
} from "lucide-react";

// Type definitions for audit log
interface AuditLog {
  _id: string;
  actionType: string;
  description: string;
  userId?: {
    name: string;
    role: string;
    idNumber: string;
  };
  examId?: {
    courseName: string;
    location: string;
  };
  metadata?: any;
  createdAt: string;
}

// Action type translations and colors
const ACTION_TYPES = {
  EXAM_STARTED: {
    label: "מבחן מתחיל",
    badge: "bg-[var(--success-bg)] text-[var(--success)]",
  },
  EXAM_FINISHED: {
    label: "מבחן הסתיים",
    badge: "bg-[var(--info-bg)] text-[var(--info)]",
  },
  USER_REGISTERED: {
    label: "רישום משתמש",
    badge: "bg-[var(--purple-bg)] text-[var(--purple)]",
  },
  SYSTEM_LOGIN: {
    label: "התחברות",
    badge: "bg-[var(--surface-hover)] text-[var(--muted)]",
  },
  GENERAL_REPORT: {
    label: "דיווח כללי",
    badge: "bg-[var(--warning-bg)] text-[var(--warning)]",
  },
  CRITICAL_REPORT: {
    label: "דיווח חריג",
    badge: "bg-[var(--danger-bg)] text-[var(--danger)]",
  },
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const user = sessionStorage.getItem("currentUser");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== "admin") {
        router.push("/home");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const filterParam = filter !== "ALL" ? `&actionType=${filter}` : "";
      const res = await fetch(
        `/api/admin/audit-logs?page=${currentPage}&limit=50${filterParam}`
      );
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [filter, currentPage]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, filter, currentPage]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-6 sm:py-8" dir="rtl">
      {/* Header */}
      <div className="rounded-3xl bg-[var(--bg)] border border-[var(--border)] p-6 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="text-[var(--accent)]" size={32} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg)]">
                יומן פעולות מערכת
              </h1>
              <p className="text-sm text-[var(--muted)]">
                מעקב אחר פעולות משמעותיות בזמן אמת
              </p>
            </div>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
              ${
                autoRefresh
                  ? "bg-[var(--success-bg)] text-[var(--success)]"
                  : "bg-[var(--surface-hover)] text-[var(--muted)]"
              }
            `}
          >
            <RefreshCw
              size={18}
              className={autoRefresh ? "animate-spin" : ""}
            />
            {autoRefresh ? "רענון אוטומטי פעיל" : "רענון אוטומטי כבוי"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={18} className="text-[var(--muted)]" />

          <FilterButton
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          >
            הכל
          </FilterButton>

          {Object.entries(ACTION_TYPES).map(([key, value]) => (
            <FilterButton
              key={key}
              active={filter === key}
              onClick={() => setFilter(key)}
              activeClass={value.badge}
            >
              {value.label}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Logs */}
      {loading && logs.length === 0 ? (
        <EmptyState text="טוען יומן פעולות…" />
      ) : logs.length === 0 ? (
        <EmptyState text="אין פעולות להצגה" />
      ) : (
        <div className="rounded-3xl bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {logs.map((log) => {
              const actionInfo =
                ACTION_TYPES[log.actionType as keyof typeof ACTION_TYPES];

              return (
                <div
                  key={log._id}
                  className="px-4 py-3 hover:bg-[var(--surface-hover)] transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            actionInfo?.badge ||
                            "bg-[var(--surface-hover)] text-[var(--muted)]"
                          }`}
                        >
                          {actionInfo?.label || log.actionType}
                        </span>

                        <span className="text-xs text-[var(--muted)]">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-[var(--fg)]">
                        {log.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                        {log.userId && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {log.userId.name} ({log.userId.role})
                          </span>
                        )}
                        {log.examId && (
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {log.examId.courseName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-t border-[var(--border)]">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm disabled:opacity-50"
              >
                הקודם
              </button>

              <span className="text-sm text-[var(--muted)]">
                עמוד {currentPage} מתוך {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm disabled:opacity-50"
              >
                הבא
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= SMALL UI ================= */

function FilterButton({
  active,
  children,
  onClick,
  activeClass,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-xl text-sm font-medium transition
        ${
          active
            ? activeClass ||
              "bg-[var(--accent)] text-white"
            : "bg-[var(--surface-hover)] text-[var(--muted)] hover:bg-[var(--border)]"
        }
      `}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-[var(--muted)]">
      <Activity className="mx-auto mb-3 opacity-50" size={40} />
      <p className="text-sm">{text}</p>
    </div>
  );
}
