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
      const res = await axios.get("http://localhost:5000/api/admin/teachers");
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
    return `http://localhost:5000/profile_photos/${photoUrl}`;
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-slate-700 selection:text-white relative font-sans overflow-hidden transition-colors duration-500">

      {/* Ambient neutral orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-slate-400/10 dark:bg-slate-600/10 blur-[140px] rounded-full animate-pulse-slow" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-400/10 dark:bg-slate-600/10 blur-[140px] rounded-full animate-pulse-slow" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-300/5 dark:bg-slate-700/5 blur-[160px] rounded-full" />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-[90%] xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-32 pb-24 relative z-10">

        {/* ============ HEADER ============ */}
        <div className="relative mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-200 dark:border-slate-800/80">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Meet Your{" "}
                <span className="relative inline-block">
                  <span className="text-slate-900 dark:text-white">
                    Teachers
                  </span>
                </span>
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">
                Discover the experienced professionals guiding your learning journey. Click any card to explore their credentials.
              </p>

              {/* Stats pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm">
                  <BookOpen size={13} className="text-slate-500 dark:text-slate-400" />
                  {teachers.length} Teachers
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm">
                  <Award size={13} className="text-slate-500 dark:text-slate-400" />
                  Verified Profiles
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ SEARCH & FILTERS SECTION ============ */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filter Teachers:</span>
            </div>

            {/* Search Box */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or subject..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/50 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Subject Filter Pills */}
          {subjects.length > 1 && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Subjects:</span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                    selectedSubject === sub
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-lg p-3 animate-pulse"
              >
                <div className="w-full h-[340px] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-[24px]" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] py-24 text-center px-4 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-500/5" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <User size={40} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">
                No teachers found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                We couldn't find any teacher matching your search criteria. Try a different name or subject.
              </p>
              {(search || selectedSubject !== "all") && (
                <button
                  onClick={() => { setSearch(""); setSelectedSubject("all"); }}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-white transition-all hover:scale-105 active:scale-95"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredTeachers.map((t, index) => {
              const allLinks = [
                ...(t.website ? [{ platform: "Website", url: t.website }] : []),
                ...(t.socialLinks || [])
              ];

              const isTouched = activeTouchId === t._id;

              return (
                <div
                  key={t._id}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-2 transition-all duration-500 p-3 animate-fade-in opacity-0"
                  onTouchStart={() => setActiveTouchId(t._id)}
                >
                  {/* Neutral border glow on hover */}
                  <div className="absolute inset-0 rounded-[32px] bg-slate-900 dark:bg-slate-100 opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10 blur-sm" />

                  {/* Photo Card */}
                  <div className="relative w-full h-[340px] bg-slate-100 dark:bg-slate-800 rounded-[24px] overflow-hidden flex items-center justify-center">
                    {t.profilePhoto ? (
                      <>
                        <img
                          src={getProfileImageUrl(t.profilePhoto) || ""}
                          alt={t.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                        <User size={80} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    )}

                    {/* Glassmorphism Social Links Bar */}
                    {allLinks.length > 0 && (
                      <div
                        className={`absolute bottom-4 inset-x-4 mx-auto max-w-[90%] bg-white/20 dark:bg-black/35 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full px-4 py-2 flex items-center justify-start md:justify-center gap-2 shadow-xl z-10 transition-all duration-300 ease-out overflow-x-auto custom-scrollbar ${
                          isTouched
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0"
                        }`}
                      >
                        <div className="flex md:hidden items-center gap-2 shrink-0">
                          {allLinks.slice(0, 2).map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-slate-200 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-white/10 dark:bg-white/5"
                              title={link.platform}
                            >
                              {link.platform === "Website" ? <Globe size={14} /> : <ExternalLink size={14} />}
                              <span className="text-[11px] font-semibold truncate max-w-[75px]">{link.platform}</span>
                            </a>
                          ))}
                        </div>

                        <div className="hidden md:flex items-center gap-2 shrink-0">
                          {allLinks.slice(0, 3).map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-slate-200 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-white/10 dark:bg-white/5"
                              title={link.platform}
                            >
                              {link.platform === "Website" ? <Globe size={14} /> : <ExternalLink size={14} />}
                              <span className="text-[11px] font-semibold truncate max-w-[75px]">{link.platform}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subject Badge */}
                    <div className="absolute top-4 left-4 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-extrabold shadow-lg shadow-black/20 flex items-center gap-2 tracking-wide">
                      <BookOpen size={15} />
                      {t.subject}
                    </div>

                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-white dark:bg-slate-900 rounded-tl-[36px] pointer-events-none z-10" />

                    {/* Action Button */}
                    <button
                      onClick={() => toggleExpand(t._id)}
                      className="absolute right-3 bottom-3 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-20"
                      title="View Details"
                    >
                      <ChevronRight
                        size={22}
                        className="transition-transform duration-500 group-hover:rotate-90"
                      />
                    </button>
                  </div>

                  {/* Teacher Name Footer */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-xl text-slate-900 dark:text-white truncate group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                        {t.name}
                      </h3>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-slate-700 dark:bg-slate-300 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============ MODAL ============ */}
        {selectedTeacher && (
          <div
            onClick={() => setExpandedTeacherId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-modal-in"
            >
              {/* Modal Header */}
              <div className="relative bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Teacher Details</span>
                </div>

                <button
                  onClick={() => setExpandedTeacherId(null)}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-600 hover:rotate-90 transition-all duration-300 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[55vh] custom-scrollbar bg-slate-50/50 dark:bg-slate-900">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Email
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-xs truncate block">
                        {selectedTeacher.email || "Not provided"}
                      </span>
                    </div>
                  </div>

                  {selectedTeacher.phone && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Phone size={16} className="text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Phone
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-xs truncate block">
                          {selectedTeacher.phone}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedTeacher.address && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sm:col-span-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Address
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-xs block">
                          {selectedTeacher.address}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Qualifications */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <GraduationCap size={15} className="text-slate-700 dark:text-slate-300" />
                    Qualifications & Credentials
                  </p>
                  {selectedTeacher.qualifications && selectedTeacher.qualifications.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedTeacher.qualifications.map((q, idx) => (
                        <div
                          key={idx}
                          className="group/q relative bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Award size={15} className="text-slate-700 dark:text-slate-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {q.degree}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                                <GraduationCap size={11} /> {q.institution}
                              </p>
                              {q.period && (
                                <span className="inline-block text-[10px] text-slate-700 dark:text-slate-300 font-bold mt-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                  {q.period}
                                </span>
                              )}
                              {q.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                  {q.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <GraduationCap size={20} className="mx-auto text-slate-300 dark:text-slate-700 mb-1" />
                      <p className="text-xs text-slate-400 italic">No qualifications listed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              {(selectedTeacher.website ||
                (selectedTeacher.socialLinks && selectedTeacher.socialLinks.length > 0)) && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Link2 size={12} /> Connect
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.website && (
                      <a
                        href={selectedTeacher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
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
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        <ExternalLink size={13} /> {s.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============ LOCAL STYLES ============ */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-modal-in {
          animation: modalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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