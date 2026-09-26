"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { PlayCircle, FileText, BookOpen, Download, User, Eye, Search, Loader2, CheckCircle, Megaphone, Link as LinkIcon, ChevronLeft, ChevronRight, Clock, Users, GraduationCap, Video, Award, Layers, Layout, Code, Globe, MessageCircle, Send, Share2, X, Mail, Copy } from "lucide-react";
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

// Fallback items
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

// සමාජ මාධ්‍ය සඳහා නිවැරදි SVG අයිකන ලබාදෙන Helper Function එක
const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  
  if (p.includes("facebook")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  }
  if (p.includes("youtube")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
  }
  if (p.includes("instagram")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
  }
  if (p.includes("tiktok")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>;
  }
  if (p.includes("whatsapp")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
  }
  if (p.includes("x") || p.includes("twitter")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  }
  if (p.includes("linkedin")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
  }
  if (p.includes("telegram")) {
    return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.535-.195 1.006.132.832.934z"/></svg>;
  }
  
  return <Globe size={18} />;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dashboardSettings, setDashboardSettings] = useState<any>(null);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
    fetchDashboardSettings();
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

  const heroBadge = dashboardSettings?.heroBadge || "eLearning Platform";
  const heroTitleLine1 = dashboardSettings?.heroTitleLine1 || "Smart Learning";
  const heroTitleLine2 = dashboardSettings?.heroTitleLine2 || "Deeper & More";
  const heroTitleHighlight = dashboardSettings?.heroTitleHighlight || "-Amazing";
  const heroDescription = dashboardSettings?.heroDescription || "Phosfluorescently deploy unique intellectual capital without enterprise- after bricks & clicks synergy. Enthusiastically revolutionize intuitive.";
  const primaryBtnText = dashboardSettings?.primaryBtnText || "Start Free Trial";
  const socialLinks = dashboardSettings?.socialLinks || [];

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

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
              <button 
                onClick={() => router.push("/class/class_view")}
                className="bg-[#00CBB8] hover:bg-[#00B5A4] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-teal-500/30 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {primaryBtnText} <ChevronRight size={16} />
              </button>
              
              {/* Share Button Wrapper */}
              <div className="relative inline-block">
                {/* Share Button (z-40 මඟින් බ්ලර් එකට උඩින් සහ ඉතා පැහැදිලිව පෙනෙන සේ සකසා ඇත) */}
                <button
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  title="Share Website"
                  className="bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-full transition-all shadow-xl hover:scale-110 flex items-center justify-center cursor-pointer active:scale-95 z-40 relative"
                >
                  {isShareOpen ? <X size={20} /> : <Share2 size={20} />}
                </button>

                {/* Animated Circular Social Share Popup Menu with Backdrop Blur */}
                {isShareOpen && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 pointer-events-auto z-30 animate-in fade-in zoom-in duration-300 flex items-center justify-center">
                    {/* පසුබිම Blur කර පෙන්වන ආවරණය (Backdrop Blur Layer) */}
                    <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md rounded-full shadow-2xl border border-white/20 dark:border-slate-800 -z-10"></div>

                    <div className="relative w-full h-full">
                      {/* WhatsApp (ඉහළින්) */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute left-1/2 top-3 -translate-x-1/2 bg-white dark:bg-slate-900 text-emerald-500 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </a>

                      {/* LinkedIn (වමෙන් ඉහළ) */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute left-5 top-14 bg-white dark:bg-slate-900 text-blue-600 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center"
                        title="Share on LinkedIn"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>

                      {/* Twitter / X (වමෙන් පහළ) */}
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute left-5 bottom-12 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center"
                        title="Share on X"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>

                      {/* Email Share (දකුණෙන් ඉහළ) */}
                      <a
                        href={`mailto:?subject=Check out this platform&body=${encodeURIComponent(currentUrl)}`}
                        className="absolute right-5 top-14 bg-white dark:bg-slate-900 text-rose-500 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center"
                        title="Share via Email"
                      >
                        <Mail size={18} />
                      </a>

                      {/* Copy Link (දකුණෙන් පහළ) */}
                      <button
                        onClick={handleCopyLink}
                        className="absolute right-5 bottom-12 bg-white dark:bg-slate-900 text-teal-500 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center"
                        title="Copy Link"
                      >
                        {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Links Display Area */}
            {socialLinks.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-3 relative">
                {socialLinks.map((social: { platform: string; url: string }, index: number) => (
                  social.url && (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 p-2.5 rounded-full transition-all shadow-sm hover:scale-110 flex items-center justify-center cursor-pointer"
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  )
                ))}
              </div>
            )}
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