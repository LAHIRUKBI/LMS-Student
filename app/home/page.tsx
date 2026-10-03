"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { GraduationCap, Video, Award, Users, Globe, Star } from "lucide-react";
import Navbar from "@/app/components/Navbar";

// Imported Components
import HeroSection from "@/app/components/HeroSection";
import FeaturesSection from "@/app/components/FeaturesSection";
import AnnouncementsSection from "@/app/components/AnnouncementsSection";
import TestimonialsSection from "@/app/components/TestimonialsSection";
import GallerySection from "@/app/components/GallerySection";
import AIChatWidget from "@/app/components/AIChatWidget";

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

const fallbackGalleryItems = [
  { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop", label: "Student 1", description: "Default student description 1" },
  { image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=600&fit=crop", label: "Student 2", description: "Default student description 2" },
  { image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop", label: "Online Class", description: "Default online class description" },
  { image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=600&fit=crop", label: "Student 3", description: "Default student description 3" },
  { image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=600&fit=crop", label: "Student 4", description: "Default student description 4" },
];

const fallbackHeroImages = [
  { id: 1, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=faces", title: "Student 1" },
  { id: 2, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=faces", title: "Student 2" },
  { id: 3, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&crop=faces", title: "Student 3" }
];

const fallbackFeatureItems = [
  {
    id: 1,
    title: "Expert-Led Courses",
    description: "Learn from industry experts with years of experience. Our curriculum is designed to be practical and up-to-date.",
    iconType: "icon",
    icon: <GraduationCap size={28} />
  },
  {
    id: 2,
    title: "Interactive Learning",
    description: "Engage with interactive videos, quizzes, and hands-on projects that make learning fun and effective.",
    iconType: "icon",
    icon: <Video size={28} />
  },
  {
    id: 3,
    title: "Certification",
    description: "Earn recognized certificates upon completion. Showcase your new skills to employers and advance your career.",
    iconType: "icon",
    icon: <Award size={28} />
  },
  {
    id: 4,
    title: "Community Support",
    description: "Join a vibrant community of learners and mentors. Get help when you need it and collaborate on projects.",
    iconType: "icon",
    icon: <Users size={28} />
  }
];

const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  
  if (p.includes("facebook")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  if (p.includes("youtube")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
  if (p.includes("instagram")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
  if (p.includes("tiktok")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>;
  if (p.includes("whatsapp")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
  if (p.includes("x") || p.includes("twitter")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  if (p.includes("linkedin")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
  if (p.includes("telegram")) return <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.535-.195 1.006.132.832.934z"/></svg>;
  
  return <Globe size={18} />;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dashboardSettings, setDashboardSettings] = useState<any>(null);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [announcementPage, setAnnouncementPage] = useState(0);
  const [fadeAnim, setFadeAnim] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const announcementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setToken(localToken);

    if (localToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    fetchActiveAds(localToken);
    fetchDashboardSettings();

    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", checkScreenSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [router]);

  const fetchActiveAds = async (authToken: string | null) => {
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await axios.get("http://localhost:5000/api/ads/active", { headers });
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

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const displayedAds = filteredAds.slice(announcementPage * itemsPerPage, (announcementPage + 1) * itemsPerPage);

  const handleNextAnnouncements = () => {
    if (announcementPage < totalPages - 1) {
      setFadeAnim(false);
      setTimeout(() => {
        setAnnouncementPage(prev => prev + 1);
        setFadeAnim(true);
      }, 300);
    }
  };

  const handlePrevAnnouncements = () => {
    if (announcementPage > 0) {
      setFadeAnim(false);
      setTimeout(() => {
        setAnnouncementPage(prev => prev - 1);
        setFadeAnim(true);
      }, 300);
    }
  };

  const heroBadge = dashboardSettings?.heroBadge || "eLearning Platform";
  const titleColor1 = isDarkMode ? (dashboardSettings?.darkTitleColor1 || "#ffffff") : (dashboardSettings?.titleColor1 || "#0f172a");
  const titleColor2 = isDarkMode ? (dashboardSettings?.darkTitleColor2 || "#ffffff") : (dashboardSettings?.titleColor2 || "#0f172a");
  const highlightColor = isDarkMode ? (dashboardSettings?.darkHighlightColor || "#fb923c") : (dashboardSettings?.highlightColor || "#f97316");

  const heroTitleLine1 = dashboardSettings?.heroTitleLine1 || "Smart Learning";
  const heroTitleLine2 = dashboardSettings?.heroTitleLine2 || "Deeper & More";
  const heroTitleHighlight = dashboardSettings?.heroTitleHighlight || "-Amazing";
  const heroDescription = dashboardSettings?.heroDescription || "Phosfluorescently deploy unique intellectual capital without enterprise- after bricks & clicks synergy. Enthusiastically revolutionize intuitive.";
  const primaryBtnText = dashboardSettings?.primaryBtnText || "Start Free Trial";
  const socialLinks = dashboardSettings?.socialLinks || [];
  const testimonials = dashboardSettings?.testimonials || [];
  const badgeText = dashboardSettings?.badgeText || "+3000 students worldwide";
  const badgeAvatars = dashboardSettings?.badgeAvatars || [];

  const currentHeroImages = dashboardSettings?.heroImages?.length > 0 
    ? dashboardSettings.heroImages.map((item: any) => ({ ...item, image: getMediaUrl(item.image) }))
    : fallbackHeroImages;

  const galleryDescription = dashboardSettings?.galleryDescription || "";
  const currentGalleryItems = dashboardSettings?.galleryItems?.length > 0 
    ? dashboardSettings.galleryItems.map((item: any) => ({ 
        ...item, 
        image: getMediaUrl(item.image), 
        label: item.text || item.label,
        description: item.description || "" 
      }))
    : fallbackGalleryItems;

  const heroStatsBadge = dashboardSettings?.heroStatsBadge || "About Us";
  const heroStatsTitle = dashboardSettings?.heroStatsTitle || "We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education. Our mission offering a diverse range of courses.";
  const heroStatsList = dashboardSettings?.heroStatsList?.length > 0 
    ? dashboardSettings.heroStatsList 
    : [
        { value: "25+", label: "Years of eLearning Education Experience" },
        { value: "56k", label: "Students Enrolled in LMSZONE Courses" },
        { value: "170+", label: "Experienced Teacher's service." }
      ];  

  const featureBadge = dashboardSettings?.featureBadge || "Why Choose Us";
  const featureTitleLine1 = dashboardSettings?.featureTitleLine1 || "Everything you need to";
  const featureTitleHighlight = dashboardSettings?.featureTitleHighlight || "excel";
  const featureDescription = dashboardSettings?.featureDescription || "We provide a comprehensive learning environment designed to help you achieve your goals. Our platform combines expert-led content with cutting-edge technology.";
  
  const currentFeatureItems = dashboardSettings?.featureItems?.length > 0
    ? dashboardSettings.featureItems.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        description: item.description,
        iconType: item.iconType || "image",
        iconImage: item.iconImage ? getMediaUrl(item.iconImage) : null,
        icon: <Star size={28} />
      }))
    : fallbackFeatureItems;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const nextTestimonials = () => {
    if (testimonials.length <= 2) return;
    setTestimonialIndex((prev) => (prev + 2 >= testimonials.length ? 0 : prev + 2));
  };

  const prevTestimonials = () => {
    if (testimonials.length <= 2) return;
    setTestimonialIndex((prev) => (prev - 2 < 0 ? Math.max(0, testimonials.length - (testimonials.length % 2 === 0 ? 2 : 1)) : prev - 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F1] to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500 relative font-sans overflow-x-hidden">
      
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16">
        
        {/* 1. Hero Section */}
        <HeroSection
          heroBadge={heroBadge}
          badgeAvatars={badgeAvatars}
          badgeText={badgeText}
          titleColor1={titleColor1}
          titleColor2={titleColor2}
          highlightColor={highlightColor}
          heroTitleLine1={heroTitleLine1}
          heroTitleLine2={heroTitleLine2}
          heroTitleHighlight={heroTitleHighlight}
          heroDescription={heroDescription}
          primaryBtnText={primaryBtnText}
          socialLinks={socialLinks}
          currentHeroImages={currentHeroImages}
          isShareOpen={isShareOpen}
          setIsShareOpen={setIsShareOpen}
          currentUrl={currentUrl}
          copied={copied}
          handleCopyLink={handleCopyLink}
          getMediaUrl={getMediaUrl}
          getSocialIcon={getSocialIcon}
          heroStatsBadge={heroStatsBadge}
          heroStatsTitle={heroStatsTitle}
          heroStatsList={heroStatsList}
        />

        {/* 2. Second Section (Features) */}
        <FeaturesSection
          featureBadge={featureBadge}
          featureTitleLine1={featureTitleLine1}
          featureTitleHighlight={featureTitleHighlight}
          featureDescription={featureDescription}
          currentFeatureItems={currentFeatureItems}
        />

        {/* 3. Announcements */}
        <AnnouncementsSection
          search={search}
          setSearch={setSearch}
          setAnnouncementPage={setAnnouncementPage}
          loading={loading}
          filteredAds={filteredAds}
          fadeAnim={fadeAnim}
          isMobile={isMobile}
          announcementsRef={announcementsRef}
          announcementPage={announcementPage}
          totalPages={totalPages}
          displayedAds={displayedAds}
          imageIndexes={imageIndexes}
          prevImage={prevImage}
          nextImage={nextImage}
          handlePrevAnnouncements={handlePrevAnnouncements}
          handleNextAnnouncements={handleNextAnnouncements}
          getMediaUrl={getMediaUrl}
        />

        {/* 4. Testimonials Section */}
        <TestimonialsSection
          testimonials={testimonials}
          testimonialIndex={testimonialIndex}
          prevTestimonials={prevTestimonials}
          nextTestimonials={nextTestimonials}
          dashboardSettings={dashboardSettings}
          getMediaUrl={getMediaUrl}
        />

        {/* 5. Gallery Section */}
        <GallerySection
          galleryDescription={galleryDescription}
          currentGalleryItems={currentGalleryItems}
        />

      </main>
      <AIChatWidget />
    </div>
  );
}