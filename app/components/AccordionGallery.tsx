"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

interface GalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
  text?: string;
  description?: string;
}

interface AccordionGalleryProps {
  items?: GalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  { image: "https://picsum.photos/id/1015/1400/900", label: "Canyon", description: "Explore the deep majestic canyons." },
  { image: "https://picsum.photos/id/1018/1400/900", label: "Ridgeline", description: "Breathtaking mountain ridgelines." },
  { image: "https://picsum.photos/id/1039/1400/900", label: "Falls", description: "Crystal clear rushing waterfalls." },
  { image: "https://picsum.photos/id/1043/1400/900", label: "Harbour", description: "A peaceful evening by the harbour." },
  { image: "https://picsum.photos/id/1044/1400/900", label: "Skyline", description: "A city skyline after dark." },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const AccordionGallery: React.FC<AccordionGalleryProps> = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  accentColor = "#00CBB8",
  overlayColor = "#071018",
  textColor = "#ffffff",
  height = 460,
  gap = 10,
  radius = 22,
  expandRatio = 0.52,
  duration = 0.6,
  parallax = 0.5,
  tilt = 8,
  showLabels = true,
  className = "",
}) => {
  const safeItems = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => item && item.image) : []),
    [items]
  );
  const count = safeItems.length;

  const [active, setActive] = useState(() =>
    count ? clamp(defaultIndex, 0, count - 1) : 0
  );
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; pointerId: number } | null>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    if (!count) {
      setActive(0);
      return;
    }
    setActive((current) => clamp(current, 0, count - 1));
  }, [count]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const goTo = useCallback(
    (index: number) => {
      if (!count) return;
      const next = ((index % count) + count) % count;
      setActive(next);
      setDragX(0);
    },
    [count]
  );

  const goNext = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const goPrevious = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  // Automatically advance every five seconds on desktop and mobile.
  // Reset the interval after each slide change and pause while the user is dragging.
  useEffect(() => {
    if (count <= 1 || isDragging) return;

    const intervalId = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
      setDragX(0);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [count, active, isDragging]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (dragRef.current) {
      const delta = event.clientX - dragRef.current.startX;
      setDragX(clamp(delta, -150, 150));
    } else if (event.pointerType === "mouse") {
      const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
      setPointer({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) });
    }
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;

    const delta = event.clientX - dragRef.current.startX;
    const threshold = Math.max(42, (event.currentTarget.clientWidth || 300) * 0.12);

    dragRef.current = null;
    setIsDragging(false);
    setDragX(0);

    if (Math.abs(delta) > threshold) {
      if (delta < 0) goNext();
      else goPrevious();
    }
  };

  const cancelPointer = () => {
    dragRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const handleStageKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goPrevious();
    }
  };

  if (!count) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-5 py-12 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400 ${className}`}
      >
        No gallery images available yet.
      </div>
    );
  }

  const current = safeItems[active];
  const activeLabel = current.label || `Gallery image ${active + 1}`;
  const transitionMs = Math.max(180, duration * 1000);
  const imageZoom = 1.025 + clamp(expandRatio, 0.2, 0.9) * 0.025;

  return (
    <div
      className={`nova-focus-gallery w-full min-w-0 ${className}`}
      style={
        {
          "--nfg-accent": accentColor,
          "--nfg-overlay": overlayColor,
          "--nfg-text": textColor,
          "--nfg-radius": `${radius}px`,
          "--nfg-gap": `${gap}px`,
          "--nfg-duration": `${transitionMs}ms`,
          "--nfg-parallax": `${clamp(parallax, 0, 1.5)}`,
          "--nfg-tilt": `${clamp(tilt, 0, 15)}`,
          "--nfg-image-zoom": imageZoom,
        } as React.CSSProperties
      }
    >
      <div className="nfg-layout">
        {/* Main cinematic image stage */}
        <div
          ref={stageRef}
          className={`nfg-stage ${isDragging ? "nfg-is-dragging" : ""}`}
          style={{ height: `${height}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={cancelPointer}
          onLostPointerCapture={cancelPointer}
          onKeyDown={handleStageKeyDown}
          role="region"
          aria-label="Interactive image gallery. Use arrow keys or swipe to browse."
          tabIndex={0}
        >
          <div
            key={`${active}-${current.image}`}
            className="nfg-image-reveal absolute inset-0"
            style={{
              transform: `translate3d(${dragX * 0.16 * parallax}px, ${pointer.y * -tilt * 0.16}px, 0) scale(${imageZoom + Math.abs(dragX) * 0.00018})`,
              transition: isDragging
                ? "none"
                : `transform ${transitionMs}ms cubic-bezier(0.22, 0.72, 0.18, 1)`,
            }}
          >
            <img
              src={current.image}
              alt={current.alt || activeLabel}
              draggable={false}
              className="h-full w-full select-none object-cover"
            />
          </div>

          <div className="nfg-image-shade" aria-hidden="true" />

          {/* Main caption */}
          {showLabels && (
            <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col gap-3 sm:bottom-7 sm:left-7 sm:right-7">
              <div className="nfg-caption-rule" />
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                <div className="min-w-0">
                  <h3
                    className="max-w-2xl text-2xl font-black leading-[1.05] tracking-[-0.045em] drop-shadow-sm sm:text-4xl"
                    style={{ color: textColor }}
                  >
                    {activeLabel}
                  </h3>
                </div>
                {current.link && (
                  <a
                    href={current.link}
                    className="nfg-explore-link"
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    Explore <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Navigation controls */}
          {count > 1 && (
            <>
              <div className="absolute left-4 top-1/2 z-30 -translate-y-1/2 sm:left-6">
                <button
                  type="button"
                  onClick={goPrevious}
                  aria-label="Previous gallery image"
                  title="Previous image"
                  className="nfg-arrow-button"
                >
                  <ArrowLeft size={18} />
                </button>
              </div>
              <div className="absolute right-4 top-1/2 z-30 -translate-y-1/2 sm:right-6">
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next gallery image"
                  title="Next image"
                  className="nfg-arrow-button"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

        </div>

      </div>

      {/* Progress rail */}
      <div className="nfg-progress-track" aria-hidden="true">
        <span style={{ width: `${((active + 1) / count) * 100}%` }} />
      </div>

      <style jsx>{`
        .nova-focus-gallery {
          color: #0f172a;
        }

        .nfg-layout {
          display: block;
          min-width: 0;
          width: 100%;
        }

        .nfg-stage {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border-radius: var(--nfg-radius);
          isolation: isolate;
          background: #08111a;
          cursor: grab;
          touch-action: pan-y;
          outline: none;
          box-shadow: 0 22px 55px -35px rgba(2, 8, 23, 0.65);
        }

        .nfg-stage:focus-visible {
          outline: 2px solid var(--nfg-accent);
          outline-offset: 3px;
        }

        .nfg-is-dragging {
          cursor: grabbing;
          user-select: none;
        }

        .nfg-image-reveal {
          z-index: -2;
          transform-origin: center;
          will-change: transform;
        }

        .nfg-image-reveal img {
          pointer-events: none;
          -webkit-user-drag: none;
        }

        .nfg-image-shade {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--nfg-overlay) 22%, transparent) 0%, transparent 36%, color-mix(in srgb, var(--nfg-overlay) 84%, transparent) 100%),
            linear-gradient(90deg, color-mix(in srgb, var(--nfg-overlay) 20%, transparent), transparent 65%);
        }

        .nfg-image-reveal {
          animation: nfgImageEnter var(--nfg-duration) cubic-bezier(0.22, 0.72, 0.18, 1) both;
        }

        .nfg-caption-rule {
          width: 42px;
          height: 3px;
          border-radius: 99px;
          background: var(--nfg-accent);
          box-shadow: 0 0 18px color-mix(in srgb, var(--nfg-accent) 60%, transparent);
        }

        .nfg-explore-link {
          display: inline-flex;
          width: fit-content;
          flex: 0 0 auto;
          align-items: center;
          gap: 9px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.12);
          padding: 11px 14px;
          color: white;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          backdrop-filter: blur(14px);
          transition: background 200ms ease, transform 200ms ease;
        }

        .nfg-explore-link:hover {
          background: color-mix(in srgb, var(--nfg-accent) 28%, rgba(255,255,255,0.12));
          transform: translateY(-2px);
        }

        .nfg-arrow-button {
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 14px;
          background: rgba(4, 12, 20, 0.42);
          color: white;
          backdrop-filter: blur(15px);
          transition: transform 200ms ease, background 200ms ease, border-color 200ms ease;
          cursor: pointer;
        }

        .nfg-arrow-button:hover {
          transform: scale(1.06);
          border-color: color-mix(in srgb, var(--nfg-accent) 70%, white);
          background: color-mix(in srgb, var(--nfg-accent) 25%, rgba(4,12,20,0.8));
        }

        .nfg-arrow-button:active {
          transform: scale(0.94);
        }

        .nfg-progress-track {
          height: 3px;
          overflow: hidden;
          margin-top: 12px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.18);
        }

        .nfg-progress-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--nfg-accent);
          box-shadow: 0 0 14px color-mix(in srgb, var(--nfg-accent) 55%, transparent);
          transition: width var(--nfg-duration) cubic-bezier(0.22, 0.72, 0.18, 1);
        }

        @keyframes nfgImageEnter {
          from {
            opacity: 0.55;
            filter: saturate(0.72);
            clip-path: inset(0 0 0 4%);
          }
          to {
            opacity: 1;
            filter: saturate(1);
            clip-path: inset(0 0 0 0);
          }
        }

        @media (max-width: 767px) {
          .nfg-stage {
            height: min(${Math.max(280, Math.min(height, 390))}px, 72vw) !important;
            min-height: 270px;
          }

        }

        @media (max-width: 420px) {
          .nfg-arrow-button {
            width: 36px;
            height: 36px;
            border-radius: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nfg-image-reveal,
          .nfg-progress-track span {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AccordionGallery;
