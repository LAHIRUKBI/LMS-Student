"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar, Sparkles, BellRing, Bell, Image as ImageIcon, Loader2, X } from "lucide-react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";

export default function NoticeViewPage() {
  const [user, setUser] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal එක පාලනය කිරීම සඳහා අලුතින් එකතු කළ state එක
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <Navbar user={user} onLogout={handleLogout} />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        {/* Header Section (Updated to match Teacher UI style) */}
        <div className="flex items-center justify-between mb-8 p-6 rounded-2xl shadow-sm border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <BellRing size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notice Board</h1>
              </div>
              <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 font-medium">
                Official announcements and notices published specifically for you.
              </p>
            </div>
          </div>
          <div className="hidden sm:block px-4 py-2 rounded-lg font-bold text-sm border bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            Total: {notices.length}
          </div>
        </div>

        {/* Notices List (Grid Layout) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center rounded-3xl border border-dashed bg-white border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 shadow-sm">
            <div className="p-4 rounded-full mb-4 bg-slate-100 text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-700 dark:text-slate-300">No notices available</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              There are no notices published for you at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => {
              const imgUrl = notice.image ? (notice.image.startsWith("http") ? notice.image : `http://localhost:5000${notice.image}`) : null;
              
              return (
                <div 
                  key={notice._id} 
                  className="group flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-500/50"
                >
                  {/* Image Section */}
                  {imgUrl ? (
                    <div className="w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img src={imgUrl} alt={notice.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600">
                      <ImageIcon size={32} className="opacity-50" />
                      <span className="text-xs font-medium uppercase tracking-widest opacity-60">No Image</span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {notice.targetType ? notice.targetType.replace('_', ' ') : 'NOTICE'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Calendar size={14} />
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-slate-900 dark:text-white">
                      {notice.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed flex-1 line-clamp-3 text-slate-600 dark:text-slate-400">
                      {notice.message}
                    </p>

                    {/* Read More Button */}
                    <button 
                      onClick={() => setSelectedNotice(notice)}
                      className="mt-4 w-full py-2 rounded-lg text-sm font-bold transition-colors bg-slate-100 hover:bg-blue-50 text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 dark:text-slate-200 dark:hover:text-white"
                    >
                      Read Full Notice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- Full Notice Modal (Popup) --- */}
        {selectedNotice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
            <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-slate-900 dark:border dark:border-slate-700">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedNotice(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-rose-600 text-white transition-colors z-20 backdrop-blur-md"
                title="Close"
              >
                <X size={20} />
              </button>
              
              {/* Modal Image (Full uncropped view) */}
              {selectedNotice.image && (
                <div className="w-full flex items-center justify-center flex-shrink-0 border-b bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                  <img 
                    src={selectedNotice.image.startsWith("http") ? selectedNotice.image : `http://localhost:5000${selectedNotice.image}`} 
                    alt={selectedNotice.title} 
                    className="w-full h-auto max-h-[60vh] object-contain" 
                  />
                </div>
              )}
              
              {/* Modal Content */}
              <div className="p-6 md:p-8 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {selectedNotice.targetType ? selectedNotice.targetType.replace('_', ' ') : 'NOTICE'}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <Calendar size={16} />
                    {new Date(selectedNotice.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  {selectedNotice.title}
                </h2>
                
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {selectedNotice.message}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}