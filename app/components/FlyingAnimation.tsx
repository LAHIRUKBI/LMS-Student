"use client";

import React, { useState, useRef } from "react";
import { Send, CheckCircle2, X } from "lucide-react";

interface FlyingAnimationProps {
  onFinish: () => void;
  buttonText?: string;
  className?: string;
  successMessage?: string;
  successTitle?: string;
}

export default function FlyingAnimation({
  onFinish,
  buttonText = "Request Class",
  className = "",
  successTitle = "Request Sent Successfully!",
  successMessage = "Your request has been sent to the teacher. Please wait for approval.",
}: FlyingAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [rocketPos, setRocketPos] = useState({ x: 0, y: 0 });
  const [showRocket, setShowRocket] = useState(false);
  const [showBlur, setShowBlur] = useState(false);
  const [isLanding, setIsLanding] = useState(false);
  const [isUnfolding, setIsUnfolding] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (isAnimating) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setRocketPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    setIsAnimating(true);
    setShowRocket(true);

    // Page blur
    setTimeout(() => {
      setShowBlur(true);
    }, 150);

    // Rocket completes smooth flight + landing
    setTimeout(() => {
      setIsLanding(true);
    }, 3200);

    // Rocket → Paper unfolding (Smoother transition)
    setTimeout(() => {
      setIsUnfolding(true);
    }, 3900);

    // Success content appears smoothly
    setTimeout(() => {
      setShowContent(true);
    }, 4800);

    // Trigger backend request
    setTimeout(() => {
      onFinish();
    }, 5000);

    // Auto close (Extended viewing time: ~8 seconds visible for reading)
    setTimeout(() => {
      closePopup();
    }, 13000);
  };

  const closePopup = () => {
    setShowContent(false);

    setTimeout(() => {
      setIsUnfolding(false);
      setIsLanding(false);
      setShowRocket(false);
      setShowBlur(false);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isAnimating}
        className={`relative w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed ${className}`}
      >
        <span
          className={`flex items-center gap-1.5 transition-all duration-300 ${
            isAnimating ? "opacity-0 scale-75" : "opacity-100 scale-100"
          }`}
        >
          <Send size={14} />
          {buttonText}
        </span>

        {isAnimating && (
          <span className="absolute inset-0 rounded-xl animate-glow-ring pointer-events-none" />
        )}
      </button>

      {showBlur && (
        <div className="fixed inset-0 z-[9998] pointer-events-none animate-blur-overlay backdrop-blur-md bg-slate-900/20 dark:bg-slate-950/40" />
      )}

      {showRocket && !isLanding && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${rocketPos.x}px`,
            top: `${rocketPos.y}px`,
          }}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <Send
              size={34}
              className="text-blue-500 drop-shadow-[0_0_18px_rgba(59,130,246,0.9)] animate-rocket-natural"
            />
          </div>

          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-trail-natural"
                style={{
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>

          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
            {[...Array(8)].map((_, i) => (
              <span
                key={`smoke-${i}`}
                className="absolute w-3 h-3 bg-slate-300/70 dark:bg-slate-500/70 rounded-full animate-smoke-natural"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {isLanding && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-md animate-popup-backdrop"
            onClick={closePopup}
          />

          <div className="relative flex items-center justify-center">
            <div
              className={`relative transition-all duration-700 ease-out ${
                isUnfolding ? "opacity-0 scale-50" : "opacity-100 scale-100"
              }`}
            >
              <div className="relative animate-rocket-land-natural">
                <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-xl animate-rocket-glow" />
                <Send
                  size={56}
                  className="relative text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,1)]"
                />

                {[...Array(8)].map((_, i) => (
                  <span
                    key={`land-sparkle-${i}`}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-land-sparkle"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      transform: `rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>

            {isUnfolding && (
              <div className="absolute animate-paper-unfold">
                <div className="relative bg-gradient-to-b from-amber-50 via-amber-50 to-amber-100 dark:from-slate-100 dark:via-slate-50 dark:to-slate-200 border-2 border-amber-700/30 shadow-2xl px-6 sm:px-8 py-8 w-[340px] sm:w-[420px] rounded-lg">
                  
                  <div className="absolute -top-2 left-0 right-0 h-3 flex justify-between px-2">
                    {[...Array(14)].map((_, i) => (
                      <div
                        key={`top-${i}`}
                        className="w-3 h-3 bg-amber-50 dark:bg-slate-100 border-t-2 border-amber-700/30 rotate-45"
                        style={{ marginTop: "6px" }}
                      />
                    ))}
                  </div>

                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-700/40 rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-700/40 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-700/40 rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-700/40 rounded-br-lg" />

                  <button
                    onClick={closePopup}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-amber-200/60 transition-colors text-amber-800/70 hover:text-amber-900 z-10"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>

                  <div
                    className={`flex flex-col items-center text-center pt-2 transition-all duration-700 ${
                      showContent
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-success-ring" />
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-success-ring-delayed" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-success-bounce">
                        <CheckCircle2
                          size={36}
                          className="text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-amber-900 dark:text-slate-900 mb-3">
                      {successTitle}
                    </h3>

                    <div className="flex items-center gap-2 my-3 w-full">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
                    </div>

                    <p className="text-xs sm:text-sm text-amber-800/80 dark:text-slate-700 leading-relaxed mb-5 px-1">
                      {successMessage}
                    </p>

                    <button
                      onClick={closePopup}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Got it, Thanks!
                    </button>

                    {showContent && (
                      <div className="w-full mt-3 h-1 bg-amber-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-progress-bar-8s" />
                      </div>
                    )}
                  </div>

                  <div className="absolute -bottom-2 left-0 right-0 h-3 flex justify-between px-2">
                    {[...Array(14)].map((_, i) => (
                      <div
                        key={`bottom-${i}`}
                        className="w-3 h-3 bg-amber-100 dark:bg-slate-200 border-b-2 border-amber-700/30 rotate-45"
                        style={{ marginTop: "-6px" }}
                      />
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}