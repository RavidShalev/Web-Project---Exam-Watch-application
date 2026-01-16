"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2
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

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch statistics
      const [examsRes, usersRes, auditRes] = await Promise.all([
        fetch("/api/admin/exams"),
        fetch("/api/users"),
        fetch("/api/admin/audit-logs?limit=5")
      ]);

      const examsData = await examsRes.json();
      const usersData = await usersRes.json();
      const auditData = await auditRes.json();

      // Calculate exam statistics
      const exams = examsData.exams || [];
      const users = usersData.users || [];

      // Filter active and upcoming exams
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const active = exams.filter((e: Exam) => e.status === "active");
      const upcoming = exams
        .filter((e: Exam) => e.status === "scheduled" && e.date >= today)
        .sort((a: Exam, b: Exam) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        })
        .slice(0, 5);

      const statistics: Stats = {
        totalExams: exams.length,
        activeExams: active.length,
        scheduledExams: exams.filter((e: any) => e.status === "scheduled").length,
        finishedExams: exams.filter((e: any) => e.status === "finished").length,
        totalUsers: users.length,
        totalStudents: users.filter((u: any) => u.role === "student").length,
        totalLecturers: users.filter((u: any) => u.role === "lecturer").length,
        totalSupervisors: users.filter((u: any) => u.role === "supervisor").length,
      };

      setStats(statistics);
      setActiveExams(active);
      setUpcomingExams(upcoming);
      setRecentActivities(auditData.logs || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  // Format date to Hebrew
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("he-IL", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format exam date
  function formatExamDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Action type colors
  const actionTypeConfig: Record<string, string> = {
    EXAM_STARTED: "text-green-600",
    EXAM_FINISHED: "text-blue-600",
    USER_REGISTERED: "text-purple-600",
    SYSTEM_LOGIN: "text-gray-600",
    GENERAL_REPORT: "text-yellow-600",
    CRITICAL_REPORT: "text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          לוח בקרה
        </h1>
        <p className="text-gray-600 text-sm">סקירה כללית של המערכת</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 border-r-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">סך הכל מבחנים</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalExams || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-r-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">מבחנים פעילים</p>
          <p className="text-3xl font-bold text-green-600">{stats?.activeExams || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-r-4 border-yellow-500">
          <p className="text-gray-600 text-sm mb-1">מבחנים מתוכננים</p>
          <p className="text-3xl font-bold text-yellow-600">{stats?.scheduledExams || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-r-4 border-purple-500">
          <p className="text-gray-600 text-sm mb-1">משתמשים</p>
          <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.totalStudents} סטודנטים • {stats?.totalLecturers} מרצים • {stats?.totalSupervisors} משגיחים
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Exams */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">מבחנים פעילים כעת</h2>
            {activeExams.length > 0 && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                פעיל
              </span>
            )}
          </div>

          {activeExams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 size={32} className="mx-auto mb-2" />
              <p className="text-sm">אין מבחנים פעילים כרגע</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeExams.map((exam) => (
                <div
                  key={exam._id}
                  className="p-4 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/lecturer-view/${exam._id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exam.courseName}</h3>
                      <p className="text-sm text-gray-600">{exam.courseCode}</p>
                    </div>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">פעיל</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 {exam.location}</p>
                    <p>👥 {exam.students?.length || 0} סטודנטים</p>
                    <p>🕐 {exam.startTime} - {exam.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">מבחנים קרובים</h2>
            <Clock size={20} className="text-gray-400" />
          </div>

          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={32} className="mx-auto mb-2" />
              <p className="text-sm">אין מבחנים מתוכננים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/edit-exam/${exam._id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exam.courseName}</h3>
                      <p className="text-sm text-gray-600">{exam.courseCode}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      {formatExamDate(exam.date)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 {exam.location}</p>
                    <p>🕐 {exam.startTime} - {exam.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">פעילות אחרונה</h2>
            <button
              onClick={() => router.push("/admin/audit-logs")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              צפה בהכל
              <ArrowLeft size={14} />
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity size={32} className="mx-auto mb-2" />
              <p className="text-sm">אין פעילות אחרונה</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((activity) => {
                const colorClass = actionTypeConfig[activity.actionType] || "text-gray-600";
                
                return (
                  <div
                    key={activity._id}
                    className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${colorClass}`}>
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}