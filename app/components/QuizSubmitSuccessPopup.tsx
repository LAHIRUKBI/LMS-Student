// src/app/components/QuizSubmitSuccessPopup.tsx

"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface QuizSubmitSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function QuizSubmitSuccessPopup({ isOpen, onClose, message }: QuizSubmitSuccessPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl scale-100 transition-transform">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={36} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Quiz Submitted!</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
        >
          Return to Class Room
        </button>
      </div>
    </div>
  );
}