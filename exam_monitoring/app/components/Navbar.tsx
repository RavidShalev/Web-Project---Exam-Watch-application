'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, BookOpen, Bot, UserPlus, FileText, LogOut } from 'lucide-react';

type CurrentUser = { username: string; role: string; name?: string };

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const pathname = usePathname();

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

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isStudent = currentUser?.role === 'student';
  const isLecturer = currentUser?.role === 'lecturer';
  const canViewProcedures = isStudent || isLecturer || isSupervisor;

  // Navigation items based on role
  const navItems = [
    { href: '/home', label: 'בית', icon: Home, show: true },
    { href: '/procedures', label: 'נהלים', icon: BookOpen, show: canViewProcedures },
    { href: '/exam-bot', label: 'בוט בחינות', icon: Bot, show: isSupervisor },
    { href: '/register-user', label: 'רישום משתמש', icon: UserPlus, show: isAdmin },
    { href: '/add-exam', label: 'הוספת בחינה', icon: FileText, show: isAdmin },
  ].filter(item => item.show);

  // Check if link is active : Visibility of system status
  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('supervisorId');
    window.location.href = '/';
  };

  return (
    <nav className="bg-[#1b2430] sticky top-0 z-50 shadow-lg" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-[#17cf97] to-[#0ea97a] p-2 rounded-xl group-hover:shadow-lg group-hover:shadow-[#17cf97]/25 transition-all">
              <svg width="24" height="24" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.5 12.75C24.5 18.9632 19.4632 24 13.25 24H2V12.75C2 6.53679 7.03679 1.5 13.25 1.5C19.4632 1.5 24.5 6.53679 24.5 12.75Z" fill="white"/>
                <path d="M24.5 35.25C24.5 29.0368 29.5368 24 35.75 24H47V35.25C47 41.4632 41.9632 46.5 35.75 46.5C29.5368 46.5 24.5 41.4632 24.5 35.25Z" fill="white"/>
                <path d="M2 35.25C2 41.4632 7.03679 46.5 13.25 46.5H24.5V35.25C24.5 29.0368 19.4632 24 13.25 24C7.03679 24 2 29.0368 2 35.25Z" fill="white" fillOpacity="0.6"/>
                <path d="M47 12.75C47 6.53679 41.9632 1.5 35.75 1.5H24.5V12.75C24.5 18.9632 29.5368 24 35.75 24C41.9632 24 47 18.9632 47 12.75Z" fill="white" fillOpacity="0.6"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">ExamWatch</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-[#17cf97] text-white shadow-lg shadow-[#17cf97]/25'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User info & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{currentUser.name || currentUser.username}</p>
                  <p className="text-gray-400 text-xs">
                    {currentUser.role === 'admin' && 'מנהל מערכת'}
                    {currentUser.role === 'supervisor' && 'משגיח'}
                    {currentUser.role === 'lecturer' && 'מרצה'}
                    {currentUser.role === 'student' && 'סטודנט'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="התנתק"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-[#232d3b] border-t border-[#2d3a4a]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-[#17cf97] text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile logout */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span>התנתק</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
