"use client";

import { CheckCircle, Share2, ChevronRight, MessageCircle, Mail, Copy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import HeroCarousel from "@/app/components/HeroCarousel";
import CountUp from "@/app/components/CountUp";

interface HeroSectionProps {
  heroBadge: string;
  badgeAvatars: any[];
  badgeText: string;
  titleColor1: string;
  titleColor2: string;
  highlightColor: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleHighlight: string;
  heroDescription: string;
  primaryBtnText: string;
  socialLinks: any[];
  currentHeroImages: any[];
  isShareOpen: boolean;
  setIsShareOpen: (val: boolean) => void;
  currentUrl: string;
  copied: boolean;
  handleCopyLink: () => void;
  getMediaUrl: (path: string) => string;
  getSocialIcon: (platform: string) => React.ReactNode;
  // Stats props
  heroStatsBadge?: string;
  heroStatsTitle?: string;
  heroStatsDescription?: string;
  heroStatsList?: any[];
}

export default function HeroSection({
  heroBadge,
  badgeAvatars,
  badgeText,
  titleColor1,
  titleColor2,
  highlightColor,
  heroTitleLine1,
  heroTitleLine2,
  heroTitleHighlight,
  heroDescription,
  primaryBtnText,
  socialLinks,
  currentHeroImages,
  isShareOpen,
  setIsShareOpen,
  currentUrl,
  copied,
  handleCopyLink,
  getMediaUrl,
  getSocialIcon,
  heroStatsBadge = "About Us",
  heroStatsTitle = "We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education. Our mission offering a diverse range of courses.",
  heroStatsList = [
    { value: "25+", label: "Years of eLearning Education Experience" },
    { value: "56k", label: "Students Enrolled in LMSZONE Courses" },
    { value: "170+", label: "Experienced Teacher's service." }
  ],
}: HeroSectionProps) {
  const router = useRouter();

  const parseStatValue = (val: string) => {
    if (!val) return { numericVal: 0, prefix: "", suffix: "" };
    
    let multiplier = 1;
    let cleanVal = val.trim();
    
    if (cleanVal.toLowerCase().includes('k')) {
      multiplier = 1000;
      cleanVal = cleanVal.replace(/k/gi, '');
    }

    const match = cleanVal.match(/(\d+)/);
    if (!match) return { numericVal: 0, prefix: "", suffix: val };

    const numericVal = parseInt(match[1], 10) * multiplier;
    const fullMatchStr = match[1];
    const index = cleanVal.indexOf(fullMatchStr);
    
    const prefix = cleanVal.substring(0, index);
    const suffix = cleanVal.substring(index + fullMatchStr.length) + (multiplier === 1000 ? 'k' : '');

    return { numericVal, prefix, suffix };
  };

  return (
    <div className="flex flex-col mb-24 relative overflow-hidden py-1">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative">
        
        {/* Background Glow Elements */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Left Content Section */}
        <div className="flex-1 space-y-8 z-20 mt-4 lg:mt-0 lg:max-w-xl">
          
          {/* Badge & Social Proof Row */}
          <div className="flex flex-wrap items-center gap-3">
            {heroBadge && (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 text-orange-600 dark:text-orange-400 font-semibold px-4 py-2 rounded-full text-xs tracking-wide border border-orange-500/20 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                {heroBadge}
              </div>
            )}

            {badgeAvatars.length > 0 && (
              <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex -space-x-2 overflow-hidden">
                  {badgeAvatars.map((av: any, i: number) => (
                    av.image && (
                      <img 
                        key={i} 
                        src={getMediaUrl(av.image)} 
                        alt="Student" 
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover shadow-sm" 
                      />
                    )
                  ))}
                </div>
                {badgeText && (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {badgeText}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Main Title with Typography Enhancement */}
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.12] tracking-tight">
            <span style={{ color: titleColor1 }} className="drop-shadow-sm">{heroTitleLine1}</span> <br className="hidden sm:block" />
            <span style={{ color: titleColor2 }} className="drop-shadow-sm">{heroTitleLine2}</span> <br className="hidden sm:block" />
            <span style={{ color: highlightColor }} className="relative inline-block mt-1">
              {heroTitleHighlight}
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 max-w-lg text-base sm:text-lg leading-relaxed font-normal">
            {heroDescription}
          </p>
          
          {/* CTA Buttons & Share Popover */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={() => router.push("/class/class_view")}
              className="group bg-gradient-to-r from-[#00CBB8] to-[#00b5a3] hover:from-[#00b5a3] hover:to-[#009e8f] text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3 cursor-pointer text-base"
            >
              <span>{primaryBtnText}</span> 
              <span className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                <ChevronRight size={16} />
              </span>
            </button>
            
            <div className="relative inline-block">
              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                title="Share Website"
                className="bg-white dark:bg-slate-800 hover:bg-orange-500 dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 hover:text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-orange-500/25 border border-slate-200/80 dark:border-slate-700 hover:border-orange-500 hover:scale-105 flex items-center justify-center cursor-pointer active:scale-95 z-50 relative"
              >
                {isShareOpen ? <X size={20} /> : <Share2 size={20} />}
              </button>

              {/* Redesigned Circular Share Popover */}
              {isShareOpen && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-auto z-40 animate-in fade-in zoom-in-95 duration-200 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-slate-200/80 dark:border-slate-700 -z-10"></div>
                  <div className="relative w-full h-full">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-1/2 top-4 -translate-x-1/2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 p-3.5 rounded-full shadow-md hover:scale-125 transition-all flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <MessageCircle size={18} />
                    </a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-6 top-16 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 p-3.5 rounded-full shadow-md hover:scale-125 transition-all flex items-center justify-center border border-blue-200 dark:border-blue-800">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-6 bottom-14 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 p-3.5 rounded-full shadow-md hover:scale-125 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href={`mailto:?subject=Check out this platform&body=${encodeURIComponent(currentUrl)}`} className="absolute right-6 top-16 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 p-3.5 rounded-full shadow-md hover:scale-125 transition-all flex items-center justify-center border border-rose-200 dark:border-rose-800">
                      <Mail size={18} />
                    </a>
                    <button onClick={handleCopyLink} className="absolute right-6 bottom-14 bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 p-3.5 rounded-full shadow-md hover:scale-125 transition-all flex items-center justify-center border border-teal-200 dark:border-teal-800">
                      {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links Row */}
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
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 p-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center cursor-pointer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
              ))}
            </div>
          )}
        </div>

        {/* Right Carousel & Floating Badges Section */}
        <div className="flex-1 relative flex justify-center lg:justify-end items-center w-full max-w-md lg:max-w-none h-[420px] sm:h-[520px] lg:h-[620px] mt-8 lg:mt-0">
          
          {/* Modern Glassmorphic Backdrop Shapes */}
          <div className="absolute w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] bg-gradient-to-tr from-[#00CBB8]/25 to-teal-400/10 rounded-[40px] rotate-[12deg] -z-10 right-[-10px] lg:right-[-30px] top-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-[30px] rotate-45 -z-20 right-[-30px] lg:right-[-60px] top-1/4 blur-xl"></div>
          
          {/* Carousel Container with Glass Frame */}
          <div className="relative z-10 w-full h-full flex justify-center lg:justify-end items-end p-2 sm:p-4">
            <div className="relative w-full rounded-3xl p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-2xl">
              <HeroCarousel items={currentHeroImages} baseWidth={600} autoplay={true} autoplayDelay={5000} pauseOnHover={true} loop={true} />
            </div>
          </div>

          {/* Floating Verified / Success Badge */}
          <div className="absolute top-10 left-2 sm:left-6 lg:left-[-20px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-[bounce_4s_infinite] z-30 border border-white/50 dark:border-slate-700">
             <div className="bg-yellow-400/20 p-2 rounded-xl">
               <CheckCircle className="text-yellow-500" size={24} fill="currentColor" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Quality</p>
               <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">100% Trusted</p>
             </div>
          </div>
        </div>
      </div>

      {/* ================= About us section with count up ================= */}
      <div className="mt-20 pt-12 border-t border-slate-200/60 dark:border-slate-800/80 text-center max-w-6xl mx-auto w-full px-4">
        {heroStatsBadge && (
          <div className="inline-block bg-[#00CBB8]/10 text-[#00CBB8] dark:bg-[#00CBB8]/20 dark:text-[#00CBB8] font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-6">
            {heroStatsBadge}
          </div>
        )}

        {heroStatsTitle && (
          <p className="text-slate-700 dark:text-slate-300 text-lg sm:text-xl font-medium leading-relaxed max-w-5xl mx-auto mb-12">
            {heroStatsTitle}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-center">
          {heroStatsList?.map((stat: any, index: number) => {
            const { numericVal, prefix, suffix } = parseStatValue(stat.value);

            return (
              <div key={index} className="flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center mb-2">
                  {prefix}
                  <CountUp from={0} to={numericVal} duration={2.5} separator="," />
                  {suffix}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-[220px] leading-relaxed">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}