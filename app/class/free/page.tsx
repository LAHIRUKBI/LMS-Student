// src/app/class/free/page.tsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  User, 
  PlayCircle, 
  Film,
  SlidersHorizontal,
  X,
  ChevronDown,
  GraduationCap
} from "lucide-react"; 
import Navbar from "@/app/components/Navbar";
import AIChatWidget from "@/app/components/AIChatWidget";

// 1. Cover Image Helper Function
const getCoverImageUrl = (coverImage: any) => {
  if (!coverImage) return null;
  const rawUrl = typeof coverImage === "object" && coverImage !== null 
    ? coverImage.url 
    : coverImage;

  if (!rawUrl || typeof rawUrl !== "string") return null;
  return rawUrl.startsWith("http") ? rawUrl : `${process.env.NEXT_PUBLIC_API_URL}${rawUrl}`;
};

// 2. Helper function for YouTube Video ID
const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

// Helper: Extract Year from Title (e.g. "2024 - 1st Term Paper" -> "2024")
const extractYearFromTitle = (title: string): string | null => {
  if (!title) return null;
  const match = title.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[0] : null;
};

export default function FreeMaterialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [contentTypeTab, setContentTypeTab] = useState<"all" | "pdf" | "paper" | "video">("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser({ name: "Guest Student" });
    }
    fetchFreeMaterials();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch approved free materials
  const fetchFreeMaterials = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/materials/free/all`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching free materials:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. PDF Preview Function
  const handleViewPdf = (fileUrl: string) => {
    if (!fileUrl) {
      alert("The PDF link cannot be found!");
      return;
    }
    const cleanUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${process.env.NEXT_PUBLIC_API_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };

  // 4. PDF Download Function
  const handleDownloadPdf = async (fileUrl: string, title: string) => {
    if (!fileUrl) return;
    try {
      const cleanUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${process.env.NEXT_PUBLIC_API_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

      if (cleanUrl.includes('cloudinary.com')) {
        const downloadUrl = cleanUrl.replace('/upload/', '/upload/fl_attachment/');
        window.location.href = downloadUrl;
        return;
      }

      const response = await fetch(cleanUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'material'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(fileUrl, '_blank');
    }
  };

  // Subjects List
  const subjects = useMemo(() => {
    const subs = materials.map((m) => m.subject).filter(Boolean);
    return ["all", ...Array.from(new Set(subs))];
  }, [materials]);

  // Counts for tabs
  const resourceCounts = useMemo(() => {
    const pdfCount = materials.filter(m => m.type === "pdf" || (!m.type && m.fileUrl?.endsWith(".pdf"))).length;
    const paperCount = materials.filter(m => m.type === "paper").length;
    const videoCount = materials.filter(m => m.type === "video").length;
    return {
      all: materials.length,
      pdf: pdfCount,
      paper: paperCount,
      video: videoCount
    };
  }, [materials]);

  // Detected Years from Titles
  const availableYears = useMemo(() => {
    const years = materials
      .map(m => extractYearFromTitle(m.title))
      .filter((yr): yr is string => Boolean(yr));
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [materials]);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.teacherId?.name && item.teacherId.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;

      let matchesType = true;
      if (contentTypeTab === "pdf") matchesType = item.type === "pdf" || (!item.type && item.fileUrl?.endsWith(".pdf"));
      else if (contentTypeTab === "paper") matchesType = item.type === "paper";
      else if (contentTypeTab === "video") matchesType = item.type === "video";

      let matchesYear = true;
      if (selectedYear !== "all") {
        const itemYear = extractYearFromTitle(item.title);
        matchesYear = itemYear === selectedYear;
      }

      return matchesSearch && matchesSubject && matchesType && matchesYear;
    });
  }, [materials, searchTerm, selectedSubject, contentTypeTab, selectedYear]);

  // Quick jump & highlight item
  const scrollToItem = (id: string) => {
    setIsDropdownOpen(false);
    const element = document.getElementById(`material-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add("ring-4", "ring-emerald-500", "transition-all");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-emerald-500");
      }, 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative font-sans">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-[98%] 2xl:max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6 pt-24 sm:pt-28 pb-20 relative z-10">
        
        {/* Header & Compact Search/Filter Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileStack className="text-emerald-500 w-6 h-6" /> Free Learning Resources
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access tutorials, past papers, notes, and video lessons free of charge.
            </p>
          </div>

          {/* Right Corner Compact Search Bar with Expandable Dropdown */}
          <div className="relative w-full md:w-80" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-sm"
              />
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                title="Filter Options"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>

            {/* Dropdown Menu under Search Bar */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-full sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Filter Materials</span>
                  <button 
                    onClick={() => {
                      setContentTypeTab("all");
                      setSelectedSubject("all");
                      setSelectedYear("all");
                      setSearchTerm("");
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Reset All
                  </button>
                </div>

                {/* 3 Tabs: PDF, Paper, Video with counts */}
                <div className="mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Material Type</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    <button
                      onClick={() => setContentTypeTab(contentTypeTab === "pdf" ? "all" : "pdf")}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg font-bold transition-all ${
                        contentTypeTab === "pdf" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[11px]"><FileText size={12} /> PDF</span>
                      <span className="text-[10px] opacity-80 font-medium">({resourceCounts.pdf})</span>
                    </button>

                    <button
                      onClick={() => setContentTypeTab(contentTypeTab === "paper" ? "all" : "paper")}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg font-bold transition-all ${
                        contentTypeTab === "paper" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[11px]"><GraduationCap size={12} /> Paper</span>
                      <span className="text-[10px] opacity-80 font-medium">({resourceCounts.paper})</span>
                    </button>

                    <button
                      onClick={() => setContentTypeTab(contentTypeTab === "video" ? "all" : "video")}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg font-bold transition-all ${
                        contentTypeTab === "video" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[11px]"><Film size={12} /> Video</span>
                      <span className="text-[10px] opacity-80 font-medium">({resourceCounts.video})</span>
                    </button>
                  </div>
                </div>

                {/* Subject Selector */}
                {subjects.length > 1 && (
                  <div className="mb-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {subjects.map(s => (
                        <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Years Filter (Detected from Titles) */}
                {availableYears.length > 0 && (
                  <div className="mb-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Year (From Title)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      <button
                        onClick={() => setSelectedYear("all")}
                        className={`px-2 py-1 rounded text-[11px] font-bold ${
                          selectedYear === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        All
                      </button>
                      {availableYears.map(yr => (
                        <button
                          key={yr}
                          onClick={() => setSelectedYear(selectedYear === yr ? "all" : yr)}
                          className={`px-2 py-1 rounded text-[11px] font-bold ${
                            selectedYear === yr ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Results Quick Jump List */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Jump ({filteredMaterials.length})</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredMaterials.slice(0, 10).map(item => {
                      const yr = extractYearFromTitle(item.title);
                      return (
                        <div
                          key={item._id}
                          onClick={() => scrollToItem(item._id)}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <span className="truncate pr-2 text-slate-700 dark:text-slate-300 font-medium">
                            {item.title}
                          </span>
                          {yr && (
                            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">
                              {yr}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={36} />
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
          <>
            {/* DESKTOP VIEW: 5-Column Compact Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMaterials.map((item) => {
                const isVideo = item.type === "video";
                const coverSrc = getCoverImageUrl(item.coverImage);
                const ytId = item.youtubeVideoId || getYouTubeVideoId(item.fileUrl);
                const detectedYear = extractYearFromTitle(item.title);

                return (
                  <div 
                    id={`material-${item._id}`}
                    key={item._id} 
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group text-xs"
                  >
                    <div>
                      {/* Media Preview Header */}
                      {isVideo ? (
                        <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
                          {ytId ? (
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
                              title={item.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="w-full h-full relative">
                              <video 
                                src={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}#t=0.1`} 
                                className="w-full h-full object-cover opacity-80"
                                preload="metadata"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <a 
                                  href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-emerald-600 transition-all shadow"
                                >
                                  <PlayCircle size={18} />
                                </a>
                              </div>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Video
                          </span>
                        </div>
                      ) : (
                        <div className="relative h-28 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                          {coverSrc ? (
                            <img 
                              src={coverSrc} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-emerald-500">
                              <FileText size={24} strokeWidth={1.5} />
                              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider text-slate-400">PDF Document</span>
                            </div>
                          )}
                          
                          <span className={`absolute top-2 left-2 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            item.type === 'paper' ? 'bg-amber-600/90' : 'bg-emerald-600/90'
                          }`}>
                            {item.type === 'paper' ? 'Paper' : 'Note'}
                          </span>

                          {detectedYear && (
                            <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              {detectedYear}
                            </span>
                          )}

                          {item.grade && (
                            <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              {item.grade}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          <BookOpen size={11} className="shrink-0" />
                          <span className="truncate">{item.subject}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors leading-tight" title={item.title}>
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions & Teacher Footer */}
                    <div className="px-3 pb-3">
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 mb-2.5">
                        <span className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300">
                          <User size={10} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{item.teacherId?.name || "Teacher"}</span>
                        </span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isVideo ? (
                          <a 
                            href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full py-1.5 px-2 rounded-lg font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
                          >
                            <PlayCircle size={12} /> Watch
                          </a>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleViewPdf(item.fileUrl)}
                              className="flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                            >
                              <Eye size={12} /> View
                            </button>
                            <button 
                              onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                              className="flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
                            >
                              <Download size={12} /> Get
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MOBILE VIEW: Compact & Clean List View */}
            <div className="sm:hidden space-y-2.5">
              {filteredMaterials.map((item) => {
                const isVideo = item.type === "video";
                const coverSrc = getCoverImageUrl(item.coverImage);
                const detectedYear = extractYearFromTitle(item.title);

                return (
                  <div 
                    id={`material-${item._id}`}
                    key={item._id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-3">
                      {/* Compact Thumbnail Icon or Image */}
                      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative border border-slate-200 dark:border-slate-700">
                        {coverSrc ? (
                          <img src={coverSrc} alt={item.title} className="w-full h-full object-cover" />
                        ) : isVideo ? (
                          <Film className="text-indigo-500 w-6 h-6" />
                        ) : (
                          <FileText className="text-emerald-500 w-6 h-6" />
                        )}
                        {detectedYear && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-white text-center py-0.5">
                            {detectedYear}
                          </span>
                        )}
                      </div>

                      {/* Info & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {item.subject}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.type || "PDF"}
                          </span>
                          {item.grade && (
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              • {item.grade}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-xs mt-1 leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300">
                            <User size={10} className="text-emerald-500 shrink-0" />
                            <span className="truncate">{item.teacherId?.name || "Teacher"}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {isVideo ? (
                        <a 
                          href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <PlayCircle size={14} /> Watch Lesson
                        </a>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleViewPdf(item.fileUrl)}
                            className="flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button 
                            onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                            className="flex-1 py-1.5 px-3 rounded-lg font-bold text-xs bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Download size={13} /> Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </main>
      <AIChatWidget />
    </div>
  );
}