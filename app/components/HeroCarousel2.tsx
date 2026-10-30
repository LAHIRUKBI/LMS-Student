'use client';

// app/components/HeroCarousel.tsx
//
// "Portal" carousel.
// Instead of a stack of cards that get swiped away, the current image fills the
// whole stage and the NEXT image lives inside a small circular portal in the
// bottom-right corner. The portal is the navigation:
//   • tap it           -> the portal blooms and the next scene takes over
//   • drag it inward   -> you scrub the bloom by hand (release past ~30% to commit,
//                         otherwise it springs back)
//   • the ring around  -> is the autoplay countdown, so you always see when the
//     the portal          next scene is coming
// Everything is driven by ONE motion value (`p`, 0 → 1), so scrubbing, tapping and
// autoplay all share the exact same transition.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const COMMIT_THRESHOLD = 0.3; // how far the bloom must be dragged to commit
const COMMIT_VELOCITY = 1.4; // flick speed (stage-travels per second) that commits

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// TypeScript Types
export interface HeroImageData {
  id: number;
  image: string;
  title: string;
}

interface HeroCarouselProps {
  items?: HeroImageData[];
  baseWidth?: number; // (kept only for compatibility with the old API)
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
}

/* ---------- Geometry of the portal, derived from the stage size ---------- */
interface Geo {
  w: number;
  h: number;
  restR: number; // portal radius at rest
  maxR: number; // radius needed to cover the whole stage
  cx: number; // portal centre
  cy: number;
  s0: number; // scale of the preview image inside the portal at rest
  ux: number; // unit vector the user drags along (portal -> stage centre)
  uy: number;
  travel: number; // drag distance (px) that equals a fully open portal
}

const computeGeo = (w: number, h: number): Geo => {
  const m = Math.min(w, h);
  const restR = clamp(m * 0.12, 32, 60);
  const edge = restR + clamp(m * 0.045, 14, 24);
  const cx = w - edge;
  const cy = h - edge;
  const maxR =
    Math.max(
      Math.hypot(cx, cy),
      Math.hypot(w - cx, cy),
      Math.hypot(cx, h - cy),
      Math.hypot(w - cx, h - cy),
    ) + 4;
  const s0 = Math.max(0.28, (restR * 2 * 1.3) / m);
  const vx = w / 2 - cx;
  const vy = h / 2 - cy;
  const len = Math.hypot(vx, vy) || 1;
  return { w, h, restR, cx, cy, maxR, s0, ux: vx / len, uy: vy / len, travel: Math.hypot(w, h) * 0.4 };
};

/** Derive a value from the portal progress `p` and the current geometry. */
function usePortalValue<T>(
  p: MotionValue<number>,
  tick: MotionValue<number>,
  geoRef: MutableRefObject<Geo>,
  fn: (v: number, g: Geo) => T,
) {
  return useTransform([p, tick], ([v]: number[]) => fn(v, geoRef.current));
}

/* ---------- Caption (sits on the image itself) ---------- */
function Caption({
  title,
  index,
  padRight,
}: {
  title: string;
  index: number;
  padRight: number;
}) {
  if (!title) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent pb-4 pl-5 pt-14"
      style={{ paddingRight: padRight }}
    >
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
        Scene {String(index + 1).padStart(2, '0')}
      </span>
      <span className="block truncate text-sm font-bold tracking-wide text-white drop-shadow sm:text-base">
        {title}
      </span>
    </div>
  );
}

