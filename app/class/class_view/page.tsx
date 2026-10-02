// src/app/student/classes/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, User, Loader2, ShieldAlert, Monitor, Search, CheckCircle, Send, ImageIcon, ExternalLink } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import RequestPopup from "@/app/components/RequestPopup";

export default function StudentClassViewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groupedClasses, setGroupedClasses] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Adding a state to control the popup
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

  // Fetch all available classes and student requests (ලොග් වී ඇති විට)
  const fetchData = async (authToken: string) => {
    try {
      const [classRes, reqRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes/all", { headers: { Authorization: `Bearer ${authToken}` } }),
        axios.get("http://localhost:5000/api/classes/student-requests", { headers: { Authorization: `Bearer ${authToken}` } })
      ]);
      
      setRequests(reqRes.data);

      const teacherMap: { [key: string]: any } = {};
      classRes.data.forEach((cls: any) => {
        if (!cls.teacherId) return;
        const teacherId = cls.teacherId._id;
        if (!teacherMap[teacherId]) {
          teacherMap[teacherId] = { teacher: cls.teacherId, classes: [] };
        }
        teacherMap[teacherId].classes.push(cls);
      });

      setGroupedClasses(Object.values(teacherMap));
    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ලොග් වී නොමැති විට පන්ති ලැයිස්තුව පමණක් ලබා ගැනීමට
  const fetchPublicClasses = async () => {
    try {
      const classRes = await axios.get("http://localhost:5000/api/classes/all");

      const teacherMap: { [key: string]: any } = {};
      classRes.data.forEach((cls: any) => {
        if (!cls.teacherId) return;
        const teacherId = cls.teacherId._id;
        if (!teacherMap[teacherId]) {
          teacherMap[teacherId] = { teacher: cls.teacherId, classes: [] };
        }
        teacherMap[teacherId].classes.push(cls);
      });

      setGroupedClasses(Object.values(teacherMap));
    } catch (err: any) {
      console.error("Error fetching public classes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending request to join a class (ලොග් වී නැත්නම් දැනුම් දීම)
  const handleRequestClass = async (classId: string, teacherId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ 
        type: "error", 
        text: "Please register and log in to the system first before requesting a class!" 
      });
      setIsPopupOpen(true);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/classes/request", { classId, teacherId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: res.data.message });
      setIsPopupOpen(true);
      fetchData(token);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to send the request." });
      setIsPopupOpen(true);
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Available Classes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Request to join classes and start your learning journey.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="space-y-8">
            {groupedClasses.map((item) => (
              <div key={item.teacher._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] border border-white/40 dark:border-slate-800/80 p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row gap-8 items-start transition-all hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]">
                
                {/* Left Side: Teacher Info Box */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 text-center lg:sticky lg:top-28 space-y-4 border border-slate-200/50 dark:border-slate-700/40">
                  <div className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 dark:from-teal-500/20 dark:to-emerald-500/20 text-teal-700 dark:text-teal-300 rounded-2xl border border-teal-500/30 shadow-sm flex items-center justify-center gap-2">
                    <BookOpen size={20} className="flex-shrink-0" />
                    <span className="text-base sm:text-lg font-black tracking-wide uppercase truncate">
                      {item.teacher?.subject || "Subject"}
                    </span>
                  </div>

                  <div className="w-full h-48 rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 shadow-sm mt-1 relative group">
                    {item.teacher?.profilePhoto ? (
                      <img src={getProfileImageUrl(item.teacher.profilePhoto) || ""} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  
                  {/* Teacher Name linked to Teacher Profile */}
                  <div className="w-full space-y-2">
                    <h3 
                      onClick={() => router.push(`/teacher`)} 
                      className="font-extrabold text-xl text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 group"
                      title="View Teacher Profile"
                    >
                      <span className="border-b border-transparent group-hover:border-blue-600 dark:group-hover:border-blue-400">{item.teacher?.name}</span>
                      <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400" />
                    </h3>
                  </div>
                </div>

                {/* Right Side: Scheduled Classes Grid */}
                <div className="flex-1 w-full">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Scheduled Classes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.classes.map((cls: any) => {
                      const req = requests.find((r) => r.classId === cls._id);
                      const status = req ? req.status : null;

                      return (
                        <div 
                          key={cls._id} 
                          className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-2xl border border-white/80 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500/40"
                        >
                          
                          {cls.coverImage && (
                            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                              <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover object-center" />
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold">{cls.grade}</span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-extrabold">{cls.medium}</span>
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-extrabold">{cls.mode}</span>
                          </div>

                          <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <p className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> Day: {cls.day}</p>
                            <p className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> Time: {cls.startTime} - {cls.endTime}</p>
                          </div>

                          {cls.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                              {cls.description}
                            </p>
                          )}

                          <div className="pt-2">
                            {!status && (
                              <button onClick={() => handleRequestClass(cls._id, item.teacher._id)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all">
                                <Send size={14} /> Request Class
                              </button>
                            )}
                            {status === 'Pending' && (
                              <button disabled className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                <Loader2 size={15} className="animate-spin" />
                                Request Pending...
                              </button>
                            )}
                            {status === 'Approved' && (
                              <button onClick={() => router.push(`/class/class_join?classId=${cls._id}`)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all">
                                <CheckCircle size={14} /> Join Class
                              </button>
                            )}
                            {status === 'Blocked' && (
                              <button disabled className="w-full py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold cursor-not-allowed">
                                Access Blocked by Admin
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* The pop-up message component has been rendered here. */}
      <RequestPopup 
        isOpen={isPopupOpen}
        type={message.type as "success" | "error"}
        message={message.text}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}