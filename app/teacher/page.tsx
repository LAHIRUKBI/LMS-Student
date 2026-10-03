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

  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

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

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q))
    );
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
        <div className="relative mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-200 dark:border-slate-800/80">
            <div className="space-y-4 max-w-2xl">
              {/* Small badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-wide">
                
                EDUCATORS DIRECTORY
              </div>

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

            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute -inset-0.5 rounded-full bg-slate-900 dark:bg-slate-100 opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-500" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-6 pr-14 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-transparent focus:ring-2 focus:ring-slate-900/30 dark:focus:ring-slate-100/30 transition-all shadow-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-2.5 rounded-full shadow-lg shadow-slate-900/20 group-focus-within:scale-110 transition-transform duration-300">
                  <Search size={16} />
                </div>
              </div>
            </div>
          </div>
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
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-white transition-all hover:scale-105 active:scale-95"
                >
                  <X size={14} /> Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredTeachers.map((t, index) => {
              return (
                <div
                  key={t._id}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-2 transition-all duration-500 p-3 animate-fade-in opacity-0"
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

                    {/* Subject Badge — enlarged & neutral */}
                    <div className="absolute top-4 left-4 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-extrabold shadow-lg shadow-black/20 flex items-center gap-2 tracking-wide">
                      <BookOpen size={15} />
                      {t.subject}
                    </div>

                    {/* Inward corner mask */}
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-white dark:bg-slate-900 rounded-tl-[36px] pointer-events-none z-10" />

                    {/* Action Button — neutral */}
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

                  {/* Teacher Name Footer — email removed */}
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
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-modal-in"
            >
              {/* Modal Header */}
              <div className="relative bg-slate-900 dark:bg-slate-950 text-white p-7 overflow-hidden border-b border-slate-800">
                {/* Neutral decorative blob */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/10 shrink-0 ring-4 ring-white/5">
                      {selectedTeacher.profilePhoto ? (
                        <img
                          src={getProfileImageUrl(selectedTeacher.profilePhoto) || ""}
                          alt={selectedTeacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-slate-500 m-auto mt-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white mb-1.5 border border-white/10">
                        {selectedTeacher.subject}
                      </span>
                      <h3 className="text-2xl font-extrabold truncate">{selectedTeacher.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                        <span className="text-[11px] text-slate-300 font-medium">Available</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedTeacherId(null)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-600 hover:rotate-90 transition-all duration-300 shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[62vh] custom-scrollbar bg-slate-50/50 dark:bg-slate-900">

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Email
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm truncate block">
                        {selectedTeacher.email || "Not provided"}
                      </span>
                    </div>
                  </div>

                  {selectedTeacher.phone && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Phone size={18} className="text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Phone
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-sm truncate block">
                          {selectedTeacher.phone}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedTeacher.address && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-colors sm:col-span-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Address
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-sm block">
                          {selectedTeacher.address}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Qualifications */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <GraduationCap size={16} className="text-slate-700 dark:text-slate-300" />
                    Qualifications & Credentials
                  </p>
                  {selectedTeacher.qualifications && selectedTeacher.qualifications.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.qualifications.map((q, idx) => (
                        <div
                          key={idx}
                          className="group/q relative bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Award size={16} className="text-slate-700 dark:text-slate-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-900 dark:text-white text-base">
                                {q.degree}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                                <GraduationCap size={12} /> {q.institution}
                              </p>
                              {q.period && (
                                <span className="inline-block text-[10px] text-slate-700 dark:text-slate-300 font-bold mt-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                  {q.period}
                                </span>
                              )}
                              {q.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                  {q.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <GraduationCap size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-1.5" />
                      <p className="text-xs text-slate-400 italic">No qualifications listed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              {(selectedTeacher.website ||
                (selectedTeacher.socialLinks && selectedTeacher.socialLinks.length > 0)) && (
                <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Link2 size={12} /> Connect
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.website && (
                      <a
                        href={selectedTeacher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        <Globe size={15} /> Website
                        <ExternalLink size={12} className="opacity-70" />
                      </a>
                    )}
                    {selectedTeacher.socialLinks?.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        <ExternalLink size={14} /> {s.platform}
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
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
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