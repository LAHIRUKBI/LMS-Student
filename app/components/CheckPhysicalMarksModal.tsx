// src/components/CheckPhysicalMarksModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Search,
  Loader2,
  AlertCircle,
  Hash,
} from "lucide-react";

interface CheckPhysicalMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PETAL_COUNT = 8;

// Grade → accent colours (same grade mapping as before, tuned for a dark theme)
const getGradeTheme = (grade: string) => {
  switch (grade) {
    case "A":
      return { pill: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", petal: "#6ee7b7" };
    case "B":
      return { pill: "text-sky-300 border-sky-400/30 bg-sky-400/10", petal: "#7dd3fc" };
    case "C":
      return { pill: "text-amber-300 border-amber-400/30 bg-amber-400/10", petal: "#fcd34d" };
    case "S":
      return { pill: "text-violet-300 border-violet-400/30 bg-violet-400/10", petal: "#c4b5fd" };
    default:
      return { pill: "text-rose-300 border-rose-400/30 bg-rose-400/10", petal: "#fda4af" };
  }
};

const modalStyles = `
  @keyframes cpm-in {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cpm-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cpm-num {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes cpm-pop {
    0%   { opacity: 0; transform: scale(0.5); }
    70%  { opacity: 1; transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes cpm-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cpm-petal {
    0%   { transform: rotate(var(--angle)) translateY(0) scale(0.4); opacity: 0; }
    20%  { opacity: 0.85; }
    100% { transform: rotate(var(--angle)) translateY(-70px) scale(1); opacity: 0; }
  }
  @keyframes cpm-core {
    0%   { transform: scale(0); opacity: 0.9; }
    60%  { transform: scale(1.4); opacity: 0.5; }
    100% { transform: scale(0); opacity: 0; }
  }

  .cpm-modal { animation: cpm-in 320ms ease-out both; }
  .cpm-card  { animation: cpm-rise 520ms ease-out both; animation-delay: var(--delay, 0ms); }
  .cpm-num   { animation: cpm-num 550ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 300ms; }
  .cpm-pop   { animation: cpm-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: 400ms; }
  .cpm-fade  { animation: cpm-fade 400ms ease-out both; }

  .cpm-burst { position: absolute; left: 50%; top: 50%; width: 0; height: 0; pointer-events: none; }
  .cpm-petal {
    position: absolute; left: -3px; top: -8px; width: 6px; height: 16px;
    border-radius: 50% 50% 50% 50% / 65% 65% 35% 35%;
    background: var(--color); opacity: 0;
    animation: cpm-petal 1000ms ease-out forwards;
  }
  .cpm-core {
    position: absolute; left: -4px; top: -4px; width: 8px; height: 8px;
    border-radius: 9999px; background: var(--color);
    animation: cpm-core 800ms ease-out forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    .cpm-modal, .cpm-card, .cpm-num, .cpm-pop, .cpm-fade { animation: none !important; }
    .cpm-petal, .cpm-core { display: none; }
  }
`;

// Soft petal burst behind the marks figure
function FlowerBurst({ color }: { color: string }) {
  return (
    <div className="cpm-burst" aria-hidden="true">
      {Array.from({ length: PETAL_COUNT }).map((_, i) => {
        const angle = (360 / PETAL_COUNT) * i;
        return (
          <span
            key={i}
            className="cpm-petal"
            style={
              {
                "--angle": `${angle}deg`,
                "--color": color,
                animationDelay: `${i * 30}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
      <span className="cpm-core" style={{ "--color": color } as React.CSSProperties} />
    </div>
  );
}

export default function CheckPhysicalMarksModal({ isOpen, onClose }: CheckPhysicalMarksModalProps) {
  const [indexNumber, setIndexNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [markData, setMarkData] = useState<any[] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Escape key closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexNumber.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setMarkData(null);

    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Fetch all physical marks for the given index number
      const res = await axios.get(`${API_URL}/api/physical-marks/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const allMarks = res.data.data;
        // Keep every record whose index number matches the input
        const matched = allMarks.filter(
          (item: any) => item.indexNumber.trim().toLowerCase() === indexNumber.trim().toLowerCase()
        );

        if (matched.length > 0) {
          setMarkData(matched);
        } else {
          setErrorMsg("No physical paper marks found for this index number.");
        }
      }
    } catch (err) {
      console.error("Error fetching physical marks:", err);
      setErrorMsg("Failed to retrieve marks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{modalStyles}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="cpm-modal relative flex flex-col w-full max-w-2xl rounded-3xl bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-2xl">
          {/* Header */}
          <div className="relative px-7 pt-6 pb-5 border-b border-zinc-800">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">
              Classroom Results
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-white">
              Physical Paper Marks
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Enter your index number to view your classroom paper marks.
            </p>
          </div>

          {/* Body */}
          <div className="flex flex-col px-7 py-5 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                <input
                  type="text"
                  value={indexNumber}
                  onChange={(e) => setIndexNumber(e.target.value)}
                  placeholder="Enter Student Index Number"
                  required
                  autoComplete="off"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-300/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-zinc-950 text-sm font-semibold transition-colors shrink-0 disabled:opacity-60"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                <span>Search</span>
              </button>
            </form>

            {/* Error */}
            {errorMsg && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-300 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-2 py-10 text-sm text-zinc-500">
                <Loader2 size={20} className="animate-spin text-amber-300/80" />
                <span>Loading marks…</span>
              </div>
            )}

            {/* Results (no inner scroll: records sit in a grid that fits the modal) */}
            {markData && (
              <>
                <p className="cpm-fade text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {markData.length} record{markData.length > 1 ? "s" : ""} found
                </p>

                <div className={`grid grid-cols-1 gap-4 ${markData.length > 1 ? "sm:grid-cols-2" : ""}`}>
                  {markData.map((item: any, idx: number) => {
                    const theme = getGradeTheme(item.grade);

                    return (
                      <article
                        key={item._id}
                        className="cpm-card rounded-2xl bg-zinc-900/70 border border-zinc-800 px-5 py-5"
                        style={{ "--delay": `${idx * 120}ms` } as React.CSSProperties}
                      >
                        {/* Centred details: student, institute, subject, class, index */}
                        <div className="text-center">
                          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                            Student  Result
                          </p>
                          <h4 className="mt-0.5 text-base font-semibold text-white">{item.studentName}</h4>

                          {item.instituteName && (
                            <p className="mt-3 text-sm font-semibold text-zinc-100">{item.instituteName}</p>
                          )}
                          {item.subjectName && (
                            <p className="mt-0.5 text-xs text-zinc-400">{item.subjectName}</p>
                          )}
                          <p className="mt-0.5 text-xs text-zinc-400">Class {item.className}</p>
                          <p className="mt-0.5 text-[11px] font-mono text-zinc-500">Index {item.indexNumber}</p>
                        </div>

                        <div className="my-4 border-t border-dashed border-zinc-800" />

                        {/* Marks + grade table */}
                        <div className="rounded-xl border border-zinc-800">
                          <div className="grid grid-cols-2 rounded-t-xl bg-zinc-900 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            <div className="px-4 py-2 border-r border-zinc-800">Marks</div>
                            <div className="px-4 py-2 text-center">Grade</div>
                          </div>

                          <div className="grid grid-cols-2">
                            <div className="relative flex items-end gap-2 px-4 py-4 border-r border-zinc-800">
                              <FlowerBurst color={theme.petal} />
                              <span className="cpm-num text-3xl font-bold text-white tabular-nums leading-none">
                                {item.marks}
                              </span>
                              <span className="pb-0.5 text-xs text-zinc-500">/ 100</span>
                            </div>

                            <div className="flex items-center justify-center px-4 py-4">
                              <span
                                className={`cpm-pop grid place-items-center h-11 w-11 rounded-full border text-base font-bold ${theme.pill}`}
                              >
                                {item.grade}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}