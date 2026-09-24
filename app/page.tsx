"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isDropped, setIsDropped] = useState(false);
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    // බල්බය පහළට පැමිණීම (2.2s)
    const dropTimer = setTimeout(() => {
      setIsDropped(true);
    }, 2200);

    // බල්බය දැල්වීම (drop එකෙන් පසු)
    const lightTimer = setTimeout(() => {
      setIsLit(true);
    }, 2600);

    // /login පිටුවට යාම (සම්පූර්ණ animation එක නැරඹීමට කාලය)
    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 8500);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(lightTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black font-sans relative overflow-hidden">

      <style>{`
        /* ===== Background glow (cool blue/slate light spreads) ===== */
        .bg-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 50% 30%,
            rgba(96, 165, 250, 0.15) 0%,
            rgba(59, 130, 246, 0.05) 30%,
            rgba(0, 0, 0, 0) 65%
          );
          opacity: 0;
          transition: opacity 2s ease-in-out;
          pointer-events: none;
          z-index: 1;
        }
        .bg-glow.lit { opacity: 1; }

        /* ===== Bulb drop animation (gravity + bounce) ===== */
        @keyframes dropBounce {
          0%   { transform: translateY(-260px); }
          55%  { transform: translateY(0); }
          68%  { transform: translateY(-14px); }
          80%  { transform: translateY(0); }
          88%  { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        .bulb-container {
          animation: dropBounce 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          position: absolute;
          top: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 20;
          will-change: transform;
        }

        /* ===== Wire sway ===== */
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(1.2deg); }
        }
        .wire {
          animation: sway 4s ease-in-out infinite;
          transform-origin: top center;
        }

        /* ===== Spotlight (soft blue light spread) ===== */
        .spotlight {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%) scale(0.85);
          width: 620px;
          height: 620px;
          background: radial-gradient(
            circle,
            rgba(147, 197, 253, 0.22) 0%,
            rgba(96, 165, 250, 0.10) 25%,
            rgba(59, 130, 246, 0.04) 50%,
            rgba(0, 0, 0, 0) 75%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 1.6s ease-in-out, transform 1.6s ease-in-out;
          z-index: 5;
          filter: blur(6px);
        }
        .spotlight.lit {
          opacity: 1;
          transform: translateX(-50%) scale(1);
          animation: spotlightPulse 5s ease-in-out infinite 1.6s;
        }
        @keyframes spotlightPulse {
          0%, 100% { opacity: 0.95; transform: translateX(-50%) scale(1); }
          50%      { opacity: 1;    transform: translateX(-50%) scale(1.05); }
        }

        /* ===== Bulb glow flicker (Blue/Slate tint) ===== */
        @keyframes bulbFlicker {
          0%   { opacity: 0.7; filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.6)); }
          10%  { opacity: 1;   filter: drop-shadow(0 0 18px rgba(96, 165, 250, 0.95)); }
          20%  { opacity: 0.85;filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.8)); }
          30%  { opacity: 1;   filter: drop-shadow(0 0 22px rgba(96, 165, 250, 1)); }
          100% { opacity: 1;   filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.9)); }
        }
        .bulb-lit {
          color: #93c5fd; /* Light Blue */
          animation: bulbFlicker 2.5s ease-out forwards;
        }

        /* ===== Child + Book fade/scale in ===== */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .content-visible {
          animation: fadeInUp 1.4s ease-out forwards;
        }

        /* ===== Book (realistic page flip) ===== */
        .book-container {
          position: relative;
          width: 120px;
          height: 70px;
          perspective: 1200px;
          margin-top: -8px;
          /* Blue tinted drop shadow */
          filter: drop-shadow(0 6px 14px rgba(96, 165, 250, 0.25));
        }
        .book-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 4px;
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.12);
        }
        .book-spine {
          position: absolute;
          left: 50%;
          top: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8, #cbd5e1);
          transform: translateX(-50%);
          z-index: 15;
          border-radius: 1px;
        }
        .page {
          position: absolute;
          top: 0;
          right: 50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to left, #ffffff 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-right: none;
          transform-origin: right center;
          border-radius: 4px 0 0 4px;
          box-shadow: inset -2px 0 4px rgba(0,0,0,0.06);
          animation: flip 2.4s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
          backface-visibility: hidden;
        }
        .page:nth-child(1) { animation-delay: 0s; }
        .page:nth-child(2) { animation-delay: 0.6s; }
        .page:nth-child(3) { animation-delay: 1.2s; }
        .page:nth-child(4) { animation-delay: 1.8s; }

        @keyframes flip {
          0%   { transform: rotateY(0deg);   opacity: 1; }
          45%  { opacity: 1; }
          50%  { transform: rotateY(-90deg); opacity: 0.85; }
          100% { transform: rotateY(-180deg);opacity: 0; }
        }

        /* ===== Loading dots ===== */
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
        .dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #93c5fd; /* Blue dot */
          margin: 0 3px;
          animation: dotBounce 1.4s infinite ease-in-out;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* Background glow */}
      <div className={`bg-glow ${isLit ? "lit" : ""}`}></div>

      {/* Dropping bulb + wire */}
      <div className="bulb-container">
        <div className="wire">
          <div className="w-[2px] h-24 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 mx-auto"></div>
        </div>

        {/* Bulb SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-14 h-14 rotate-180 transition-colors duration-1000 ${
            isLit ? "bulb-lit" : "text-gray-700"
          }`}
        >
          <path d="M12 2.25a7.125 7.125 0 00-7.125 7.125c0 2.65 1.455 5.013 3.655 6.195a2.25 2.25 0 011.22 2.003v.427c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-.427c0-.853.486-1.636 1.22-2.003 2.2-1.182 3.655-3.545 3.655-6.195A7.125 7.125 0 0012 2.25zm1.5 17.25h-3a1.5 1.5 0 001.5 1.5h0a1.5 1.5 0 001.5-1.5z" />
        </svg>
      </div>

      <main className="flex flex-col items-center justify-center w-full mt-24 relative">

        {/* Spotlight */}
        <div className={`spotlight ${isLit ? "lit" : ""}`}></div>

        {/* Child + Book (fade in when lit) */}
        <div className={isLit ? "content-visible flex flex-col items-center relative z-10" : "opacity-0 flex flex-col items-center relative z-10"}>
          {/* Child silhouette - Now with blue tint drop shadow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="currentColor"
            className="w-24 h-24 text-gray-200 z-10 relative drop-shadow-[0_0_12px_rgba(147,197,253,0.35)]"
          >
            <circle cx="32" cy="16" r="9" />
            <path d="M32,28 C22,28 16,36 16,46 L16,56 L24,56 L24,46 C24,40 28,38 32,38 C36,38 40,40 40,46 L40,56 L48,56 L48,46 C48,36 42,28 32,28 Z" />
          </svg>

          {/* Book with page flip */}
          <div className="book-container">
            <div className="book-base"></div>
            <div className="page"></div>
            <div className="page"></div>
            <div className="page"></div>
            <div className="page"></div>
            <div className="book-spine"></div>
          </div>

          {/* Loading indicator */}
          <div className="mt-10 flex flex-col items-center space-y-3">
            <p className="text-sm font-medium text-blue-100/70 tracking-[0.3em] uppercase">
              Loading
            </p>
            <div className="flex items-center">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-600 tracking-wider z-10">
        powered by LI Solution @2026
      </div>
    </div>
  );
}