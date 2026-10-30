// src/app/class/free/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CheckSquare,
  Square,
  Archive,
  RotateCcw,
  LayoutGrid,
  List,
  Folder as FolderIcon,
  ArrowLeft,
  FolderOpen
} from "lucide-react"; 
import Navbar from "@/app/components/Navbar";
import AIChatWidget from "@/app/components/AIChatWidget";

const getCoverImageUrl = (coverImage: any) => {
  if (!coverImage) return null;
  const rawUrl = typeof coverImage === "object" && coverImage !== null 
    ? coverImage.url 
    : coverImage;

  if (!rawUrl || typeof rawUrl !== "string") return null;
  return rawUrl.startsWith("http") ? rawUrl : `${process.env.NEXT_PUBLIC_API_URL}${rawUrl}`;
};

const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

const extractYearFromTitle = (title: string): string | null => {
  if (!title) return null;
  const match = title.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[0] : null;
};

export default function FreeMaterialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [folderHistory, setFolderHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [contentTypeTab, setContentTypeTab] = useState<"all" | "pdf" | "paper" | "video">("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [zipStatusText, setZipStatusText] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser({ name: "Guest Student" });
    }
    fetchFreeData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, contentTypeTab, selectedYear, itemsPerPage, currentFolder]);

  const fetchFreeData = async () => {
    try {
      const [matRes, folderRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/materials/free/all`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/folders/free/all`)
      ]);
      setMaterials(matRes.data);
      setFolders(folderRes.data);
    } catch (err) {
      console.error("Error fetching free materials:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleBulkZipDownload = async () => {
    const downloadableItems = materials.filter(
      (m) => selectedIds.includes(m._id) && m.type !== "video" && m.fileUrl
    );

    if (downloadableItems.length === 0) {
      alert("Please select at least one downloadable PDF or Paper.");
      return;
    }

    setIsBulkDownloading(true);
    const zip = new JSZip();
    const usedNames = new Set<string>();

    try {
      for (let i = 0; i < downloadableItems.length; i++) {
        const item = downloadableItems[i];
        setZipStatusText(`Packaging (${i + 1}/${downloadableItems.length})...`);

        const cleanUrl = item.fileUrl.startsWith('http')
          ? item.fileUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl.startsWith('/') ? '' : '/'}${item.fileUrl}`;

        const response = await fetch(cleanUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${item.title}`);
        const blob = await response.blob();

        let sanitizedBaseName = (item.title || "material").replace(/[/\\?%*:|"<>]/g, "_").trim();
        let finalFileName = `${sanitizedBaseName}.pdf`;
        let counter = 1;
        while (usedNames.has(finalFileName)) {
          finalFileName = `${sanitizedBaseName}_${counter}.pdf`;
          counter++;
        }
        usedNames.add(finalFileName);

        zip.file(finalFileName, blob);
      }

      setZipStatusText("Compressing archive...");
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `resources_${new Date().toISOString().slice(0, 10)}.zip`);

      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk zip creation failed:", error);
      alert("An error occurred while creating the .zip archive.");
    } finally {
      setIsBulkDownloading(false);
      setZipStatusText("");
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const enterFolder = (f: any) => {
    setFolderHistory([...folderHistory, f]);
    setCurrentFolder(f);
  };

  const navigateUp = () => {
    const newHist = [...folderHistory];
    newHist.pop();
    setFolderHistory(newHist);
    setCurrentFolder(newHist.length > 0 ? newHist[newHist.length - 1] : null);
  };

  const subjects = useMemo(() => {
    const subs = materials.map((m) => m.subject).filter(Boolean);
    return ["all", ...Array.from(new Set(subs))];
  }, [materials]);

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

  const availableYears = useMemo(() => {
    const years = materials
      .map(m => extractYearFromTitle(m.title))
      .filter((yr): yr is string => Boolean(yr));
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [materials]);

  // Current Level Folders (Search match filters included)
  const currentLevelFolders = useMemo(() => {
    return folders.filter((f) => {
      const isParentMatch = !currentFolder ? !f.parentFolderId : f.parentFolderId === currentFolder._id;
      const isSearchMatch = searchTerm === "" || f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isTypeMatch = contentTypeTab === "all" || contentTypeTab === "pdf" || contentTypeTab === "paper";
      return isParentMatch && isSearchMatch && isTypeMatch;
    });
  }, [folders, currentFolder, searchTerm, contentTypeTab]);

  // Filter Materials
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

      const matchesFolder = currentFolder 
        ? item.folderId === currentFolder._id 
        : (!item.folderId || item.type === "video");

      return matchesSearch && matchesSubject && matchesType && matchesYear && matchesFolder;
    });
  }, [materials, searchTerm, selectedSubject, contentTypeTab, selectedYear, currentFolder]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMaterials, currentPage, itemsPerPage]);

  const isAllCurrentPageSelected = useMemo(() => {
    const validCurrentItems = paginatedMaterials.filter(m => m.type !== "video");
    if (validCurrentItems.length === 0) return false;
    return validCurrentItems.every(m => selectedIds.includes(m._id));
  }, [paginatedMaterials, selectedIds]);

  const toggleSelectAllCurrentPage = () => {
    const validCurrentIds = paginatedMaterials
      .filter(m => m.type !== "video")
      .map(m => m._id);

    if (isAllCurrentPageSelected) {
      setSelectedIds(prev => prev.filter(id => !validCurrentIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...validCurrentIds])));
    }
  };

  const hasActiveFilters = searchTerm !== "" || selectedSubject !== "all" || contentTypeTab !== "all" || selectedYear !== "all";

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedSubject("all");
    setContentTypeTab("all");
    setSelectedYear("all");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative font-sans">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-24 lg:pt-32 pb-16">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileStack className="text-emerald-500 w-6 h-6" /> Free Learning Resources
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access tutorials, past papers, notes, and video lessons free of charge.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title, subject, or teacher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation for Free Folders */}
        {(folders.length > 0 || currentFolder) && (
          <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl border text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
            <button 
              onClick={() => { setCurrentFolder(null); setFolderHistory([]); }}
              className={`font-bold transition-colors ${!currentFolder ? "text-emerald-600" : "text-slate-400 hover:text-emerald-500"}`}
            >
              All Free Documents
            </button>
            {folderHistory.map((folder, idx) => (
              <div key={folder._id} className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-400">/</span>
                <button 
                  onClick={() => {
                    const sliced = folderHistory.slice(0, idx + 1);
                    setFolderHistory(sliced);
                    setCurrentFolder(folder);
                  }}
                  className={`font-bold transition-colors ${idx === folderHistory.length - 1 ? "text-emerald-600" : "text-slate-400 hover:text-emerald-500"}`}
                >
                  {folder.name}
                </button>
              </div>
            ))}
            {currentFolder && (
              <button 
                onClick={navigateUp} 
                className="ml-auto flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-500 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setContentTypeTab("all")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                contentTypeTab === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <FileStack size={13} />
              <span>All</span>
              <span className="text-[10px] opacity-80">({resourceCounts.all})</span>
            </button>

            <button
              onClick={() => setContentTypeTab("paper")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                contentTypeTab === "paper"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <GraduationCap size={13} />
              <span>Past Papers</span>
              <span className="text-[10px] opacity-80">({resourceCounts.paper})</span>
            </button>

            <button
              onClick={() => setContentTypeTab("pdf")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                contentTypeTab === "pdf"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <FileText size={13} />
              <span>PDF Notes</span>
              <span className="text-[10px] opacity-80">({resourceCounts.pdf})</span>
            </button>

            <button
              onClick={() => setContentTypeTab("video")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                contentTypeTab === "video"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Film size={13} />
              <span>Videos</span>
              <span className="text-[10px] opacity-80">({resourceCounts.video})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {subjects.length > 1 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === "all" ? "All Subjects" : sub}
                  </option>
                ))}
              </select>
            )}

            {availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Year: {yr}
                  </option>
                ))}
              </select>
            )}

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="p-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                title="Reset Filters"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="List View"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Counter & Per-Page Controls */}
        {!loading && (filteredMaterials.length > 0 || currentLevelFolders.length > 0) && (
          <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={toggleSelectAllCurrentPage}
              className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
            >
              {isAllCurrentPageSelected ? (
                <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Square size={16} />
              )}
              <span>Select All on Page</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}

        {/* Unified Content Section: Folders & Documents Rendered Together */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
        ) : (filteredMaterials.length === 0 && currentLevelFolders.length === 0) ? (
          <div className="py-24 flex flex-col items-center justify-center text-center rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <FileStack size={32} className="text-emerald-500 mb-2" />
            <h3 className="text-base font-bold mb-1 text-slate-800 dark:text-slate-200">No Materials or Folders Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-3">No documents or folders available under this directory.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-2.5">
            {/* Folders in List Mode: Mobile එකේ 2-column grid, Desktop එකේ flex-wrap */}
            {currentLevelFolders.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 pb-2">
                {currentLevelFolders.map((f) => {
                  const itemCount = materials.filter(m => m.folderId === f._id).length;
                  const subFolderCount = folders.filter(sub => sub.parentFolderId === f._id).length;

                  return (
                    <div
                      key={f._id}
                      onClick={() => enterFolder(f)}
                      className="group relative cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto sm:min-w-[190px] sm:max-w-[215px]"
                    >
                      <div className="w-12 sm:w-16 h-2 rounded-t-lg bg-amber-400 dark:bg-amber-500 ml-2.5 sm:ml-3 shadow-sm transition-transform duration-200 group-hover:scale-x-105" />
                      <div className="rounded-2xl rounded-tl-sm border border-amber-300/80 dark:border-amber-900/50 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20 p-2 sm:p-2.5 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-500/20 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                            <FolderOpen size={15} className="drop-shadow-sm sm:w-4 sm:h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={f.name}>
                              {f.name}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                              {itemCount} docs {subFolderCount > 0 ? `• ${subFolderCount} subs` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-amber-200/50 dark:border-slate-800/80 flex items-center justify-between text-[8px] sm:text-[9px] font-bold">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Free
                          </span>
                          <span className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            Open &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Documents List */}
            {paginatedMaterials.map((item) => {
              const detectedYear = extractYearFromTitle(item.title);
              const isSelected = selectedIds.includes(item._id);
              const isVideo = item.type === "video";
              const isPaper = item.type === "paper";

              return (
                <div 
                  key={item._id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-3 sm:px-4 sm:py-3 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isSelected 
                      ? "border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20" 
                      : "border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5">
                      {!isVideo ? (
                        <button
                          onClick={() => toggleSelectItem(item._id)}
                          className="text-slate-400 hover:text-emerald-500 transition-colors p-0.5 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      ) : (
                        <div className="w-4 shrink-0" />
                      )}

                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isVideo
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                          : isPaper
                          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {isVideo ? <Film size={14} /> : isPaper ? <GraduationCap size={14} /> : <FileText size={14} />}
                      </div>

                      <div className="sm:w-36 shrink-0">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate text-[11px] sm:text-xs block">
                          {item.subject || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pl-9 sm:pl-0">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                        {item.title}
                      </h3>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 flex-wrap pl-9 sm:pl-0">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px] sm:text-[11px] border border-slate-200 dark:border-slate-700">
                        {item.grade ? `${item.grade}` : (detectedYear ? `Year: ${detectedYear}` : "General")}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>

                    {isVideo ? (
                      <a
                        href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <PlayCircle size={13} />
                        <span>Watch</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View: Mobile එකේ 2-column grid, Desktop එකේ පෙර පරිදිම grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Folders in Grid View */}
            {currentLevelFolders.map((f) => {
              const itemCount = materials.filter(m => m.folderId === f._id).length;
              const subFolderCount = folders.filter(sub => sub.parentFolderId === f._id).length;

              return (
                <div
                  key={f._id}
                  onClick={() => enterFolder(f)}
                  className="group relative cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 active:scale-95"
                >
                  <div className="w-12 sm:w-16 h-2 rounded-t-lg bg-amber-400 dark:bg-amber-500 ml-2.5 sm:ml-3 shadow-sm transition-transform duration-200 group-hover:scale-x-105" />
                  <div className="rounded-2xl rounded-tl-sm border border-amber-300/80 dark:border-amber-900/50 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20 p-2 sm:p-3 shadow-sm hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between h-full min-h-[95px] sm:min-h-[105px]">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-500/20 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                        <FolderOpen size={16} className="drop-shadow-sm sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={f.name}>
                          {f.name}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                          {itemCount} docs {subFolderCount > 0 ? `• ${subFolderCount} subs` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-amber-200/50 dark:border-slate-800/80 flex items-center justify-between text-[8px] sm:text-[9px] font-bold">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Free
                      </span>
                      <span className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Open &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Document Cards in Grid View */}
            {paginatedMaterials.map((item) => {
              const detectedYear = extractYearFromTitle(item.title);
              const isSelected = selectedIds.includes(item._id);
              const isVideo = item.type === "video";
              const isPaper = item.type === "paper";
              const coverSrc = getCoverImageUrl(item.coverImage);
              const ytId = item.youtubeVideoId || getYouTubeVideoId(item.fileUrl);

              return (
                <div
                  key={item._id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20" 
                      : "border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  <div>
                    <div className="relative h-32 sm:h-44 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {isVideo ? (
                        ytId ? (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-indigo-500">
                            <Film size={32} />
                          </div>
                        )
                      ) : coverSrc ? (
                        <img
                          src={coverSrc}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-emerald-500">
                          {isPaper ? <GraduationCap size={36} strokeWidth={1.5} /> : <FileText size={36} strokeWidth={1.5} />}
                        </div>
                      )}

                      <span className={`absolute top-2 left-2 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow ${
                        isVideo ? 'bg-indigo-600' : isPaper ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {isVideo ? 'Video' : isPaper ? 'Paper' : 'Note'}
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-4">
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5 sm:mb-1">
                        {item.subject || "General"}
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2 bg-slate-50/50 dark:bg-slate-950/40">
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="flex-1 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg font-bold text-[10px] sm:text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-all"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>

                    {isVideo ? (
                      <a
                        href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg font-bold text-[10px] sm:text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <PlayCircle size={12} />
                        <span>Watch</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                        className="flex-1 py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg font-bold text-[10px] sm:text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Toolbar */}
        {!loading && filteredMaterials.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMaterials.length)} of {filteredMaterials.length} materials
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Floating ZIP Bulk Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[11px]">
              {selectedIds.length}
            </span>
            <span>Items Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={handleBulkZipDownload}
            disabled={isBulkDownloading}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {isBulkDownloading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{zipStatusText}</span>
              </>
            ) : (
              <>
                <Archive size={14} />
                <span>Download as .ZIP</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSelectedIds([])}
            disabled={isBulkDownloading}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Full Details Overlay Modal */}
      {activeModalItem && (() => {
        const item = activeModalItem;
        const isVideo = item.type === "video";
        const coverSrc = getCoverImageUrl(item.coverImage);
        const ytId = item.youtubeVideoId || getYouTubeVideoId(item.fileUrl);
        const detectedYear = extractYearFromTitle(item.title);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileStack className="text-emerald-500" size={15} /> Resource Details
                </span>
                <button 
                  onClick={() => setActiveModalItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-4">
                {isVideo ? (
                  <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-inner">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
                        title={item.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video 
                        src={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}#t=0.1`} 
                        className="w-full h-full object-cover" 
                        controls
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative h-44 sm:h-52 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                    {coverSrc ? (
                      <img 
                        src={coverSrc} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-emerald-500">
                        <FileText size={44} strokeWidth={1.5} />
                        <span className="text-[10px] font-bold mt-1.5 uppercase tracking-wider text-slate-400">PDF Document</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    {item.subject}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {isVideo ? (
                  <a 
                    href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 py-2 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <PlayCircle size={15} /> Watch Full Video
                  </a>
                ) : (
                  <>
                    <button 
                      onClick={() => handleViewPdf(item.fileUrl)}
                      className="flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                    >
                      <Eye size={15} /> Open in Browser
                    </button>
                    <button 
                      onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                      className="flex-1 py-2 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download size={15} /> Download
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <AIChatWidget />
    </div>
  );
}