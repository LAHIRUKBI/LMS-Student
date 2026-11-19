// src/app/teacher/page.tsx (හෝ අදාළ StudentTeacherView පිටුව)

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import {
  Search, User, Mail, GraduationCap, Globe, ExternalLink,
  ChevronRight, X, BookOpen, Award, Link2, Phone, MapPin,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import AIChatWidget from "@/app/components/AIChatWidget";

interface Qualification {
  institution: string;
  degree: string;
  period: string;
  description: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  subject: string;
  phone?: string;
  address?: string;
  website?: string;
  socialLinks?: SocialLink[];
  profilePhoto?: string;
  qualifications?: Qualification[];
}

type SortOption = "name" | "qualifications";

export default function StudentTeacherView() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [activeTouchId, setActiveTouchId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser({ name: "Guest Student" });
    }

    fetchPublicTeachers();
  }, [router]);

  const fetchPublicTeachers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/teachers`);
      setTeachers(res.data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `${process.env.NEXT_PUBLIC_API_URL}/profile_photos/${photoUrl}`;
  };

  // ලබා ගත හැකි සියලුම විෂයයන් (Subjects) ස්වයංක්‍රීයව ලබා ගැනීම
  const subjects = ["all", ...Array.from(new Set(teachers.map((t) => t.subject).filter(Boolean)))];

  // එක් එක් විෂයයේ ගුරු ගණන (chip එකේ පෙන්වීමට)
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: teachers.length };
    teachers.forEach((t) => {
      if (t.subject) counts[t.subject] = (counts[t.subject] || 0) + 1;
    });
    return counts;
  }, [teachers]);

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q));

    const matchesSubject = selectedSubject === "all" || t.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  // Sorting (filter කළ ලැයිස්තුවට පමණක් අදාළයි)
  const sortedTeachers = useMemo(() => {
    const list = [...filteredTeachers];
    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      list.sort((a, b) => (b.qualifications?.length || 0) - (a.qualifications?.length || 0));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers, search, selectedSubject, sortBy]);

  const hasActiveFilters = search !== "" || selectedSubject !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedSubject("all");
  };

  const toggleExpand = (id: string) => {
    if (expandedTeacherId === id) {
      setExpandedTeacherId(null);
    } else {
      setExpandedTeacherId(id);
    }
  };

  const selectedIndex = sortedTeachers.findIndex((t) => t._id === expandedTeacherId);
  const selectedTeacher = teachers.find((t) => t._id === expandedTeacherId);

  const goToTeacher = (offset: number) => {
    const next = sortedTeachers[selectedIndex + offset];
    if (next) setExpandedTeacherId(next._id);
  };

  // Modal විවෘත වු විට: Esc වසයි, ←/→ අනික් ගුරුවරුන් අතර යයි, පසුබිම scroll නොවේ
  useEffect(() => {
    if (!expandedTeacherId) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedTeacherId(null);
      if (e.key === "ArrowRight") goToTeacher(1);
      if (e.key === "ArrowLeft") goToTeacher(-1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedTeacherId, selectedIndex, sortedTeachers]);

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 font-sans text-slate-800 transition-colors duration-500 selection:bg-teal-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ============ TOOLBAR ============ */}
      <header className="relative z-10 pb-10 pt-32">
        <div className="w-full px-3 sm:px-5 lg:px-8">
          <div className="rounded-[28px] border border-white/70 bg-white/60 p-3 shadow-sm shadow-slate-900/5 ring-1 ring-inset ring-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:ring-white/5 sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-white/80 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-900"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <label className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 md:justify-start">
                Sort
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="cursor-pointer bg-transparent text-xs font-bold text-slate-800 focus:outline-none dark:text-slate-100"
                >
                  <option value="name">Name (A–Z)</option>
                  <option value="qualifications">Most qualifications</option>
                </select>
              </label>
            </div>

            {/* Subject Labels (ගණන සමඟ) */}
            {subjects.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {subjects.map((sub) => {
                  const active = selectedSubject === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      aria-pressed={active}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all duration-300 ${
                        active
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                          : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-teal-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-400"
                      }`}
                    >
                      {sub === "all" ? "All Subjects" : sub}
                      <span
                        className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-200/70 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {subjectCounts[sub] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============ GLASS PANEL covering all teacher cards ============ */}
      <main className="relative z-10 w-full px-3 pb-24 sm:px-5 lg:px-8">
        <section className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/35 p-5 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/35 dark:shadow-black/40 dark:ring-white/5 sm:p-8">
          {/* Glass sheen: light reflecting across the surface */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[40px] bg-gradient-to-br from-white/60 via-white/5 to-transparent dark:from-white/10 dark:via-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          <div className="relative">
            {/* ============ RESULTS LINE ============ */}
            {!loading && teachers.length > 0 && (
              <div className="mb-6 flex items-center justify-between px-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">{sortedTeachers.length}</span>
                  {" "}of {teachers.length} teachers
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* ============ CONTENT ============ */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-[28px] bg-white/80 ring-1 ring-slate-200/70 dark:bg-slate-900/80 dark:ring-slate-800"
                  >
                    <div className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-3 p-5">
                      <div className="h-3 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedTeachers.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-4 py-24 text-center dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <User size={38} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">No teachers found</h3>
                <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
                  We couldn't find any teacher matching your search criteria. Try a different name or subject.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-95"
                  >
                    <X size={14} /> Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedTeachers.map((t, index) => {
                  const allLinks = [
                    ...(t.website ? [{ platform: "Website", url: t.website }] : []),
                    ...(t.socialLinks || [])
                  ];

                  const isTouched = activeTouchId === t._id;
                  const qualCount = t.qualifications?.length || 0;

                  return (
                    <article
                      key={t._id}
                      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
                      className={`group relative flex flex-col overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-900/10 dark:bg-slate-900 animate-fade-in opacity-0 ${
                        isTouched ? "ring-teal-500/60" : "ring-slate-200/70 dark:ring-slate-800"
                      }`}
                      onTouchStart={() => setActiveTouchId(t._id)}
                    >
                      {/* Portrait Photo with overlaid name */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(t._id)}
                        className="relative aspect-[4/5] w-full overflow-hidden bg-teal-600 text-left"
                        aria-label={`View ${t.name}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User size={72} className="text-white/30" />
                        </div>
                        {t.profilePhoto && (
                          <img
                            src={getProfileImageUrl(t.profilePhoto) || ""}
                            alt={t.name}
                            loading="lazy"
                            className="relative h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        )}

                        {/* Bottom gradient for text legibility */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                        {/* Qualification count (glass) */}
                        {qualCount > 0 && (
                          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                            <GraduationCap size={12} />
                            {qualCount} {qualCount === 1 ? "qualification" : "qualifications"}
                          </span>
                        )}

                        {/* Name + subject over photo */}
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <h3 className="truncate text-xl font-black tracking-tight text-white">{t.name}</h3>
                          <p className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                            <BookOpen size={12} className="shrink-0" />
                            <span className="truncate">{t.subject}</span>
                          </p>
                        </div>
                      </button>

                      {/* Footer */}
                      <div className="flex flex-1 flex-col gap-4 p-5">
                        {/* Glassmorphism Social Links Capsule */}
                        {allLinks.length > 0 && (
                          <div className="flex max-w-full items-center">
                            <div
                              className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/90 bg-slate-100/80 px-2 py-0.5 backdrop-blur-md shadow-sm transition-all duration-300 ease-out dark:border-slate-700/80 dark:bg-slate-800/80 sm:gap-1.5 sm:px-2.5 sm:py-1 ${
                                isTouched
                                  ? "opacity-100 translate-y-0"
                                  : "opacity-90 sm:opacity-0 sm:translate-y-1.5 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
                              }`}
                              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                              {/* Mobile Links */}
                              <div className="flex items-center gap-1 md:hidden">
                                {allLinks.slice(0, 2).map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 transition-colors hover:text-teal-600 dark:text-slate-200 dark:hover:text-teal-400"
                                    title={link.platform}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link.platform === "Website" ? <Globe size={11} className="shrink-0" /> : <ExternalLink size={11} className="shrink-0" />}
                                    <span className="max-w-[55px] truncate">{link.platform}</span>
                                  </a>
                                ))}
                              </div>

                              {/* Desktop Links */}
                              <div className="hidden items-center gap-1.5 md:flex">
                                {allLinks.slice(0, 3).map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-slate-700 transition-colors hover:text-teal-600 dark:text-slate-200 dark:hover:text-teal-400"
                                    title={link.platform}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link.platform === "Website" ? <Globe size={12} className="shrink-0" /> : <ExternalLink size={12} className="shrink-0" />}
                                    <span className="max-w-[70px] truncate">{link.platform}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* View Profile Action */}
                        <button
                          onClick={() => toggleExpand(t._id)}
                          className="mt-auto flex w-full items-center justify-between rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-teal-600 active:scale-[0.98] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-teal-500 dark:hover:text-white"
                          title="View Details"
                        >
                          View Profile
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ============ TEACHER DETAILS MODAL ============ */}
      {selectedTeacher && (
        <div
          onClick={() => setExpandedTeacherId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md animate-fade-in sm:p-6 lg:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88vh] w-full max-w-5xl flex-col-reverse overflow-y-auto rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-900/10 animate-modal-in custom-scrollbar dark:bg-slate-900 dark:ring-slate-800 sm:h-auto sm:max-h-[90vh] sm:rounded-[32px] lg:flex-row lg:overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setExpandedTeacherId(null)}
              className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:bg-red-600 active:scale-90 lg:bg-slate-900/40 lg:text-slate-100 dark:bg-black/50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* LEFT SIDE: Information & Credentials */}
            <div className="flex flex-1 flex-col lg:overflow-hidden">
              {/* Header */}
              <div className="px-6 pb-5 pt-7 sm:px-8">
                <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Teacher Profile
                </p>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {selectedTeacher.name}
                </h2>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-teal-600/20">
                  <BookOpen size={13} /> {selectedTeacher.subject}
                </span>
              </div>

              {/* Details */}
              <div className="custom-scrollbar flex-1 space-y-7 px-6 py-6 sm:px-8 lg:overflow-y-auto">
                {/* Contact */}
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact</p>
                  <ul className="divide-y divide-slate-100 rounded-2xl bg-slate-50 dark:divide-slate-800 dark:bg-slate-800/50">
                    <li className="flex items-center gap-3 p-4">
                      <Mail size={17} className="shrink-0 text-teal-600 dark:text-teal-400" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {selectedTeacher.email || "Not provided"}
                        </span>
                      </div>
                    </li>
                    {selectedTeacher.phone && (
                      <li className="flex items-center gap-3 p-4">
                        <Phone size={17} className="shrink-0 text-teal-600 dark:text-teal-400" />
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</span>
                          <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {selectedTeacher.phone}
                          </span>
                        </div>
                      </li>
                    )}
                    {selectedTeacher.address && (
                      <li className="flex items-start gap-3 p-4">
                        <MapPin size={17} className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" />
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Address</span>
                          <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {selectedTeacher.address}
                          </span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Qualifications */}
                <div>
                  <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <GraduationCap size={15} className="text-teal-600 dark:text-teal-400" />
                    Qualifications & Credentials
                  </p>
                  {selectedTeacher.qualifications && selectedTeacher.qualifications.length > 0 ? (
                    <div className="relative space-y-6 pl-6 before:absolute before:bottom-1 before:left-[7px] before:top-1.5 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                      {selectedTeacher.qualifications.map((q, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-6 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-teal-500 bg-white dark:bg-slate-900" />
                          {q.period && (
                            <span className="mb-1 inline-block text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                              {q.period}
                            </span>
                          )}
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{q.degree}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <Award size={12} /> {q.institution}
                          </p>
                          {q.description && (
                            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{q.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 py-6 text-center dark:border-slate-700">
                      <GraduationCap size={22} className="mx-auto mb-1 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs italic text-slate-400">No qualifications listed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Connect */}
              {(selectedTeacher.website ||
                (selectedTeacher.socialLinks && selectedTeacher.socialLinks.length > 0)) && (
                <div className="border-t border-slate-100 p-5 dark:border-slate-800 sm:px-8">
                  <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Link2 size={12} /> Connect
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.website && (
                      <a
                        href={selectedTeacher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition-all duration-300 hover:bg-teal-700 active:scale-95"
                      >
                        <Globe size={14} /> Website
                        <ExternalLink size={11} className="opacity-70" />
                      </a>
                    )}
                    {selectedTeacher.socialLinks?.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all duration-300 hover:border-teal-500 hover:text-teal-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-teal-400"
                      >
                        <ExternalLink size={13} /> {s.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous / Next */}
              {sortedTeachers.length > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-8">
                  <button
                    onClick={() => goToTeacher(-1)}
                    disabled={selectedIndex <= 0}
                    className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-400"
                  >
                    Previous
                  </button>
                  <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                    {selectedIndex + 1} / {sortedTeachers.length}
                  </span>
                  <button
                    onClick={() => goToTeacher(1)}
                    disabled={selectedIndex >= sortedTeachers.length - 1}
                    className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-400"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Teacher Photo */}
            <div className="relative h-56 w-full shrink-0 overflow-hidden bg-teal-600 sm:h-72 lg:h-auto lg:w-[46%] xl:w-[48%]">
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={80} className="text-white/30" />
              </div>
              {selectedTeacher.profilePhoto && (
                <img
                  src={getProfileImageUrl(selectedTeacher.profilePhoto) || ""}
                  alt={selectedTeacher.name}
                  className="relative h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-slate-950/20" />
            </div>
          </div>
        </div>
      )}

      {/* ============ LOCAL STYLES ============ */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-in {
          animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
      <AIChatWidget />
    </div>
  );
}