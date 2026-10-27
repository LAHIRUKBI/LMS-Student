// src/app/student/classes/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Loader2,
  Monitor,
  Search,
  CheckCircle,
  Send,
  ExternalLink,
  X,
  Users,
  AlertCircle,
  GraduationCap,
  Languages,
  Sparkles,
  Ban,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import RequestPopup from "@/app/components/RequestPopup";
import AIChatWidget from "@/app/components/AIChatWidget";

// Cloudinary HTTPS URLs සහ Local backend paths දෙකටම ගැලපෙන Helper ශ්‍රිතය
const getImageUrl = (photoUrl?: string) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("http")) return photoUrl;
  return `${process.env.NEXT_PUBLIC_API_URL}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
};

// Teacher අනුව classes කණ්ඩායම් කිරීම
const groupByTeacher = (classes: any[]) => {
  const teacherMap: { [key: string]: any } = {};
  classes.forEach((cls: any) => {
    if (!cls.teacherId) return;
    const teacherId = cls.teacherId._id;
    if (!teacherMap[teacherId]) {
      teacherMap[teacherId] = { teacher: cls.teacherId, classes: [] };
    }
    teacherMap[teacherId].classes.push(cls);
  });
  return Object.values(teacherMap);
};

export default function StudentClassViewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groupedClasses, setGroupedClasses] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchData(token);
    } else {
      setUser({ name: "Guest Student" });
      fetchPublicClasses();
    }
  }, [router]);

  // Fetch all available classes and student requests when logged in
  const fetchData = async (authToken: string) => {
    try {
      const [classRes, reqRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/all`, { headers: { Authorization: `Bearer ${authToken}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/student-requests`, { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      setRequests(reqRes.data);
      setGroupedClasses(groupByTeacher(classRes.data));
    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch only public classes list when not logged in
  const fetchPublicClasses = async () => {
    try {
      const classRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/all`);
      setGroupedClasses(groupByTeacher(classRes.data));
    } catch (err: any) {
      console.error("Error fetching public classes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending request to join a class (notify if not logged in)
  const handleRequestClass = async (classId: string, teacherId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({
        type: "error",
        text: "Please register and log in to the system first before requesting a class!",
      });
      setIsPopupOpen(true);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/classes/request`,
        { classId, teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: res.data.message });
      setIsPopupOpen(true);
      fetchData(token);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to send the request." });
      setIsPopupOpen(true);
    }
  };

  // Handle canceling a pending class request
  const handleCancelRequest = async (requestId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: res.data.message || "Request cancelled successfully." });
      setIsPopupOpen(true);
      fetchData(token);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to cancel the request." });
      setIsPopupOpen(true);
    }
  };

  // Automatically collect all available subjects
  const subjects = useMemo(() => {
    const all = Array.from(new Set(groupedClasses.map((item) => item.teacher?.subject).filter(Boolean)));
    return ["all", ...all];
  }, [groupedClasses]);

  // Filter teachers and classes based on Search and Subject Filter
  const filteredGroupedClasses = useMemo(() => {
    const query = search.toLowerCase();

    return groupedClasses
      .map((item) => {
        const teacherName = item.teacher?.name?.toLowerCase() || "";
        const teacherSubject = item.teacher?.subject?.toLowerCase() || "";
        const matchesSubject = selectedSubject === "all" || item.teacher?.subject === selectedSubject;
        const teacherMatches = teacherName.includes(query) || teacherSubject.includes(query);

        const filteredClasses = item.classes.filter((cls: any) => {
          const grade = (cls.grade === "Other" ? cls.customGradeName : cls.grade)?.toLowerCase() || "";
          const medium = cls.medium?.toLowerCase() || "";
          const mode = cls.mode?.toLowerCase() || "";
          const description = cls.description?.toLowerCase() || "";
          return (
            grade.includes(query) ||
            medium.includes(query) ||
            mode.includes(query) ||
            description.includes(query)
          );
        });

        const finalClasses = teacherMatches ? item.classes : filteredClasses;

        if (matchesSubject && finalClasses.length > 0) {
          return { ...item, classes: finalClasses };
        }
        return null;
      })
      .filter(Boolean) as any[];
  }, [groupedClasses, search, selectedSubject]);

  const totalClasses = groupedClasses.reduce((sum, g) => sum + g.classes.length, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans">
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.clear();
          router.push("/login");
        }}
      />

      {/* ============ HERO ============ */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 pt-28 pb-24">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Find the <span className="text-blue-300">class</span> that suits you
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300">
            Browse classes from top teachers, check schedules and fees, and send your join request in a single click.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-2xl font-extrabold text-white">{groupedClasses.length}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Teachers</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-2xl font-extrabold text-white">{totalClasses}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Classes</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-2xl font-extrabold text-white">{subjects.length - 1}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Subjects</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        {/* ============ SEARCH & FILTERS (overlaps hero) ============ */}
        <div className="-mt-12 mb-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xl shadow-slate-900/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher, subject, grade, medium..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {subjects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                    selectedSubject === sub
                      ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {sub === "all" ? "All Subjects" : sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============ CONTENT ============ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-sm font-medium">Loading classes...</p>
          </div>
        ) : filteredGroupedClasses.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <BookOpen size={30} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Classes Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              We couldn't find any classes matching your search criteria.
            </p>
            {(search || selectedSubject !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedSubject("all");
                }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {filteredGroupedClasses.map((item: any) => {
              const photo = getImageUrl(item.teacher?.profilePhoto);
              return (
                <section key={item.teacher._id}>
                  {/* ---------- Teacher header ---------- */}
                  <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-blue-500/10 bg-slate-100 dark:bg-slate-800">
                        {photo ? (
                          <img src={photo} alt={item.teacher?.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <User size={30} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                          {item.teacher?.name}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                            <GraduationCap size={13} />
                            {item.teacher?.subject || "Subject"}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {item.classes.length} {item.classes.length === 1 ? "class" : "classes"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/teacher`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      View Profile <ExternalLink size={14} />
                    </button>
                  </div>

                  {/* ---------- Class cards ---------- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {item.classes.map((cls: any) => {
                      const req = requests.find((r) => r.classId === cls._id);
                      const status = req ? req.status : null;
                      const requestId = req ? req._id : null;
                      const coverImageUrl = getImageUrl(cls.coverImage);
                      const gradeLabel = cls.grade === "Other" ? cls.customGradeName : cls.grade;

                      const approved = cls.approvedStudentsCount || 0;
                      const hasLimit = cls.hasBatchLimit && cls.batchLimit > 0;
                      const isBatchFull = hasLimit && approved >= cls.batchLimit;
                      const fillPercent = hasLimit ? Math.min(100, Math.round((approved / cls.batchLimit) * 100)) : 0;
                      const seatsLeft = hasLimit ? Math.max(0, cls.batchLimit - approved) : null;

                      const feeMain = cls.isFree
                        ? "FREE"
                        : cls.fee
                        ? `LKR ${Number(cls.fee).toLocaleString()}`
                        : "Contact";
                      const feeSub = cls.isFree || !cls.fee
                        ? ""
                        : cls.billingType === "fixed_months"
                        ? `for ${cls.durationMonths || 1} month${(cls.durationMonths || 1) > 1 ? "s" : ""}`
                        : "per month";

                      return (
                        <article
                          key={cls._id}
                          className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-500/40"
                        >
                          {/* Cover */}
                          <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                            {coverImageUrl ? (
                              <img
                                src={coverImageUrl}
                                alt={gradeLabel}
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700">
                                <BookOpen size={48} />
                              </div>
                            )}
                          </div>

                          {/* Body */}
                          <div className="flex flex-1 flex-col gap-4 p-5">
                            {/* Grade / Medium / Mode */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-300">
                                {gradeLabel}
                              </span>
                              {cls.medium && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                  <Languages size={12} /> {cls.medium}
                                </span>
                              )}
                              {cls.mode && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-700 dark:text-orange-300">
                                  <Monitor size={12} /> {cls.mode}
                                </span>
                              )}
                            </div>

                            {/* Schedule */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  <Calendar size={15} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Day</p>
                                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">Every {cls.day}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                  <Clock size={15} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Time</p>
                                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {cls.startTime} – {cls.endTime}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {cls.description && (
                              <p className="whitespace-pre-line break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                {cls.description}
                              </p>
                            )}

                            {/* Seats */}
                            <div>
                              <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                  <Users size={12} /> {hasLimit ? "Seat availability" : "Seats"}
                                </span>
                                {hasLimit ? (
                                  <span className={isBatchFull ? "text-rose-500" : "text-violet-600 dark:text-violet-400"}>
                                    {isBatchFull ? "Batch Full" : `${seatsLeft} of ${cls.batchLimit} left`}
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400">Unlimited</span>
                                )}
                              </div>
                              {hasLimit && (
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isBatchFull ? "bg-rose-500" : fillPercent > 75 ? "bg-amber-500" : "bg-violet-500"
                                    }`}
                                    style={{ width: `${fillPercent}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Footer: fee + action */}
                            <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Class Fee</p>
                                  <p
                                    className={`text-lg font-extrabold leading-tight ${
                                      cls.isFree ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                                    }`}
                                  >
                                    {feeMain}
                                  </p>
                                </div>
                                {feeSub && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{feeSub}</p>}
                              </div>

                              {!status &&
                                (isBatchFull ? (
                                  <button
                                    disabled
                                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 text-xs font-bold text-slate-500 dark:text-slate-400"
                                  >
                                    <AlertCircle size={15} /> Batch Full (No Seats Left)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRequestClass(cls._id, item.teacher._id)}
                                    className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99]"
                                  >
                                    <Send size={15} className="transition-transform group-hover/btn:translate-x-0.5" />
                                    Request to Join
                                  </button>
                                ))}

                              {status === "Pending" && (
                                <div className="grid grid-cols-5 gap-2">
                                  <div className="col-span-3 flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-xs font-bold text-amber-700 dark:text-amber-400">
                                    <Loader2 size={14} className="animate-spin" /> Pending
                                  </div>
                                  {requestId && (
                                    <button
                                      onClick={() => handleCancelRequest(requestId)}
                                      className="col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-600 transition-all hover:bg-rose-500 hover:text-white dark:text-rose-400"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              )}

                              {status === "Approved" && (
                                <button
                                  onClick={() => router.push(`/class/class_join?classId=${cls._id}`)}
                                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                                >
                                  <CheckCircle size={15} /> Join Class
                                </button>
                              )}

                              {status === "Blocked" && (
                                <button
                                  disabled
                                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-600 dark:text-rose-400"
                                >
                                  <Ban size={15} /> Access Blocked by Admin
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      <RequestPopup
        isOpen={isPopupOpen}
        type={message.type as "success" | "error"}
        message={message.text}
        onClose={() => setIsPopupOpen(false)}
      />
      <AIChatWidget />
    </div>
  );
}
