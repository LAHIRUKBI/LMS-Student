// src/app/class/free/page.tsx
"use client";

import { useEffect, useState, useMemo, useId } from "react";
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
  ArrowLeft,
  FolderOpen
} from "lucide-react"; 
import Navbar from "@/app/components/Navbar";
import AIChatWidget from "@/app/components/AIChatWidget";

// Reusable blue folder artwork for the Free Materials folder tiles.
const FreeFolderArtwork = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const gradientId = useId().replace(/:/g, "");

  return (
    <div
      className={`relative mx-auto flex shrink-0 items-center justify-center ${
        size === "sm"
          ? "h-[76px] w-[104px] sm:h-[84px] sm:w-[116px]"
          : "h-[94px] w-[132px] sm:h-[108px] sm:w-[150px]"
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 210 160" className="h-full w-full overflow-visible drop-shadow-[0_7px_7px_rgba(31,87,120,0.16)]">
        <defs>
          <linearGradient id={`${gradientId}-back`} x1="30" y1="16" x2="170" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#58B5E2" />
            <stop offset="1" stopColor="#328EC4" />
          </linearGradient>
          <linearGradient id={`${gradientId}-front`} x1="55" y1="48" x2="150" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#54C9EF" />
            <stop offset="1" stopColor="#32A9D9" />
          </linearGradient>
        </defs>
      <ellipse cx="105" cy="148" rx="66" ry="5.5" fill="#245B7A" opacity="0.10" />
      <path
        d="M22 34c0-8.5 6.8-15.3 15.3-15.3h40.2c7.1 0 12.2 3.2 15.3 9.3l4.1 8.1h58.5c9.2 0 16.6 7.4 16.6 16.6v67.8c0 10.4-8.4 18.8-18.8 18.8H40.8c-10.4 0-18.8-8.4-18.8-18.8V34Z"
        fill={`url(#${gradientId}-back)`}
      />
      <path
        d="M34 51.5c0-4.4 3.6-8 8-8h113.5c4.4 0 8 3.6 8 8v44.2c0 4.4-3.6 8-8 8H42c-4.4 0-8-3.6-8-8V51.5Z"
        fill="#F8FCFF"
      />
      <path
        d="M46.2 59.2c2.5-7.4 8.1-11.2 16.4-11.2h115.2c10.4 0 16.2 7.4 13.4 17.4l-17.8 63.2c-2.2 7.8-8.5 12.1-17.2 12.1H39.1c-10.5 0-16.2-7.6-13.2-17.7l20.3-63.8Z"
        fill={`url(#${gradientId}-front)`}
      />
      <path
        d="M51 64.5c2.6-6.4 7.3-9.3 14.5-9.3h104.8"
        stroke="#A5E8FA"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.65"
      />
      </svg>
    </div>
  );
};

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans text-slate-800 transition-colors duration-300 dark:bg-[#081323] dark:text-slate-100">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-10 xl:px-12">
        

        {/* Breadcrumb navigation */}
        {(folders.length > 0 || currentFolder) && (
          <nav aria-label="Folder breadcrumb" className="mt-5 flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-[11px] shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => { setCurrentFolder(null); setFolderHistory([]); }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 font-semibold transition-colors ${!currentFolder ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
            >
              <FileStack size={13} /> All free resources
            </button>
            {folderHistory.map((folder, idx) => (
              <div key={folder._id} className="flex shrink-0 items-center gap-1.5">
                <ChevronRight size={13} className="text-slate-300 dark:text-slate-600" />
                <button
                  type="button"
                  onClick={() => {
                    const sliced = folderHistory.slice(0, idx + 1);
                    setFolderHistory(sliced);
                    setCurrentFolder(folder);
                  }}
                  className={`max-w-[180px] truncate rounded-xl px-2.5 py-1.5 font-semibold transition-colors ${idx === folderHistory.length - 1 ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                >
                  {folder.name}
                </button>
              </div>
            ))}
            {currentFolder && (
              <button
                type="button"
                onClick={navigateUp}
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}
          </nav>
        )}

        {/* Filters and display controls */}
        <section className="mt-5 rounded-[24px] border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Browse by resource type</p>
              <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setContentTypeTab("all")}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold transition-all ${contentTypeTab === "all" ? "bg-slate-900 text-white shadow-sm dark:bg-sky-200 dark:text-slate-900" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                >
                  <FileStack size={14} /> All <span className="text-[10px] opacity-70">{resourceCounts.all}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentTypeTab("paper")}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold transition-all ${contentTypeTab === "paper" ? "bg-slate-900 text-white shadow-sm dark:bg-sky-200 dark:text-slate-900" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                >
                  <GraduationCap size={14} /> Past papers <span className="text-[10px] opacity-70">{resourceCounts.paper}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentTypeTab("pdf")}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold transition-all ${contentTypeTab === "pdf" ? "bg-slate-900 text-white shadow-sm dark:bg-sky-200 dark:text-slate-900" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                >
                  <FileText size={14} /> PDF notes <span className="text-[10px] opacity-70">{resourceCounts.pdf}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentTypeTab("video")}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold transition-all ${contentTypeTab === "video" ? "bg-slate-900 text-white shadow-sm dark:bg-sky-200 dark:text-slate-900" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                >
                  <Film size={14} /> Videos <span className="text-[10px] opacity-70">{resourceCounts.video}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 xl:border-t-0 xl:pt-0">
              {subjects.length > 1 && (
                <select
                  aria-label="Filter by subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="h-10 min-w-[135px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 sm:flex-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub === "all" ? "All subjects" : sub}</option>
                  ))}
                </select>
              )}

              {availableYears.length > 0 && (
                <select
                  aria-label="Filter by year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-10 min-w-[115px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 sm:flex-none"
                >
                  <option value="all">All years</option>
                  {availableYears.map((yr) => <option key={yr} value={yr}>Year: {yr}</option>)}
                </select>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  title="Reset filters"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              )}

              <div className="ml-auto inline-flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`flex h-8 w-9 items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-300" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                  title="List view"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`flex h-8 w-9 items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-300" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                  title="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Selection and pagination preferences */}
        {!loading && (filteredMaterials.length > 0 || currentLevelFolders.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={toggleSelectAllCurrentPage}
              className="inline-flex items-center gap-2 rounded-lg py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-300"
            >
              {isAllCurrentPageSelected ? <CheckSquare size={15} className="text-sky-600 dark:text-sky-400" /> : <Square size={15} />}
              Select all documents on this page
            </button>
            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              <span>Show</span>
              <select
                aria-label="Items per page"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <div className="mt-5 flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <Loader2 className="animate-spin" size={22} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Loading your learning library</p>
            <p className="mt-1 text-[11px] text-slate-400">Gathering free resources and folders...</p>
          </div>
        ) : (filteredMaterials.length === 0 && currentLevelFolders.length === 0) ? (
          <div className="mt-5 flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-5 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
              <FileStack size={28} strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight text-slate-800 dark:text-white">No resources found</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">There are no folders or learning materials matching your current search and filters.</p>
            {hasActiveFilters && (
              <button type="button" onClick={resetAllFilters} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-sky-200 dark:text-slate-900 dark:hover:bg-sky-100">
                <RotateCcw size={13} /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-7">
            {/* Folder collection */}
            {currentLevelFolders.length > 0 && (
              <section>
                <div className="mb-3 flex items-end justify-between gap-3 px-1">
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    {currentLevelFolders.length} {currentLevelFolders.length === 1 ? "folder" : "folders"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {currentLevelFolders.map((f) => {
                    const itemCount = materials.filter(m => m.folderId === f._id).length;
                    const subFolderCount = folders.filter(sub => sub.parentFolderId === f._id).length;

                    return (
                      <button
                        type="button"
                        key={f._id}
                        onClick={() => enterFolder(f)}
                        className="group flex min-w-0 flex-col items-center rounded-2xl px-2 pb-2 pt-2 text-center outline-none transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)] focus-visible:ring-2 focus-visible:ring-sky-500/60 active:scale-[0.98] dark:hover:bg-slate-900/70 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] sm:px-3"
                      >
                        <FreeFolderArtwork size="md" />
                        <span className="mt-1.5 block w-full break-words px-1 text-center text-[11px] font-bold leading-[1.45] text-slate-800 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300 sm:text-xs [overflow-wrap:anywhere]">
                          {f.name}
                        </span>
                        <span className="mt-1 block w-full break-words text-center text-[9px] font-medium leading-relaxed text-slate-400 dark:text-slate-500 sm:text-[10px]">
                          {itemCount} documents{subFolderCount > 0 ? ` · ${subFolderCount} subfolders` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Learning materials */}
            <section>
              <div className="mb-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Your study collection</p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Learning materials</h2>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {currentFolder ? `Resources inside ${currentFolder.name}` : "Explore the latest free notes, papers and lessons."}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  <FileText size={12} /> {filteredMaterials.length} matching {filteredMaterials.length === 1 ? "resource" : "resources"}
                </span>
              </div>

              {filteredMaterials.length === 0 ? (
                <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white px-5 text-center dark:border-slate-800 dark:bg-slate-900/70">
                  <FileText size={24} className="text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">No documents in this view</p>
                  <p className="mt-1 text-[10px] text-slate-400">Try another resource type or adjust your search filters.</p>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-2.5">
                  {paginatedMaterials.map((item) => {
                    const detectedYear = extractYearFromTitle(item.title);
                    const isSelected = selectedIds.includes(item._id);
                    const isVideo = item.type === "video";
                    const isPaper = item.type === "paper";

                    return (
                      <article
                        key={item._id}
                        className={`group rounded-2xl border bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:bg-slate-900 sm:p-4 ${isSelected ? "border-sky-400 bg-sky-50/40 dark:border-sky-700 dark:bg-sky-950/20" : "border-slate-200/90 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            {!isVideo ? (
                              <button
                                type="button"
                                onClick={() => toggleSelectItem(item._id)}
                                aria-label={isSelected ? `Deselect ${item.title}` : `Select ${item.title}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950/50 dark:hover:text-sky-300"
                              >
                                {isSelected ? <CheckSquare size={16} className="text-sky-600 dark:text-sky-400" /> : <Square size={16} />}
                              </button>
                            ) : (
                              <span className="w-7 shrink-0" />
                            )}

                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isVideo ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300" : isPaper ? "bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300" : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"}`}>
                              {isVideo ? <Film size={18} /> : isPaper ? <GraduationCap size={19} /> : <FileText size={18} />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${isVideo ? "text-violet-600 dark:text-violet-300" : isPaper ? "text-amber-700 dark:text-amber-300" : "text-sky-700 dark:text-sky-300"}`}>
                                  {isVideo ? "Video lesson" : isPaper ? "Past paper" : "PDF notes"}
                                </span>
                                {item.grade && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{item.grade}</span>}
                                {!item.grade && detectedYear && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{detectedYear}</span>}
                              </div>
                              <h3 className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 sm:text-sm">{item.title}</h3>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1"><BookOpen size={11} /> {item.subject || "General"}</span>
                                {item.teacherId?.name && <span className="inline-flex items-center gap-1"><User size={11} /> {item.teacherId.name}</span>}
                                {item.createdAt && <span className="inline-flex items-center gap-1"><Calendar size={11} /> {new Date(item.createdAt).toLocaleDateString()}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:border-t-0 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => setActiveModalItem(item)}
                              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
                            >
                              <Eye size={13} /> View details
                            </button>
                            {isVideo ? (
                              <a
                                href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3.5 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 sm:flex-none"
                              >
                                <PlayCircle size={13} /> Watch
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                                className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 dark:bg-sky-200 dark:text-slate-900 dark:hover:bg-sky-100 sm:flex-none"
                              >
                                <Download size={13} /> Download
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {paginatedMaterials.map((item) => {
                    const detectedYear = extractYearFromTitle(item.title);
                    const isSelected = selectedIds.includes(item._id);
                    const isVideo = item.type === "video";
                    const isPaper = item.type === "paper";
                    const coverSrc = getCoverImageUrl(item.coverImage);
                    const ytId = item.youtubeVideoId || getYouTubeVideoId(item.fileUrl);

                    return (
                      <article
                        key={item._id}
                        className={`group flex min-w-0 flex-col overflow-hidden rounded-[22px] border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)] dark:bg-slate-900 ${isSelected ? "border-sky-400 dark:border-sky-700" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
                      >
                        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-44">
                          {isVideo ? (
                            ytId ? (
                              <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-violet-500"><Film size={34} /><span className="text-[10px] font-semibold">Video lesson</span></div>
                            )
                          ) : coverSrc ? (
                            <img src={coverSrc} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                          ) : (
                            <div className={`flex flex-col items-center gap-2 ${isPaper ? "text-amber-600 dark:text-amber-300" : "text-sky-600 dark:text-sky-300"}`}>
                              {isPaper ? <GraduationCap size={40} strokeWidth={1.4} /> : <FileText size={38} strokeWidth={1.4} />}
                              <span className="text-[9px] font-bold uppercase tracking-[0.14em]">{isPaper ? "Past paper" : "PDF document"}</span>
                            </div>
                          )}
                          <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-sm ${isVideo ? "bg-violet-600" : isPaper ? "bg-amber-600" : "bg-sky-700"}`}>
                            {isVideo ? <Film size={10} /> : isPaper ? <GraduationCap size={11} /> : <FileText size={10} />}
                            {isVideo ? "Video" : isPaper ? "Paper" : "PDF"}
                          </span>
                          {!isVideo && (
                            <button
                              type="button"
                              onClick={() => toggleSelectItem(item._id)}
                              aria-label={isSelected ? `Deselect ${item.title}` : `Select ${item.title}`}
                              className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-colors ${isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-white/80 bg-white/90 text-slate-500 hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300"}`}
                            >
                              {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-sky-700 dark:text-sky-300">{item.subject || "General"}</span>
                          <h3 className="mt-1.5 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-900 dark:text-white">{item.title}</h3>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {item.grade && <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.grade}</span>}
                            {!item.grade && detectedYear && <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Year {detectedYear}</span>}
                            {item.teacherId?.name && <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400"><User size={10} /> {item.teacherId.name}</span>}
                          </div>
                          <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => setActiveModalItem(item)}
                              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <Eye size={13} /> Details
                            </button>
                            {isVideo ? (
                              <a
                                href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-2 text-[10px] font-semibold text-white transition-colors hover:bg-violet-700"
                              >
                                <PlayCircle size={13} /> Watch
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-2 text-[10px] font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-sky-200 dark:text-slate-900 dark:hover:bg-sky-100"
                              >
                                <Download size={13} /> Download
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredMaterials.length > 0 && totalPages > 1 && (
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredMaterials.length)}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filteredMaterials.length}</strong> resources
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              ><ChevronLeft size={16} /></button>
              <span className="min-w-[70px] text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              ><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </main>

      {/* Floating ZIP download bar */}
      {selectedIds.length > 0 && (
        <div className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-white shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 sm:inset-x-auto sm:bottom-6 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-300 text-[11px] font-extrabold text-slate-950">{selectedIds.length}</span>
              <span>Resources selected</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              disabled={isBulkDownloading}
              aria-label="Clear selected items"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 sm:hidden"
            ><X size={15} /></button>
          </div>
          <div className="hidden h-7 w-px bg-slate-700 sm:block" />
          <button
            type="button"
            onClick={handleBulkZipDownload}
            disabled={isBulkDownloading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-sky-300 px-4 py-2 text-[11px] font-bold text-slate-950 shadow-sm transition-colors hover:bg-sky-200 disabled:cursor-wait disabled:opacity-60"
          >
            {isBulkDownloading ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
            <span>{isBulkDownloading ? zipStatusText : "Download selected as ZIP"}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            disabled={isBulkDownloading}
            aria-label="Clear selected items"
            className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 sm:inline-flex"
          ><X size={15} /></button>
        </div>
      )}

      {/* Resource details modal */}
      {activeModalItem && (() => {
        const item = activeModalItem;
        const isVideo = item.type === "video";
        const isPaper = item.type === "paper";
        const coverSrc = getCoverImageUrl(item.coverImage);
        const ytId = item.youtubeVideoId || getYouTubeVideoId(item.fileUrl);
        const detectedYear = extractYearFromTitle(item.title);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
            <div
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(2,6,23,0.35)] dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"><FileStack size={17} /></div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Resource information</p>
                    <h2 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">Learning resource</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  aria-label="Close resource details"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                ><X size={17} /></button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-6">
                {isVideo ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
                        title={item.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        src={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}#t=0.1`}
                        className="h-full w-full object-cover"
                        controls
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 sm:h-60">
                    {coverSrc ? (
                      <img src={coverSrc} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className={`flex flex-col items-center gap-2 ${isPaper ? "text-amber-600 dark:text-amber-300" : "text-sky-600 dark:text-sky-300"}`}>
                        {isPaper ? <GraduationCap size={48} strokeWidth={1.4} /> : <FileText size={44} strokeWidth={1.4} />}
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{isPaper ? "Past paper" : "PDF document"}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${isVideo ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : isPaper ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"}`}>
                      {isVideo ? "Video lesson" : isPaper ? "Past paper" : "PDF notes"}
                    </span>
                    {item.grade && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.grade}</span>}
                    {!item.grade && detectedYear && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Year {detectedYear}</span>}
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300">{item.subject || "General"}</p>
                  <h2 className="mt-1 text-lg font-extrabold leading-snug tracking-tight text-slate-950 dark:text-white sm:text-xl">{item.title}</h2>
                  {item.teacherId?.name && <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400"><User size={12} /> {item.teacherId.name}</p>}
                  {item.description && (
                    <p className="mt-4 whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="min-h-10 rounded-xl px-4 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >Close</button>
                {isVideo ? (
                  <a
                    href={item.fileUrl?.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-[11px] font-bold text-white transition-colors hover:bg-violet-700"
                  ><PlayCircle size={14} /> Watch full video</a>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleViewPdf(item.fileUrl)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    ><Eye size={14} /> Open in browser</button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(item.fileUrl, item.title)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-[11px] font-bold text-white transition-colors hover:bg-slate-700 dark:bg-sky-200 dark:text-slate-900 dark:hover:bg-sky-100"
                    ><Download size={14} /> Download PDF</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <AIChatWidget />
    </div>
  );
}
