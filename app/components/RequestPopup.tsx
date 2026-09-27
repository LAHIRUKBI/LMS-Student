// src/components/RequestPopup.tsx

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

interface RequestPopupProps {
  isOpen: boolean;
  type: "success" | "error" | "";
  message: string;
  onClose: () => void;
}

export default function RequestPopup({ isOpen, type, message, onClose }: RequestPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Backdrop with Smooth Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Professional Modal Card */}
      <div className={`relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 text-center transform transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
        }`}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        {/* Elegant Icon Badge */}
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={26} strokeWidth={2.2} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={26} strokeWidth={2.2} />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
          {isSuccess ? "Request Successful" : "Action Failed"}
        </h3>

        {/* Dynamic Message */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Professional Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] ${
            isSuccess 
              ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white" 
              : "bg-rose-600 hover:bg-rose-700 text-white"
          }`}
        >
          Continue
        </button>

      </div>
    </div>
  );
}