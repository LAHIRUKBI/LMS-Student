//src/app/class/class_join/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, User, Loader2, Video, FileText, ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function ClassJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const [user, setUser] = useState<any>(null);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));

    if (classId) {
      fetchClassDetails(token, classId);
    } else {
      setError("පන්ති විස්තර සොයාගත නොහැක.");
      setLoading(false);
    }
  }, [classId, router]);

  const fetchClassDetails = async (token: string, id: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/classes/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundClass = res.data.find((c: any) => c._id === id);
      if (foundClass) {
        setClassDetails(foundClass);
      } else {
        setError("අදාළ පන්තිය පද්ධතිය තුළ හමු නොවීය.");
      }
    } catch (err) {
      console.error(err);
      setError("පන්ති තොරතුරු ලබාගැනීමේදී දෝෂයක් මතු විය.");
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
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-600/10 blur-[120px] rounded-full"></div>

      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push("/class/class_view")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Classes
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading class room...</p>
          </div>
        ) : error || !classDetails ? (
          <div className="bg-white dark:bg-slate-900 border rounded-3xl p-12 text-center shadow-sm">
            <p className="text-red-500 font-bold">{error || "Class not found."}</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Class Banner / Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center shadow-md">
                  {classDetails.teacherId?.profilePhoto ? (
                    <img src={getProfileImageUrl(classDetails.teacherId.profilePhoto) || ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-3 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-extrabold">{classDetails.grade}</span>
                    <span className="px-3 py-0.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-extrabold">{classDetails.medium}</span>
                    <span className="px-3 py-0.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-extrabold">{classDetails.mode}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{classDetails.teacherId?.subject} Class</h1>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Educator: <span className="text-slate-800 dark:text-slate-200 font-bold">{classDetails.teacherId?.name}</span></p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border text-xs space-y-1.5 min-w-[220px]">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Calendar size={14} className="text-blue-500" /> Day: <span className="font-medium text-slate-500">{classDetails.day}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Clock size={14} className="text-orange-500" /> Time: <span className="font-medium text-slate-500">{classDetails.startTime} - {classDetails.endTime}</span>
                </div>
              </div>

            </div>

            {/* Student Learning Dashboard / Actions Inside Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Live Session Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] p-8 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-4">
                    Live Stream
                  </div>
                  <h3 className="text-2xl font-extrabold mb-2">Join Live Classroom</h3>
                  <p className="text-blue-100 text-sm mb-6">Connect directly to the ongoing live teaching session with your educator.</p>
                </div>

                <button 
                  onClick={() => router.push(`/class/room/${classDetails._id}`)}
                  className="w-full py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Video size={18} /> Enter Live Room
                </button>
              </div>

              {/* Class Materials & Notes Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-4">
                    Resources
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Class Notes & Papers</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Access study materials, tutorials, and past papers uploaded for this class.</p>
                </div>

                <button 
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <FileText size={18} /> View Materials
                </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}