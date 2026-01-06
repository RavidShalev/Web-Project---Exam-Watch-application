'use client';

import { useState, useEffect } from 'react';
// I added 'QrCode' icon and removed 'Bell' icon
import { Calendar, Clock, MapPin, CheckCircle, ChevronDown, ChevronUp, Calculator, Headphones, Book, AlertCircle, DoorOpen, User, BookOpen, QrCode } from 'lucide-react';

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
  
  // Remembers which exam box is open in the history list
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  // --- STATE FOR ACTIVE EXAM ---
  const [restroomStatus, setRestroomStatus] = useState(false);
  
  // Status for the QR Code scan:
  // 'idle'     = Waiting to scan
  // 'scanning' = Camera is "working" (animation)
  // 'verified' = Scan is done and OK
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');

  // --- RUNS ONCE WHEN PAGE LOADS ---
  useEffect(() => {
    // 1. Get user data from browser memory
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setStudentName(user.name || user.idNumber || 'Student');
      setStudentId(user.idNumber); 

      // 2. Get exams from the server
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

  // Filter the exams into groups
  const activeExam = exams.find(e => e.status === 'active');
  const upcomingExams = exams.filter(e => e.status === 'scheduled');
  const pastExams = exams.filter(e => e.status === 'finished');

  // Function to open/close history items
  const toggleExamDetails = (id: string) => {
      if (expandedExamId === id) {
          setExpandedExamId(null); // Close if already open
      } else {
          setExpandedExamId(id); // Open the clicked one
      }
  };

  // Function to choose the right icon
  const getRuleIcon = (iconName: string) => {
      switch(iconName) {
          case 'calculator': return <Calculator size={16} />;
          case 'headphones': return <Headphones size={16} />;
          case 'book': return <Book size={16} />;
          default: return <AlertCircle size={16} />;
      }
  };

  // Toggle restroom status
  const handleRestroomToggle = () => setRestroomStatus(!restroomStatus);

  // --- NEW FUNCTION: Handle QR Scan ---
  const handleQrScan = () => {
    // If already verified, do nothing
    if (scanStatus === 'verified') return;

    // Change status to 'scanning' (starts animation)
    setScanStatus('scanning');
    
    // Wait 2 seconds to simulate a camera scan
    setTimeout(() => {
        setScanStatus('verified'); // Mark as done
        // In the future: Here we will tell the server "Student is present"
    }, 2000); 
  };

  if (loading) return <div className="p-10 text-center bg-gray-50 min-h-screen">טוען...</div>;

  // --- VIEW 1: ACTIVE EXAM SCREEN ---
  if (activeExam) {
    return (
      <div className="flex flex-col items-center p-6 w-full bg-gray-50 min-h-screen" dir="rtl">
        
        {/* Header */}
        <div className="w-full max-w-lg text-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{activeExam.courseName}</h1>
            <p className="text-xl text-gray-500 font-mono mt-1">{activeExam.courseCode}</p>
        </div>
        
        {/* Timer */}
        <div className="bg-white px-10 py-6 rounded-3xl shadow-sm border border-gray-200 mb-8 text-center">
            <p className="text-gray-400 text-sm mb-1">זמן שנותר</p>
            <div className="text-5xl font-mono font-bold text-blue-600 tracking-wider">
                02:45:00
            </div>
        </div>

        {/* ID Card */}
        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500 mb-8 flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-full">
                <User size={32} className="text-blue-600" />
            </div>
            <div>
                <p className="text-gray-500 text-sm">תעודת זהות</p>
                <h2 className="text-2xl font-bold text-gray-900">{studentId}</h2>
                <p className="text-gray-600">משתמש פעיל</p>
            </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            
            {/* 1. Restroom Button */}
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

            {/* 2. QR Code Scan Button (New) */}
            <button 
                onClick={handleQrScan}
                disabled={scanStatus === 'verified'} // Disable click if already done
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-sm ${
                    scanStatus === 'verified'
                    ? 'bg-green-50 border-green-500 text-green-700 cursor-default' // Style for Done
                    : scanStatus === 'scanning'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 animate-pulse' // Style for Scanning
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md' // Style for Idle
                }`}
            >
                {/* Change Icon based on status */}
                {scanStatus === 'verified' ? (
                     <CheckCircle size={48} className="mb-2" />
                ) : (
                     <QrCode size={48} className={`mb-2 ${scanStatus === 'scanning' ? 'animate-spin-slow' : ''}`} />
                )}
                
                {/* Change Text based on status */}
                <span className="font-bold text-lg">
                    {scanStatus === 'idle' && "סריקת נוכחות"}
                    {scanStatus === 'scanning' && "מבצע סריקה..."}
                    {scanStatus === 'verified' && "נוכחות אומתה!"}
                </span>
            </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
            <MapPin size={16} />
            <span>מיקום: {activeExam.location}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full bg-gray-50 min-h-screen" dir="rtl">
      
      {/* Top Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold mb-1 text-black">שלום, {studentName}</h1>
           <p className="text-gray-500 text-sm">
             איזור אישי • {upcomingExams.length} מבחנים קרובים
           </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <BookOpen size={32} />
        </div>
      </div>

      {/* Upcoming Exams List */}
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

      {/* History List (Accordion) */}
      {pastExams.length > 0 && (
          <div className="mt-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-500 flex items-center gap-2">
                <CheckCircle size={20} /> היסטוריית מבחנים
            </h3>
            <div className="space-y-3">
                {pastExams.map((exam) => (
                    <div key={exam._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        
                        {/* Clickable Header */}
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
                                {expandedExamId === exam._id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedExamId === exam._id && (
                            <div className="p-4 bg-white border-t border-gray-100 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-bold text-gray-700 mb-2">פרטים:</p>
                                        <ul className="space-y-1 text-gray-600">
                                            <li>מיקום: {exam.location}</li>
                                            <li>קוד קורס: {exam.courseCode}</li>
                                        </ul>
                                    </div>
                                    
                                    {exam.rules && exam.rules.length > 0 && (
                                        <div>
                                            <p className="font-bold text-gray-700 mb-2">ציוד למבחן:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {exam.rules.filter(r => r.allowed).map((rule) => (
                                                    <span key={rule.id} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-100">
                                                        {getRuleIcon(rule.icon)} {rule.label}
                                                    </span>
                                                ))}
                                                {exam.rules.filter(r => !r.allowed).map((rule) => (
                                                    <span key={rule.id} className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded text-xs border border-red-100 opacity-70">
                                                        <AlertCircle size={12}/> לא {rule.label}
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