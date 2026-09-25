// app/components/FeatureCarousel.tsx
import { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FeatureItemData {
  id: number;
  title: string;
  description: string;
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
      {/* Fixed 3 Cards Grid */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: visibleCount }).map((_, slotIndex) => {
            const item = visibleItems[slotIndex];
            if (!item) return null;

            return (
              <div
                key={slotIndex}
                // මෙතැන Gradient Border එක සහ Dark Mode Glow එක සකසා ඇත
                className="group relative rounded-[34px] p-[1.5px] 
                           bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 
                           dark:from-[#2A2A2A] dark:via-[#00CBB8]/30 dark:to-[#2A2A2A]
                           hover:from-[#00CBB8]/60 hover:via-[#00CBB8]/20 hover:to-orange-400/40
                           dark:hover:from-[#00CBB8]/80 dark:hover:via-[#00CBB8]/30 dark:hover:to-orange-400/60
                           transition-all duration-500
                           shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
                           dark:hover:shadow-[0_0_30px_rgba(0,203,184,0.25)]
                           min-h-[290px]"
              >
                {/* ඇතුළත කාඩ් එක */}
                <div 
                  className="relative w-full h-full rounded-[32px] overflow-hidden 
                             bg-white dark:bg-[#121212]"
                  style={{ perspective: 1200, minHeight: '287px' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${item.id}-${currentIndex}-${slotIndex}`}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeInOut",
                        delay: slotIndex * 0.1 
                      }}
                      className="absolute inset-0 flex flex-col items-start justify-between p-8"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Icon - Image එකේ ඇති පරිදි රවුම් සුදු පසුබිමක් සහිත */}
                      <div>
                        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full 
                                         bg-slate-100 dark:bg-[#1E1E1E] 
                                         text-[#00CBB8] dark:text-[#00CBB8] 
                                         border border-slate-200 dark:border-[#2F2F2F]
                                         group-hover:bg-[#00CBB8]/10 transition-colors duration-300">
                          {item.icon}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div>
                        <h3 className="mb-2 font-black text-2xl text-slate-800 dark:text-white tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Dark Mode එකේදී ඇතුළත Subtle Glow එකක් */}
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 dark:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(0,203,184,0.08),transparent_60%)]"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      {totalSlides > visibleCount && (
        <div className="flex items-center justify-center gap-2.5 mt-10">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'bg-slate-800 dark:bg-[#00CBB8] w-3 h-3 shadow-[0_0_8px_rgba(0,203,184,0.6)]'
                  : 'bg-slate-300 dark:bg-white/30 w-3 h-3 hover:bg-slate-400 dark:hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}