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

  const navItems = [
    { href: "/home", label: "Home", icon: Home, tone: "blue" },
    { href: "/teacher", label: "Teachers", icon: UserCheck, tone: "violet" },
    { href: "/class/class_view", label: "Class", icon: Tv, tone: "cyan" },
    { href: "/class/free", label: "Resources", icon: BookOpenCheck, tone: "emerald" },
    ...(user && user.name !== "Guest Student"
      ? [{ href: "/class/myclass", label: "My classes", icon: GraduationCap, tone: "purple" }]
      : []),
    ...(user && user.name !== "Guest Student"
      ? [{ href: "/notice_view", label: "Notices", icon: FileText, tone: "blue" }]
      : []),
  ];

  const isActivePath = (href: string) =>
    pathname === href || (href !== "/home" && pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="fixed top-4 left-1/2 z-50 w-full max-w-7xl -translate-x-1/2 px-3 sm:px-5 pointer-events-none">
        {/* Soft ambient colour gives the glass a visible luminous edge */}
        <div className="pointer-events-none absolute left-[12%] top-[-18px] h-20 w-52 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute right-[13%] top-[-20px] h-24 w-56 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="flex items-center justify-between gap-2 sm:gap-3 pointer-events-none">

          {/* LEFT: Mobile menu trigger / desktop brand */}
          <div className="relative pointer-events-auto" ref={menuRef}>
            <div className={`flex h-[62px] items-center rounded-full border border-white/55 bg-gradient-to-br from-white/48 via-white/25 to-cyan-100/16 shadow-[0_12px_45px_rgba(55,65,120,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-3xl [backdrop-filter:saturate(180%)_blur(28px)] dark:border-white/15 dark:from-slate-800/48 dark:via-slate-900/38 dark:to-indigo-950/42 dark:shadow-[0_12px_45px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-500 ${
              isExpanded
                ? "h-[62px] w-[62px] min-w-[62px] justify-center p-0"
                : "px-2.5 sm:px-3"
            }`}>
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 768 || isExpanded) {
                    setIsDropdownOpen((value) => !value);
                  }
                }}
                aria-label="Open navigation menu"
                aria-expanded={isDropdownOpen}
                className={`group flex h-10 items-center justify-center rounded-full text-slate-800 transition-all duration-300 hover:bg-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 dark:text-white dark:hover:bg-white/10 focus-visible:ring-offset-2 ${
                  isExpanded
                    ? "absolute left-1/2 top-1/2 w-10 min-w-10 -translate-x-1/2 -translate-y-1/2 p-0"
                    : "gap-2.5 px-2.5"
                }`}
              >
                <span
                  className={`relative grid h-9 w-9 min-h-9 min-w-9 shrink-0 place-items-center overflow-hidden rounded-full border text-white backdrop-blur-2xl transition-all duration-300 ${
                    isExpanded
                      ? "border-cyan-200/80 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_5px_22px_rgba(37,99,235,.42)] ring-1 ring-cyan-100/45 dark:border-sky-300/70 dark:from-sky-500 dark:via-blue-700 dark:to-indigo-800 dark:shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_5px_22px_rgba(37,99,235,.38)]"
                      : "border-white/70 bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 shadow-[0_5px_18px_rgba(99,102,241,0.38)] group-hover:shadow-[0_7px_24px_rgba(99,102,241,0.5)]"
                  }`}
                >
                  {isExpanded ? <Menu size={19} /> : <BookOpen size={19} />}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/55 via-cyan-200/25 to-violet-300/35 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
                </span>
                <span className={`overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide text-white transition-all duration-500 ${
                  isExpanded ? "max-w-0 opacity-0" : "max-w-32 opacity-100"
                }`}>
                  NovaSkill
                </span>
              </button>

              {!isExpanded && (
                <span className="mx-2 hidden h-7 w-px bg-white/15 md:block" />
              )}

              {/* Desktop navigation: each item expands independently on hover */}
              <div className={`hidden md:flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] transition-all duration-500 ${
                isExpanded ? "max-w-0 overflow-hidden opacity-0" : "max-w-[760px] opacity-100"
              }`}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={`group/nav relative flex h-[46px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full border transition-[width,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:w-[124px] focus-visible:w-[124px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                        active
                          ? "border-white/75 bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_5px_22px_rgba(99,102,241,.38)]"
                          : "border-transparent text-slate-600 hover:border-white/70 hover:bg-white/65 hover:text-indigo-700 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="pointer-events-none absolute inset-[2px] rounded-full bg-gradient-to-br from-white/35 via-white/10 to-transparent opacity-100" />
                      )}
                      <span className="relative z-10 flex shrink-0 items-center justify-center">
                        <Icon size={21} strokeWidth={active ? 2.3 : 1.9} />
                      </span>
                      <span className="relative z-10 ml-0 max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-semibold opacity-0 transition-all duration-300 group-hover/nav:ml-2 group-hover/nav:max-w-[78px] group-hover/nav:opacity-100 group-focus-visible/nav:ml-2 group-focus-visible/nav:max-w-[78px] group-focus-visible/nav:opacity-100">
                        {item.label}
                      </span>
                      {item.href === "/notice_view" && unreadNoticeCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 z-20 h-2 w-2 rounded-full border border-[#101116] bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,.8)]" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile dropdown: two separate frosted-glass panels */}
              {isExpanded && isDropdownOpen && (
                <div className="absolute left-0 top-[calc(100%+10px)] z-[70] flex w-[min(282px,calc(100vw-28px))] flex-col gap-2 rounded-[24px] border border-white/85 bg-gradient-to-br from-white/68 via-white/48 to-indigo-100/38 p-2 shadow-[0_20px_58px_rgba(65,55,130,.20),inset_0_1px_0_rgba(255,255,255,.98)] backdrop-blur-3xl [backdrop-filter:saturate(185%)_blur(30px)] animate-in fade-in slide-in-from-top-2 duration-300 dark:border-white/15 dark:from-slate-800/68 dark:via-slate-900/58 dark:to-indigo-950/62">
                  <div className="rounded-[19px] border border-white/85 bg-white/30 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_6px_18px_rgba(99,102,241,.07)] backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
                    {!isStandalone && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleInstallClick();
                        }}
                        className="mb-1 flex w-full items-center gap-2.5 rounded-[15px] bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-left text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(99,102,241,.22)] transition-transform active:scale-[.98]"
                      >
                        <Download size={18} />
                        <span>Get NovaSkill App</span>
                      </button>
                    )}
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActivePath(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex min-h-[44px] items-center gap-2.5 rounded-[14px] px-3.5 py-2 text-[13px] font-medium transition-all duration-300 ${
                            active
                              ? "bg-gradient-to-r from-violet-300/90 via-indigo-300/85 to-sky-300/80 text-indigo-950 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_7px_22px_rgba(99,102,241,.22)] dark:from-violet-500/45 dark:via-indigo-500/40 dark:to-sky-500/35 dark:text-white"
                              : "text-slate-700 hover:bg-white/65 dark:text-slate-200 dark:hover:bg-white/[0.07]"
                          }`}
                        >
                          <Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
                          <span className="flex-1">{item.label}</span>
                          {item.href === "/notice_view" && unreadNoticeCount > 0 && (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              {unreadNoticeCount}
                            </span>
                          )}
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-300" />}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="rounded-[19px] border border-white/85 bg-white/30 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_6px_18px_rgba(99,102,241,.07)] backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleNavbarLogout();
                      }}
                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[14px] px-3.5 py-2 text-left text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-50/80 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    >
                      <LogOut size={20} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: utilities and account controls */}
          <div className="pointer-events-auto flex h-[62px] shrink-0 items-center gap-0.5 rounded-full border border-white/55 bg-gradient-to-br from-white/48 via-white/25 to-violet-100/16 px-1.5 shadow-[0_12px_45px_rgba(55,65,120,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-3xl [backdrop-filter:saturate(180%)_blur(28px)] dark:border-white/15 dark:from-slate-800/48 dark:via-slate-900/38 dark:to-indigo-950/42 dark:shadow-[0_12px_45px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] sm:gap-1 sm:px-2">
            {!isStandalone && !isExpanded && (
              <button
                onClick={handleInstallClick}
                className="hidden items-center gap-1.5 rounded-full border border-indigo-300/40 bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_5px_16px_rgba(99,102,241,.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(99,102,241,.38)] lg:flex"
                title="Install App"
              >
                <Download size={15} />
                <span>Get App</span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (!isNotificationOpen) fetchNotifications();
                }}
                aria-label="Notifications"
                className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-all hover:bg-white/65 hover:text-indigo-600 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-[#090b10] bg-rose-400 shadow-[0_0_9px_rgba(251,113,133,.8)]" />
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-[calc(100%+14px)] z-[80] w-[min(360px,calc(100vw-24px))] rounded-[24px] border border-white/60 bg-white/90 p-3 shadow-[0_24px_70px_rgba(20,25,45,.22)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#11141c]/95 sm:w-96 sm:p-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Your latest updates</p>
                    </div>
                    <button onClick={markAllAsRead} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-400/10">
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  </div>
                  <div className="custom-scrollbar mt-3 max-h-72 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">No notifications found.</p>
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
                          className={`flex cursor-pointer items-start justify-between gap-2 rounded-2xl border p-3 transition-colors ${
                            notif.isRead
                              ? "border-slate-200/70 bg-white/50 hover:bg-white dark:border-white/5 dark:bg-white/[0.025] dark:hover:bg-white/[0.06]"
                              : "border-indigo-200/70 bg-indigo-50/80 hover:bg-indigo-50 dark:border-indigo-400/20 dark:bg-indigo-400/[0.08] dark:hover:bg-indigo-400/[0.13]"
                          }`}
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{notif.title}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{notif.message}</p>
                            <span className="mt-1.5 block text-[10px] text-slate-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notif._id, e)}
                            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop appearance control; mobile appearance is inside the menu */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="hidden h-10 w-10 place-items-center rounded-full text-slate-600 transition-all hover:bg-white/65 hover:text-indigo-600 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white sm:grid"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="group/profile relative ml-0.5 flex h-11 w-11 shrink-0 items-center justify-center">
              <Link
                href="/profile"
                aria-label="Profile"
                className="relative grid aspect-square h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-300 via-indigo-500 to-violet-500 p-[2px] shadow-[0_5px_18px_rgba(99,102,241,.28)] transition-transform duration-300 hover:scale-[1.06] hover:shadow-[0_8px_24px_rgba(99,102,241,.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <span className="relative block aspect-square h-full w-full min-h-0 min-w-0 overflow-hidden rounded-full bg-white dark:bg-slate-900">
                  {profileImgUrl ? (
                    <img
                      src={profileImgUrl}
                      alt={user?.name || "Profile"}
                      className="absolute inset-0 block aspect-square h-full w-full min-h-0 min-w-0 rounded-full object-cover object-center"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 dark:from-indigo-500/25 dark:to-violet-500/25 dark:text-indigo-200">
                      <User size={17} />
                    </span>
                  )}
                </span>
              </Link>
              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+7px)] z-[90] -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-xl border border-white/70 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-slate-800 opacity-0 shadow-[0_8px_26px_rgba(35,35,70,.16)] backdrop-blur-2xl transition-all duration-200 group-hover/profile:translate-y-0 group-hover/profile:opacity-100 group-focus-within/profile:translate-y-0 group-focus-within/profile:opacity-100 dark:border-white/15 dark:bg-slate-900/90 dark:text-white">
                {user?.name || "Profile"}
              </span>
            </div>

            {/* Desktop expand / collapse control */}
            <button
              onClick={toggleExpand}
              aria-label={isExpanded ? "Expand navigation" : "Collapse navigation"}
              title={isExpanded ? "Expand Navbar" : "Collapse Navbar"}
              className="ml-0.5 hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-white/65 bg-white/55 text-slate-600 shadow-sm transition-all hover:bg-white/90 hover:text-indigo-600 dark:border-white/15 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/20 dark:hover:text-white md:grid"
            >
              {isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Install guide modal – existing PWA flow retained */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-[28px] border border-white/15 bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,.35)] dark:bg-[#11141c] sm:p-8">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
                <Download size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Install NovaSkill</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add to your device for easy access</p>
              </div>
            </div>
            <div className="my-6 space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <Monitor size={16} className="text-indigo-500" /> පරිගණකය (Edge / Chrome)
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  බ්‍රවුසරයේ URL තීරුවේ (Address bar) දකුණු කෙළවරේ ඇති <strong>Install (App available)</strong> අයිකනය ඔබන්න.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <Smartphone size={16} className="text-emerald-500" /> ජංගම දුරකථනය (Android / iOS)
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  බ්‍රවුසරයේ <strong>Menu (⋮)</strong> හෝ <strong>Share</strong> බොත්තම ඔබා <strong>"Install app"</strong> හෝ <strong>"Add to Home Screen"</strong> තෝරන්න.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[.99]"
            >
              තේරුම් ගත්තා (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
