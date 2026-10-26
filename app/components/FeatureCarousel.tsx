// app/components/FeatureCarousel.tsx
import { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FeatureItemData {
  id: number;
  title: string;
  description: string;
  iconType?: string;
  iconImage?: string | null;
  icon: ReactNode;
}

interface FeatureCarouselProps {
  items?: FeatureItemData[];
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
}

export default function FeatureCarousel({
  items = [],
  autoplay = true,
  autoplayDelay = 4000,
  pauseOnHover = true,
}: FeatureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(1);
      else if (width < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const totalSlides = items.length;
  const maxIndex = Math.max(0, totalSlides - visibleCount);

  useEffect(() => {
    if (!autoplay || isHovered || maxIndex === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, maxIndex]);

  const visibleItems = items.slice(currentIndex, currentIndex + visibleCount);

  return (
    <div
      className="w-full flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes fc-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="relative isolate">
          {/* Large glass panel that holds every card */}
          <div
            className="relative overflow-hidden rounded-[2rem]
                       border border-white/70 dark:border-white/10
                       bg-gradient-to-br from-white/60 via-white/35 to-white/20
                       dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.02]
                       backdrop-blur-2xl backdrop-saturate-150
                       shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.85)]
                       dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]
                       p-5 sm:p-8"
          >
            {/* top edge light */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px
                         bg-gradient-to-r from-transparent via-white to-transparent dark:via-white/40"
            />
            {/* diagonal glass reflection */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-1/4 -top-1/2 h-[120%] w-1/2 rotate-[18deg]
                         bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.05]"
            />

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: visibleCount }).map((_, slotIndex) => {
                const item = visibleItems[slotIndex];
                if (!item) return null;

                const number = String(currentIndex + slotIndex + 1).padStart(2, '0');
                const total = String(totalSlides).padStart(2, '0');
                const hasImage = item.iconType === 'image' && !!item.iconImage;

                return (
                  <div
                    key={slotIndex}
                    className="group relative min-h-[290px] overflow-hidden rounded-2xl
                               border border-slate-200/80 bg-white/90
                               dark:border-white/10 dark:bg-[#121212]/90
                               shadow-[0_6px_20px_-8px_rgba(15,23,42,0.18)]
                               dark:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.7)]
                               transition-all duration-300 ease-out
                               hover:-translate-y-1 hover:border-[#00CBB8]/50
                               hover:shadow-[0_16px_36px_-12px_rgba(0,203,184,0.3)]
                               dark:hover:border-[#00CBB8]/40"
                    style={{ minHeight: '290px' }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${item.id}-${currentIndex}-${slotIndex}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                          delay: slotIndex * 0.07,
                        }}
                        className="absolute inset-0 flex flex-col justify-between p-7"
                      >
                        {/* Top row: icon + counter */}
                        <div className="flex items-start justify-between">
                          {hasImage ? (
                            <span
                              className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full
                                         transition-transform duration-300 ease-out group-hover:scale-105"
                            >
                              <img
                                src={item.iconImage as string}
                                alt={item.title}
                                className="h-full w-full rounded-full object-cover"
                              />
                            </span>
                          ) : (
                            <span
                              className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl
                                         bg-[#00CBB8]/10 text-[#00CBB8]
                                         ring-1 ring-inset ring-[#00CBB8]/20
                                         transition-colors duration-300
                                         group-hover:bg-[#00CBB8] group-hover:text-white group-hover:ring-[#00CBB8]"
                            >
                              {item.icon}
                            </span>
                          )}

                          <span className="font-mono text-xs tabular-nums tracking-wider text-slate-400 dark:text-slate-500">
                            {number}
                            <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
                            {total}
                          </span>
                        </div>

                        {/* Text */}
                        <div>
                          <h3 className="mb-2.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Bottom accent line that grows on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[#00CBB8]
                                 transition-all duration-500 ease-out group-hover:w-full"
                    />
                  </div>
                );
              })}
            </div>

            {totalSlides > visibleCount && (
              <div className="relative mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
                  const active = currentIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      aria-current={active}
                      className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ease-out ${
                        active
                          ? 'w-10 bg-slate-300/80 dark:bg-white/15'
                          : 'w-1.5 bg-slate-400/50 hover:bg-slate-500/70 dark:bg-white/25 dark:hover:bg-white/45'
                      }`}
                    >
                      {active && (
                        <span
                          key={`progress-${currentIndex}`}
                          className="absolute inset-0 origin-left rounded-full bg-slate-900 dark:bg-[#00CBB8]"
                          style={{
                            animation:
                              autoplay && maxIndex > 0
                                ? `fc-progress ${autoplayDelay}ms linear forwards`
                                : undefined,
                            animationPlayState: isHovered ? 'paused' : 'running',
                            transform: autoplay && maxIndex > 0 ? undefined : 'scaleX(1)',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
