"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Filter, RefreshCw, Calendar, User, FileText } from "lucide-react";

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
  EXAM_STARTED: { label: "מבחן מתחיל", color: "bg-green-100 text-green-700" },
  EXAM_FINISHED: { label: "מבחן הסתיים", color: "bg-blue-100 text-blue-700" },
  USER_REGISTERED: { label: "רישום משתמש", color: "bg-purple-100 text-purple-700" },
  SYSTEM_LOGIN: { label: "התחברות", color: "bg-gray-100 text-gray-700" },
  GENERAL_REPORT: { label: "דיווח כללי", color: "bg-yellow-100 text-yellow-700" },
  CRITICAL_REPORT: { label: "דיווח חריג", color: "bg-red-100 text-red-700" },
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

  // Fetch audit logs
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

  // Initial load and when filter/page changes
  useEffect(() => {
    fetchLogs();
  }, [filter, currentPage]);

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, filter, currentPage]);

  // Format date to Hebrew
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">יומן פעולות מערכת</h1>
              <p className="text-sm text-gray-500">מעקב אחר פעולות משמעותיות בזמן אמת</p>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <RefreshCw className={autoRefresh ? "animate-spin" : ""} size={18} />
            {autoRefresh ? "רענון אוטומטי פעיל" : "רענון אוטומטי כבוי"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={20} className="text-gray-500" />
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            הכל
          </button>
          {Object.entries(ACTION_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? value.color
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {loading && logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
          טוען יומן פעולות...
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <Activity className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-lg">אין פעולות להצגה</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const actionInfo = ACTION_TYPES[log.actionType as keyof typeof ACTION_TYPES];
              
              return (
                <div
                  key={log._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${actionInfo?.color || "bg-gray-100"}`}
                        >
                          {actionInfo?.label || log.actionType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {log.description}
                      </p>

                      {/* Additional Details */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                הקודם
              </button>
              <span className="text-sm text-gray-600">
                עמוד {currentPage} מתוך {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
