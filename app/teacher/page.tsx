"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { Search, Loader2, User, Mail, Phone, BookOpen, GraduationCap, MapPin, Globe, ExternalLink, ShieldCheck } from "lucide-react";
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
      console.log("Fetched teachers:", res.data);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 relative font-sans overflow-hidden">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-600/10 blur-[120px] rounded-full"></div>

      <Navbar user={user} onLogout={handleLogout} />

      {/* පිටුවේ දෙපස හිස් බව නැති කර පුළුල්ව පෙන්වීම සඳහා max-w පුළුල් කර ඇත */}
      <main className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-16 relative z-10">
        
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
              Discover the experienced professionals guiding your learning journey. Find their subjects, qualifications, and contact details.
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
          <div className="space-y-8">
            {filteredTeachers.map((t) => (
              <div 
                key={t._id} 
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 flex flex-col lg:flex-row gap-8 items-stretch"
              >
                
                {/* වම් පස: ගුරුවරයාගේ විශාල රූපය කොටුව පුරාම */}
                <div className="lg:w-80 xl:w-96 shrink-0 flex flex-col items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl p-5 border border-blue-100/50 dark:border-slate-700/50">
                  <div className="w-full h-64 sm:h-72 lg:h-full min-h-[280px] rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center relative">
                    {t.profilePhoto ? (
                      <img 
                        src={getProfileImageUrl(t.profilePhoto) || ""} 
                        alt={t.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={64} className="text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  
                  <div className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20">
                    <ShieldCheck size={14} /> Verified Teacher
                  </div>
                </div>

                {/* දකුණු පස: අභ්‍යන්තර කාඩ්පත (Inner Card) - සියලුම විස්තර සහිතයි */}
                <div className="flex-1 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                  
                  <div>
                    {/* නම සහ විෂය */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.name}</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">ID: {t.teacherId}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 px-4 py-2 rounded-2xl font-extrabold text-sm shadow-sm self-start sm:self-auto">
                        <BookOpen size={18} /> {t.subject}
                      </div>
                    </div>

                    {/* සම්බන්ධතා තොරතුරු (Contact Info Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Mail size={18} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-bold text-slate-400 uppercase">Email Address</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{t.email || "Not Provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <Phone size={18} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.phone || "Not Provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* අධ්‍යාපන සුදුසුකම් (Qualifications Section) */}
                    <div className="mb-6">
                      <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GraduationCap size={16} className="text-blue-600" /> Educational Qualifications
                      </h4>
                      {t.qualifications && t.qualifications.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {t.qualifications.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{q.degree}</p>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{q.institution} ({q.period})</p>
                              {q.description && <p className="text-xs text-slate-400 mt-2 italic">{q.description}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">No qualifications added yet.</p>
                      )}
                    </div>
                  </div>

                  {/* සමාජ මාධ්‍ය සහ වෙබ් අඩවි සබැඳි (Social Links & Website) */}
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-3">
                    {t.website && (
                      <a href={t.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                        <Globe size={14} /> Visit Website
                      </a>
                    )}
                    {t.socialLinks?.map((s, idx) => (
                      <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ExternalLink size={14} /> {s.platform}
                      </a>
                    ))}
                    {!t.website && (!t.socialLinks || t.socialLinks.length === 0) && (
                      <span className="text-xs text-slate-400 italic">No external social profiles linked.</span>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}