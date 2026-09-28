"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { Search, Loader2, User, Mail, GraduationCap, Globe, ExternalLink, ChevronRight, Sparkles, BookOpen, X, ShieldCheck } from "lucide-react";
import Navbar from "@/app/components/Navbar";

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

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchTeachers(token);
  }, [router]);

  const fetchTeachers = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Find currently selected teacher for modal view
  const selectedTeacher = teachers.find((t) => t._id === expandedTeacherId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-blue-500 selection:text-white relative font-sans overflow-hidden transition-colors duration-500">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-600/10 blur-[120px] rounded-full"></div>

      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-[90%] xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-32 pb-24 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-slate-200 dark:border-slate-800/80">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Meet Your <span className="text-blue-600 dark:text-blue-400">Teachers</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl">
              Discover the experienced professionals guiding your learning journey. Click the arrow button to view professional credentials.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search by name or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-6 pr-12 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-full shadow-md">
              <Search size={16} />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading educators...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-24 text-center px-4 shadow-sm">
            <User size={56} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No teachers found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">We couldn't find any teacher matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredTeachers.map((t) => {
              return (
                <div key={t._id} className="flex flex-col group">
                  
                  {/* Subject Name Displayed Above Photo (Only Subject Name, Larger) */}
                  <div className="mb-3 text-center bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 py-3 px-4 rounded-2xl shadow-sm">
                    <span className="text-lg font-black text-teal-700 dark:text-teal-300 truncate block">{t.subject}</span>
                  </div>

                  {/* Teacher Photo Card */}
                  <div className="relative w-full h-[360px] bg-slate-100 dark:bg-slate-900 rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg flex items-center justify-center">
                    {t.profilePhoto ? (
                      <img 
                        src={getProfileImageUrl(t.profilePhoto) || ""} 
                        alt={t.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={80} className="text-slate-300 dark:text-slate-600" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                    {/* View Details Button */}
                    <button 
                      onClick={() => toggleExpand(t._id)}
                      className="absolute left-4 bottom-4 w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 z-20"
                      title="View Details"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Teacher Name Displayed Below Photo */}
                  <div className="mt-4 text-center">
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white truncate">{t.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Educator</p>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* LARGER & CLEARER PROFESSIONAL MODAL POPUP FOR TEACHER DETAILS */}
        {selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-7 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
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
                  <div>
                    <span className="text-xs font-bold tracking-wider text-blue-400 block mb-0.5">{selectedTeacher.subject}</span>
                    <h3 className="text-2xl font-extrabold">{selectedTeacher.name}</h3>
                  </div>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setExpandedTeacherId(null)}
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body (Larger text & spacing) */}
              <div className="p-8 space-y-6 overflow-y-auto max-h-[62vh] custom-scrollbar bg-slate-50/50 dark:bg-slate-900">
                
                {/* Email Section */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
                  <Mail size={20} className="text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold text-base">{selectedTeacher.email || "No Email Provided"}</span>
                  </div>
                </div>

                {/* Qualifications Section */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-600" /> Qualifications & Credentials
                  </p>
                  {selectedTeacher.qualifications && selectedTeacher.qualifications.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.qualifications.map((q, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
                          <p className="font-extrabold text-slate-900 dark:text-white text-base">{q.degree}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{q.institution}</p>
                          {q.period && <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Period: {q.period}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">No qualifications listed.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2.5">
                {selectedTeacher.website && (
                  <a href={selectedTeacher.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors">
                    <Globe size={15} /> Website
                  </a>
                )}
                {selectedTeacher.socialLinks?.map((s, idx) => (
                  <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <ExternalLink size={15} /> {s.platform}
                  </a>
                ))}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}