"use client";

import { CheckCircle, Share2, ChevronRight, MessageCircle, Mail, Copy, X, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import HeroCarousel from "@/app/components/HeroCarousel";

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
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-20 relative">
      <div className="flex-1 space-y-6 z-20 mt-4 lg:mt-0 lg:max-w-xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-sm">
            {heroBadge}
          </div>

          {badgeAvatars.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {badgeAvatars.map((av: any, i: number) => (
                  av.image && (
                    <img 
                      key={i} 
                      src={getMediaUrl(av.image)} 
                      alt="Student" 
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" 
                    />
                  )
                ))}
              </div>
              {badgeText && (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {badgeText}
                </span>
              )}
            </div>
          )}
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-[1.1] tracking-tight">
          <span style={{ color: titleColor1 }}>{heroTitleLine1}</span> <br className="hidden sm:block" />
          <span style={{ color: titleColor2 }}>{heroTitleLine2}</span> <br className="hidden sm:block" />
          <span style={{ color: highlightColor }}>{heroTitleHighlight}</span>
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
          
          <div className="relative inline-block">
            <button
              onClick={() => setIsShareOpen(!isShareOpen)}
              title="Share Website"
              className="bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-full transition-all shadow-xl hover:scale-110 flex items-center justify-center cursor-pointer active:scale-95 z-50 relative"
            >
              {isShareOpen ? <X size={20} /> : <Share2 size={20} />}
            </button>

            {isShareOpen && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 pointer-events-auto z-40 animate-in fade-in zoom-in duration-300 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md rounded-full shadow-2xl border border-white/30 dark:border-slate-800 -z-10"></div>
                <div className="relative w-full h-full">
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-1/2 top-3 -translate-x-1/2 bg-white dark:bg-slate-900 text-emerald-500 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                    <MessageCircle size={18} />
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-5 top-14 bg-white dark:bg-slate-900 text-blue-600 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-5 bottom-12 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href={`mailto:?subject=Check out this platform&body=${encodeURIComponent(currentUrl)}`} className="absolute right-5 top-14 bg-white dark:bg-slate-900 text-rose-500 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                    <Mail size={18} />
                  </a>
                  <button onClick={handleCopyLink} className="absolute right-5 bottom-12 bg-white dark:bg-slate-900 text-teal-500 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-3 relative">
            {socialLinks.map((social: { platform: string; url: string }, index: number) => (
              social.url && (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" title={social.platform} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 p-2.5 rounded-full transition-all shadow-sm hover:scale-110 flex items-center justify-center cursor-pointer">
                  {getSocialIcon(social.platform)}
                </a>
              )
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative flex justify-center lg:justify-end items-center w-full max-w-md lg:max-w-none h-[400px] sm:h-[500px] lg:h-[600px] mt-10 lg:mt-0">
        <div className="absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[#00CBB8]/20 rounded-bl-[150px] rounded-tr-[120px] rounded-tl-[40px] rounded-br-[40px] rotate-[15deg] -z-10 right-[-20px] lg:right-[-50px] top-1/2 -translate-y-1/2 opacity-90"></div>
        <div className="absolute w-40 sm:w-64 h-40 sm:h-64 bg-orange-500/20 rounded-[40px] rotate-45 -z-20 right-[-40px] lg:right-[-80px] top-1/4 opacity-80"></div>
        
        <div className="relative z-10 w-full h-full flex justify-center lg:justify-end items-end">
          <HeroCarousel items={currentHeroImages} baseWidth={600} autoplay={true} autoplayDelay={5000} pauseOnHover={true} loop={true} />
        </div>

        <div className="absolute top-16 left-4 sm:left-10 lg:left-0 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center animate-[bounce_4s_infinite] z-30">
           <CheckCircle className="text-yellow-400" size={28} fill="currentColor" />
        </div>
        <div className="absolute bottom-20 right-4 lg:right-10 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl flex items-center justify-center z-30 border border-slate-100 dark:border-slate-700">
           <span className="text-xs font-bold text-slate-700 dark:text-slate-200">⭐ 5.0 Rating</span>
        </div>
      </div>
    </div>
  );
}