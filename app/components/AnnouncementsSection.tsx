"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Megaphone,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  MessageCircle,
  Mail,
  Copy,
  CheckCircle,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

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
  const [mobileAdExiting, setMobileAdExiting] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // On mobile, a horizontal swipe moves to the previous/next announcement page.
  const handleCarouselTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (mobileAdExiting) {
      touchStartX.current = null;
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("button, a, video, input")) {
      touchStartX.current = null;
      return;
    }
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleCarouselTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (mobileAdExiting || touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (typeof endX === "number") {
      const deltaX = endX - touchStartX.current;
      if (Math.abs(deltaX) > 45) {
        if (deltaX < 0) handleNextAnnouncements();
        else handlePrevAnnouncements();
      }
    }
    touchStartX.current = null;
  };

  // On mobile, move to the next announcement only after its description has completed one full rise.
  // The final announcement loops back to the first one.
  const handleDescriptionAnimationIteration = () => {
    if (
      !isMobile ||
      !hasMultiplePages ||
      mobileAdExiting ||
      expandedAdId ||
      shareOpenAdId ||
      autoAdvanceTimeoutRef.current !== null
    ) {
      return;
    }

    setMobileAdExiting(true);
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      setAnnouncementPage((currentPage) =>
        currentPage >= totalPages - 1 ? 0 : currentPage + 1
      );
      setMobileAdExiting(false);
      autoAdvanceTimeoutRef.current = null;
    }, 260);
  };

  const visibleAds = (displayedAds || []).slice(0, isMobile ? 1 : 3);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Keep the original safe lookup so an unavailable announcement never breaks the section.
  const selectedAd = (filteredAds || []).find((ad) => ad._id === expandedAdId);
  const hasMultiplePages = filteredAds && filteredAds.length > (isMobile ? 1 : 3);

  const renderSharePanel = () => (
    <div className="absolute right-0 top-14 z-40 w-[min(250px,calc(100vw-3.5rem))] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold tracking-wide text-slate-900 dark:text-white">Share this update</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">Pass the news along</p>
        </div>
        <button
          type="button"
          onClick={() => setShareOpenAdId(null)}
          aria-label="Close share options"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5 text-xs font-bold text-emerald-600 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400"
        >
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/5 px-3 py-2.5 text-xs font-bold text-blue-600 transition hover:border-blue-500/40 hover:bg-blue-500/10 dark:text-blue-400"
        >
          <ExternalLink size={15} /> LinkedIn
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-500/5 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-400/40 hover:bg-slate-500/10 dark:text-slate-200"
        >
          <Share2 size={15} /> X / Twitter
        </a>
        <a
          href={`mailto:?subject=Check out this announcement&body=${encodeURIComponent(currentUrl)}`}
          className="flex items-center gap-2 rounded-xl border border-rose-500/15 bg-rose-500/5 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:border-rose-500/40 hover:bg-rose-500/10 dark:text-rose-400"
        >
          <Mail size={15} /> Email
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-400 dark:hover:text-slate-950"
        >
          {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
          {copied ? "Link copied" : "Copy page link"}
        </button>
      </div>
    </div>
  );

  const renderMedia = (ad: any, compact = false) => {
    const validImages = ad.images && Array.isArray(ad.images)
      ? ad.images.filter((img: string) => img && img.trim() !== "")
      : [];
    const currentImageIndex = imageIndexes[ad._id] || 0;

    return (
      <div className={`group/media relative isolate w-full overflow-hidden bg-slate-100 dark:bg-slate-900 ${compact ? "h-[150px] sm:h-[168px]" : "min-h-[260px] sm:min-h-[340px] lg:min-h-[410px]"}`}>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.02),rgba(15,23,42,0.16))]" />

        {((ad.mediaType as string) === "video" || ad.mediaType === "both") && ad.video ? (
          <video
            controls
            className="absolute inset-0 h-full w-full bg-black object-contain"
            src={getMediaUrl(ad.video)}
          />
        ) : null}

        {((ad.mediaType as string) === "image" || ad.mediaType === "both") && validImages.length > 0 && (ad.mediaType as string) !== "video" ? (
          <div className={`absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 ${ad.mediaType === "both" && ad.video ? "hidden group-hover/media:flex" : ""}`}>
            <img
              src={getMediaUrl(validImages[currentImageIndex])}
              alt={ad.headline}
              className="h-full w-full object-cover transition-transform duration-700 group-hover/media:scale-[1.035]"
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => prevImage(ad._id, validImages.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/55 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-orange-500"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => nextImage(ad._id, validImages.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/55 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-orange-500"
                >
                  <ChevronRight size={17} />
                </button>
                <div className="absolute bottom-3 left-3 z-20 rounded-full border border-white/20 bg-slate-950/65 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-white backdrop-blur-md">
                  {String(currentImageIndex + 1).padStart(2, "0")} <span className="mx-1 text-white/50">/</span> {String(validImages.length).padStart(2, "0")}
                </div>
              </>
            )}
          </div>
        ) : null}

        {!ad.video && validImages.length === 0 && (
          <div className={`flex h-full w-full flex-col items-center justify-center ${compact ? "min-h-[150px] sm:min-h-[168px]" : "min-h-[260px]"} bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.16),transparent_40%),linear-gradient(135deg,#f8fafc,#e2e8f0)] text-slate-500 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.16),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.14),transparent_40%),linear-gradient(135deg,#0f172a,#1e293b)] dark:text-slate-400`}>
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/70 bg-white/65 text-orange-500 shadow-lg shadow-orange-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <Megaphone size={27} strokeWidth={1.7} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.28em]">NovaSkill Bulletin</span>
            <span className="mt-1 text-xs font-medium opacity-65">An update worth knowing</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section ref={announcementsRef} className="relative isolate mt-6 w-full overflow-visible py-5 sm:mt-8 sm:py-7">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8">
        {/* Compact heading */}
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h2 className="text-2xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-3xl">Latest updates.</h2>
              <p className="pb-1 text-xs font-medium text-slate-500 dark:text-slate-400">News, opportunities and announcements from NovaSkill.</p>
            </div>
          </div>

        </div>

        {/* Small feed label */}
        <div className="mb-3 flex items-center justify-end border-y border-slate-200/80 py-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <span>{filteredAds ? filteredAds.length : 0} updates</span>
            {hasMultiplePages && <span className="text-slate-300 dark:text-slate-700">·</span>}
            {hasMultiplePages && <span>{announcementPage + 1} / {totalPages}</span>}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-5 py-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <Loader2 className="mb-3 animate-spin text-orange-500" size={28} />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Loading announcements...</p>
          </div>
        ) : (!filteredAds || filteredAds.length === 0) ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Megaphone size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">No announcements found</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">There are no active announcements matching your search right now.</p>
          </div>
        ) : (
          <div className={`transition-all duration-300 ${fadeAnim ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
            <div className="flex items-stretch gap-2 sm:gap-3">
              {/* Desktop previous arrow */}
              {hasMultiplePages && !isMobile && (
                <button
                  type="button"
                  onClick={handlePrevAnnouncements}
                  disabled={announcementPage === 0}
                  aria-label="Previous announcements"
                  title="Previous announcements"
                  className="hidden h-10 w-10 shrink-0 self-center items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-orange-300 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 md:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Mobile swipe + desktop 3-column carousel track */}
              <div
                className="min-w-0 flex-1 touch-pan-y rounded-[28px] border border-slate-200/90 bg-slate-100/70 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl dark:border-white/[0.12] dark:bg-white/[0.045] dark:shadow-[0_18px_48px_rgba(0,0,0,0.20)] sm:rounded-[32px] sm:p-5"
                onTouchStart={handleCarouselTouchStart}
                onTouchEnd={handleCarouselTouchEnd}
              >
                <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                  {visibleAds.map((ad) => {
                    const isShareActive = shareOpenAdId === ad._id;
                    return (
                      <article
                        key={ad._id}
                        className={`group relative z-0 flex min-w-0 flex-col rounded-[22px] border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.055)] transition-all duration-300 hover:z-20 hover:-translate-y-0.5 hover:border-orange-300/80 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-[0_8px_28px_rgba(0,0,0,0.16)] dark:hover:border-orange-500/40 ${isMobile ? "mobile-ad-enter" : ""} ${isMobile && mobileAdExiting ? "mobile-ad-exit" : ""}`}
                      >
                        <div className="relative">
                          <div className="overflow-hidden rounded-t-[21px]">
                            {renderMedia(ad, true)}
                          </div>
                          <div className="absolute right-3 top-3 z-30">
                            <button
                              type="button"
                              onClick={() => setShareOpenAdId(isShareActive ? null : ad._id)}
                              title="Share announcement"
                              aria-label={isShareActive ? "Close share options" : "Share announcement"}
                              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 shadow-lg backdrop-blur-xl transition active:scale-95 ${isShareActive ? "bg-orange-500 text-white" : "bg-slate-950/65 text-white hover:scale-105 hover:bg-orange-500"}`}
                            >
                              {isShareActive ? <X size={15} /> : <Share2 size={15} />}
                            </button>
                            {isShareActive && renderSharePanel()}
                          </div>
                          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950/35 to-transparent" />
                          <div className="pointer-events-none absolute bottom-2.5 left-3 z-20 rounded-full border border-white/20 bg-slate-950/45 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.17em] text-white backdrop-blur-md">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-300" />NovaSkill Bulletin
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                            <CalendarDays size={11} />
                            {new Date(ad.createdAt).toLocaleDateString()}
                            <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-orange-600 dark:text-orange-400">Update</span>
                          </div>
                          <h3 className="line-clamp-2 min-h-[2.7rem] text-base font-black leading-[1.3] tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-orange-500 dark:text-white">
                            {ad.headline}
                          </h3>
                          <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                            {ad.description ? (
                              <div
                                className="announcement-description-window"
                                tabIndex={0}
                                role="note"
                                aria-label={`Announcement description: ${ad.description}`}
                                title="Hover or focus to pause the moving description"
                              >
                                <div
                                  className={`announcement-description-track ${isMobile && hasMultiplePages ? "mobile-description-once" : ""}`}
                                  onAnimationEnd={handleDescriptionAnimationIteration}
                                >
                                  <p className="announcement-description-copy text-[12px] font-medium leading-[1.7] text-slate-700 dark:text-slate-200 sm:text-[13px]">
                                    {ad.description}
                                  </p>
                                  <p
                                    aria-hidden="true"
                                    className="announcement-description-copy text-[12px] font-medium leading-[1.7] text-slate-700 dark:text-slate-200 sm:text-[13px]"
                                  >
                                    {ad.description}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="min-h-[5.5rem] text-[12px] font-medium leading-[1.7] text-slate-400 dark:text-slate-500 sm:text-[13px]">
                                No description available.
                              </p>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                            <span className="truncate text-[9px] font-bold text-slate-400 dark:text-slate-500">From the NovaSkill team</span>
                            <button
                              type="button"
                              onClick={() => setExpandedAdId(ad._id)}
                              aria-label={`View announcement: ${ad.headline}`}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-extrabold text-white transition hover:bg-orange-500 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-orange-400"
                            >
                              View details <ArrowUpRight size={13} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Desktop next arrow */}
              {hasMultiplePages && !isMobile && (
                <button
                  type="button"
                  onClick={handleNextAnnouncements}
                  disabled={announcementPage >= totalPages - 1}
                  aria-label="Next announcements"
                  title="Next announcements"
                  className="hidden h-10 w-10 shrink-0 self-center items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:translate-x-0.5 hover:border-orange-300 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 md:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* A small swipe hint is only needed on touch-sized screens. */}
            {hasMultiplePages && isMobile && (
              <p className="mt-2 text-center text-[9px] font-semibold text-slate-400 dark:text-slate-500">Swipe left or right to explore more updates</p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .announcement-description-window {
          position: relative;
          height: 96px;
          overflow: hidden;
          outline: none;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%);
        }

        @media (min-width: 640px) {
          .announcement-description-window {
            height: 108px;
          }
        }

        .announcement-description-window:focus-visible {
          border-radius: 8px;
          outline: 2px solid rgba(249, 115, 22, 0.65);
          outline-offset: 3px;
        }

        .announcement-description-track {
          display: flex;
          flex-direction: column;
          animation: novaAnnouncementRise 16s linear infinite;
          will-change: transform;
        }

        /* On mobile, finish the description scroll once before moving to the next card. */
        .announcement-description-track.mobile-description-once {
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }

        .announcement-description-copy {
          box-sizing: border-box;
          display: flex;
          min-height: 96px;
          align-items: center;
          margin: 0;
          padding: 9px 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        @media (min-width: 640px) {
          .announcement-description-copy {
            min-height: 108px;
          }
        }

        .announcement-description-window:hover .announcement-description-track,
        .announcement-description-window:focus .announcement-description-track {
          animation-play-state: paused;
        }

        @keyframes novaAnnouncementRise {
          0%, 7% { transform: translate3d(0, 0, 0); }
          93%, 100% { transform: translate3d(0, -50%, 0); }
        }

        /* Mobile card transition: the old card exits left, then the next enters from the right. */
        .mobile-ad-enter {
          animation: novaMobileAdEnter 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity, filter;
        }

        .mobile-ad-exit {
          animation: novaMobileAdExit 260ms ease-in both;
          pointer-events: none;
        }

        @keyframes novaMobileAdEnter {
          from {
            opacity: 0;
            transform: translate3d(42px, 0, 0);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }

        @keyframes novaMobileAdExit {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
          to {
            opacity: 0;
            transform: translate3d(-34px, 0, 0);
            filter: blur(2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-ad-enter,
          .mobile-ad-exit {
            animation: none !important;
            filter: none !important;
            transform: none !important;
          }

          .announcement-description-window {
            overflow-y: auto;
            -webkit-mask-image: none;
            mask-image: none;
          }

          .announcement-description-track {
            animation: none;
            transform: none;
          }

          .announcement-description-copy[aria-hidden="true"] {
            display: none;
          }

          .announcement-description-copy {
            display: block;
            min-height: 0;
          }
        }
      `}</style>

      {/* Announcement detail modal */}
      {expandedAdId && selectedAd && (
        <div
          onClick={() => setExpandedAdId(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md animate-fadeIn sm:p-6"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] border border-white/15 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)] animate-modalIn dark:border-slate-700 dark:bg-slate-950 sm:rounded-[32px]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-7">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10"><Megaphone size={14} /></span>
                NovaSkill announcement
              </div>
              <button
                type="button"
                onClick={() => setExpandedAdId(null)}
                aria-label="Close announcement"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-orange-500 hover:text-white dark:bg-slate-800 dark:text-slate-300"
              >
                <X size={17} />
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain">
              {selectedAd.images && selectedAd.images.length > 0 && (
                <div className="relative mx-5 mt-5 h-44 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 sm:mx-7 sm:mt-7 sm:h-64">
                  <img
                    src={getMediaUrl(selectedAd.images[0])}
                    alt={selectedAd.headline}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div className="px-5 py-6 sm:px-7 sm:py-7">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  <CalendarDays size={13} /> {new Date(selectedAd.createdAt).toLocaleDateString()}
                </div>
                <h3 id="announcement-modal-title" className="text-2xl font-black leading-tight tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
                  {selectedAd.headline}
                </h3>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70 sm:p-5">
                  <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700 dark:text-slate-300">
                    {selectedAd.description}
                  </p>
                </div>

                {selectedAd.links && selectedAd.links.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Useful links</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAd.links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/5 px-3.5 py-2.5 text-xs font-extrabold text-teal-700 transition hover:border-teal-500/50 hover:bg-teal-500 hover:text-white dark:text-teal-300 dark:hover:text-slate-950"
                        >
                          <LinkIcon size={13} />
                          <span className="truncate">{link.label}</span>
                          <ArrowUpRight size={13} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60 sm:px-7">
              <button
                type="button"
                onClick={() => setExpandedAdId(null)}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-orange-500 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
