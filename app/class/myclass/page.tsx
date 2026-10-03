// src/app/class/myclass/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, Loader2, CheckCircle, User } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import AIChatWidget from "@/app/components/AIChatWidget";

export default function StudentMyClassesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [approvedClasses, setApprovedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchApprovedClasses(token);
    } else {
      router.push("/login");
    }
  }, [router]);

  // අනුමත කරන ලද (Approved) පන්ති පමණක් ලබා ගැනීම
  const fetchApprovedClasses = async (authToken: string) => {
    try {
      const [classRes, reqRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes/all", { headers: { Authorization: `Bearer ${authToken}` } }),
        axios.get("http://localhost:5000/api/classes/student-requests", { headers: { Authorization: `Bearer ${authToken}` } })
      ]);

      const requests = reqRes.data;
      const approvedClassIds = requests
        .filter((r: any) => r.status === 'Approved')
        .map((r: any) => r.classId);

      const filteredClasses = classRes.data.filter((cls: any) => approvedClassIds.includes(cls._id));

      setApprovedClasses(filteredClasses);
    } catch (err: any) {
      console.error("Error fetching approved classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000/profile_photos/${photoUrl}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 relative font-sans">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-[95%] xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Classes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Access your approved classes and join your learning sessions.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : approvedClasses.length === 0 ? (
          <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-8 shadow-xl">
            <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Approved Classes Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Request to join classes from the available classes page and wait for admin approval.</p>
            <button 
              onClick={() => router.push("/class/class_view")}
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Browse Available Classes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedClasses.map((cls: any) => {
              const teacherPhoto = cls.teacherId?.profilePhoto ? getProfileImageUrl(cls.teacherId.profilePhoto) : null;

              return (
                <div 
                  key={cls._id} 
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/40 dark:border-slate-800/80 shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                >
                  {/* Teacher & Subject Info Header (Cute & Compact Style) */}
                  <div className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/40">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-teal-500/30 bg-white dark:bg-slate-900 shadow-sm shrink-0 flex items-center justify-center">
                        {teacherPhoto ? (
                          <img src={teacherPhoto} alt={cls.teacherId?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <User size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-full text-[10px] font-black uppercase tracking-wider mb-0.5">
                          {cls.teacherId?.subject || "Subject"}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-[140px] sm:max-w-[180px]">
                          {cls.teacherId?.name || "Teacher"}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Class Cover Image (Cute & Small Size) */}
                  {cls.coverImage && (
                    <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-700/70 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[11px] font-extrabold">{cls.grade}</span>
                    <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-extrabold">{cls.medium}</span>
                    <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-[11px] font-extrabold">{cls.mode}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-700/30">
                    <p className="flex items-center gap-2"><Calendar size={13} className="text-slate-400" /> Day: {cls.day}</p>
                    <p className="flex items-center gap-2"><Clock size={13} className="text-slate-400" /> Time: {cls.startTime} - {cls.endTime}</p>
                  </div>

                  {/* Description */}
                  {cls.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50/70 dark:bg-slate-800/40 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/40 line-clamp-2">
                      {cls.description}
                    </p>
                  )}

                  {/* Join Button */}
                  <div className="pt-1">
                    <button 
                      onClick={() => router.push(`/class/class_join?classId=${cls._id}`)} 
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle size={14} /> Join Class
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AIChatWidget />
    </div>
  );
}