"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, Sparkles, BellRing } from "lucide-react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";

export default function NoticeViewPage() {
  const [user, setUser] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchStudentNotices();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const tokenParts = token.split('.');
      if (tokenParts.length === 2) {
        const payload = JSON.parse(atob(tokenParts[1]));
        setUser(payload.user || { name: "Student" });
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  };

  const fetchStudentNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get("http://localhost:5000/api/admin/student/notices", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotices(res.data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.delete(`http://localhost:5000/api/admin/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notice:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <Navbar user={user} onLogout={handleLogout} />

      {/* මෙහි max-w-4xl වෙනුවට max-w-6xl ලෙස මාරු කර පිටුව පළල් කර ඇත */}
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10 bg-slate-50 dark:bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <BellRing size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Notice Board</h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles size={12} /> Updates
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Official announcements and notices published specifically for you.
              </p>
            </div>
          </div>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-sm font-medium">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
              <FileText size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">No notices available</h3>
            <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
              There are no notices published for you at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {notices.map((notice) => (
              <div 
                key={notice._id}
                className="group relative overflow-hidden p-6 sm:p-8 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 dark:bg-blue-500"></div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3.5 flex-1 pl-3">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {notice.title}
                      </h2>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 w-fit">
                        <Calendar size={14} className="text-blue-500" />
                        <span>{new Date(notice.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {notice.message}
                    </p>

                    {/* Notice එක සමඟ පින්තූරයක් (Image) ලබා දී ඇත්නම් එය පෙන්වීම */}
                    {notice.image && (
                      <div className="mt-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shadow-inner max-w-3xl">
                        <img 
                          src={notice.image.startsWith("http") ? notice.image : `http://localhost:5000${notice.image}`} 
                          alt="Notice attachment" 
                          className="w-full max-h-[500px] object-contain mx-auto"
                        />
                      </div>
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