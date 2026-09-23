"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { Search, Loader2, User, Mail, GraduationCap, Globe, ExternalLink, ChevronRight } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 relative font-sans overflow-hidden">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-600/10 blur-[120px] rounded-full"></div>

      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-block bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-sm mb-3">
              Our Educators
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Meet Your <span className="text-blue-600 dark:text-blue-400">Teachers</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl text-sm sm:text-base">
              Discover the experienced professionals guiding your learning journey. Click the arrow button to slide out details horizontally.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <input 
              type="text" 
              placeholder="Search by name or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-6 pr-12 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full shadow-md group-hover:scale-105 transition-transform">
              <Search size={16} />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading amazing educators...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-full mb-5">
              <User size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No teachers found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">We couldn't find any teacher matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeachers.map((t) => {
              const isExpanded = expandedTeacherId === t._id;

              return (
                <div 
                  key={t._id} 
                  className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-5 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-300 flex flex-col relative overflow-hidden"
                >
                  
                  {/* විෂය නාමය ඉහළින්ම පැහැදිලිව පෙන්වීම */}
                  <div className="mb-3 text-center bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 py-2 px-3 rounded-2xl">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400 block">Subject</span>
                    <span className="text-base font-extrabold text-slate-800 dark:text-white truncate block">{t.subject}</span>
                  </div>

                  {/* ගුරුවරයාගේ ෆොටෝ එක සහ වම් පස රවුමක් ඇතුළත ">" අයිකනය */}
                  <div className="relative w-full h-60 sm:h-64 rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800 flex items-center justify-center group">
                    {t.profilePhoto ? (
                      <img 
                        src={getProfileImageUrl(t.profilePhoto) || ""} 
                        alt={t.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={64} className="text-slate-300 dark:text-slate-600" />
                    )}

                    {/* වම් පස පහළ කෙළවරේ රවුමක් ඇතුළත ">" අයිකනය */}
                    <button 
                      onClick={() => toggleExpand(t._id)}
                      className="absolute left-3 bottom-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 z-20"
                      title={isExpanded ? "Hide Details" : "View Details"}
                    >
                      <ChevronRight size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* ගුරුවරයාගේ නම */}
                  <div className="mt-4 text-center">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate">{t.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Educator</p>
                  </div>

                  {/* හරහට (වමේ සිට දකුණට - Horizontal Slide) එළියට විහිදී එන විස්තර කොටස (අර්ධ විනිවිද පෙනෙන Glassmorphism පසුබිමක් සහිතව රූපය යටපත් නොවන සේ සකසා ඇත) */}
                  <div 
                    className={`absolute inset-y-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 p-5 flex flex-col justify-between transition-transform duration-500 ease-in-out shadow-2xl border-r border-slate-200 dark:border-slate-800 ${
                      isExpanded ? 'translate-x-0' : '-translate-x-full'
                    }`}
                  >
                    <div>
                      {/* ඉහළින් Close / Back කිරීමට අයිකනයක් */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">{t.name}</h4>
                        <button 
                          onClick={() => toggleExpand(t._id)}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* විස්තර ලැයිස්තුව */}
                      <div className="space-y-3 text-left overflow-y-auto max-h-[280px] pr-1">
                        
                        {/* Email */}
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                          <Mail size={14} className="text-blue-500 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{t.email || "No Email"}</span>
                        </div>

                        {/* Qualifications */}
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <GraduationCap size={12} className="text-blue-600" /> Qualifications
                          </p>
                          {t.qualifications && t.qualifications.length > 0 ? (
                            <div className="space-y-1.5">
                              {t.qualifications.map((q, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{q.degree}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{q.institution}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No qualifications added.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Social Links & Website */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                      {t.website && (
                        <a href={t.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] shadow-sm hover:bg-blue-700 transition-colors">
                          <Globe size={12} /> Website
                        </a>
                      )}
                      {t.socialLinks?.map((s, idx) => (
                        <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <ExternalLink size={12} /> {s.platform}
                        </a>
                      ))}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}