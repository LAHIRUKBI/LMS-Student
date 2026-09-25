"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { PlayCircle, FileText, BookOpen, Download, User, Eye, Search, Loader2, CheckCircle, Megaphone, Link as LinkIcon, ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface AdLink {
  label: string;
  url: string;
}

interface AdData {
  _id: string;
  headline: string;
  description: string;
  mediaType: "image" | "video" | "both";
  images: string[];
  video?: string | null;
  links: AdLink[];
  targetAudience?: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Track image indexes for ads with multiple images
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchActiveAds(token);
  }, [router]);

  const fetchActiveAds = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/ads/active", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(res.data);
    } catch (err) {
      console.error("Error fetching advertisements:", err);
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

  const getMediaUrl = (mediaPath: string) => {
    if (!mediaPath) return "";
    if (mediaPath.startsWith("http")) return mediaPath;
    const cleanPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  const nextImage = (adId: string, maxImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [adId]: ((prev[adId] || 0) + 1) % maxImages
    }));
  };

  const prevImage = (adId: string, maxImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [adId]: ((prev[adId] || 0) - 1 + maxImages) % maxImages
    }));
  };

  // Filter ads based on search keyword and student's batch/target audience if needed
  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.headline.toLowerCase().includes(search.toLowerCase()) || 
                          ad.description.toLowerCase().includes(search.toLowerCase());
    const matchesAudience = ad.targetAudience === "all" || !ad.targetAudience || (user && ad.targetAudience === user.batch);
    return matchesSearch && matchesAudience;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F1] to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500 relative font-sans overflow-hidden">
      
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-20">
          
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
              Welcome back, {user.name.split(" ")[0]}! Explore the latest announcements, special seminars, and updates below.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
              <button className="bg-[#00CBB8] hover:bg-[#00B5A4] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-teal-500/30 active:scale-95">
                Explore Announcements
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center items-center w-full max-w-md lg:max-w-none h-[350px] sm:h-[450px]">
            <div className="absolute w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] bg-[#00CBB8] rounded-bl-[100px] sm:rounded-bl-[150px] rounded-tr-[80px] sm:rounded-tr-[120px] rounded-tl-3xl rounded-br-3xl rotate-12 -z-10 right-4 sm:right-10 opacity-90 dark:opacity-80"></div>
            <div className="absolute w-32 sm:w-48 h-48 sm:h-72 bg-orange-500 rounded-full rotate-45 -z-20 right-0 top-10 sm:top-20 opacity-90 dark:opacity-80"></div>
            
            <div className="relative z-10 w-full h-full flex justify-center items-end pb-4">
              <User size={250} strokeWidth={1} className="text-slate-800 dark:text-slate-200 drop-shadow-2xl mix-blend-luminosity opacity-50" />
            </div>

            <div className="absolute top-10 sm:top-20 left-4 sm:left-10 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center animate-[bounce_4s_infinite]">
               <CheckCircle className="text-yellow-400" size={28} fill="currentColor" />
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
               We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education.
             </p>
          </div>
        </div>

        {/* Announcements / Ads Header & Search */}
        <div className="py-12 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
             <div>
               <div className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs mb-3 shadow-sm">
                 Announcements & Promotions
               </div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Explore Latest Updates</h2>
             </div>
             
             <div className="relative w-full md:w-80 lg:w-96 group">
               <input 
                 type="text" 
                 placeholder="Search announcements..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-6 pr-12 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
               />
               <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full shadow-md group-hover:scale-105 transition-transform">
                  <Search size={16} />
               </div>
             </div>
          </div>

          {/* Advertisements Display Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Loading announcements...</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4 shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-full mb-5">
                <Megaphone size={48} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No announcements found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">There are no active announcements matching your search right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {filteredAds.map((ad) => {
                const validImages = ad.images && Array.isArray(ad.images) 
                  ? ad.images.filter(img => img && img.trim() !== "") 
                  : [];
                const currentImageIndex = imageIndexes[ad._id] || 0;

                return (
                  <div key={ad._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                    
                    {/* Media / Video / Image Carousel Container */}
                    <div className="w-full h-60 relative bg-slate-900 overflow-hidden flex items-center justify-center">
                      
                      {/* Video Render */}
                      {((ad.mediaType as string) === "video" || ad.mediaType === "both") && ad.video ? (
                        <video 
                          controls 
                          className="w-full h-full object-contain bg-black"
                          src={getMediaUrl(ad.video)} 
                        />
                      ) : null}

                      {/* Images Render */}
                      {((ad.mediaType as string) === "image" || ad.mediaType === "both") && validImages.length > 0 && (ad.mediaType as string) !== "video" ? (
                        <div className={`w-full h-full relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${ad.mediaType === "both" && ad.video ? "absolute inset-0 bg-slate-900/90 hidden group-hover:flex transition-all" : ""}`}>
                          <img 
                            src={getMediaUrl(validImages[currentImageIndex])} 
                            alt={ad.headline} 
                            className="w-full h-full object-contain"
                          />

                          {validImages.length > 1 && (
                            <>
                              <button 
                                onClick={() => prevImage(ad._id, validImages.length)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <button 
                                onClick={() => nextImage(ad._id, validImages.length)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10"
                              >
                                <ChevronRight size={18} />
                              </button>
                              
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 tracking-wider">
                                {currentImageIndex + 1} / {validImages.length}
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      {/* Fallback if no media */}
                      {(!ad.video && validImages.length === 0) && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/10 to-teal-500/10 text-slate-400">
                          <Megaphone size={40} className="mb-2 text-orange-500 opacity-80" />
                          <span className="text-xs font-bold uppercase tracking-wider">Announcement</span>
                        </div>
                      )}
                    </div>

                    {/* Details Area */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                          {ad.targetAudience === "all" ? "All Batches" : `${ad.targetAudience} Batch`}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-xl text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {ad.headline}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                        {ad.description}
                      </p>

                      {/* Action Links / Buttons */}
                      {ad.links && ad.links.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                          {ad.links.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00CBB8]/10 text-[#00CBB8] hover:bg-[#00CBB8] hover:text-white transition-all shadow-sm"
                            >
                              <LinkIcon size={12} /> {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}