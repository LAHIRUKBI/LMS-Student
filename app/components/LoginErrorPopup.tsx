// app/components/ErrorPopup.jsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ShieldAlert, XCircle } from "lucide-react";

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function ErrorPopup({ isOpen, onClose, message = "An error occurred." }: ErrorPopupProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // තත්පර 1.5 කට පසු checking/loading animation එක අවසන් කර Error එක පෙන්වයි
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500); 
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border dark:border-slate-700 overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              {isAnimating ? (
                // 1. Verifying / Checking Animation State
                <motion.div
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center w-full py-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                    className="bg-red-100 dark:bg-red-900/40 p-4 rounded-full border border-red-200 dark:border-red-800 mb-4"
                  >
                    <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </motion.div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Verifying Account...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
                    Checking registration status
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.3, ease: "easeInOut" }}
                      className="bg-red-500 h-full"
                    />
                  </div>
                </motion.div>
              ) : (
                // 2. Error Message Display State
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center w-full"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <XCircle className="w-20 h-20 text-red-500 mb-4" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Access Denied
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-center text-sm mb-8 leading-relaxed">
                    {message}
                  </p>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 active:scale-[0.98]"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}