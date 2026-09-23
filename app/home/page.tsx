"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { PlayCircle, FileText, BookOpen, Download, User, Eye, Search, Loader2, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F1] to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500 relative font-sans overflow-hidden">
      
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16">
        
        {/* Hero Section (Matched with the provided image) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-20">
          
          {/* Left Content */}
          <div className="flex-1 space-y-6 z-10 mt-8 lg:mt-0">
            <div className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-sm">
              eLearning Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Smart Learning <br className="hidden sm:block" />
              Deeper & More <br className="hidden sm:block" />
              <span className="text-orange-500">-Amazing</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 max-w-lg text-base sm:text-lg leading-relaxed">
              Phosfluorescently deploy unique intellectual capital without enterprise-wide synergy. Enthusiastically revolutionize intuitive learning experiences for {user.name.split(" ")[0]}.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
              <button className="bg-[#00CBB8] hover:bg-[#00B5A4] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-teal-500/30 active:scale-95">
                Start Free Trial
              </button>
              <button className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold hover:text-orange-500 dark:hover:text-orange-400 transition-colors group">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md text-orange-500 group-hover:scale-110 transition-transform">
                  <PlayCircle size={24} fill="currentColor" className="text-white dark:text-slate-800" strokeWidth={1} />
                </div>
                How it Work
              </button>
            </div>
          </div>

          {/* Right Content / Illustration */}
          <div className="flex-1 relative flex justify-center items-center w-full max-w-md lg:max-w-none h-[350px] sm:h-[450px]">
            {/* Abstract Background Shapes */}
            <div className="absolute w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] bg-[#00CBB8] rounded-bl-[100px] sm:rounded-bl-[150px] rounded-tr-[80px] sm:rounded-tr-[120px] rounded-tl-3xl rounded-br-3xl rotate-12 -z-10 right-4 sm:right-10 opacity-90 dark:opacity-80"></div>
            <div className="absolute w-32 sm:w-48 h-48 sm:h-72 bg-orange-500 rounded-full rotate-45 -z-20 right-0 top-10 sm:top-20 opacity-90 dark:opacity-80"></div>
            
            {/* Dots Pattern */}
            <div className="absolute top-0 right-1/4 w-4 h-4 bg-orange-400 rounded-full"></div>
            <div className="absolute top-1/4 left-0 w-3 h-3 bg-teal-400 rounded-full"></div>
            <div className="absolute bottom-10 right-0 w-2 h-2 bg-blue-400 rounded-full"></div>

            {/* Student Image Placeholder (Replace src with actual image later if needed) */}
            <div className="relative z-10 w-full h-full flex justify-center items-end pb-4">
              <User size={250} strokeWidth={1} className="text-slate-800 dark:text-slate-200 drop-shadow-2xl mix-blend-luminosity opacity-50" />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 sm:top-20 left-4 sm:left-10 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center animate-[bounce_4s_infinite]">
               <CheckCircle className="text-yellow-400" size={28} fill="currentColor" />
            </div>
            <div className="absolute top-24 sm:top-32 right-4 sm:right-10 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center animate-[pulse_3s_infinite]">
               <div className="font-extrabold text-xl sm:text-2xl text-blue-500">G</div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="py-16 text-center max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
             <div className="inline-block bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold px-4 py-1.5 rounded-full text-xs mb-2">
               About Us
             </div>
             <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
               We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education. Our mission offering a diverse range of courses.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800 py-10">
             <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
               <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">25+</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Years of eLearning<br/>Education Experience</p>
             </div>
             <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
               <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">56k</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Students Enrolled in<br/>LMSZONE Courses</p>
             </div>
             <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
               <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">170+</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Experienced Teacher's<br/>service.</p>
             </div>
          </div>
        </div>

        {/* Courses Header & Search */}
        <div className="py-12 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
             <div>
               <div className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs mb-3 shadow-sm">
                 Our Course
               </div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Explore Our Course</h2>
             </div>
             
             {/* Search Bar matching the image */}
             <div className="relative w-full md:w-80 lg:w-96 group">
               <input 
                 type="text" 
                 placeholder="Search lessons..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-6 pr-12 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
               />
               <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full shadow-md group-hover:scale-105 transition-transform">
                  <Search size={16} />
               </div>
             </div>
          </div>

          {/* Filters / Tabs */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            <button onClick={() => setActiveTab("all")} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "all" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
              All Categories
            </button>
            <button onClick={() => setActiveTab("video")} className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "video" ? "bg-[#00CBB8] text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
              <PlayCircle size={16} /> Video Lessons
            </button>
            <button onClick={() => setActiveTab("pdf")} className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "pdf" ? "bg-orange-500 text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
              <FileText size={16} /> Tutorials & Papers
            </button>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching amazing lessons...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4 shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-full mb-5">
                <BookOpen size={48} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No lessons found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">We couldn't find any lessons matching your search criteria. Try a different keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMaterials.map((m) => (
                <div key={m._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  
                  {/* Thumbnail / Video Player Area */}
                  {m.type === "video" ? (
                    <div className="w-full aspect-video bg-slate-900 relative">
                      <video 
                        controls 
                        controlsList="nodownload"
                        className="w-full h-full object-contain"
                        src={`http://localhost:5000${m.fileUrl}`} 
                      />
                    </div>
                  ) : (
                    <div className={`w-full aspect-video flex items-center justify-center ${m.type === 'paper' ? 'bg-[#E5F9F6] dark:bg-teal-900/30' : 'bg-[#FFF0E5] dark:bg-orange-900/30'}`}>
                      <FileText size={56} className={m.type === 'paper' ? 'text-[#00CBB8]' : 'text-orange-400'} strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Details Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        m.type === "video" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                        m.type === "paper" ? "bg-[#E5F9F6] text-[#00A394] dark:bg-teal-500/20 dark:text-teal-400" :
                        "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                      }`}>
                        {m.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">{m.title}</h3>
                    <p className="text-sm font-bold text-[#00CBB8] mb-6">{m.subject}</p>
                    
                    <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      
                      {/* ගුරුවරයාගේ නම සහ Profile Image එක පෙන්වන කොටස */}
                      <div className="flex items-center gap-3">
                        {m.teacherId?.profileImage ? (
                          <img 
                            src={m.teacherId.profileImage.startsWith('http') ? m.teacherId.profileImage : `http://localhost:5000${m.teacherId.profileImage}`} 
                            alt={m.teacherId?.name || "Teacher"} 
                            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm">
                            <User size={14} className="text-slate-500" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                          {m.teacherId?.name || "Teacher"}
                        </span>
                      </div>

                      {/* Download / View Buttons for PDF/Paper */}
                      {m.type !== "video" && (
                        <div className="flex gap-2">
                          <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-[#00CBB8] hover:text-white dark:hover:bg-[#00CBB8] transition-colors shadow-sm" title="View">
                            <Eye size={16} />
                          </a>
                          <a href={`http://localhost:5000${m.fileUrl}`} download className="p-2.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-colors shadow-sm" title="Download">
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
        </div>

      </main>
    </div>
  );
}