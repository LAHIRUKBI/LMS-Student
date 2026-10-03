"use client";

import { useState } from "react";
import { Search, Loader2, Megaphone, Clock, Link as LinkIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Share2, MessageCircle, Mail, Copy, CheckCircle } from "lucide-react";

interface AnnouncementsSectionProps {
  search: string;
  setSearch: (val: string) => void;
  setAnnouncementPage: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  filteredAds: any[];
  fadeAnim: boolean;
  isMobile: boolean;
  announcementsRef: React.RefObject<HTMLDivElement | null>;
  announcementPage: number;
  totalPages: number;
  displayedAds: any[];
  imageIndexes: Record<string, number>;
  prevImage: (adId: string, max: number) => void;
  nextImage: (adId: string, max: number) => void;
  handlePrevAnnouncements: () => void;
  handleNextAnnouncements: () => void;
  getMediaUrl: (path: string) => string;
}

export default function AnnouncementsSection({
  search,
  setSearch,
  setAnnouncementPage,
  loading,
  filteredAds,
  fadeAnim,
  isMobile,
  announcementsRef,
  announcementPage,
  totalPages,
  displayedAds,
  imageIndexes,
  prevImage,
  nextImage,
  handlePrevAnnouncements,
  handleNextAnnouncements,
  getMediaUrl,
}: AnnouncementsSectionProps) {
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);
  const [shareOpenAdId, setShareOpenAdId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 🌟 ආරක්ෂිතව filteredAds පරීක්ෂා කිරීම (Undefined දෝෂය වැළැක්වීමට)
  const selectedAd = (filteredAds || []).find((ad) => ad._id === expandedAdId);

  return (
    <div className="py-12 mt-8 w-full max-w-full mx-auto" ref={announcementsRef}>
      {/* 🌟 ප්‍රධාන වීදුරු ග්ලාස් පසුබිම */}
      <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-slate-700/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] p-6 sm:p-12 relative">
        
        {/* Header & Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
           <div>
             <div className="inline-block bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/30 dark:border-slate-700/40 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs mb-3 shadow-sm">
               Announcements & Promotions
             </div>
             <div className="flex items-center gap-3">
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Explore Latest Updates</h2>
               
               {filteredAds && filteredAds.length > (isMobile ? 1 : 3) && (
                 <div className="flex items-center gap-1.5 ml-2">
                   <button
                     onClick={handlePrevAnnouncements}
                     disabled={announcementPage === 0}
                     className={`p-2 rounded-full shadow-md transition-all flex items-center justify-center backdrop-blur-md ${
                       announcementPage === 0 
                         ? "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50" 
                         : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer active:scale-95"
                     }`}
                     title="Previous Announcements"
                   >
                     <ChevronUp size={18} />
                   </button>
                   <button
                     onClick={handleNextAnnouncements}
                     disabled={announcementPage >= totalPages - 1}
                     className={`p-2 rounded-full shadow-md transition-all flex items-center justify-center backdrop-blur-md ${
                       announcementPage >= totalPages - 1 
                         ? "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50" 
                         : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer active:scale-95"
                     }`}
                     title="Next Announcements"
                   >
                     <ChevronDown size={18} />
                   </button>
                 </div>
               )}
             </div>
           </div>
          
           <div className="relative w-full md:w-80 lg:w-96 group">
             <input 
               type="text" 
               placeholder="Search announcements..." 
               value={search}
               onChange={(e) => {
                 setSearch(e.target.value);
                 setAnnouncementPage(0);
               }}
               className="w-full pl-6 pr-12 py-3.5 rounded-full border border-white/40 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
             />
             <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full shadow-md group-hover:scale-105 transition-transform">
                <Search size={16} />
             </div>
           </div>
        </div>

        {/* Content Loading / Empty / Display Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-inner">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading announcements...</p>
          </div>
        ) : (!filteredAds || filteredAds.length === 0) ? (
          <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4 shadow-inner">
            <div className="bg-white/50 dark:bg-slate-800/50 p-5 rounded-full mb-5 backdrop-blur-md">
              <Megaphone size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No announcements found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">There are no active announcements matching your search right now.</p>
          </div>
        ) : (
          <div 
            className={`transition-all duration-500 transform ${
              fadeAnim ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className={`grid grid-cols-1 ${isMobile ? 'max-w-md mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-8`}>
              {displayedAds && displayedAds.map((ad) => {
                const validImages = ad.images && Array.isArray(ad.images) 
                  ? ad.images.filter((img: string) => img && img.trim() !== "") 
                  : [];
                const currentImageIndex = imageIndexes[ad._id] || 0;
                const isThisExpanded = expandedAdId === ad._id;
                const isShareActive = shareOpenAdId === ad._id;

                return (
                  <div key={ad._id} className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[32px] border border-white/40 dark:border-slate-700/40 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 p-3 group flex flex-col h-full">
                    
                    {/* Media / Image Container */}
                    <div className="relative w-full h-[240px] bg-slate-100 dark:bg-slate-800 rounded-[24px] overflow-hidden flex items-center justify-center">
                      {((ad.mediaType as string) === "video" || ad.mediaType === "both") && ad.video ? (
                        <video controls className="w-full h-full object-contain bg-black/40" src={getMediaUrl(ad.video)} />
                      ) : null}

                      {((ad.mediaType as string) === "image" || ad.mediaType === "both") && validImages.length > 0 && (ad.mediaType as string) !== "video" ? (
                        <div className={`w-full h-full relative flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 ${ad.mediaType === "both" && ad.video ? "absolute inset-0 bg-slate-900/90 hidden group-hover:flex transition-all" : ""}`}>
                          <img src={getMediaUrl(validImages[currentImageIndex])} alt={ad.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />

                          {validImages.length > 1 && (
                            <>
                              <button onClick={() => prevImage(ad._id, validImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-md z-10 cursor-pointer"><ChevronLeft size={16} /></button>
                              <button onClick={() => nextImage(ad._id, validImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-md z-10 cursor-pointer"><ChevronRight size={16} /></button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 tracking-wider">
                                {currentImageIndex + 1} / {validImages.length}
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      {(!ad.video && validImages.length === 0) && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/10 to-teal-500/10 text-slate-400 backdrop-blur-sm">
                          <Megaphone size={40} className="mb-2 text-orange-500 opacity-80" />
                          <span className="text-xs font-bold uppercase tracking-wider">Announcement</span>
                        </div>
                      )}

                      {/* Share Button & Popup */}
                      <div className="absolute top-3 right-3 z-30">
                        <button
                          onClick={() => setShareOpenAdId(isShareActive ? null : ad._id)}
                          title="Share"
                          className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full transition-all shadow-lg hover:scale-110 flex items-center justify-center cursor-pointer active:scale-95"
                        >
                          {isShareActive ? <X size={15} /> : <Share2 size={15} />}
                        </button>

                        {isShareActive && (
                          <div className="absolute right-0 top-12 w-48 h-48 pointer-events-auto z-40 animate-in fade-in zoom-in duration-300 flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/95 backdrop-blur-md rounded-full shadow-2xl border border-white/30 dark:border-slate-800 -z-10"></div>
                            <div className="relative w-full h-full">
                              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-1/2 top-2.5 -translate-x-1/2 bg-white dark:bg-slate-900 text-emerald-500 p-2.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                                <MessageCircle size={15} />
                              </a>
                              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-3 top-11 bg-white dark:bg-slate-900 text-blue-600 p-2.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                              </a>
                              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="absolute left-3 bottom-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-2.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </a>
                              <a href={`mailto:?subject=Check out this announcement&body=${encodeURIComponent(currentUrl)}`} className="absolute right-3 top-11 bg-white dark:bg-slate-900 text-rose-500 p-2.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                                <Mail size={15} />
                              </a>
                              <button onClick={handleCopyLink} className="absolute right-3 bottom-10 bg-white dark:bg-slate-900 text-teal-500 p-2.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-125 transition-all flex items-center justify-center">
                                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inward corner mask for button alignment */}
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-tl-[28px] pointer-events-none z-10" />

                      {/* View Button */}
                      <button
                        onClick={() => setExpandedAdId(ad._id)}
                        className="absolute right-3 bottom-3 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-20 cursor-pointer"
                        title="View Full Announcement"
                      >
                        <ChevronRight size={22} className="transition-transform duration-500 group-hover:rotate-90" />
                      </button>
                    </div>

                    {/* Card Footer Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {ad.headline}
                      </h3>
                      
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {ad.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination controls */}
        {filteredAds && filteredAds.length > (isMobile ? 1 : 3) && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={handlePrevAnnouncements}
              disabled={announcementPage === 0}
              className={`p-3 rounded-full shadow-md transition-all flex items-center justify-center backdrop-blur-md ${
                announcementPage === 0 
                  ? "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50" 
                  : "bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer active:scale-95"
              }`}
              title="Previous Announcements"
            >
              <ChevronUp size={20} />
            </button>
            
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/30 dark:border-slate-700/40">
              {announcementPage + 1} / {totalPages}
            </span>

            <button
              onClick={handleNextAnnouncements}
              disabled={announcementPage >= totalPages - 1}
              className={`p-3 rounded-full shadow-md transition-all flex items-center justify-center backdrop-blur-md ${
                announcementPage >= totalPages - 1 
                  ? "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50" 
                  : "bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer active:scale-95"
              }`}
              title="Next Announcements"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        )}

        {/* Compact & Cute Frosted Glass Popup Modal */}
        {expandedAdId && selectedAd && (
          <div 
            onClick={() => setExpandedAdId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col p-5 animate-modalIn"
            >
              {/* Header & Close Button */}
              <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(selectedAd.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedAdId(null)}
                  className="p-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-orange-500 hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-sm"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-3">
                
                {selectedAd.images && selectedAd.images.length > 0 && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-900/90 relative shadow-inner">
                    <img 
                      src={getMediaUrl(selectedAd.images[0])} 
                      alt={selectedAd.headline} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {selectedAd.headline}
                  </h3>

                  <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-3 rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-inner max-h-40 overflow-y-auto custom-scrollbar">
                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedAd.description}
                    </p>
                  </div>
                </div>

                {selectedAd.links && selectedAd.links.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAd.links.map((link: any, idx: number) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#00CBB8]/15 text-[#00CBB8] hover:bg-[#00CBB8] hover:text-white transition-all shadow-sm backdrop-blur-md border border-[#00CBB8]/30"
                        >
                          <LinkIcon size={12} /> {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex justify-end">
                <button
                  onClick={() => setExpandedAdId(null)}
                  className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}