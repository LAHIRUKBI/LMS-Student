"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Star, User } from "lucide-react";

interface TestimonialsSectionProps {
  testimonials: any[];
  testimonialIndex: number;
  prevTestimonials: () => void;
  nextTestimonials: () => void;
  dashboardSettings: any;
  getMediaUrl: (path: string) => string;
}

type TestimonialPosition = "left" | "center" | "right";

export default function TestimonialsSection({
  testimonials,
  testimonialIndex,
  prevTestimonials,
  nextTestimonials,
  dashboardSettings,
  getMediaUrl,
}: TestimonialsSectionProps) {
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];
  const count = safeTestimonials.length;

  // This carousel advances one testimonial at a time. The parent callbacks
  // are retained for compatibility, but the carousel owns its active index:
  // older parent pagination logic may advance by two because it displayed
  // two testimonials per page. Letting that prop overwrite this index would
  // skip every other testimonial in this single-item circular flow.
  const normalizeIndex = (index: number) =>
    count > 0 ? ((index % count) + count) % count : 0;
  const [activeIndex, setActiveIndex] = useState(() => normalizeIndex(testimonialIndex));

  // Pointer dragging lets a neighbouring card glide into the featured position.
  const pointerStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    deltaX: number;
    dragging: boolean;
    originPosition: TestimonialPosition | null;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (count === 0) return null;

  const currentIndex = normalizeIndex(activeIndex);

  const goToNextTestimonial = () => {
    if (count <= 1) return;
    setActiveIndex((index) => normalizeIndex(index + 1));
    // Keep the existing parent callback in sync for any surrounding UI.
    // Its index is deliberately not used to drive this one-by-one carousel.
    nextTestimonials();
  };

  const goToPreviousTestimonial = () => {
    if (count <= 1) return;
    setActiveIndex((index) => normalizeIndex(index - 1));
    prevTestimonials();
  };

  const handleCarouselPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, video, input")) return;

    const cardElement = target.closest<HTMLElement>(".testimonial-card");
    const originPosition: TestimonialPosition | null = cardElement?.classList.contains("testimonial-card--right")
      ? "right"
      : cardElement?.classList.contains("testimonial-card--left")
        ? "left"
        : cardElement?.classList.contains("testimonial-card--center")
          ? "center"
          : null;

    pointerStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      dragging: false,
      originPosition,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCarouselPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = pointerStartRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;

    if (!pointer.dragging) {
      if (Math.abs(deltaX) < 8) return;
      // Let normal vertical page scrolling continue; only capture a clear horizontal gesture.
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.15) {
        pointerStartRef.current = null;
        return;
      }
      pointer.dragging = true;
      setIsDragging(true);
    }

    pointer.deltaX = deltaX;
    setDragOffset(deltaX);
    if (event.cancelable) event.preventDefault();
  };

  const finishCarouselPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = pointerStartRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const shouldNavigate = pointer.dragging && Math.abs(pointer.deltaX) > 55;
    const direction = pointer.deltaX;
    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (shouldNavigate) {
      suppressClickRef.current = true;
      if (direction < 0) goToNextTestimonial();
      else goToPreviousTestimonial();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);
    }
  };

  const handleCarouselPointerCancel = () => {
    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Match the resting CSS offsets so the grabbed side card tracks the pointer 1:1.
  const getSideOffset = () => {
    const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
    return Math.round(
      viewportWidth <= 767
        ? Math.min(230, Math.max(145, viewportWidth * 0.58))
        : Math.min(315, Math.max(220, viewportWidth * 0.32)),
    );
  };

  const getCardDragStyle = (position: TestimonialPosition): CSSProperties | undefined => {
    const pointer = pointerStartRef.current;
    if (!isDragging || !pointer?.dragging || !pointer.originPosition) return undefined;

    const sideOffset = getSideOffset();
    const delta = dragOffset;
    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

    // Pulling the right-hand card left: both cards follow the pointer in a crisp
    // 2D plane; their width/height transitions create the depth change on release.
    if (pointer.originPosition === "right" && delta <= 0) {
      const progress = clamp01(Math.abs(delta) / sideOffset);
      if (position === "right") {
        return {
          zIndex: 45,
          transform: `translate(-50%, -50%) translateX(${sideOffset + delta}px)`,
          opacity: 1,
        };
      }
      if (position === "center") {
        return {
          zIndex: 30,
          transform: `translate(-50%, -50%) translateX(${-sideOffset * progress}px)`,
          opacity: 1,
        };
      }
    }

    // Mirror the same crisp pointer-follow interaction when the left card is pulled right.
    if (pointer.originPosition === "left" && delta >= 0) {
      const progress = clamp01(delta / sideOffset);
      if (position === "left") {
        return {
          zIndex: 45,
          transform: `translate(-50%, -50%) translateX(${-sideOffset + delta}px)`,
          opacity: 1,
        };
      }
      if (position === "center") {
        return {
          zIndex: 30,
          transform: `translate(-50%, -50%) translateX(${sideOffset * progress}px)`,
          opacity: 1,
        };
      }
    }

    // If the centre card itself is dragged, let it follow the pointer and
    // progressively reveal the neighbouring card without scaling its text layer.
    if (pointer.originPosition === "center" && delta !== 0) {
      const direction = delta < 0 ? -1 : 1;
      if ((position === "right" && direction < 0) || (position === "left" && direction > 0)) {
        const fromX = position === "right" ? sideOffset : -sideOffset;
        return {
          zIndex: 45,
          transform: `translate(-50%, -50%) translateX(${fromX + delta}px)`,
          opacity: 1,
        };
      }
      if (position === "center") {
        return {
          zIndex: 30,
          transform: `translate(-50%, -50%) translateX(${delta}px)`,
          opacity: 1,
        };
      }
    }

    // A side card also tracks the pointer when pulled away from the centre;
    // the release threshold still decides whether the carousel changes page.
    if (pointer.originPosition === "right" && position === "right" && delta > 0) {
      return { zIndex: 45, transform: `translate(-50%, -50%) translateX(${sideOffset + delta}px)`, opacity: 1 };
    }
    if (pointer.originPosition === "left" && position === "left" && delta < 0) {
      return { zIndex: 45, transform: `translate(-50%, -50%) translateX(${-sideOffset + delta}px)`, opacity: 1 };
    }

    return undefined;
  };

  const handleSideCardClick = (position: TestimonialPosition) => {
    if (suppressClickRef.current) return;
    if (position === "left") goToPreviousTestimonial();
    if (position === "right") goToNextTestimonial();
  };

  const handleSideCardKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    position: TestimonialPosition,
  ) => {
    if (position === "center" || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    handleSideCardClick(position);
  };

  // Circular neighbours: the first and last testimonials are connected,
  // so the carousel never reaches a dead end.
  const layeredTestimonials: Array<{
    test: any;
    position: TestimonialPosition;
    itemIndex: number;
  }> = [];

  if (count > 2) {
    const previousIndex = normalizeIndex(currentIndex - 1);
    layeredTestimonials.push({
      test: safeTestimonials[previousIndex],
      position: "left",
      itemIndex: previousIndex,
    });
  }
  layeredTestimonials.push({
    test: safeTestimonials[currentIndex],
    position: "center",
    itemIndex: currentIndex,
  });
  if (count > 1) {
    const nextIndex = normalizeIndex(currentIndex + 1);
    layeredTestimonials.push({
      test: safeTestimonials[nextIndex],
      position: "right",
      itemIndex: nextIndex,
    });
  }

  const backgroundImage = dashboardSettings?.testimonialBgImage
    ? `url("${getMediaUrl(dashboardSettings.testimonialBgImage)}")`
    : 'url("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&h=900&fit=crop")';

  return (
    <section className="testimonial-section relative mb-20 w-full">
      {/* Atmospheric image header */}
      <div
        className="testimonial-hero relative isolate min-h-[312px] overflow-hidden rounded-[30px] px-5 pb-24 pt-9 sm:min-h-[356px] sm:rounded-[38px] sm:px-9 sm:pb-28 sm:pt-12 lg:min-h-[382px] lg:px-14"
        style={{ backgroundImage }}
      >
        <div className="absolute inset-0 -z-10 bg-slate-950/75" />
        <div className="testimonial-orbit testimonial-orbit-one" />
        <div className="testimonial-orbit testimonial-orbit-two" />

        <div className="relative z-10 mx-auto flex max-w-6xl items-end justify-between">
          <div className="max-w-2xl">
            <h2 className="max-w-xl text-[2rem] font-black leading-[1.08] tracking-[-0.055em] text-white sm:text-4xl lg:text-5xl">
              <span className="block text-teal-300">Meaningful progress.</span>
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 md:justify-end">
            <div className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-white/65">
              <span className="text-white">{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="mx-1.5 text-white/30">/</span>
              {String(count).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Three-layer depth carousel: left and right cards sit behind the active card. */}
      <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-1 sm:-mt-16 sm:px-4 lg:px-6">
        <div
          ref={stageRef}
          className={`testimonial-stage ${isDragging ? "is-dragging" : ""}`}
          aria-live="polite"
          onPointerDown={handleCarouselPointerDown}
          onPointerMove={handleCarouselPointerMove}
          onPointerUp={finishCarouselPointer}
          onPointerCancel={handleCarouselPointerCancel}
          onLostPointerCapture={handleCarouselPointerCancel}
          onClickCapture={(event) => {
            if (suppressClickRef.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClickRef.current = false;
            }
          }}
        >
          {layeredTestimonials.map(({ test, position, itemIndex }, index) => {
            const stars = Math.max(0, Math.min(5, Number(test.rating) || 5));
            const isCenter = position === "center";
            const authorImage = test.image ? getMediaUrl(test.image) : undefined;
            // Keep each testimonial keyed by identity, not by its visual slot.
            // This allows the same DOM card to travel from a side position into the center.
            const cardKey = test._id || `${test.name || "testimonial"}-${test.title || ""}-${itemIndex}`;

            return (
              <article
                key={cardKey}
                className={`testimonial-card testimonial-card--${position} ${!isCenter ? "testimonial-card--interactive" : ""}`}
                role={!isCenter ? "button" : undefined}
                tabIndex={!isCenter ? 0 : -1}
                aria-label={!isCenter ? `Show ${test.name}'s testimonial` : undefined}
                aria-current={isCenter ? "true" : undefined}
                title={!isCenter ? "Click or drag to bring this testimonial forward" : undefined}
                onClick={() => handleSideCardClick(position)}
                onKeyDown={(event) => handleSideCardKeyDown(event, position)}
                style={{ animationDelay: `${index * 90}ms`, ...getCardDragStyle(position) }}
              >
                <div
                  className="testimonial-art"
                  style={authorImage ? { backgroundImage: `url("${authorImage}")` } : undefined}
                >
                </div>

                <div className="testimonial-card-content">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="testimonial-card-kicker">Student experience</span>
                    <div className="flex shrink-0 items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={isCenter ? 14 : 12}
                          fill="currentColor"
                          className={i < stars ? "text-amber-400" : "text-white/20"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="testimonial-copy">
                    “{test.idea}”
                  </p>

                  <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-4">
                    <div className="testimonial-avatar">
                      {authorImage ? (
                        <img src={authorImage} alt={test.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-full w-full p-2.5 text-white/75" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-extrabold text-white sm:text-base">{test.name}</h3>
                      <p className="mt-0.5 truncate text-xs font-medium text-white/75">{test.title}</p>
                    </div>
                    {isCenter && (
                      <span className="hidden rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45 sm:inline-flex">
                        Verified voice
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .testimonial-section {
          isolation: isolate;
        }

        .testimonial-hero {
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        .testimonial-orbit {
          position: absolute;
          z-index: -1;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 9999px;
          pointer-events: none;
        }

        .testimonial-orbit-one {
          width: 390px;
          height: 390px;
          right: -105px;
          top: -215px;
        }

        .testimonial-orbit-two {
          width: 260px;
          height: 260px;
          right: -40px;
          top: -150px;
          border-color: rgba(255, 255, 255, 0.09);
        }

        .testimonial-nav-button {
          display: inline-flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 15px;
          color: white;
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(12px);
          transition: transform 220ms ease, background 220ms ease, border-color 220ms ease;
          cursor: pointer;
        }

        .testimonial-nav-button:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.42);
        }

        .testimonial-nav-button:active {
          transform: scale(0.94);
        }

        .testimonial-stage {
          position: relative;
          height: 505px;
          width: 100%;
          /* 2D compositing keeps glyph edges crisp while preserving layered depth. */
          transform-style: flat;
          touch-action: pan-y;
          cursor: grab;
          animation: testimonialStageIn 650ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
        }

        .testimonial-stage.is-dragging {
          cursor: grabbing;
          transition: none;
        }

        .testimonial-stage.is-dragging .testimonial-card {
          transition: none;
          user-select: none;
          -webkit-user-drag: none;
        }

        .testimonial-stage.is-dragging .testimonial-card--interactive {
          pointer-events: none;
        }

        .testimonial-card {
          position: absolute;
          left: 50%;
          top: 50%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.17);
          border-radius: 29px;
          color: white;
          background: linear-gradient(155deg, rgba(32, 37, 49, 0.98), rgba(8, 12, 20, 0.99));
          box-shadow: 0 28px 75px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transform-style: flat;
          backface-visibility: visible;
          -webkit-font-smoothing: auto;
          -moz-osx-font-smoothing: auto;
          text-rendering: geometricPrecision;
          transition: transform 760ms cubic-bezier(0.2, 0.78, 0.2, 1), width 760ms cubic-bezier(0.2, 0.78, 0.2, 1), height 760ms cubic-bezier(0.2, 0.78, 0.2, 1), opacity 760ms ease, box-shadow 760ms ease;
          transform-origin: center center;
          animation: testimonialCardArrive 760ms cubic-bezier(0.18, 0.72, 0.25, 1) both;
        }

        .testimonial-card--center {
          z-index: 30;
          width: min(47%, 410px);
          height: 465px;
          opacity: 1;
          transform: translate(-50%, -50%);
          box-shadow: 0 34px 90px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.045), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .testimonial-card--left,
        .testimonial-card--right {
          z-index: 10;
          width: min(33%, 300px);
          height: 365px;
          opacity: 0.96;
        }

        .testimonial-card--interactive {
          cursor: pointer;
        }

        .testimonial-card--interactive:hover,
        .testimonial-card--interactive:focus-visible {
          opacity: 1;
          outline: none;
        }

        .testimonial-card--interactive:focus-visible {
          box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.65), 0 28px 75px rgba(0, 0, 0, 0.36);
        }

        .testimonial-card--left {
          transform: translate(-50%, -50%) translateX(clamp(-315px, -32vw, -220px));
        }

        .testimonial-card--right {
          transform: translate(-50%, -50%) translateX(clamp(220px, 32vw, 315px));
        }

        .testimonial-art {
          position: relative;
          isolation: isolate;
          backface-visibility: hidden;
          image-rendering: auto;
          display: flex;
          height: 150px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #303644;
          background-image: radial-gradient(circle at 28% 22%, rgba(255,255,255,.25), transparent 34%), linear-gradient(135deg, #667085, #303746 58%, #151a25);
          background-position: center;
          background-size: cover;
          transition: height 760ms cubic-bezier(0.2, 0.78, 0.2, 1);
        }

        .testimonial-card--left .testimonial-art,
        .testimonial-card--right .testimonial-art {
          height: 108px;
        }

        .testimonial-card-content {
          -webkit-font-smoothing: auto;
          -moz-osx-font-smoothing: auto;
          text-rendering: geometricPrecision;
          display: flex;
          min-height: 0;
          flex: 1;
          flex-direction: column;
          padding: 20px 22px 21px;
          transition: padding 760ms cubic-bezier(0.2, 0.78, 0.2, 1);
        }

        .testimonial-card--left .testimonial-card-content,
        .testimonial-card--right .testimonial-card-content {
          padding: 13px 15px 15px;
        }

        .testimonial-card-kicker {
          color: rgba(255,255,255,.72);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .testimonial-copy {
          display: -webkit-box;
          -webkit-font-smoothing: auto;
          -moz-osx-font-smoothing: auto;
          text-rendering: geometricPrecision;
          overflow: hidden;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.75;
          overflow-wrap: anywhere;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 6;
          transition: font-size 760ms ease, line-height 760ms ease;
        }

        .testimonial-card--left .testimonial-copy,
        .testimonial-card--right .testimonial-copy {
          font-size: 12px;
          font-weight: 600;
          line-height: 1.6;
          -webkit-line-clamp: 4;
        }

        .testimonial-avatar {
          width: 43px;
          height: 43px;
          flex: 0 0 auto;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.20);
          border-radius: 15px;
          background: rgba(255,255,255,.10);
          transition: width 760ms ease, height 760ms ease, border-radius 760ms ease;
        }

        .testimonial-card--left .testimonial-avatar,
        .testimonial-card--right .testimonial-avatar {
          width: 34px;
          height: 34px;
          border-radius: 12px;
        }

        @keyframes testimonialStageIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes testimonialCardArrive {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 767px) {
          .testimonial-stage {
            height: 480px;
            /* Keep text in a flat compositing plane on touch devices too. */
          }

          .testimonial-card--center {
            width: 84%;
            height: 438px;
          }

          .testimonial-card--left,
          .testimonial-card--right {
            width: 66%;
            height: 360px;
            opacity: 0.96;
          }

          .testimonial-card--left {
            transform: translate(-50%, -50%) translateX(clamp(-230px, -58vw, -145px));
          }

          .testimonial-card--right {
            transform: translate(-50%, -50%) translateX(clamp(145px, 58vw, 230px));
          }

          .testimonial-art {
            height: 132px;
          }

          .testimonial-card--left .testimonial-art,
          .testimonial-card--right .testimonial-art {
            height: 100px;
          }

          .testimonial-card-content {
            padding: 17px 17px 18px;
          }

          .testimonial-copy {
            font-size: 13px;
            line-height: 1.72;
            -webkit-line-clamp: 6;
          }

          .testimonial-card--left .testimonial-card-content,
          .testimonial-card--right .testimonial-card-content {
            padding: 12px 13px 14px;
          }

          .testimonial-card--left .testimonial-copy,
          .testimonial-card--right .testimonial-copy {
            font-size: 11px;
            line-height: 1.55;
            -webkit-line-clamp: 4;
          }
        }

        @media (max-width: 390px) {
          .testimonial-stage {
            height: 465px;
          }

          .testimonial-card--center {
            width: 86%;
            height: 430px;
          }

          .testimonial-card--left,
          .testimonial-card--right {
            width: 64%;
            height: 345px;
          }

          .testimonial-card-content {
            padding: 15px 15px 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .testimonial-stage,
          .testimonial-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
