// src/app/components/Navbar.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, User, LogOut, ChevronLeft, ChevronRight, Moon, Sun, Users, Menu, Bell, Trash2, CheckCheck, FileText, Gift, GraduationCap, Download, X, Smartphone, Monitor } from "lucide-react";
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

  // A ref to close the notification dropdown when clicking outside of it.
  const notificationRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    const savedExpandState = localStorage.getItem("navbarExpanded") === "true";
    const savedDarkMode = localStorage.getItem("darkMode") === "true";

    setIsExpanded(savedExpandState);
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

    // 2. Standalone (දැනටමත් App එකක් ලෙස Install කර විවෘත කර ඇත්දැයි) පරීක්ෂා කිරීම
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);
    };
    checkStandalone();

    // 3. බ්‍රවුසරයෙන් Install Prompt එක සූදානම් වූ විට ගබඩා කරගැනීම
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

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

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
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between transition-all duration-700 ease-in-out h-14 sm:h-16
          ${isExpanded
            ? 'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-full pointer-events-none'
            : 'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-7xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full px-4 sm:px-6 pointer-events-auto'
          }
        `}
      >
        {/* Left Part: Logo Area & Navigation Tabs */}
        <div
          className={`flex items-center h-full transition-all duration-700 pointer-events-auto relative
            ${isExpanded
              ? 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full px-3 sm:px-6'
              : 'px-0 border-transparent bg-transparent shadow-none rounded-none'
            }
          `}
        >
          <div className="relative flex items-center">
            <Link
              href="/home"
              className="flex items-center"
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
            </Link>

            {isExpanded && isDropdownOpen && (
              <div className="absolute top-full left-0 mt-4 w-48 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl rounded-2xl py-2.5 flex flex-col gap-1 z-50">
                <Link
                  href="/teacher"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2.5 mx-2 rounded-xl ${pathname === '/teacher' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Users size={16} /> Teachers
                </Link>
                <Link
                  href="/class/class_view"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2.5 mx-2 rounded-xl ${pathname === '/class/class_view' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Users size={16} /> Class
                </Link>
                <Link
                  href="/class/free"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2.5 mx-2 rounded-xl ${pathname === '/class/free' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Gift size={16} /> Resources
                </Link>
                {user && user.name !== "Guest Student" && (
                  <Link
                    href="/class/myclass"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2.5 mx-2 rounded-xl ${pathname === '/class/myclass' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <GraduationCap size={16} /> My classes
                  </Link>
                )}
                {user && user.name !== "Guest Student" && (
                  <Link
                    href="/notice_view"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 relative ${pathname === '/notice_view' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <FileText size={16} /> Notices
                    {unreadNoticeCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                        {unreadNoticeCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className={`hidden md:flex items-center ml-6 gap-2 transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${isExpanded ? 'max-w-0 opacity-0' : 'max-w-[650px] opacity-100'}`}>
            <div className="h-6 w-px bg-slate-300/40 dark:bg-slate-700/40 mr-2"></div>

            <Link
              href="/teacher"
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1.5 ${pathname === '/teacher' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
            >
              <Users size={16} /> Teachers
            </Link>

            <Link
              href="/class/class_view"
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1.5 ${pathname === '/class/class_view' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
            >
              <Users size={16} /> Class
            </Link>

            <Link
              href="/class/free"
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1.5 ${pathname === '/class/free' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
            >
              <Gift size={16} /> Resources
            </Link>

            {user && user.name !== "Guest Student" && (
              <Link
                href="/class/myclass"
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-1.5 ${pathname === '/class/myclass' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }`}
              >
                <GraduationCap size={16} /> My classes
              </Link>
            )}

            {user && user.name !== "Guest Student" && (
              <Link
                href="/notice_view"
                onClick={() => setIsDropdownOpen(false)}
                className={`px-4 py-2 text-sm font-bold transition-colors flex items-center justify-between mx-2 rounded-full ${pathname === '/notice_view' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }`}
              >
                <span className="flex items-center gap-2"><FileText size={16} /> Notices</span>
                {unreadNoticeCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1.5">
                    {unreadNoticeCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Right Part: Actions & Notification Bell */}
        <div
          className={`flex items-center gap-1.5 sm:gap-3 h-full transition-all duration-700 pointer-events-auto
            ${isExpanded
              ? 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-slate-700/30 rounded-full px-3 sm:px-6'
              : 'px-0 border-transparent bg-transparent shadow-none rounded-none'
            }
          `}
        >
          {/* Get App Button (Standalone නොවන සෑම විටකම දිස්වේ) */}
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              className={`flex items-center text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-full shadow-md transition-all duration-500 shrink-0 border border-blue-400/30
                ${isExpanded ? 'p-2' : 'px-3 py-1.5'}
              `}
              title="Install App"
            >
              <Download size={16} className="shrink-0" />
              <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'max-w-[70px] opacity-100 ml-1.5'}`}>
                Get App
              </span>
            </button>
          )}

          {/* Notification Bell Icon & Responsive Dropdown */}
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
              <div className="absolute right-[-100px] sm:right-0 mt-3 w-[270px] sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl rounded-2xl p-3 sm:p-4 z-50">
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
                        className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${notif.isRead
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

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors shrink-0"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

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
            <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-ellipsis ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'max-w-[65px] sm:max-w-[150px] opacity-100 ml-2 text-xs sm:text-sm'}`}>
              {user?.name}
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleNavbarLogout}
            className={`flex items-center text-sm font-medium text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-100/70 dark:hover:bg-red-500/20 rounded-full transition-all duration-500 shrink-0 border border-red-200/30 dark:border-red-500/20
              ${isExpanded ? 'p-2' : 'px-3.5 py-1.5'}
            `}
          >
            <LogOut size={16} className="shrink-0" />
            <span className={`transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${isExpanded ? 'max-w-0 opacity-0 ml-0 text-[0px]' : 'hidden sm:block max-w-[80px] opacity-100 ml-2'}`}>
              Logout
            </span>
          </button>

          <button
            onClick={toggleExpand}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/60 transition-all duration-300 shrink-0 border border-white/20 dark:border-slate-700/30"
          >
            {isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </nav>

      {/* Elegant Install Guide Modal (Event එක නොලැබෙන බ්‍රවුසර සඳහා) */}
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