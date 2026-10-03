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
  Film,
  Sparkles,
  GraduationCap
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative font-sans">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-[95%] xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
        {/* Controls Section: Search & Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Content Type Tabs (All / PDFs / Videos) */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setContentTypeTab("all")}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  contentTypeTab === "all"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setContentTypeTab("pdf")}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  contentTypeTab === "pdf"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText size={14} /> PDFs & Papers
              </button>
              <button
                onClick={() => setContentTypeTab("video")}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  contentTypeTab === "video"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Film size={14} /> Video Lessons
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search title, subject, teacher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Subject Filter Pills */}
          {subjects.length > 1 && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Subjects:</span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                    selectedSubject === sub
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {sub === "all" ? "All Subjects" : sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Loading free learning materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-4 rounded-2xl mb-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
              <FileStack size={32} />
            </div>
            <h3 className="text-base font-bold mb-1 text-slate-800 dark:text-slate-200">No Materials Found</h3>
            <p className="text-xs text-slate-400 max-w-xs">We couldn't find anything matching your search criteria. Try resetting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => {
              const isVideo = item.type === "video";

              return (
                <div 
                  key={item._id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Media Preview Header */}
                    {isVideo ? (
                      <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
                        <video 
                          src={`http://localhost:5000${item.fileUrl}#t=0.1`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white group-hover:bg-emerald-600 group-hover:scale-110 transition-all shadow-lg"
                          >
                            <PlayCircle size={24} className="ml-0.5" />
                          </a>
                        </div>
                        <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider uppercase">
                          Video Lesson
                        </span>
                      </div>
                    ) : (
                      <div className="relative h-44 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                        {item.coverImage ? (
                          <img 
                            src={item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:5000${item.coverImage}`} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-emerald-500">
                            <FileText size={36} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold mt-1.5 uppercase tracking-wider text-slate-400">PDF Document</span>
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider uppercase">
                          {item.type || "PDF Note"}
                        </span>
                        {item.grade && (
                          <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-md font-bold">
                            {item.grade}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <BookOpen size={13} />
                        <span>{item.subject}</span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Teacher info & Actions */}
                  <div className="px-5 pb-5 pt-0">
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 truncate mr-2">
                        <User size={13} className="text-emerald-500 shrink-0" /> 
                        <span className="truncate">{item.teacherId?.name || "Expert Teacher"}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isVideo ? (
                        <a 
                          href={`http://localhost:5000${item.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <PlayCircle size={15} /> Watch Now
                        </a>
                      ) : (
                        <>
                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                          >
                            <Eye size={14} /> View
                          </a>

                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
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