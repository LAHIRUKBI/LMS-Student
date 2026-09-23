"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { PlayCircle, FileText, BookOpen, Download, User, Eye, Search, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); 
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchMaterials(token);
  }, [router]);

  const fetchMaterials = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/materials/student/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesTab = activeTab === "all" ? true : activeTab === "pdf" ? (m.type === "pdf" || m.type === "paper") : m.type === activeTab;
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        
        {/* Welcome Section & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Welcome, {user.name.split(" ")[0]}! 👋</h1>
            <p className="text-slate-500 mt-1">Get your latest lessons and tutorials here.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search lessons..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filters / Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveTab("all")} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "all" ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
            All Lessons
          </button>
          <button onClick={() => setActiveTab("video")} className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "video" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
            <PlayCircle size={16} /> Videos
          </button>
          <button onClick={() => setActiveTab("pdf")} className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "pdf" ? "bg-orange-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
            <FileText size={16} /> Tutorials & Papers
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Fetching lessons...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <BookOpen size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">No lessons found</h3>
            <p className="text-slate-500">There are no lessons matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMaterials.map((m) => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                
                {/* Thumbnail / Video Player Area */}
                {m.type === "video" ? (
                  <div className="w-full aspect-video bg-black relative">
                    <video 
                      controls 
                      controlsList="nodownload"
                      className="w-full h-full object-contain"
                      src={`http://localhost:5000${m.fileUrl}`} 
                    />
                  </div>
                ) : (
                  <div className={`w-full aspect-video flex items-center justify-center ${m.type === 'paper' ? 'bg-teal-50' : 'bg-orange-50'}`}>
                    <FileText size={48} className={m.type === 'paper' ? 'text-teal-300' : 'text-orange-300'} />
                  </div>
                )}

                {/* Details Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      m.type === "video" ? "bg-indigo-100 text-indigo-700" :
                      m.type === "paper" ? "bg-teal-100 text-teal-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {m.type}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2 line-clamp-2">{m.title}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-4">{m.subject}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    
                    {/* ගුරුවරයාගේ නම සහ Profile Image එක පෙන්වන කොටස */}
                    <div className="flex items-center gap-2">
                      {m.teacherId?.profileImage ? (
                        <img 
                          src={m.teacherId.profileImage.startsWith('http') ? m.teacherId.profileImage : `http://localhost:5000${m.teacherId.profileImage}`} 
                          alt={m.teacherId?.name || "Teacher"} 
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <User size={12} className="text-slate-500" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                        {m.teacherId?.name || "Teacher"}
                      </span>
                    </div>

                    {/* Download / View Buttons for PDF/Paper */}
                    {m.type !== "video" && (
                      <div className="flex gap-2">
                        <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="View">
                          <Eye size={16} />
                        </a>
                        <a href={`http://localhost:5000${m.fileUrl}`} download className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Download">
                          <Download size={16} />
                        </a>
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