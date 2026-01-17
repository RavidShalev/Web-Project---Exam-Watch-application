'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

type CurrentUser = { 
  _id?: string;
  idNumber?: string;
  name: string; 
  role: string;
  username?: string; // for backward compatibility
};

const Navbar = () => {
  const [clicked, setClicked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load current user (username + role) from sessionStorage ONCE (no useEffect)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = sessionStorage.getItem('currentUser');
        if (raw) {
          setCurrentUser(JSON.parse(raw));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    loadUser();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('supervisorId');
    setCurrentUser(null);
    router.push('/');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'מנהל',
      supervisor: 'משגיח',
      lecturer: 'מרצה',
      student: 'סטודנט'
    };
    return labels[role] || role;
  };
  
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
    const isActive = pathname === path || pathname?.startsWith(path + '/');
    const baseClass =
      "text-[1.3rem] font-semibold text-white transition duration-300 ease-in-out hover:text-[#17cf97] relative";
    const hoverClass =
      "after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-[#17cf97] after:bottom-[-4px] after:left-0 hover:after:w-full";
    const activeClass = isActive ? "text-[#17cf97] after:w-full" : "";
    return `${baseClass} ${hoverClass} ${activeClass}`;
  };

  return (
    <nav className="flex items-center justify-between bg-[#1b2430] py-5 px-5 md:px-20 relative z-50" dir="rtl">
      {/* Logo - Right side (RTL) */}
      <Link href="/home" className="shrink-0">
        <svg
          id="logo-15"
          width="49"
          height="48"
          viewBox="0 0 49 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer hover:opacity-80 transition-opacity"
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

      {/* Navigation Links - Center */}
      <div className="flex-1 flex justify-center">
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

          {isAdmin && (
            <li>
              <Link href="/admin/audit-logs" className={getLinkClass('/admin/audit-logs')}>
                יומן פעולות
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* User Actions - Left side (RTL) */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white text-2xl cursor-pointer p-2 hover:bg-gray-700 rounded transition-colors"
          onClick={handleClick}
          aria-label="תפריט"
        >
          {clicked ? '✕' : '☰'}
        </button>

        {/* Desktop User Info */}
        {currentUser && (
          <>
            <div className="hidden md:flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full bg-[#17cf97] flex items-center justify-center">
                <User size={16} className="text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{currentUser.name || currentUser.username}</span>
                <span className="text-xs text-gray-300">{getRoleLabel(currentUser.role)}</span>
              </div>
            </div>
            
            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
              title="התנתק"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">התנתק</span>
            </button>
          </>
        )}
        
        {/* Theme Toggle */}
        <div className="border-r-2 border-gray-600 pr-4">
          <ThemeToggle />
        </div>
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

        {isAdmin && (
          <Link
            href="/admin/audit-logs"
            className={`${getLinkClass('/admin/audit-logs')} py-2 block`}
            onClick={() => setClicked(false)}
          >
            יומן פעולות
          </Link>
        )}

        {/* User Info & Logout for mobile */}
        {currentUser && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#17cf97] flex items-center justify-center">
                <User size={20} className="text-black" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-white">{currentUser.name || currentUser.username}</span>
                <span className="text-xs text-gray-300">{getRoleLabel(currentUser.role)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setClicked(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
            >
              <LogOut size={16} />
              <span>התנתק</span>
            </button>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-600 flex items-center gap-3">
          <div className="mr-4 border-r border-gray-600 pr-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
