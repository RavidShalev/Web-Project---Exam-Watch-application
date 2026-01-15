"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProcedureCard from './_components/ProcedureCard';

// Define the shape of data from API
interface Procedure {
  _id: string;
  sectionId: string;
  title: string;
  content: string;
  icon: string;
  phase: string;
}

export default function ProceduresPage() {
  const router = useRouter();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState('before'); // default tab
  const [userRole, setUserRole] = useState('');

  // 1. Run on page load
  useEffect(() => {
    // Get user from storage
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);

      // Prevent admin from accessing this page
      if (user.role === 'admin') {
        router.push('/home');
        return;
      }

      // Fetch data from our API
      fetch(`/api/procedures?role=${user.role}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProcedures(data.data);
          }
        })
        .catch((err) => console.error("Error:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router]);

  // 2. Filter procedures by the active tab
  const filteredProcedures = procedures.filter(p => 
    p.phase === activePhase || p.phase === 'always'
  );

  // 3. Helper to style tabs
  const getTabClass = (phaseName: string) => {
    const base = "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200";
    if (activePhase === phaseName) {
      return `${base} bg-blue-600 text-white dark:bg-blue-500`;
    }
    return `${base} bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700`;
  };

  if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">טוען נהלים...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 text-gray-900 dark:text-gray-100" dir="rtl">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-blue-600 dark:text-blue-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            נהלי בחינות
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 pr-11">
          הנחיות מותאמות לתפקיד:{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {userRole === 'student' ? 'סטודנט' : 
             userRole === 'supervisor' ? 'משגיח' : 
             userRole === 'lecturer' ? 'מרצה' : userRole}
          </span>
        </p>
      </div>

      {/* Tabs Section (Scrollable on mobile) */}
      <div className="max-w-6xl mx-auto mb-8 overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          <button 
            onClick={() => setActivePhase('before')} 
            className={getTabClass('before')}
          >
            לפני הבחינה
          </button>
          
          <button 
            onClick={() => setActivePhase('ongoing')} 
            className={getTabClass('ongoing')}
          >
            במהלך הבחינה
          </button>
          
          <button 
            onClick={() => setActivePhase('after')} 
            className={getTabClass('after')}
          >
            לאחר הבחינה
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcedures.length > 0 ? (
          filteredProcedures.map((proc) => (
            <ProcedureCard 
              key={proc._id}
              title={proc.title}
              content={proc.content}
              sectionId={proc.sectionId}
              icon={proc.icon}
            />
          ))
        ) : (
          // Empty State
          <div className="col-span-full flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
            <Info size={40} className="mb-2 opacity-50 dark:text-gray-400" />
            <p>אין נהלים להצגה בשלב זה</p>
          </div>
        )}
      </div>
    </div>
  );
}
