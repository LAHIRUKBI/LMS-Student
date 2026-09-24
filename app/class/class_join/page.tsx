"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, User, Loader2, Video, FileText, ArrowLeft, Download, Eye, PlayCircle, CheckCircle, Award } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function ClassJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const [user, setUser] = useState<any>(null);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, videos, pdfs, quizzes

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));

    if (classId) {
      fetchClassRoomData(token, classId);
    } else {
      setError("පන්ති විස්තර සොයාගත නොහැක.");
      setLoading(false);
    }
  }, [classId, router]);

  const fetchClassRoomData = async (token: string, id: string) => {
    try {
      // 1. සියලු පන්ති වලින් අදාළ පන්තිය සෙවීම
      const classRes = await axios.get(`http://localhost:5000/api/classes/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundClass = classRes.data.find((c: any) => c._id === id);
      
      if (!foundClass) {
        setError("අදාළ පන්තිය පද්ධතිය තුළ හමු නොවීය.");
        setLoading(false);
        return;
      }
      setClassDetails(foundClass);

      // 2. මෙම පන්තියට Publish කර ඇති Materials ලබා ගැනීම
      try {
        const matRes = await axios.get(`http://localhost:5000/api/materials/class/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterials(matRes.data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      }

      // 3. මෙම පන්තියට Publish කර ඇති Quizzes ලබා ගැනීම (Backend එකේ route එක ඇති නම්)
      try {
        const quizRes = await axios.get(`http://localhost:5000/api/quiz/class/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizzes(quizRes.data);
      } catch (err) {
        // Quiz route එක නැතිනම් හිස්ව තැබීම
        setQuizzes([]);
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

  // Filter materials based on active tab
  const filteredVideos = materials.filter(m => m.type === 'video');
  const filteredPdfs = materials.filter(m => m.type === 'pdf' || m.type === 'paper');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 relative font-sans">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-600/10 blur-[120px] rounded-full"></div>

      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        
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

            {/* Navigation Tabs for Published Content */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === "all" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400"}`}
              >
                All Resources ({materials.length + quizzes.length})
              </button>
              <button 
                onClick={() => setActiveTab("videos")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === "videos" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400"}`}
              >
                Video Lessons ({filteredVideos.length})
              </button>
              <button 
                onClick={() => setActiveTab("pdfs")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === "pdfs" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400"}`}
              >
                PDFs & Papers ({filteredPdfs.length})
              </button>
              <button 
                onClick={() => setActiveTab("quizzes")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === "quizzes" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400"}`}
              >
                Quizzes ({quizzes.length})
              </button>
            </div>

            {/* Published Content Display Sections */}
            <div className="space-y-10">
              
              {/* 1. Video Lessons Section */}
              {(activeTab === "all" || activeTab === "videos") && (
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Video size={20} className="text-blue-500" /> Published Video Lessons
                  </h2>

                  {filteredVideos.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border text-center text-slate-400 text-xs italic">
                      No video lessons published for this class yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredVideos.map((video) => (
                        <div key={video._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                          <div className="relative aspect-video bg-black">
                            <video src={`http://localhost:5000${video.fileUrl}`} controls className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{video.description || "No description provided."}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              <a href={`http://localhost:5000${video.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                <PlayCircle size={14} /> Watch Full
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. PDFs & Papers Section */}
              {(activeTab === "all" || activeTab === "pdfs") && (
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText size={20} className="text-teal-500" /> Study Materials, PDFs & Past Papers
                  </h2>

                  {filteredPdfs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border text-center text-slate-400 text-xs italic">
                      No PDFs or papers published for this class yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPdfs.map((pdf) => (
                        <div key={pdf._id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                              <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600 mb-1 inline-block">{pdf.type}</span>
                              <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{pdf.title}</h3>
                              <p className="text-xs text-slate-400 truncate">{pdf.subject} • {pdf.grade}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a href={`http://localhost:5000${pdf.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-700 dark:text-slate-300 transition-colors" title="View Document">
                              <Eye size={16} />
                            </a>
                            <a href={`http://localhost:5000${pdf.fileUrl}`} download className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-sm" title="Download Document">
                              <Download size={16} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Quizzes Section */}
              {(activeTab === "all" || activeTab === "quizzes") && (
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Award size={20} className="text-orange-500" /> Interactive Quizzes
                  </h2>

                  {quizzes.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border text-center text-slate-400 text-xs italic">
                      No quizzes published for this class yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizzes.map((quiz) => (
                        <div key={quiz._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-3 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">{quiz.duration} Minutes</span>
                              <span className="text-xs font-bold text-slate-400">{quiz.questions?.length || 0} Questions</span>
                            </div>
                            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-1">{quiz.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{quiz.description || "Test your knowledge with this quiz."}</p>
                          </div>

                          <button 
                            onClick={() => router.push(`/quiz/${quiz._id}`)}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} /> Start Quiz Now
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}