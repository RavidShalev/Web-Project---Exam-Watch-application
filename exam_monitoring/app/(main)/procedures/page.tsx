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
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);

      if (user.role === 'admin') {
        router.push('/home');
        return;
      }

      fetch(`/api/procedures?role=${user.role}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProcedures(data.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router]);

  // 2. Filter procedures by the active tab
  const filteredProcedures = procedures.filter(
    p => p.phase === activePhase || p.phase === 'always'
  );

  // 3. Helper to style tabs
  const getTabClass = (phaseName: string) => {
    const base =
      "px-6 py-2 rounded-full text-sm font-medium transition border";

    if (activePhase === phaseName) {
      return `
        ${base}
        bg-[var(--accent)]
        text-white
        border-[var(--accent)]
      `;
    }

    return `
      ${base}
      bg-[var(--surface)]
      text-[var(--fg)]
      border-[var(--border)]
      hover:bg-[var(--surface-hover)]
    `;
  };

  if (loading) {
    return <div className="p-10 text-center text-[var(--muted)]">טוען נהלים...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8" dir="rtl">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-[var(--accent)]" size={32} />
          <h1 className="text-3xl font-bold text-[var(--fg)]">
            נהלי בחינות
          </h1>
        </div>

        <p className="pr-11 text-[var(--muted)]">
          הנחיות מותאמות לתפקיד:{' '}
          <span className="font-semibold text-[var(--fg)]">
            {userRole === 'student'
              ? 'סטודנט'
              : userRole === 'supervisor'
              ? 'משגיח'
              : userRole === 'lecturer'
              ? 'מרצה'
              : userRole}
          </span>
        </p>
      </div>

      {/* Tabs Section */}
      <div className="max-w-6xl mx-auto mb-8 overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          <button onClick={() => setActivePhase('before')} className={getTabClass('before')}>
            לפני הבחינה
          </button>
          <button onClick={() => setActivePhase('ongoing')} className={getTabClass('ongoing')}>
            במהלך הבחינה
          </button>
          <button onClick={() => setActivePhase('after')} className={getTabClass('after')}>
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
          <div
            className="
              col-span-full
              flex flex-col items-center justify-center
              p-10
              bg-[var(--surface)]
              border border-[var(--border)]
              rounded-lg
              text-[var(--muted)]
            "
          >
            <Info size={40} className="mb-2 opacity-50" />
            <p>אין נהלים להצגה בשלב זה</p>
          </div>
        )}
      </div>
    </div>
  );
}
