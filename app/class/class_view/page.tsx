// src/app/student/classes/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, User, Loader2, ShieldAlert, Monitor, Search, CheckCircle, Send, ImageIcon } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import RequestPopup from "@/app/components/RequestPopup"; //

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

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchData(token);
  }, [router]);

  // Fetch all available classes and student requests
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

  // Handle sending request to join a class
  const handleRequestClass = async (classId: string, teacherId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post("http://localhost:5000/api/classes/request", { classId, teacherId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: res.data.message });
      setIsPopupOpen(true); // Showing the popupම
      fetchData(token);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to send the request." });
      setIsPopupOpen(true); // Showing the popup
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
          <div className="space-y-6">
            {groupedClasses.map((item) => (
              <div key={item.teacher._id} className="bg-white dark:bg-slate-900 rounded-[32px] border p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Side: Teacher Info Box */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 text-center lg:sticky lg:top-28 space-y-4">
                  <div className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 dark:from-teal-500/20 dark:to-emerald-500/20 text-teal-700 dark:text-teal-300 rounded-2xl border border-teal-500/30 shadow-sm flex items-center justify-center gap-2">
                    <BookOpen size={20} className="flex-shrink-0" />
                    <span className="text-base sm:text-lg font-black tracking-wide uppercase truncate">
                      {item.teacher?.subject || "Subject"}
                    </span>
                  </div>

                  <div className="w-full h-48 rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 shadow-sm mt-1">
                    {item.teacher?.profilePhoto ? (
                      <img src={getProfileImageUrl(item.teacher.profilePhoto) || ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{item.teacher?.name}</h3>
                </div>

                {/* Right Side: Scheduled Classes Grid */}
                <div className="flex-1 w-full">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Scheduled Classes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.classes.map((cls: any) => {
                      const req = requests.find((r) => r.classId === cls._id);
                      const status = req ? req.status : null;

                      return (
                        <div key={cls._id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border flex flex-col justify-between gap-3">
                          
                          {cls.coverImage && (
                            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                              <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-contain object-center" />
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-extrabold">{cls.grade}</span>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-extrabold">{cls.medium}</span>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-xl text-xs font-extrabold">{cls.mode}</span>
                          </div>

                          <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <p>📅 Day: {cls.day}</p>
                            <p>⏰ Time: {cls.startTime} - {cls.endTime}</p>
                          </div>

                          {cls.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              {cls.description}
                            </p>
                          )}

                          <div className="pt-2">
                            {!status && (
                              <button onClick={() => handleRequestClass(cls._id, item.teacher._id)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
                                <Send size={14} /> Request Class
                              </button>
                            )}
                            {status === 'Pending' && (
                              <button disabled className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold">
                                Request Pending...
                              </button>
                            )}
                            {status === 'Approved' && (
                              <button onClick={() => router.push(`/class/class_join?classId=${cls._id}`)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                                <CheckCircle size={14} /> Join Class
                              </button>
                            )}
                            {status === 'Blocked' && (
                              <button disabled className="w-full py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold">
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