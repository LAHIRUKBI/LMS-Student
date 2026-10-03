// src/app/class/free/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  FileStack, 
  BookOpen, 
  Loader2, 
  Download, 
  Eye, 
  Search, 
  FileText,
  Calendar,
  Gift,
  User,
  PlayCircle,
  Film
} from "lucide-react"; 
import Navbar from "@/app/components/Navbar";
import AIChatWidget from "@/app/components/AIChatWidget";

export default function FreeMaterialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [contentTypeTab, setContentTypeTab] = useState("all"); // "all" | "pdf" | "video"

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser({ name: "Guest Student" });
    }
    fetchFreeMaterials();
  }, []);

  // Fetch approved free materials
  const fetchFreeMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/materials/free/all");
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching free materials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Subjects list එක ලබාගැනීම සඳහා
  const subjects = useMemo(() => {
    const subs = materials.map((m) => m.subject).filter(Boolean);
    return ["all", ...Array.from(new Set(subs))];
  }, [materials]);

  // Search, Subject සහ Content Type අනුව Filter කිරීම
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.teacherId?.name && item.teacherId.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;
      
      let matchesType = true;
      if (contentTypeTab === "pdf") matchesType = item.type === "pdf" || item.type === "paper";
      else if (contentTypeTab === "video") matchesType = item.type === "video";

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [materials, searchTerm, selectedSubject, contentTypeTab]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 relative font-sans">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-[95%] xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Gift size={26} strokeWidth={2} />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 inline-block mb-1">
                Public Access
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Free Learning Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore free educational PDFs, revision papers, and video lessons shared by our expert teachers.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by title, subject, or teacher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Selector Tabs (All / PDFs / Videos) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300/40 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setContentTypeTab("all")}
              className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                contentTypeTab === "all"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Resources
            </button>
            <button
              onClick={() => setContentTypeTab("pdf")}
              className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                contentTypeTab === "pdf"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText size={15} /> PDFs & Papers
            </button>
            <button
              onClick={() => setContentTypeTab("video")}
              className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                contentTypeTab === "video"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Film size={15} /> Video Lessons
            </button>
          </div>

          {/* Subject Filter Tabs */}
          {subjects.length > 1 && (
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize transition-all ${
                    selectedSubject === sub
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {sub === "all" ? "All Subjects" : sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center rounded-[32px] border bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
            <div className="p-4 rounded-full mb-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <FileStack size={32} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-700 dark:text-slate-300">No Free Materials Found</h3>
            <p className="text-xs text-slate-400 max-w-sm">Try changing your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredMaterials.map((item) => {
              const isVideo = item.type === "video";

              return (
                <div 
                  key={item._id} 
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-white/40 dark:border-slate-800/80 shadow-xl flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-500/40"
                >
                  <div>
                    {/* Video Thumbnail or PDF Cover Preview */}
                    {isVideo ? (
                      <a 
                        href={`http://localhost:5000${item.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="relative w-full aspect-video rounded-2xl overflow-hidden group/thumb cursor-pointer block mb-4 bg-black border border-slate-200 dark:border-slate-700 shadow-inner"
                      >
                        <video 
                          src={`http://localhost:5000${item.fileUrl}#t=0.1`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 flex items-center justify-center transition-colors">
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover/thumb:bg-emerald-600 transition-all shadow-lg">
                            <PlayCircle size={24} className="text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold tracking-widest uppercase shadow">
                          Video Lesson
                        </div>
                      </a>
                    ) : (
                      <div className="flex gap-4 mb-4">
                        <div className="relative w-20 h-24 sm:w-24 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 border flex items-center justify-center bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          {item.coverImage ? (
                            <img 
                              src={item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-emerald-500">
                              <FileText size={28} />
                              <span className="text-[10px] font-bold mt-1 uppercase">PDF</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.type || "PDF"}
                            </span>
                            {item.grade && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                {item.grade}
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-sm sm:text-base line-clamp-2 mb-1 text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            {item.title}
                          </h3>

                          <p className="text-xs flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                            <BookOpen size={13} className="text-emerald-500" /> {item.subject}
                          </p>
                        </div>
                      </div>
                    )}

                    {isVideo && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {item.type || "Video"}
                          </span>
                          {item.grade && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                              {item.grade}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base line-clamp-2 mb-1 text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                          <BookOpen size={13} className="text-emerald-500" /> {item.subject}
                        </p>
                      </div>
                    )}

                    {/* Description if available */}
                    {item.description && (
                      <p className="text-xs line-clamp-2 mb-3 font-normal text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Teacher & Date Info */}
                    <div className="pt-3 mb-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold truncate mr-2">
                        <User size={13} className="text-emerald-500 shrink-0" /> <span className="truncate">{item.teacherId?.name || "Teacher"}</span>
                      </span>
                      <span className="flex items-center gap-1 opacity-80 shrink-0">
                        <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isVideo ? (
                        <a 
                          href={`http://localhost:5000${item.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <PlayCircle size={15} /> Watch Video Lesson
                        </a>
                      ) : (
                        <>
                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                          >
                            <Eye size={14} /> View
                          </a>

                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <Download size={14} /> Download
                          </a>
                        </>
                      )}
                    </div>
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