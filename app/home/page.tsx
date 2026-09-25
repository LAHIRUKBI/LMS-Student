"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { PlayCircle, FileText, BookOpen, Download, User, Eye, Search, Loader2, CheckCircle, Megaphone, Link as LinkIcon, ChevronLeft, ChevronRight, Clock, Users, GraduationCap, Video, Award, Layers, Layout, Code } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import CircularGallery from "@/app/components/CircularGallery";
import HeroCarousel from "@/app/components/HeroCarousel";
import FeatureCarousel from "@/app/components/FeatureCarousel";

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

// Fallback items (යම් හෙයකින් Backend එකෙන් ඩේටා නොපැමිණියහොත් පෙන්වීමට)
const fallbackGalleryItems = [
  { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop", text: "Student 1" },
  { image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=600&fit=crop", text: "Student 2" },
  { image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop", text: "Online Class" },
  { image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=600&fit=crop", text: "Student 3" },
  { image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=600&fit=crop", text: "Student 4" },
];

const fallbackHeroImages = [
  { id: 1, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=faces", title: "Student 1" },
  { id: 2, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=faces", title: "Student 2" },
  { id: 3, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&crop=faces", title: "Student 3" }
];

const featureItems = [
  {
    id: 1,
    title: "Expert-Led Courses",
    description: "Learn from industry experts with years of experience. Our curriculum is designed to be practical and up-to-date.",
    icon: <GraduationCap size={28} />
  },
  {
    id: 2,
    title: "Interactive Learning",
    description: "Engage with interactive videos, quizzes, and hands-on projects that make learning fun and effective.",
    icon: <Video size={28} />
  },
  {
    id: 3,
    title: "Certification",
    description: "Earn recognized certificates upon completion. Showcase your new skills to employers and advance your career.",
    icon: <Award size={28} />
  },
  {
    id: 4,
    title: "Community Support",
    description: "Join a vibrant community of learners and mentors. Get help when you need it and collaborate on projects.",
    icon: <Users size={28} />
  }
];

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Admin එකෙන් වෙනස් කරන Settings ගබඩා කරගැනීමට State එක
  const [dashboardSettings, setDashboardSettings] = useState<any>(null);

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
    fetchDashboardSettings(); // Admin Settings fetch කරගැනීමට
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

  const fetchDashboardSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/settings");
      setDashboardSettings(res.data);
    } catch (err) {
      console.error("Error fetching dashboard settings:", err);
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
    if (mediaPath.startsWith("http") || mediaPath.startsWith("blob:")) return mediaPath;
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

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.headline.toLowerCase().includes(search.toLowerCase()) || 
                          ad.description.toLowerCase().includes(search.toLowerCase());
    const matchesAudience = ad.targetAudience === "all" || !ad.targetAudience || (user && ad.targetAudience === user.batch);
    return matchesSearch && matchesAudience;
  });

  if (!user) return null;

  // දත්ත ලබාගැනීම (Settings තිබේ නම් ඒවා පෙන්වීම, නැතහොත් Defaults පෙන්වීම)
  const heroBadge = dashboardSettings?.heroBadge || "eLearning Platform";
  const heroTitleLine1 = dashboardSettings?.heroTitleLine1 || "Smart Learning";
  const heroTitleLine2 = dashboardSettings?.heroTitleLine2 || "Deeper & More";
  const heroTitleHighlight = dashboardSettings?.heroTitleHighlight || "-Amazing";
  const heroDescription = dashboardSettings?.heroDescription || "Phosfluorescently deploy unique intellectual capital without enterprise- after bricks & clicks synergy. Enthusiastically revolutionize intuitive.";
  const primaryBtnText = dashboardSettings?.primaryBtnText || "Start Free Trial";
  const secondaryBtnText = dashboardSettings?.secondaryBtnText || "How it Work";

  const currentHeroImages = dashboardSettings?.heroImages?.length > 0 
    ? dashboardSettings.heroImages.map((item: any) => ({
        ...item,
        image: getMediaUrl(item.image)
      }))
    : fallbackHeroImages;

  const currentGalleryItems = dashboardSettings?.galleryItems?.length > 0 
    ? dashboardSettings.galleryItems.map((item: any) => ({
        ...item,
        image: getMediaUrl(item.image)
      }))
    : fallbackGalleryItems;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F1] to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500 relative font-sans overflow-x-hidden">
      
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-20 relative">
          
          {/* Left Content */}
          <div className="flex-1 space-y-6 z-20 mt-4 lg:mt-0 lg:max-w-xl">
            <div className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-sm">
              {heroBadge}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              {heroTitleLine1} <br className="hidden sm:block" />
              {heroTitleLine2} <br className="hidden sm:block" />
              <span className="text-orange-500">{heroTitleHighlight}</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 max-w-lg text-base sm:text-lg leading-relaxed">
              {heroDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
              <button className="bg-[#00CBB8] hover:bg-[#00B5A4] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-teal-500/30 active:scale-95 flex items-center gap-2 cursor-pointer">
                {primaryBtnText} <ChevronRight size={16} />
              </button>
              
              <button className="flex items-center gap-3 group text-slate-800 dark:text-white font-bold cursor-pointer">
                <div className="bg-orange-500 text-white p-3 rounded-full shadow-md group-hover:scale-105 transition-transform">
                  <PlayCircle size={20} />
                </div>
                <span>{secondaryBtnText}</span>
              </button>
            </div>
          </div>

          {/* Right Large Image Container */}
          <div className="flex-1 relative flex justify-center lg:justify-end items-center w-full max-w-md lg:max-w-none h-[400px] sm:h-[500px] lg:h-[600px] mt-10 lg:mt-0">
            
            <div className="absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[#00CBB8]/20 rounded-bl-[150px] rounded-tr-[120px] rounded-tl-[40px] rounded-br-[40px] rotate-[15deg] -z-10 right-[-20px] lg:right-[-50px] top-1/2 -translate-y-1/2 opacity-90"></div>
            <div className="absolute w-40 sm:w-64 h-40 sm:h-64 bg-orange-500/20 rounded-[40px] rotate-45 -z-20 right-[-40px] lg:right-[-80px] top-1/4 opacity-80"></div>
            
            <div className="relative z-10 w-full h-full flex justify-center lg:justify-end items-end">
              <HeroCarousel 
                items={currentHeroImages} 
                baseWidth={600} 
                autoplay={true}
                autoplayDelay={5000}
                pauseOnHover={true}
                loop={true}
              />
            </div>

            <div className="absolute top-16 left-4 sm:left-10 lg:left-0 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center animate-[bounce_4s_infinite] z-30">
               <CheckCircle className="text-yellow-400" size={28} fill="currentColor" />
            </div>
            <div className="absolute bottom-20 right-4 lg:right-10 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl flex items-center justify-center z-30 border border-slate-100 dark:border-slate-700">
               <span className="text-xs font-bold text-slate-700 dark:text-slate-200">⭐ 5.0 Rating</span>
            </div>
          </div>
        </div>

        {/* ================= NEW ABOUT / FEATURES SECTION START ================= */}
        <section className="py-16 mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 font-bold px-4 py-1.5 rounded-full text-xs mb-4 shadow-sm tracking-wide">
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              Everything you need to <span className="text-[#00CBB8]">excel</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We provide a comprehensive learning environment designed to help you achieve your goals. Our platform combines expert-led content with cutting-edge technology.
            </p>
          </div>

          <FeatureCarousel 
            items={featureItems}
            autoplay={true}
            autoplayDelay={4000}
            pauseOnHover={true}
          />
        </section>
        {/* ================= NEW ABOUT / FEATURES SECTION END ================= */}

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
                    
                    <div className="w-full h-60 relative bg-slate-900 overflow-hidden flex items-center justify-center">
                      {((ad.mediaType as string) === "video" || ad.mediaType === "both") && ad.video ? (
                        <video 
                          controls 
                          className="w-full h-full object-contain bg-black"
                          src={getMediaUrl(ad.video)} 
                        />
                      ) : null}

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
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10 cursor-pointer"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <button 
                                onClick={() => nextImage(ad._id, validImages.length)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10 cursor-pointer"
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

                      {(!ad.video && validImages.length === 0) && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/10 to-teal-500/10 text-slate-400">
                          <Megaphone size={40} className="mb-2 text-orange-500 opacity-80" />
                          <span className="text-xs font-bold uppercase tracking-wider">Announcement</span>
                        </div>
                      )}
                    </div>

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

                      {ad.links && ad.links.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                          {ad.links.map((link: any, idx: number) => (
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

        {/* Gallery Section */}
        <div className="w-full h-[450px] relative mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Our Gallery</h3>
          </div>
          <CircularGallery 
            items={currentGalleryItems} 
            bend={1.5} 
            textColor="#ffffff" 
            borderRadius={0.05} 
            scrollSpeed={2}
            fontUrl=""
          />
        </div>

      </main>
    </div>
  );
}