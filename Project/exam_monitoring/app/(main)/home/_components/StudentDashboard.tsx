'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  Headphones,
  Book,
  AlertCircle,
  DoorOpen,
  User,
  BookOpen,
  QrCode
} from 'lucide-react';

// Defines what a "Rule" looks like (example: Calculator allowed)
interface Rule {
  id: string;
  label: string;
  icon: string;
  allowed: boolean;
}

// Defines what an "Exam" looks like in the database
interface Exam {
  _id: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'active' | 'finished';
  rules?: Rule[];
}

export default function StudentDashboard() {
  // --- STATE (Memory) ---
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  // --- STATE FOR ACTIVE EXAM ---
  const [restroomStatus, setRestroomStatus] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setStudentName(user.name || user.idNumber || 'Student');
      setStudentId(user.idNumber);

      fetch(`/api/exams/student?studentId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setExams(data.data);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const activeExam = exams.find(e => e.status === 'active');
  const upcomingExams = exams.filter(e => e.status === 'scheduled');
  const pastExams = exams.filter(e => e.status === 'finished');

  const toggleExamDetails = (id: string) => {
    setExpandedExamId(prev => (prev === id ? null : id));
  };

  const getRuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'calculator': return <Calculator size={16} />;
      case 'headphones': return <Headphones size={16} />;
      case 'book': return <Book size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const handleRestroomToggle = () => setRestroomStatus(!restroomStatus);

  const handleQrScan = () => {
    if (scanStatus === 'verified') return;
    setScanStatus('scanning');
    setTimeout(() => setScanStatus('verified'), 2000);
  };

  if (loading) {
    return (
      <div className="p-10 text-center bg-[var(--bg)] min-h-screen text-[var(--muted)]">
        טוען...
      </div>
    );
  }

  // --- VIEW 1: ACTIVE EXAM SCREEN ---
  if (activeExam) {
    return (
      <div className="flex flex-col items-center p-6 w-full bg-[var(--bg)] min-h-screen" dir="rtl">

        <div className="w-full max-w-lg text-center mb-8 mt-4">
          <h1 className="text-3xl font-bold text-[var(--fg)]">{activeExam.courseName}</h1>
          <p className="text-xl text-[var(--muted)] font-mono mt-1">{activeExam.courseCode}</p>
        </div>

        <div className="bg-[var(--surface)] px-10 py-6 rounded-3xl shadow-sm border border-[var(--border)] mb-8 text-center">
          <p className="text-[var(--muted)] text-sm mb-1">זמן שנותר</p>
          <div className="text-5xl font-mono font-bold text-[var(--accent)] tracking-wider">
            02:45:00
          </div>
        </div>

        <div className="w-full max-w-lg bg-[var(--surface)] p-6 rounded-2xl shadow-sm border-r-4 border-[var(--accent)] mb-8 flex items-center gap-4">
          <div className="bg-[var(--accent)/10] p-4 rounded-full">
            <User size={32} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-[var(--muted)] text-sm">תעודת זהות</p>
            <h2 className="text-2xl font-bold text-[var(--fg)]">{studentId}</h2>
            <p className="text-[var(--muted)]">משתמש פעיל</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">

          <button
            onClick={handleRestroomToggle}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-sm ${
              restroomStatus
                ? 'bg-yellow-500/15 border-yellow-500 text-yellow-700 animate-pulse'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--accent)]'
            }`}
          >
            <DoorOpen size={48} className="mb-2" />
            <span className="font-bold text-lg">
              {restroomStatus ? 'לחץ לחזרה' : 'יציאה לשירותים'}
            </span>
          </button>

          <button
            onClick={handleQrScan}
            disabled={scanStatus === 'verified'}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-sm ${
              scanStatus === 'verified'
                ? 'bg-green-500/15 border-green-500 text-green-700'
                : scanStatus === 'scanning'
                  ? 'bg-[var(--accent)/15] border-[var(--accent)] text-[var(--accent)] animate-pulse'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--accent)]'
            }`}
          >
            {scanStatus === 'verified'
              ? <CheckCircle size={48} className="mb-2" />
              : <QrCode size={48} className={`mb-2 ${scanStatus === 'scanning' ? 'animate-spin-slow' : ''}`} />
            }

            <span className="font-bold text-lg">
              {scanStatus === 'idle' && 'סריקת נוכחות'}
              {scanStatus === 'scanning' && 'מבצע סריקה...'}
              {scanStatus === 'verified' && 'נוכחות אומתה!'}
            </span>
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[var(--muted)] text-sm">
          <MapPin size={16} />
          <span>מיקום: {activeExam.location}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-[var(--bg)] min-h-screen" dir="rtl">

      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-[var(--fg)]">שלום, {studentName}</h1>
          <p className="text-[var(--muted)] text-sm">
            איזור אישי • {upcomingExams.length} מבחנים קרובים
          </p>
        </div>
        <div className="bg-[var(--accent)/10] p-3 rounded-full text-[var(--accent)]">
          <BookOpen size={32} />
        </div>
      </div>

      {/* Upcoming Exams */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--fg)] flex items-center gap-2">
          <Calendar className="text-[var(--accent)]" size={20} />
          מבחנים קרובים
        </h3>

        {upcomingExams.length === 0 ? (
          <div className="bg-[var(--surface)] p-8 rounded-2xl border border-dashed border-[var(--border)] text-center text-[var(--muted)]">
            אין מבחנים קרובים
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingExams.map((exam) => (
              <div key={exam._id} className="bg-[var(--surface)] p-5 rounded-2xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow">
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold text-[var(--fg)]">{exam.courseName}</h2>
                  <span className="bg-[var(--accent)/10] text-[var(--accent)] px-2 py-1 rounded text-xs font-bold h-fit">
                    Future
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[var(--muted)]">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {exam.date}</div>
                  <div className="flex items-center gap-2"><Clock size={16} /> {exam.startTime}</div>
                  <div className="flex items-center gap-2"><MapPin size={16} /> {exam.location}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {pastExams.length > 0 && (
        <div className="mt-4 pt-6 border-t border-[var(--border)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--muted)] flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" /> היסטוריית מבחנים
          </h3>

          <div className="space-y-3">
            {pastExams.map((exam) => (
              <div key={exam._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">

                <div
                  onClick={() => toggleExamDetails(exam._id)}
                  className="p-4 flex justify-between items-center cursor-pointer bg-[var(--surface-hover)] hover:opacity-90 transition"
                >
                  <div>
                    <p className="font-bold text-[var(--fg)]">{exam.courseName}</p>
                    <p className="text-xs text-[var(--muted)]">{exam.date} • {exam.startTime} - {exam.endTime}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[var(--border)] text-[var(--muted)] px-2 py-1 rounded">הסתיים</span>
                    {expandedExamId === exam._id
                      ? <ChevronUp size={20} className="text-[var(--muted)]" />
                      : <ChevronDown size={20} className="text-[var(--muted)]" />
                    }
                  </div>
                </div>

                {expandedExamId === exam._id && (
                  <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-[var(--fg)] mb-2">פרטים:</p>
                        <ul className="space-y-1 text-[var(--muted)]">
                          <li>מיקום: {exam.location}</li>
                          <li>קוד קורס: {exam.courseCode}</li>
                        </ul>
                      </div>

                      {exam.rules && exam.rules.length > 0 && (
                        <div>
                          <p className="font-bold text-[var(--fg)] mb-2">ציוד למבחן:</p>
                          <div className="flex flex-wrap gap-2">
                            {exam.rules.filter(r => r.allowed).map(rule => (
                              <span key={rule.id} className="flex items-center gap-1 bg-green-500/10 text-green-700 px-2 py-1 rounded text-xs border border-green-500/30">
                                {getRuleIcon(rule.icon)} {rule.label}
                              </span>
                            ))}
                            {exam.rules.filter(r => !r.allowed).map(rule => (
                              <span key={rule.id} className="flex items-center gap-1 bg-red-500/10 text-red-700 px-2 py-1 rounded text-xs border border-red-500/30 opacity-70">
                                <AlertCircle size={12} /> לא {rule.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
