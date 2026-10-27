// src/app/teacher/page.tsx (හෝ අදාළ StudentTeacherView පිටුව)

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import {
  Search, Loader2, User, Mail, GraduationCap, Globe, ExternalLink,
  ChevronRight, X, Sparkles, BookOpen, Award, Link2, Phone, MapPin,
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

export default function StudentTeacherView() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

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

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q));

    const matchesSubject = selectedSubject === "all" || t.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  const toggleExpand = (id: string) => {
    if (expandedTeacherId === id) {
      setExpandedTeacherId(null);
    } else {
      setExpandedTeacherId(id);
    }
  };

  if (!user) return null;

  const selectedTeacher = teachers.find((t) => t._id === expandedTeacherId);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-teal-500 selection:text-white relative font-sans transition-colors duration-500">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ============ HEADER (centered) ============ */}
      <header className="border-b border-slate-100 bg-slate-50 pb-12 pt-32 dark:border-slate-900 dark:bg-slate-900/40">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Award size={13} className="text-teal-600 dark:text-teal-400" />
            {teachers.length} Verified Teachers
          </div>

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Meet Your Teachers
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            Discover the experienced professionals guiding your learning journey. Open any profile to explore their credentials.
          </p>

          {/* Search Box */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-4 pl-14 pr-12 text-sm font-medium text-slate-800 shadow-sm placeholder-slate-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Subject Filter Tabs */}
          {subjects.length > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                    selectedSubject === sub
                      ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-500 dark:hover:text-teal-400"
                  }`}
                >
                  {sub === "all" ? "All Subjects" : sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[92%] px-4 pb-24 pt-10 sm:px-6 lg:px-10 xl:max-w-[1300px] relative z-10">

        {/* ============ CONTENT ============ */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-24 text-center dark:border-slate-800">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <User size={38} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">No teachers found</h3>
            <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
              We couldn't find any teacher matching your search criteria. Try a different name or subject.
            </p>
            {(search || selectedSubject !== "all") && (
              <button
                onClick={() => { setSearch(""); setSelectedSubject("all"); }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-95"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing <span className="text-slate-900 dark:text-white">{filteredTeachers.length}</span> of {teachers.length} teachers
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredTeachers.map((t, index) => {
                const allLinks = [
                  ...(t.website ? [{ platform: "Website", url: t.website }] : []),
                  ...(t.socialLinks || [])
                ];

                const isTouched = activeTouchId === t._id;
                const qualCount = t.qualifications?.length || 0;

                return (
                  <div
                    key={t._id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className={`group relative flex items-center gap-3 rounded-2xl border bg-white p-3.5 transition-all duration-300 hover:border-teal-500/60 hover:shadow-lg hover:shadow-teal-900/5 dark:bg-slate-900 sm:gap-5 sm:p-5 animate-fade-in opacity-0 ${
                      isTouched ? "border-teal-500/60" : "border-slate-200 dark:border-slate-800"
                    }`}
                    onTouchStart={() => setActiveTouchId(t._id)}
                  >
                    {/* Avatar */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-50 transition-all duration-300 group-hover:ring-teal-500/20 dark:bg-slate-800 dark:ring-slate-800 sm:h-24 sm:w-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User size={28} className="text-slate-300 dark:text-slate-600 sm:hidden" />
                        <User size={36} className="hidden text-slate-300 dark:text-slate-600 sm:block" />
                      </div>
                      {t.profilePhoto && (
                        <img
                          src={getProfileImageUrl(t.profilePhoto) || ""}
                          alt={t.name}
                          className="relative h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>

                    {/* Middle Info Column */}
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="truncate text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">{t.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 sm:text-sm">
                        <BookOpen size={13} className="shrink-0" />
                        <span className="truncate">{t.subject}</span>
                      </p>
                      {qualCount > 0 && (
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                          <GraduationCap size={12} className="shrink-0" />
                          <span className="truncate">{qualCount} {qualCount === 1 ? "qualification" : "qualifications"}</span>
                        </p>
                      )}

                      {/* Glassmorphism Social Links Capsule */}
                      {allLinks.length > 0 && (
                        <div className="mt-2 flex max-w-full items-center">
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
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => toggleExpand(t._id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-all duration-300 hover:border-teal-600 hover:bg-teal-600 hover:text-white active:scale-95 dark:border-slate-700 dark:text-slate-200 sm:h-12 sm:w-12"
                      title="View Details"
                    >
                      <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 sm:size-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* ============ FLOATING MODAL / TEACHER DETAILS ============ */}
      {selectedTeacher && (
        <div
          onClick={() => setExpandedTeacherId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-slate-950/70 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col-reverse lg:flex-row w-full max-w-5xl h-[88vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto lg:overflow-hidden rounded-[28px] sm:rounded-[36px] bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-slate-800 animate-modal-in custom-scrollbar"
          >
            {/* Close Button Floating */}
            <button
              onClick={() => setExpandedTeacherId(null)}
              className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:bg-red-600 active:scale-90 lg:bg-slate-900/40 lg:text-slate-100 dark:bg-black/50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* LEFT SIDE: Information & Credentials */}
            <div className="flex flex-1 flex-col lg:overflow-hidden">
              {/* Header Title Bar */}
              <div className="border-b border-slate-100 px-6 pb-5 pt-6 dark:border-slate-800 sm:px-8">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Teacher Profile
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {selectedTeacher.name}
                </h2>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                  <BookOpen size={13} /> {selectedTeacher.subject}
                </span>
              </div>

              {/* Details Content (Mobile එකේදී සිර නොවී පහසුවෙන් කියවීමට ඉඩ සලසා ඇත) */}
              <div className="custom-scrollbar flex-1 space-y-6 lg:overflow-y-auto px-6 py-6 sm:px-8">
                {/* Contact Section */}
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact</p>
                  <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    <li className="flex items-center gap-3 p-3.5 sm:p-4">
                      <Mail size={17} className="shrink-0 text-teal-600 dark:text-teal-400" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {selectedTeacher.email || "Not provided"}
                        </span>
                      </div>
                    </li>
                    {selectedTeacher.phone && (
                      <li className="flex items-center gap-3 p-3.5 sm:p-4">
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
                      <li className="flex items-start gap-3 p-3.5 sm:p-4">
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

                {/* Qualifications Section */}
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

              {/* Connect Footer */}
              {(selectedTeacher.website ||
                (selectedTeacher.socialLinks && selectedTeacher.socialLinks.length > 0)) && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:px-8">
                  <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
            </div>

            {/* RIGHT SIDE: Teacher Showcase Image (Mobile: h-52, Desktop: lg:h-auto) */}
            <div className="relative h-52 sm:h-64 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 lg:h-auto lg:w-[46%] xl:w-[48%]">
              <div className="absolute inset-0 flex items-center justify-center">
                <User size={80} className="text-slate-300 dark:text-slate-600 sm:size-24" />
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
              {/* Subtle gradient vignette over photo */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-slate-950/20" />
            </div>
          </div>
        </div>
      )}

      {/* ============ LOCAL STYLES ============ */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes drawerIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-modal-in {
          animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-drawer-in {
          animation: drawerIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-pulse-slow {
          animation: pulseSlow 8s ease-in-out infinite;
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