"use client";

import { Search, Loader2, Megaphone, Clock, Link as LinkIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

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
  return (
    <div className="py-12 mt-8" ref={announcementsRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
         <div>
           <div className="inline-block bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs mb-3 shadow-sm">
             Announcements & Promotions
           </div>
           <div className="flex items-center gap-3">
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Explore Latest Updates</h2>
             
             {filteredAds.length > (isMobile ? 1 : 3) && (
               <div className="flex items-center gap-1.5 ml-2">
                 <button
                   onClick={handlePrevAnnouncements}
                   disabled={announcementPage === 0}
                   className={`p-2 rounded-full shadow-md transition-all flex items-center justify-center ${
                     announcementPage === 0 
                       ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50" 
                       : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer active:scale-95"
                   }`}
                   title="Previous Announcements"
                 >
                   <ChevronUp size={18} />
                 </button>
                 <button
                   onClick={handleNextAnnouncements}
                   disabled={announcementPage >= totalPages - 1}
                   className={`p-2 rounded-full shadow-md transition-all flex items-center justify-center ${
                     announcementPage >= totalPages - 1 
                       ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50" 
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
              className="w-full pl-6 pr-12 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full shadow-md group-hover:scale-105 transition-transform">
               <Search size={16} />
            </div>
          </div>
      </div>

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
        <div 
          className={`transition-all duration-500 transform ${
            fadeAnim ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className={`grid grid-cols-1 ${isMobile ? 'max-w-md mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-8`}>
            {displayedAds.map((ad) => {
              const validImages = ad.images && Array.isArray(ad.images) 
                ? ad.images.filter((img: string) => img && img.trim() !== "") 
                : [];
              const currentImageIndex = imageIndexes[ad._id] || 0;

              return (
                <div key={ad._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  
                  <div className="w-full h-60 relative bg-slate-900 overflow-hidden flex items-center justify-center">
                    {((ad.mediaType as string) === "video" || ad.mediaType === "both") && ad.video ? (
                      <video controls className="w-full h-full object-contain bg-black" src={getMediaUrl(ad.video)} />
                    ) : null}

                    {((ad.mediaType as string) === "image" || ad.mediaType === "both") && validImages.length > 0 && (ad.mediaType as string) !== "video" ? (
                      <div className={`w-full h-full relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${ad.mediaType === "both" && ad.video ? "absolute inset-0 bg-slate-900/90 hidden group-hover:flex transition-all" : ""}`}>
                        <img src={getMediaUrl(validImages[currentImageIndex])} alt={ad.headline} className="w-full h-full object-contain" />

                        {validImages.length > 1 && (
                          <>
                            <button onClick={() => prevImage(ad._id, validImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10 cursor-pointer"><ChevronLeft size={18} /></button>
                            <button onClick={() => nextImage(ad._id, validImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10 cursor-pointer"><ChevronRight size={18} /></button>
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
                          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00CBB8]/10 text-[#00CBB8] hover:bg-[#00CBB8] hover:text-white transition-all shadow-sm">
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
        </div>
      )}

      {filteredAds.length > (isMobile ? 1 : 3) && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={handlePrevAnnouncements}
            disabled={announcementPage === 0}
            className={`p-3 rounded-full shadow-md transition-all flex items-center justify-center ${
              announcementPage === 0 
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50" 
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer active:scale-95"
            }`}
            title="Previous Announcements"
          >
            <ChevronUp size={20} />
          </button>
          
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {announcementPage + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextAnnouncements}
            disabled={announcementPage >= totalPages - 1}
            className={`p-3 rounded-full shadow-md transition-all flex items-center justify-center ${
              announcementPage >= totalPages - 1 
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50" 
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer active:scale-95"
            }`}
            title="Next Announcements"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      )}
    </div>
  );
}