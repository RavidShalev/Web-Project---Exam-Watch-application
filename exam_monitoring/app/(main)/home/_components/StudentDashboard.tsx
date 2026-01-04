'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, BookOpen, DoorOpen, Bell, User } from 'lucide-react';

interface Exam {
  _id: string;
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'active' | 'finished';
  durationMinutes?: number; // הוספנו את זה לחישוב הזמן
}

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');

  // סטייטים למצב בזמן מבחן
  const [restroomStatus, setRestroomStatus] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setStudentName(user.username); // בהנחה שזה השם או שצריך לשלוף שם
      setStudentId(user.username);   // נשתמש בזה להציג ת"ז

      fetch(`/api/exams/student?studentId=${user.username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExams(data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  const activeExam = exams.find(e => e.status === 'active');
  const upcomingExams = exams.filter(e => e.status === 'scheduled');
  const pastExams = exams.filter(e => e.status === 'finished');

  // --- הנדלרים לכפתורים (כרגע רק אלרט, בהמשך יחובר ל-DB) ---
  const handleRestroomToggle = () => {
    // כאן תהיה קריאה לשרת לעדכן סטטוס יציאה
    setRestroomStatus(!restroomStatus);
  };

  const handleCallSupervisor = () => {
    // כאן תהיה קריאה לשרת לשלוח התראה למשגיח
    setHelpRequested(true);
    setTimeout(() => setHelpRequested(false), 3000); // איפוס לצורך הדגמה
  };

  if (loading) return <div className="p-10 text-center bg-gray-50 min-h-screen">טוען נתונים...</div>;

  // =========================================================================
  //                       תצוגה 1: בזמן מבחן (Active Mode)
  // =========================================================================
  if (activeExam) {
    return (
      <div className="flex flex-col items-center p-6 w-full bg-gray-50 min-h-screen" dir="rtl">
        
        {/* כותרת המבחן */}
        <div className="w-full max-w-lg text-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{activeExam.courseName}</h1>
            <p className="text-xl text-gray-500 font-mono mt-1">{activeExam.courseCode}</p>
        </div>

        {/* טיימר גדול (דמה - אפשר לחבר לחישוב זמן אמיתי בהמשך) */}
        <div className="bg-white px-10 py-6 rounded-3xl shadow-sm border border-gray-200 mb-8 text-center">
            <p className="text-gray-400 text-sm mb-1">זמן לסיום</p>
            <div className="text-5xl font-mono font-bold text-blue-600 tracking-wider">
                02:45:00
            </div>
        </div>

        {/* כרטיס נבחן (לאימות זהות ע"י משגיח) */}
        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500 mb-8 flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-full">
                <User size={32} className="text-blue-600" />
            </div>
            <div>
                <p className="text-gray-500 text-sm">כרטיס נבחן דיגיטלי</p>
                <h2 className="text-2xl font-bold text-gray-900">{studentId}</h2>
                <p className="text-gray-600">משתמש מחובר</p>
            </div>
        </div>

        {/* כפתורי פעולה גדולים */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            
            {/* כפתור שירותים */}
            <button 
                onClick={handleRestroomToggle}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-sm ${
                    restroomStatus 
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800 animate-pulse' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md'
                }`}
            >
                <DoorOpen size={48} className="mb-2" />
                <span className="font-bold text-lg">
                    {restroomStatus ? "לחץ לחזרה" : "יציאה לשירותים"}
                </span>
            </button>

            {/* כפתור עזרה */}
            <button 
                onClick={handleCallSupervisor}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-sm ${
                    helpRequested
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-red-400 hover:shadow-md'
                }`}
            >
                <Bell size={48} className={`mb-2 ${helpRequested ? 'animate-bounce' : ''}`} />
                <span className="font-bold text-lg">
                    {helpRequested ? "קריאה נשלחה!" : "קרא למשגיח"}
                </span>
            </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
            <MapPin size={16} />
            <span>מיקום נוכחי: {activeExam.location}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  //                       תצוגה 2: שגרה (Upcoming / History)
  // =========================================================================
  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-gray-50 min-h-screen" dir="rtl">
      
      {/* כותרת */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold mb-1 text-black">שלום, {studentName || 'סטודנט'}</h1>
           <p className="text-gray-500 text-sm">
             אזור אישי • {upcomingExams.length} מבחנים עתידיים
           </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <BookOpen size={32} />
        </div>
      </div>

      {/* רשימת מבחנים עתידיים */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-black flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            מבחנים קרובים
        </h3>
        
        {upcomingExams.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
                <p>אין מבחנים קרובים</p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {upcomingExams.map((exam) => (
                    <div key={exam._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold text-black">{exam.courseName}</h2>
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold h-fit">עתידי</span>
                        </div>
                        <div className="mt-3 space-y-2 text-gray-600">
                            <div className="flex items-center gap-2"><Calendar size={16}/> {exam.date}</div>
                            <div className="flex items-center gap-2"><Clock size={16}/> {exam.startTime}</div>
                            <div className="flex items-center gap-2"><MapPin size={16}/> {exam.location}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* היסטוריה */}
      {pastExams.length > 0 && (
          <div className="mt-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-500 flex items-center gap-2">
                <CheckCircle size={20} /> היסטוריית מבחנים
            </h3>
            <div className="space-y-3">
                {pastExams.map((exam) => (
                    <div key={exam._id} className="bg-gray-100 p-4 rounded-xl flex justify-between items-center opacity-60">
                        <div>
                            <p className="font-bold text-gray-700">{exam.courseName}</p>
                            <p className="text-xs text-gray-500">{exam.date}</p>
                        </div>
                        <span className="text-xs bg-gray-300 px-2 py-1 rounded">הסתיים</span>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}