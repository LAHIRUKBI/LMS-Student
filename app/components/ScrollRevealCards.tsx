"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealCardsProps {
  children: ReactNode;
  className?: string;
  // Animation intensity (default values)
  maxTranslateX?: number;
  maxTranslateY?: number;
  maxScaleReduction?: number;
  maxRotate?: number;
  maxOpacityReduction?: number;
  // වම් පැත්තේ card එකට direction (default: -1 left, 1 right)
  leftDirection?: number;
  rightDirection?: number;
}

export default function ScrollRevealCards({
  children,
  className = "",
  maxTranslateX = 180,
  maxTranslateY = 40,
  maxScaleReduction = 0.18,
  maxRotate = 6,
  maxOpacityReduction = 0.9,
  leftDirection = -1,
  rightDirection = 1,
}: ScrollRevealCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;

      // -1 සිට 1 දක්වා progress (0 = center, -1 = පහල, 1 = උඩ)
      const progress =
        (viewportCenter - elementCenter) / (windowHeight / 2 + rect.height / 2);

      const clampedProgress = Math.max(-1, Math.min(1, progress));
      setScrollProgress(clampedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const progress = scrollProgress;
  const absProgress = Math.abs(progress);

  // දර්ශනය කරන්න ඕන card ගණන
  const childrenArray = Array.isArray(children) ? children : [children];
  const totalCards = childrenArray.length;

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${className}`}
    >
      {childrenArray.map((child, idx) => {
        // Card එක මැද්දේ ඇත්නම් 0, දෙපැත්තේ ඇත්නම් වැඩි වේ
        const direction =
          totalCards === 1
            ? 0
            : idx < totalCards / 2
            ? leftDirection
            : rightDirection;

        const translateX = direction * absProgress * maxTranslateX;
        const translateY = absProgress * maxTranslateY;
        const scale = 1 - absProgress * maxScaleReduction;
        const opacity = Math.max(0, 1 - absProgress * maxOpacityReduction);
        const rotate = direction * absProgress * maxRotate;

        return (
          <div
            key={idx}
            style={{
              transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
              opacity: opacity,
              transition:
                "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s ease-out",
              willChange: "transform, opacity",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}