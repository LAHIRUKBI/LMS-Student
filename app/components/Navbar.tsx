// src/app/components/Navbar.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Menu, 
  Bell, 
  Trash2, 
  CheckCheck, 
  FileText, 
  GraduationCap, 
  Download, 
  X, 
  Smartphone, 
  Monitor,
  Home,
  UserCheck,
  Tv,
  BookOpenCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // State for student notices count
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0);

  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    // මොබයිල් තිර සඳහා ස්වයංක්‍රීයව හැකිලී (isExpanded=true) තැබීම
    const handleScreenResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(true);
      } else {
        const savedExpandState = localStorage.getItem("navbarExpanded") === "true";
        setIsExpanded(savedExpandState);
      }
    };

    handleScreenResize();
    window.addEventListener("resize", handleScreenResize);

    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);

    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    setIsMounted(true);
    fetchNotifications();
    fetchStudentNoticesCount();

    // 1. Service Worker එක Register කිරීම
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2. Standalone පරීක්ෂා කිරීම
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);
    };
    checkStandalone();

    // 3. Install Prompt එක සූදානම් වූ විට ගබඩා කරගැනීම
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Install කර අවසන් වූ පසු බටනය සැඟවීම
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowInstallGuide(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Global Heartbeat & Socket Connection
    const userData = localStorage.getItem("user");
    let socket: any = null;
    let heartbeatInterval: any = null;
    let parsedUser: any = null;

    if (userData) {
      parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser._id) {
        socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, { transports: ["websocket"] });
        
        socket.emit("student_connected", parsedUser._id);

        heartbeatInterval = setInterval(() => {
          socket.emit("student_heartbeat", parsedUser._id);
        }, 10000);
      }
    }

    // Notification dropdown සහ Mobile menu එකෙන් පිටත ක්ලික් කළ විට වැසීම
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    const interval = setInterval(() => {
      fetchNotifications();
      fetchStudentNoticesCount();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeatInterval);
      if (socket) {
        socket.disconnect();
      }
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("resize", handleScreenResize);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Install Click Action
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching student notifications:", err);
    }
  };

  const fetchStudentNoticesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadNoticeCount(unread);
    } catch (err) {
      // Prevent console error
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/student/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const profileImgUrl = user?.profileImage
    ? (user.profileImage.startsWith("http")
      ? user.profileImage
      : `${process.env.NEXT_PUBLIC_API_URL}${user.profileImage}`)
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
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    localStorage.setItem("navbarExpanded", String(newExpandState));

    if (!newExpandState) {
      setIsDropdownOpen(false);
    }
  };

  const handleNavbarLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      let studentId = user?._id;
      if (!studentId && userData) {
        const parsedUser = JSON.parse(userData);
        studentId = parsedUser?._id;
      }

      if (studentId) {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
        socket.emit("student_logout", studentId);

        if (token) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/student/logout`,
            { studentId: studentId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
    } catch (err) {
      console.error("Navbar logout error:", err);
    } finally {
      onLogout();
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Wrapper Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-3 w-full px-4 max-w-7xl pointer-events-none">
        
        {/* Main Navbar */}
        <nav
          className={`flex items-center justify-between transition-all duration-700 ease-in-out h-14 sm:h-16 pointer-events-auto
            ${isExpanded
              ? 'w-full max-w-full bg-transparent border-transparent shadow-none px-0'
              : 'w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full px-4 sm:px-6'
            }
          `}
        >
          {/* Left Part: Logo Area & Compact Icon Tabs */}
          <div
            className={`flex items-center h-full transition-all duration-700 pointer-events-auto relative
              ${isExpanded
                ? 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full px-3 sm:px-6'
                : 'px-0 border-transparent bg-transparent shadow-none rounded-none'
              }
            `}
          >
            <div className="relative flex items-center" ref={menuRef}>
              <button
                type="button"
                className="flex items-center focus:outline-none"
                onClick={(e) => {
                  if (isExpanded) {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-full text-white shadow-sm transition-transform hover:scale-105 shrink-0">
                  {isExpanded ? <Menu size={20} /> : <BookOpen size={20} />}
                </div>
                <span
                  className={`font-bold text-slate-800 dark:text-white tracking-tight transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-ellipsis
                    ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'max-w-[110px] sm:max-w-[180px] opacity-100 ml-2 sm:ml-3 text-[15px] sm:text-xl'}
                  `}
                >
                  NovaSkill
                </span>
              </button>

              {/* Mobile / Compact Dropdown Menu */}
              {isExpanded && isDropdownOpen && (
                <div className="absolute top-full left-0 mt-4 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl rounded-2xl p-2.5 flex flex-col gap-1.5 z-50">
                  
                  {/* Navbar එක හැකිලී ඇති විට (isExpanded=true) ඉරි තුන Menu එක තුළට Get App බොත්තම */}
                  {!isStandalone && (
                    <div className="pb-1 border-b border-slate-200/50 dark:border-slate-800/50 mb-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleInstallClick();
                        }}
                        className="w-full py-2.5 px-3 text-sm font-bold transition-all flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md active:scale-95"
                      >
                        <Download size={16} /> Get App
                      </button>
                    </div>
                  )}

                  <Link
                    href="/home"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl ${
                      pathname === '/home' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Home size={16} className="shrink-0" /> Home
                  </Link>

                  <Link
                    href="/teacher"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl ${
                      pathname === '/teacher' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <UserCheck size={16} className="shrink-0" /> Teachers
                  </Link>

                  <Link
                    href="/class/class_view"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl ${
                      pathname === '/class/class_view' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Tv size={16} className="shrink-0" /> Class
                  </Link>

                  <Link
                    href="/class/free"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl ${
                      pathname === '/class/free' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <BookOpenCheck size={16} className="shrink-0" /> Resources
                  </Link>

                  {user && user.name !== "Guest Student" && (
                    <Link
                      href="/class/myclass"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl ${
                        pathname === '/class/myclass' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <GraduationCap size={16} className="shrink-0" /> My classes
                    </Link>
                  )}

                  {user && user.name !== "Guest Student" && (
                    <Link
                      href="/notice_view"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${
                        pathname === '/notice_view' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="flex items-center gap-3"><FileText size={16} className="shrink-0" /> Notices</span>
                      {unreadNoticeCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                          {unreadNoticeCount}
                        </span>
                      )}
                    </Link>
                  )}

                  <div className="pt-1 border-t border-slate-200/50 dark:border-slate-800/50 mt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleNavbarLogout();
                      }}
                      className="w-full px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={16} className="shrink-0" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View: Icon-Only Navigation with Hover Tooltips */}
            <div className={`hidden md:flex items-center ml-5 gap-1.5 transition-all duration-500 ease-in-out ${isExpanded ? 'max-w-0 opacity-0 overflow-hidden' : 'max-w-[500px] opacity-100'}`}>
              <div className="h-6 w-px bg-slate-300/40 dark:bg-slate-700/40 mr-1.5"></div>

              {/* Home */}
              <div className="relative group flex items-center justify-center">
                <Link
                  href="/home"
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    pathname === '/home' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-label="Home"
                >
                  <Home size={19} />
                </Link>
                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mb-[-4px]"></div>
                  <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    Home
                  </span>
                </div>
              </div>

              {/* Teachers */}
              <div className="relative group flex items-center justify-center">
                <Link
                  href="/teacher"
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    pathname === '/teacher' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-label="Teachers"
                >
                  <UserCheck size={19} />
                </Link>
                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mb-[-4px]"></div>
                  <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    Teachers
                  </span>
                </div>
              </div>

              {/* Class */}
              <div className="relative group flex items-center justify-center">
                <Link
                  href="/class/class_view"
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    pathname === '/class/class_view' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-label="Class"
                >
                  <Tv size={19} />
                </Link>
                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mb-[-4px]"></div>
                  <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    Class
                  </span>
                </div>
              </div>

              {/* Resources */}
              <div className="relative group flex items-center justify-center">
                <Link
                  href="/class/free"
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    pathname === '/class/free' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-label="Resources"
                >
                  <BookOpenCheck size={19} />
                </Link>
                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mb-[-4px]"></div>
                  <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    Resources
                  </span>
                </div>
              </div>

              {/* My Classes */}
              {user && user.name !== "Guest Student" && (
                <div className="relative group flex items-center justify-center">
                  <Link
                    href="/class/myclass"
                    className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                      pathname === '/class/myclass' 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                    aria-label="My Classes"
                  >
                    <GraduationCap size={19} />
                  </Link>
                  <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
                    <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mb-[-4px]"></div>
                    <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      My classes
                    </span>
                  </div>
                </div>
              )}

              {/* Notices */}
              {user && user.name !== "Guest Student" && (
                <div className="relative group flex items-center justify-center">
                  <Link
                    href="/notice_view"
                    className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                      pathname === '/notice_view' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                    aria-label="Notices"
                  >
                    <FileText size={19} />
                    {unreadNoticeCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>
                    )}
                  </Link>
                  <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
                    <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 mb-[-4px]"></div>
                    <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                      Notices
                      {unreadNoticeCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                          {unreadNoticeCount}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Part: Controls & Profile */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2.5 h-full transition-all duration-700 pointer-events-auto shrink-0
              ${isExpanded
                ? 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full px-3 sm:px-4'
                : 'px-0 border-transparent bg-transparent shadow-none rounded-none'
              }
            `}
          >
            {/* Get App Button - Navbar එක දිගහැරී ඇති විට (!isExpanded) පමණක් මෙහි දිස්වේ */}
            {!isStandalone && !isExpanded && (
              <button
                onClick={handleInstallClick}
                className="hidden md:flex items-center text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-full shadow-md transition-all duration-500 shrink-0 border border-blue-400/30 px-3.5 py-1.5 gap-1.5"
                title="Install App"
              >
                <Download size={16} className="shrink-0" />
                <span className="max-w-[70px] opacity-100 whitespace-nowrap">
                  Get App
                </span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (!isNotificationOpen) fetchNotifications();
                }}
                className="p-2 rounded-full text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors relative shrink-0"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-[270px] sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl rounded-2xl p-3 sm:p-4 z-50">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={markAllAsRead} className="text-[11px] sm:text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto mt-2 space-y-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">No notifications found.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (notif.classId) {
                              window.location.href = `/class/class_join?classId=${notif.classId}`;
                              setIsNotificationOpen(false);
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            notif.isRead
                              ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100/50'
                              : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-100/50'
                          }`}
                        >
                          <div>
                            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">{notif.title}</h4>
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">{notif.message}</p>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notif._id, e)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Delete notification"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors shrink-0"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Profile */}
            <Link
              href="/profile"
              className={`flex items-center text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-700/60 rounded-full transition-all duration-500 cursor-pointer border border-white/20 dark:border-slate-700/30
                ${isExpanded ? 'p-1.5' : 'px-3 py-1.5'}
              `}
            >
              {profileImgUrl ? (
                <img src={profileImgUrl} alt={user?.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-slate-300/50 dark:border-slate-600/50 shrink-0" />
              ) : (
                <User size={16} className="text-blue-500 shrink-0" />
              )}
              <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-ellipsis ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'max-w-[75px] sm:max-w-[150px] opacity-100 ml-2 text-xs sm:text-sm'}`}>
                {user?.name}
              </span>
            </Link>

            {/* Collapsed Status එකේදී පෙනෙන Logout බටනය */}
            {isExpanded && (
              <button
                onClick={handleNavbarLogout}
                className="flex items-center justify-center p-2 rounded-full text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-500/10 hover:bg-red-100/80 dark:hover:bg-red-500/20 transition-all border border-red-200/40 dark:border-red-500/20 shadow-sm shrink-0"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}

            {/* Desktop Expand Button */}
            {isExpanded && (
              <button
                onClick={toggleExpand}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/30 shrink-0"
                title="Expand Navbar"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </nav>

        {/* Desktop View එකේදී දිගහැරී ඇති විට Logout සහ Collapse බටන් වෙනම Pill එකක් ලෙස දකුණින් දිස්වීම */}
        {!isExpanded && (
          <div className="hidden md:flex items-center gap-2 h-14 sm:h-16 px-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full shrink-0 pointer-events-auto transition-all duration-500 animate-in fade-in">
            <button
              onClick={handleNavbarLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-500/10 hover:bg-red-100/80 dark:hover:bg-red-500/20 rounded-full transition-all border border-red-200/40 dark:border-red-500/20 shadow-sm"
              title="Logout"
            >
              <LogOut size={16} className="shrink-0" />
              <span>Logout</span>
            </button>

            <button
              onClick={toggleExpand}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/20 dark:border-slate-700/30 shrink-0"
              title="Collapse Navbar"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}

      </div>

      {/* Elegant Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800/80 relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Download size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Install NovaSkill</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add to your device for easy access</p>
              </div>
            </div>

            <div className="space-y-4 my-6 text-sm">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/40">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Monitor size={16} className="text-blue-500" /> පරිගණකය (Edge / Chrome)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  බ්‍රවුසරයේ URL තීරුවේ (Address bar) දකුණු කෙළවරේ ඇති <strong>Install (App available)</strong> අයිකනය ඔබන්න.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/40">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Smartphone size={16} className="text-emerald-500" /> ජංගම දුරකථනය (Android / iOS)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  බ්‍රවුසරයේ <strong>Menu (⋮)</strong> හෝ <strong>Share</strong> බොත්තම ඔබා <strong>"Install app"</strong> හෝ <strong>"Add to Home Screen"</strong> තෝරන්න.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              තේරුම් ගත්තා (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
}