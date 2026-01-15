'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

type CurrentUser = { username: string; role: string };

const Navbar = () => {
  const [clicked, setClicked] = useState(false);

  // Load current user (username + role) from sessionStorage ONCE (no useEffect)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('currentUser');
      if (raw) {
        setCurrentUser(JSON.parse(raw));
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);
  
  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isStudent = currentUser?.role === 'student';
  const isLecturer = currentUser?.role === 'lecturer';
  const canViewProcedures = isStudent || isLecturer || isSupervisor;
  const canViewClassMap = isAdmin || isSupervisor || isLecturer;

  // change the state of clicked when the button is clicked
  const handleClick = () => {
    setClicked(!clicked);
  };

  // give the style for a button (link) in the navbar
  const getLinkClass = (path: string) => {
    const baseClass =
      "text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] relative";
    const hoverClass =
      "after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-[#17cf97] after:bottom-[-4px] after:left-0 hover:after:w-full";
    return `${baseClass} ${hoverClass}`;
  };

  return (
    <nav className="flex items-center justify-between bg-[#1b2430] py-5 px-5 md:px-20 relative z-50">
      <Link href="/">
        <svg
          id="logo-15"
          width="49"
          height="48"
          viewBox="0 0 49 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.5 12.75C24.5 18.9632 19.4632 24 13.25 24H2V12.75C2 6.53679 7.03679 1.5 13.25 1.5C19.4632 1.5 24.5 6.53679 24.5 12.75Z"
            fill="#17CF97"
          ></path>
          <path
            d="M24.5 35.25C24.5 29.0368 29.5368 24 35.75 24H47V35.25C47 41.4632 41.9632 46.5 35.75 46.5C29.5368 46.5 24.5 41.4632 24.5 35.25Z"
            fill="#17CF97"
          ></path>
          <path
            d="M2 35.25C2 41.4632 7.03679 46.5 13.25 46.5H24.5V35.25C24.5 29.0368 19.4632 24 13.25 24C7.03679 24 2 29.0368 2 35.25Z"
            fill="#17CF97"
          ></path>
          <path
            d="M47 12.75C47 6.53679 41.9632 1.5 35.75 1.5H24.5V12.75C24.5 18.9632 29.5368 24 35.75 24C41.9632 24 47 18.9632 47 12.75Z"
            fill="#17CF97"
          ></path>
        </svg>
      </Link>

      {/* for big screens (such as computer) */}
      <div>
        <ul className="hidden md:flex items-center gap-8 list-none">
          <li><Link href="/home" className={getLinkClass('/home')}>בית</Link></li>
          
          {canViewClassMap && (
            <li><Link href="/class-map" className={getLinkClass('/class-map')}>מפת כיתות</Link></li>
          )}

          {canViewProcedures && (
            <li><Link href="/procedures" className={getLinkClass('/procedures')}>נהלים</Link></li>
          )}
          
          {/* Supervisor only */}
          {isSupervisor && (
            <li><Link href="/exam-bot" className={getLinkClass('/exam-bot')}>בוט בחינות</Link></li>
          )}

          {/* Admin only */}
          {isAdmin && (
            <li>
              <Link href="/register-user" className={getLinkClass('/register-user')}>
                רישום משתמש
              </Link>
            </li>
          )}

          {isAdmin && (
            <li>
              <Link href="/add-exam" className={getLinkClass('/add-exam')}>
                הוספת בחינה
              </Link>
            </li>
          )}

            <li className="mr-4 border-r border-gray-600 pr-4">
              <ThemeToggle />
            </li>
        </ul>
      </div>

      <div className="md:hidden text-white text-2xl cursor-pointer" onClick={handleClick}>
        {clicked ? '✕' : '☰'}
      </div>

      {/* for small screens (such as mobile) */}
      <div
        className={`${clicked ? "flex" : "hidden"} md:hidden flex-col absolute top-full right-0 w-full bg-[#1b2430] p-6 shadow-lg border-t border-gray-700`}
      >
        <Link href="/home" className={`${getLinkClass('/home')} py-2 block`} onClick={() => setClicked(false)}>בית</Link>
        
        {/* Supervisors, Lecturers and Admin */}
        {canViewClassMap && (
          <Link href="/class-map" className={`${getLinkClass('/class-map')} py-2 block`} onClick={() => setClicked(false)}>מפת כיתות</Link>
        )}

        {canViewProcedures && (
          <Link href="/procedures" className={`${getLinkClass('/procedures')} py-2 block`} onClick={() => setClicked(false)}>נהלים</Link>
        )}
        
        {/* Supervisor only */}
        {isSupervisor && (
          <Link href="/exam-bot" className={`${getLinkClass('/exam-bot')} py-2 block`} onClick={() => setClicked(false)}>בוט בחינות</Link>
        )}

        {/* Admin only */}
        {isAdmin && (
          <Link
            href="/register-user"
            className={`${getLinkClass('/register-user')} py-2 block`}
            onClick={() => setClicked(false)}
          >
            רישום משתמש חדש
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/add-exam"
            className={`${getLinkClass('/add-exam')} py-2 block`}
            onClick={() => setClicked(false)}
          >
            הוספת בחינה
          </Link>
        )}

        <div className="mt-4 pt-4 border-t border-gray-600 flex items-center gap-3">
          <span className="text-white">מצב תצוגה:</span>
          <ThemeToggle />
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
