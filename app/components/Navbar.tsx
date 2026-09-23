"use client";

import { useState, useEffect } from "react";
import { BookOpen, User, LogOut, ChevronLeft, ChevronRight, Moon, Sun, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname(); // දැනට සිටින පිටුව හඳුනා ගැනීමට

  useEffect(() => {
    const savedExpandState = localStorage.getItem("navbarExpanded") === "true";
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    
    setIsExpanded(savedExpandState);
    setIsDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    setIsMounted(true); 
  }, []);

  const profileImgUrl = user?.profileImage 
    ? (user.profileImage.startsWith("http") 
        ? user.profileImage 
        : `http://localhost:5000${user.profileImage}`)
    : null;

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    localStorage.setItem("darkMode", String(newDarkModeState));

    if (newDarkModeState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleExpand = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    localStorage.setItem("navbarExpanded", String(newExpandState));
  };

  if (!isMounted) return null; 

  return (
    <nav 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between transition-all duration-700 ease-in-out h-14 sm:h-16
        ${isExpanded 
          ? 'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-full pointer-events-none' 
          : 'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-7xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 rounded-2xl px-2 sm:px-4 pointer-events-auto'
        }
      `}
    >
      {/* Left Part: Logo Area & Navigation Tabs */}
      <div 
        className={`flex items-center h-full transition-all duration-700 pointer-events-auto
          ${isExpanded 
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 rounded-2xl px-2.5 sm:px-5' 
            : 'px-0 border-transparent bg-transparent shadow-none rounded-none'
          }
        `}
      >
        <Link href="/dashboard" className="flex items-center">
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white shadow-sm transition-transform hover:scale-105 shrink-0">
            <BookOpen size={18} className="sm:hidden block" />
            <BookOpen size={20} className="hidden sm:block" />
          </div>
          <span 
            className={`font-bold text-slate-800 dark:text-white tracking-tight transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-ellipsis
              ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'max-w-[110px] sm:max-w-[180px] opacity-100 ml-1.5 sm:ml-2 text-[15px] sm:text-xl'}
            `}
          >
            Student Portal
          </span>
        </Link>

        {/* Navigation Tabs (Dashboard & Teachers) */}
        <div className={`hidden md:flex items-center ml-6 gap-2 transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${isExpanded ? 'max-w-0 opacity-0' : 'max-w-[300px] opacity-100'}`}>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mr-2"></div>
          
          <Link 
            href="/dashboard" 
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${
              pathname === '/dashboard' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen size={16} /> Lessons
          </Link>
          
          <Link 
            href="/teacher" 
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${
              pathname === '/teacher' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={16} /> Teachers
          </Link>

          <Link 
            href="/class/class_view" 
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${
              pathname === '/teacher' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={16} /> Class
          </Link>
        </div>
      </div>

      {/* Right Part: Actions (Dark mode, Profile, Logout, Split Button) */}
      {/* ... [මෙතැන් සිට පහළට පරණ Navbar එකේ Right Part එකම කිසිදු වෙනසකින් තොරව පවතී] ... */}
      <div 
        className={`flex items-center gap-1.5 sm:gap-3 h-full transition-all duration-700 pointer-events-auto
          ${isExpanded 
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 rounded-2xl px-2.5 sm:px-5' 
            : 'px-0 border-transparent bg-transparent shadow-none rounded-none'
          }
        `}
      >
        <button 
          onClick={toggleDarkMode}
          className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <span className="block sm:hidden">{isDarkMode ? <Sun size={16} /> : <Moon size={16} />}</span>
          <span className="hidden sm:block">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</span>
        </button>

        <Link 
          href="/profile" 
          className={`flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all duration-500 cursor-pointer 
            ${isExpanded ? 'p-1 sm:p-1.5' : 'px-2 py-1 sm:px-3 sm:py-1.5'}
          `}
        >
          {profileImgUrl ? (
            <img src={profileImgUrl} alt={user?.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0" />
          ) : (
            <User size={16} className="text-blue-500 shrink-0" />
          )}
          <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-ellipsis ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'max-w-[65px] sm:max-w-[150px] opacity-100 ml-1.5 sm:ml-2 text-xs sm:text-sm'}`}>
            {user?.name}
          </span>
        </Link>

        <button 
          onClick={onLogout}
          className={`flex items-center text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all duration-500 shrink-0
            ${isExpanded ? 'p-1.5 sm:p-2' : 'p-1.5 sm:px-3 sm:py-2'}
          `}
        >
          <LogOut size={16} className="shrink-0" /> 
          <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'hidden sm:block max-w-[80px] opacity-100 ml-2'}`}>
            Logout
          </span>
        </button>

        <div className={`w-px bg-slate-200 dark:bg-slate-700 hidden sm:block transition-all duration-500 ${isExpanded ? 'h-5 mx-0' : 'h-8 mx-1'}`}></div>
        
        <button 
          onClick={toggleExpand}
          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-all duration-300 shrink-0"
        >
          <span className="block sm:hidden">{isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</span>
          <span className="hidden sm:block">{isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</span>
        </button>
      </div>
    </nav>
  );
}