export default function HeroCarousel({
  items = [],
  autoplay = true,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
}: HeroCarouselProps) {
  const total = items.length;
  const reduceMotion = useReducedMotion();

  const [active, setActive] = useState(0);
  const [pending, setPending] = useState<number | null>(null); // slide the portal is opening onto
  const [isHovered, setIsHovered] = useState(false);
  const [retry, setRetry] = useState(0);
  const [geo, setGeo] = useState<Geo>(() => computeGeo(600, 480));

  const stageRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geo>(geo);
  const busy = useRef(false);
  const scrubbing = useRef(false);

  const p = useMotionValue(0); // portal progress: 0 = closed, 1 = fully open
  const timer = useMotionValue(0); // autoplay countdown: 0 → 1
  const geoTick = useMotionValue(0); // bumped when the stage is resized

  const nextOf = useCallback(
    (i: number) => (total < 2 ? null : loop ? (i + 1) % total : i + 1 < total ? i + 1 : null),
    [total, loop],
  );
  const prevOf = useCallback(
    (i: number) => (total < 2 ? null : loop ? (i - 1 + total) % total : i - 1 >= 0 ? i - 1 : null),
    [total, loop],
  );

  const naturalNext = nextOf(active);
  const portalIdx = pending ?? naturalNext;

  /* ---------- Measure the stage ---------- */
  useIsoLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      const g = computeGeo(w, h);
      geoRef.current = g;
      setGeo(g);
      geoTick.set(geoTick.get() + 1);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [geoTick]);

  /* ---------- Derived visuals (all driven by `p`) ---------- */
  // The circular window onto the next scene
  const clipPath = usePortalValue(p, geoTick, geoRef, (v, g) =>
    `circle(${g.restR + (g.maxR - g.restR) * v}px at ${g.cx}px ${g.cy}px)`,
  );
  // The next scene starts as a small picture inside the portal and unfolds to full size.
  // It grows faster than the circle so the circle is always completely filled.
  const innerX = usePortalValue(p, geoTick, geoRef, (v, g) => (g.cx - g.w / 2) * (1 - (1 - Math.pow(1 - v, 3))));
  const innerY = usePortalValue(p, geoTick, geoRef, (v, g) => (g.cy - g.h / 2) * (1 - (1 - Math.pow(1 - v, 3))));
  const innerScale = usePortalValue(p, geoTick, geoRef, (v, g) => {
    const m = 1 - Math.pow(1 - v, 3);
    return g.s0 + (1 - g.s0) * m;
  });
  // The glass ring that rides the edge of the portal
  const ringSize = usePortalValue(p, geoTick, geoRef, (v, g) => 2 * (g.restR + (g.maxR - g.restR) * v));
  const ringX = usePortalValue(p, geoTick, geoRef, (v, g) => g.cx - (g.restR + (g.maxR - g.restR) * v));
  const ringY = usePortalValue(p, geoTick, geoRef, (v, g) => g.cy - (g.restR + (g.maxR - g.restR) * v));
  const ringOpacity = useTransform(p, v => clamp((1 - v) * 5, 0, 1));
  // The current scene recedes (zooms + dims) while the portal opens
  const currentScale = useTransform(p, v => 1 + v * 0.1);
  const dimOpacity = useTransform(p, v => v * 0.35);
  // Captions cross-fade: the old one fades out first, the new one is revealed by the portal
  const currentCaptionOpacity = useTransform(p, v => clamp(1 - v * 2.2, 0, 1));
  const incomingCaptionOpacity = useTransform(p, v => clamp((v - 0.55) * 2.2, 0, 1));
  // Idle hints (pulse + countdown ring) disappear as soon as the portal starts to open
  const hintOpacity = useTransform(p, v => clamp(1 - v * 6, 0, 1));

  /* ---------- Navigation ---------- */
  const commit = useCallback(
    (target: number | null) => {
      if (target === null || busy.current || target === active || target < 0 || target >= total) return;
      busy.current = true;
      setPending(target);
    },
    [active, total],
  );

  // Open the portal onto `pending`, then make it the active slide
  useEffect(() => {
    if (pending === null) return;
    const remaining = 1 - p.get();
    const controls = animate(p, 1, {
      duration: reduceMotion ? 0.15 : Math.max(0.3, 0.95 * remaining),
      ease: EASE,
      onComplete: () => setActive(pending),
    });
    return () => controls.stop();
  }, [pending, p, reduceMotion]);

  // Once the new slide is in place, close the portal again (before the browser paints)
  useIsoLayoutEffect(() => {
    p.set(0);
    timer.set(0);
    setPending(null);
    busy.current = false;
  }, [active, p, timer]);

  // Reset when the list itself changes
  useEffect(() => {
    setActive(0);
    setPending(null);
    busy.current = false;
    scrubbing.current = false;
    p.set(0);
    timer.set(0);
  }, [total, loop, p, timer]);

  /* ---------- Autoplay: the countdown ring IS the timer ---------- */
  useEffect(() => {
    if (!autoplay || naturalNext === null || pending !== null) return;
    if (pauseOnHover && isHovered) return;

    const remaining = Math.max(0.05, (1 - timer.get()) * (autoplayDelay / 1000));
    const controls = animate(timer, 1, {
      duration: remaining,
      ease: 'linear',
      onComplete: () => {
        if (busy.current || scrubbing.current) {
          // user is mid-gesture: skip this tick and start the countdown over
          timer.set(0);
          setRetry(r => r + 1);
          return;
        }
        commit(naturalNext);
      },
    });
    return () => controls.stop();
  }, [autoplay, autoplayDelay, naturalNext, pending, isHovered, pauseOnHover, retry, commit, timer]);

  /* ---------- Gestures ---------- */
  const cancelScrub = () => {
    animate(p, 0, { type: 'spring', stiffness: 260, damping: 26 });
  };

  const handlePanStart = () => {
    if (busy.current || naturalNext === null) return;
    scrubbing.current = true;
  };
  const handlePan = (_: unknown, info: PanInfo) => {
    if (!scrubbing.current) return;
    const g = geoRef.current;
    p.set(clamp((info.offset.x * g.ux + info.offset.y * g.uy) / g.travel, 0, 1));
  };
  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (!scrubbing.current) return;
    scrubbing.current = false;
    const g = geoRef.current;
    const velocity = (info.velocity.x * g.ux + info.velocity.y * g.uy) / g.travel;
    if (p.get() > COMMIT_THRESHOLD || velocity > COMMIT_VELOCITY) commit(naturalNext);
    else cancelScrub();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      commit(nextOf(active));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      commit(prevOf(active));
    }
  };

  /* ---------- Empty / single-image states ---------- */
  if (total === 0) {
    return <div className="relative h-full w-full rounded-[28px] bg-slate-200 dark:bg-slate-800" />;
  }

  const current = items[active] ?? items[0];
  const incoming = portalIdx !== null ? items[portalIdx] : null;
  const captionPad = geo.w - geo.cx + geo.restR + 12;
  const ringBox = (geo.restR + 6) * 2 + 6;

  return (
    <div
      className="relative h-full w-full rounded-[32px] outline-none focus-visible:ring-2 focus-visible:ring-[#00CBB8]/70"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured images"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================= Stage ================= */}
      <div
        ref={stageRef}
        className="absolute inset-2 overflow-hidden rounded-[28px] bg-slate-200 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10"
      >
        {/* Current scene */}
        <motion.img
          src={current.image}
          alt={current.title || 'Hero'}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
          style={{ scale: currentScale }}
        />
        <motion.div className="pointer-events-none absolute inset-0 bg-slate-950" style={{ opacity: dimOpacity }} />
        <motion.div className="absolute inset-0" style={{ opacity: currentCaptionOpacity }}>
          <Caption title={current.title} index={active} padRight={captionPad} />
        </motion.div>

        {/* Next scene, seen through the portal */}
        {incoming && (
          <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath }}>
            <motion.div className="absolute inset-0 will-change-transform" style={{ x: innerX, y: innerY, scale: innerScale }}>
              <img
                src={incoming.image}
                alt=""
                draggable={false}
                className="h-full w-full select-none object-cover object-center"
              />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ opacity: incomingCaptionOpacity }}>
              <Caption title={incoming.title} index={portalIdx as number} padRight={captionPad} />
            </motion.div>
          </motion.div>
        )}

        {incoming && (
          <>
            {/* Glass ring on the edge of the portal */}
            <motion.div
              className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-white/85 shadow-[0_0_0_4px_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.35)]"
              style={{ width: ringSize, height: ringSize, x: ringX, y: ringY, opacity: ringOpacity }}
            />

            {/* Idle hints: soft pulse + autoplay countdown */}
            <motion.div
              className="pointer-events-none absolute"
              style={{
                left: geo.cx - geo.restR,
                top: geo.cy - geo.restR,
                width: geo.restR * 2,
                height: geo.restR * 2,
                opacity: hintOpacity,
              }}
            >
              <div className="h-full w-full animate-ping rounded-full border border-white/60 motion-reduce:hidden" />
            </motion.div>

            {autoplay && (
              <motion.svg
                aria-hidden
                className="pointer-events-none absolute -rotate-90"
                width={ringBox}
                height={ringBox}
                viewBox={`0 0 ${ringBox} ${ringBox}`}
                style={{
                  left: geo.cx - ringBox / 2,
                  top: geo.cy - ringBox / 2,
                  opacity: hintOpacity,
                }}
              >
                <circle
                  cx={ringBox / 2}
                  cy={ringBox / 2}
                  r={geo.restR + 6}
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={2}
                />
                <motion.circle
                  cx={ringBox / 2}
                  cy={ringBox / 2}
                  r={geo.restR + 6}
                  fill="none"
                  stroke="#00CBB8"
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ pathLength: timer }}
                />
              </motion.svg>
            )}

            {/* Hit area: tap to open, drag inward to scrub */}
            <motion.div
              role="button"
              aria-label="Next slide"
              className="absolute cursor-grab rounded-full active:cursor-grabbing"
              style={{
                left: geo.cx - geo.restR - 8,
                top: geo.cy - geo.restR - 8,
                width: geo.restR * 2 + 16,
                height: geo.restR * 2 + 16,
                touchAction: 'none',
              }}
              onPanStart={handlePanStart}
              onPan={handlePan}
              onPanEnd={handlePanEnd}
              onTap={() => commit(naturalNext)}
            />
          </>
        )}

        {/* Counter + dots (jump to any scene; the portal opens onto it) */}
        <div className="absolute left-4 top-4 flex items-center gap-2.5 rounded-full bg-slate-950/45 py-1.5 pl-3 pr-2.5 backdrop-blur-md">
          <span className="text-[11px] font-bold tabular-nums tracking-wider text-white">
            {String(active + 1).padStart(2, '0')}
            <span className="text-white/50"> / {String(total).padStart(2, '0')}</span>
          </span>
          {total > 1 && (
            <span className="flex items-center gap-1">
              {items.map((it, i) => (
                <button
                  key={`${it?.id ?? i}-${i}`}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => commit(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-4 bg-[#00CBB8]' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
