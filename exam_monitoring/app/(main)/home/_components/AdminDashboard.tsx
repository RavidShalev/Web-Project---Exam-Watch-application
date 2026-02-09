"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// Statistics interface
interface Stats {
  totalExams: number;
  activeExams: number;
  scheduledExams: number;
  finishedExams: number;
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalSupervisors: number;
}

// Exam interface
interface Exam {
  _id: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  students: any[];
  lecturers: any[];
  supervisors: any[];
}

// Recent activity from audit logs
interface RecentActivity {
  _id: string;
  actionType: string;
  description: string;
  createdAt: string;
}

/**
 * AdminDashboard
 * Administrative dashboard providing a high-level overview of system activity and status.
 *
 * Responsibilities:
 * - Fetch and aggregate system-wide data (exams, users, audit logs)
 * - Display key statistics about exams and users
 * - Present currently active exams with quick navigation
 * - Display upcoming scheduled exams in chronological order
 * - Show recent system activity from audit logs
 * - Periodically refresh dashboard data to keep information up to date
 * - Provide navigation shortcuts to detailed views and management pages
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const [examsRes, usersRes, auditRes] = await Promise.all([
        fetch("/api/admin/exams"),
        fetch("/api/users"),
        fetch("/api/admin/audit-logs?limit=5"),
      ]);

      const examsData = await examsRes.json();
      const usersData = await usersRes.json();
      const auditData = await auditRes.json();

      const exams = examsData.exams || [];
      const users = usersData.users || [];

      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const active = exams.filter((e: Exam) => e.status === "active");
      const upcoming = exams
        .filter((e: Exam) => e.status === "scheduled" && e.date >= today)
        .sort((a: Exam, b: Exam) =>
          a.date !== b.date
            ? a.date.localeCompare(b.date)
            : a.startTime.localeCompare(b.startTime)
        )
        .slice(0, 5);

      setStats({
        totalExams: exams.length,
        activeExams: active.length,
        scheduledExams: exams.filter((e: any) => e.status === "scheduled").length,
        finishedExams: exams.filter((e: any) => e.status === "finished").length,
        totalUsers: users.length,
        totalStudents: users.filter((u: any) => u.role === "student").length,
        totalLecturers: users.filter((u: any) => u.role === "lecturer").length,
        totalSupervisors: users.filter((u: any) => u.role === "supervisor").length,
      });

      setActiveExams(active);
      setUpcomingExams(upcoming);
      setRecentActivities(auditData.logs || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("he-IL", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatExamDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("he-IL");
  }

  const actionTypeConfig: Record<string, string> = {
    EXAM_STARTED: "text-[var(--success)]",
    EXAM_FINISHED: "text-[var(--info)]",
    USER_REGISTERED: "text-[var(--purple)]",
    SYSTEM_LOGIN: "text-[var(--muted)]",
    GENERAL_REPORT: "text-[var(--warning)]",
    CRITICAL_REPORT: "text-[var(--danger)]",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4 text-[var(--accent)]" size={42} />
          <p className="text-[var(--muted)]">טוען נתונים…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] p-4 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg)]">
          לוח בקרה
        </h1>
        <p className="text-sm text-[var(--muted)]">
          סקירה כללית של המערכת
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="סך הכל מבחנים" value={stats?.totalExams} />
        <StatCard label="מבחנים פעילים" value={stats?.activeExams} accent="success" />
        <StatCard label="מבחנים מתוכננים" value={stats?.scheduledExams} accent="warning" />
        <StatCard
          label="משתמשים"
          value={stats?.totalUsers}
          footer={`${stats?.totalStudents} סטודנטים • ${stats?.totalLecturers} מרצים • ${stats?.totalSupervisors} משגיחים`}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Exams */}
        <Section title="מבחנים פעילים כעת">
          {activeExams.length === 0 ? (
            <Empty icon={CheckCircle2} text="אין מבחנים פעילים כרגע" />
          ) : (
            activeExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                badge="פעיל"
                badgeColor="success"
                onClick={() => router.push(`/lecturer-view/${exam._id}`)}
              />
            ))
          )}
        </Section>

        {/* Upcoming Exams */}
        <Section title="מבחנים קרובים" icon={<Clock size={18} />}>
          {upcomingExams.length === 0 ? (
            <Empty icon={AlertCircle} text="אין מבחנים מתוכננים" />
          ) : (
            upcomingExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                badge={formatExamDate(exam.date)}
                badgeColor="warning"
                onClick={() => router.push(`/edit-exam/${exam._id}`)}
              />
            ))
          )}
        </Section>

        {/* Recent Activity */}
        <Section
          title="פעילות אחרונה"
          action={
            <button
              onClick={() => router.push("/admin/audit-logs")}
              className="text-sm text-[var(--accent)] flex items-center gap-1"
            >
              צפה בהכל <ArrowLeft size={14} />
            </button>
          }
          full
        >
          {recentActivities.length === 0 ? (
            <Empty icon={Activity} text="אין פעילות אחרונה" />
          ) : (
            recentActivities.map((a) => (
              <div
                key={a._id}
                className="rounded-xl px-3 py-2 hover:bg-[var(--surface-hover)] transition"
              >
                <p className={`text-sm font-medium ${actionTypeConfig[a.actionType] || ""}`}>
                  {a.description}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {formatDate(a.createdAt)}
                </p>
              </div>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

/* ================== SMALL COMPONENTS ================== */

function StatCard({
  label,
  value,
  footer,
  accent,
}: {
  label: string;
  value?: number;
  footer?: string;
  accent?: "success" | "warning";
}) {
  return (
    <div className="rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p
        className={`text-3xl font-bold ${
          accent === "success"
            ? "text-[var(--success)]"
            : accent === "warning"
            ? "text-[var(--warning)]"
            : "text-[var(--fg)]"
        }`}
      >
        {value ?? 0}
      </p>
      {footer && <p className="text-xs text-[var(--muted)] mt-1">{footer}</p>}
    </div>
  );
}

function Section({
  title,
  children,
  icon,
  action,
  full,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl bg-[var(--bg)] border border-[var(--border)] p-6 space-y-4 ${
        full ? "lg:col-span-2" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[var(--fg)] flex items-center gap-2">
          {title} {icon}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-8 text-[var(--muted)]">
      <Icon size={32} className="mx-auto mb-2" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ExamCard({
  exam,
  badge,
  badgeColor,
  onClick,
}: {
  exam: Exam;
  badge: string;
  badgeColor: "success" | "warning";
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:bg-[var(--surface-hover)] transition"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-[var(--fg)]">{exam.courseName}</p>
          <p className="text-sm text-[var(--muted)]">{exam.courseCode}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-lg ${
            badgeColor === "success"
              ? "bg-[var(--success-bg)] text-[var(--success)]"
              : "bg-[var(--warning-bg)] text-[var(--warning)]"
          }`}
        >
          {badge}
        </span>
      </div>

      <div className="text-sm text-[var(--muted)] space-y-1">
        <p>📍 {exam.location}</p>
        <p>🕐 {exam.startTime} - {exam.endTime}</p>
        {exam.students && <p>👥 {exam.students.length} סטודנטים</p>}
      </div>
    </div>
  );
}
