// app/components/HeroCarousel.tsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS = { type: 'spring', stiffness: 260, damping: 28 } as const;

// TypeScript Types
export interface HeroImageData {
  id: number;
  image: string;
  title: string;
}

interface HeroCarouselProps {
  items?: HeroImageData[];
  baseWidth?: number; // (පරණ API එක සමඟ ගැළපීම සඳහා පමණක් තබා ඇත)
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
}

/* Stacked-deck positions: rel 0 = front card, 1/2 = cards peeking behind */
const getCardState = (rel: number, total: number) => {
  // Card that has just been swiped away (loop: the one before the active card)
  const isExited = rel < 0 || (total > 3 && rel === total - 1);

  if (isExited) {
    return { x: '-70%', y: '0%', scale: 0.9, rotate: -12, opacity: 0, zIndex: 40 };
  }
  switch (rel) {
    case 0:
      return { x: '0%', y: '0%', scale: 1, rotate: 0, opacity: 1, zIndex: 30 };
    case 1:
      return { x: '9%', y: '-3%', scale: 0.92, rotate: 4, opacity: 0.9, zIndex: 20 };
    case 2:
      return { x: '18%', y: '-6%', scale: 0.84, rotate: 8, opacity: 0.55, zIndex: 10 };
    default:
      return { x: '24%', y: '-8%', scale: 0.76, rotate: 10, opacity: 0, zIndex: 0 };
  }
};

export default function HeroCarousel({
  items = [],
  autoplay = true,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
}: HeroCarouselProps) {
  const total = items.length;
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    if (total === 0) return;
    setActive(loop ? ((index % total) + total) % total : Math.max(0, Math.min(index, total - 1)));
  };
  const goNext = () => goTo(active + 1);
  const goPrev = () => goTo(active - 1);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || total <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;

    const timer = setInterval(() => {
      setActive(prev => (loop ? (prev + 1) % total : Math.min(prev + 1, total - 1)));
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, total, loop]);

  useEffect(() => {
    setActive(0);
  }, [total, loop]);

  const handleDragEnd = (_: any, info: any) => {
    const { offset, velocity } = info;
    if (offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD) goNext();
    else if (offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD) goPrev();
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* ================= Stacked card deck (fills the whole area) ================= */}
      <div className="absolute bottom-3 left-2 right-[13%] top-3">
        {items.map((item, index) => {
          const rel = loop ? (index - active + total) % total : index - active;
          const state = getCardState(rel, total);
          const isFront = rel === 0;

          return (
            <motion.div
              key={`${item?.id ?? index}-${index}`}
              className="absolute inset-0 overflow-hidden rounded-[28px] bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10"
              style={{
                zIndex: state.zIndex,
                cursor: isFront ? 'grab' : 'pointer',
                pointerEvents: state.opacity === 0 ? 'none' : 'auto',
              }}
              initial={false}
              animate={{
                x: state.x,
                y: state.y,
                scale: state.scale,
                rotate: state.rotate,
                opacity: state.opacity,
              }}
              transition={SPRING_OPTIONS}
              drag={isFront ? 'x' : false}
              dragSnapToOrigin
              dragElastic={0.6}
              whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
              onDragEnd={isFront ? handleDragEnd : undefined}
              onClick={!isFront ? () => goTo(index) : undefined}
            >
              <img
                src={item.image}
                alt={item.title || 'Hero'}
                draggable={false}
                className="h-full w-full select-none object-cover object-center pointer-events-none"
              />
              {/* Image title on the image itself */}
              {item.title && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent px-5 pb-4 pt-12">
                  <span className="block truncate text-sm font-bold tracking-wide text-white drop-shadow sm:text-base">
                    {item.title}
                  </span>
                </div>
              )}
              {/* Dim the cards that are behind the front one */}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-slate-900"
                initial={false}
                animate={{ opacity: isFront ? 0 : rel === 1 ? 0.12 : 0.28 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
