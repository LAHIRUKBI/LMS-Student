// /app/components/SuccessPopup.tsx
"use client";

import { CheckCircle } from "lucide-react";

interface SuccessPopupProps {
  isVisible: boolean;
  message: string;
}

export default function SuccessPopup({ isVisible, message }: SuccessPopupProps) {
  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-12 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-emerald-500/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(16,185,129,0.35)] border border-emerald-400 px-6 py-3.5 rounded-full">
        <div className="flex items-center justify-center bg-white/25 p-1 rounded-full shadow-inner">
          <CheckCircle className="text-white" size={20} strokeWidth={2.5} />
        </div>
        <p className="text-sm font-bold text-white tracking-wide pr-2">
          {message}
        </p>
      </div>
    </div>
  );
}