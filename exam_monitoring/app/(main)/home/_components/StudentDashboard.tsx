'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, ChevronDown, ChevronUp, Calculator, Headphones, Book, AlertCircle, DoorOpen, Bell, User, BookOpen } from 'lucide-react';

// Defines what a rule looks like
interface Rule {
    id: string;
    label: string;
    icon: string;
    allowed: boolean;
}

// Defines what an exam looks like
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
  // memory states for the component
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  // This variable remembers WHICH exam box is currently open.
  // if null = all boxes are closed.
  // if contains an ID = that specific box is open.
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  const [restroomStatus, setRestroomStatus] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);

  
  useEffect(() => {
    // 1. Get user from browser memory
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setStudentName(user.name || user.idNumber || 'Student');
      setStudentId(user.idNumber); 

      // 2. Fetch exams from the server
      fetch(`/api/exams/student?studentId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
             setExams(data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false)); // Stop loading animation
    }
  }, []);

  // Filter exams into 3 categories
  const activeExam = exams.find(e => e.status === 'active');
  const upcomingExams = exams.filter(e => e.status === 'scheduled');
  const pastExams = exams.filter(e => e.status === 'finished');

  // open exam box
  const toggleExamDetails = (id: string) => {
      if (expandedExamId === id) {
          // If I clicked the exam that is ALREADY open -> Close it
          setExpandedExamId(null);
      } else {
          // If I clicked a closed exam -> Open it (and close others)
          setExpandedExamId(id);
      }
  };

  // need to get the correct icon for each rule
  const getRuleIcon = (iconName: string) => {
      switch(iconName) {
          case 'calculator': return <Calculator size={16} />;
          case 'headphones': return <Headphones size={16} />;
          case 'book': return <Book size={16} />;
          default: return <AlertCircle size={16} />;
      }
  };

  const handleRestroomToggle = () => setRestroomStatus(!restroomStatus);
  const handleCallSupervisor = () => {
    setHelpRequested(true);
    setTimeout(() => setHelpRequested(false), 3000); 
  };

  if (loading) return <div className="p-10 text-center bg-gray-50 min-h-screen">Loading...</div>;


  if (activeExam) {
    return (
      <div className="flex flex-col items-center p-6 w-full bg-gray-50 min-h-screen" dir="rtl">
        {/* Header: Course Name */}
        <div className="w-full max-w-lg text-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{activeExam.courseName}</h1>
            <p className="text-xl text-gray-500 font-mono mt-1">{activeExam.courseCode}</p>
        </div>
        
        {/* Timer Box */}
        <div className="bg-white px-10 py-6 rounded-3xl shadow-sm border border-gray-200 mb-8 text-center">
            <p className="text-gray-400 text-sm mb-1">Time Left</p>
            <div className="text-5xl font-mono font-bold text-blue-600 tracking-wider">
                02:45:00
            </div>
        </div>

        {/* Student Card */}
        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500 mb-8 flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-full">
                <User size={32} className="text-blue-600" />
            </div>
            <div>
                <p className="text-gray-500 text-sm">Digital ID</p>
                <h2 className="text-2xl font-bold text-gray-900">{studentId}</h2>
                <p className="text-gray-600">User Connected</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
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
                    {restroomStatus ? "Click to Return" : "Go to Restroom"}
                </span>
            </button>

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
                    {helpRequested ? "Supervisor Called!" : "Call Supervisor"}
                </span>
            </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
            <MapPin size={16} />
            <span>Location: {activeExam.location}</span>
        </div>
      </div>
    );
  }

  // --- VIEW 2: Main Dashboard (Home Screen) ---
  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-gray-50 min-h-screen" dir="rtl">
      
      {/* Top Bar: Hello User */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold mb-1 text-black">שלום, {studentName}</h1>
           <p className="text-gray-500 text-sm">
             איזור אישי • {upcomingExams.length} מבחנים מתוכננים
           </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <BookOpen size={32} />
        </div>
      </div>

      {/* Upcoming Exams Section */}
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
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold h-fit">Future</span>
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

      {/* --- HISTORY SECTION (The Accordion) --- */}
      {pastExams.length > 0 && (
          <div className="mt-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-500 flex items-center gap-2">
                <CheckCircle size={20} /> היסטוריית בחינות
            </h3>
            <div className="space-y-3">
                {pastExams.map((exam) => (
                    <div key={exam._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        
                        {/* 1. THE CLICKABLE ROW */}
                        <div 
                            onClick={() => toggleExamDetails(exam._id)}
                            className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div>
                                <p className="font-bold text-gray-800">{exam.courseName}</p>
                                <p className="text-xs text-gray-500">{exam.date} • {exam.startTime} - {exam.endTime}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">הסתיים</span>
                                {/* Icon changes: Up if open, Down if closed */}
                                {expandedExamId === exam._id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </div>
                        </div>

                        {/* 2. THE EXPANDED DETAILS BOX */}
                        {/* Only show this if the current exam ID matches the one saved in state */}
                        {expandedExamId === exam._id && (
                            <div className="p-4 bg-white border-t border-gray-100 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-bold text-gray-700 mb-2">Details:</p>
                                        <ul className="space-y-1 text-gray-600">
                                            <li>מיקום: {exam.location}</li>
                                            <li>קוד קורס: {exam.courseCode}</li>
                                        </ul>
                                    </div>
                                    
                                    {/* RULES SECTION */}
                                    {/* Only show if rules exist in the database */}
                                    {exam.rules && exam.rules.length > 0 && (
                                        <div>
                                            <p className="font-bold text-gray-700 mb-2">Equipment:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Allowed Rules (Green) */}
                                                {exam.rules.filter(r => r.allowed).map((rule) => (
                                                    <span key={rule.id} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-100">
                                                        {getRuleIcon(rule.icon)} {rule.label}
                                                    </span>
                                                ))}
                                                {/* Not Allowed Rules (Red) */}
                                                {exam.rules.filter(r => !r.allowed).map((rule) => (
                                                    <span key={rule.id} className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded text-xs border border-red-100 opacity-70">
                                                        <AlertCircle size={12}/> No {rule.label}
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