// src/app/class/quiz/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Send,
  Camera,
  Upload,
  X,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import QuizSubmitSuccessPopup from "@/app/components/QuizSubmitSuccessPopup";

// Cloudinary සහ Local Backend URLs දෙකටම ගැලපෙන Helper ශ්‍රිතය
const getQuestionImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  // Essay සහ Short ප්‍රශ්න සඳහා ළමයා ලබාදෙන පිළිතුරු කොළවල පින්තූර ගබඩා කිරීමට (Files state එක)
  const [answerSheets, setAnswerSheets] = useState<{ [key: string]: File[] }>({});

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));

    if (quizId) {
      checkAndFetchQuiz(token, quizId as string);
    }
  }, [quizId, router]);

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted || alreadySubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, alreadySubmitted]);

  const checkAndFetchQuiz = async (token: string, id: string) => {
    try {
      const checkRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/${id}/check-submission`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (checkRes.data.submitted) {
        setAlreadySubmitted(true);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(res.data);
      setTimeLeft((res.data.duration || 30) * 60);
      setStartTime(Date.now());
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch quiz data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMCQCheckboxChange = (questionId: string, optionText: string) => {
    const currentSelected: string[] = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
    if (currentSelected.includes(optionText)) {
      const updated = currentSelected.filter(item => item !== optionText);
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: [...currentSelected, optionText] });
    }
  };

  const handleSubQuestionAnswerChange = (questionId: string, subIdx: number, text: string) => {
    const currentSubAnswers = typeof answers[questionId] === 'object' && answers[questionId] !== null && !Array.isArray(answers[questionId])
      ? { ...answers[questionId] }
      : {};
    currentSubAnswers[subIdx] = text;
    setAnswers({ ...answers, [questionId]: currentSubAnswers });
  };

  // පිළිතුරු කොළ (පින්තූර) එකතු කිරීම
  const handleAnswerSheetAdd = (questionKey: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setAnswerSheets(prev => {
      const existing = prev[questionKey] || [];
      return { ...prev, [questionKey]: [...existing, ...newFiles] };
    });
  };

  // එකතු කළ පිළිතුරු කොළයක පින්තූරයක් ඉවත් කිරීම
  const handleRemoveAnswerSheet = (questionKey: string, fileIdx: number) => {
    setAnswerSheets(prev => {
      const existing = prev[questionKey] || [];
      const updated = existing.filter((_, idx) => idx !== fileIdx);
      return { ...prev, [questionKey]: updated };
    });
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (isSubmitted || alreadySubmitted) return;
    setIsSubmitted(true);

    const token = localStorage.getItem("token");
    const totalDurationSec = (quiz?.duration || 30) * 60;
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const remainingSec = totalDurationSec - elapsedSec;

    let timeTakenStr = "";
    if (remainingSec > 0) {
      const remMins = Math.floor(remainingSec / 60);
      timeTakenStr = `Completed ${remMins} minutes early`;
    } else {
      timeTakenStr = "Completed on time";
    }

    try {
      const formData = new FormData();
      formData.append("answers", JSON.stringify(answers));
      formData.append("timeTaken", timeTakenStr);

      Object.keys(answerSheets).forEach((qKey) => {
        answerSheets[qKey].forEach((file) => {
          formData.append(`answerSheets_${qKey}`, file);
        });
      });

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/${quizId}/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (isAutoSubmit) {
        alert("Time is up! Your answers have been submitted automatically.");
      }

      setShowSuccessPopup(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit quiz.");
      setIsSubmitted(false);
    }
  };

  if (!user) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formatTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isNearTimeout = timeLeft <= 300 && timeLeft > 0;

  const totalQuestions = quiz?.questions?.length || 0;
  const answeredCount = quiz?.questions ? quiz.questions.filter((q: any) => {
    const ans = answers[q._id];
    const sheets = answerSheets[q._id];
    const hasSheets = sheets && sheets.length > 0;

    if (hasSheets) return true;
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.values(ans).some((val: any) => val && val.trim() !== "");
    return String(ans).trim() !== "";
  }).length : 0;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#f3f5f8] pb-24 font-sans text-[#182230] dark:bg-[#0b1118] dark:text-[#e8eef6]">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="mx-auto max-w-5xl px-3 pb-5 pt-20 sm:px-5 sm:pt-[5.5rem]">
        {loading ? (
          <div className="grid min-h-[45vh] place-items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-[#111a24]">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={22} />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Preparing your quiz…</span>
            </div>
          </div>
        ) : alreadySubmitted ? (
          <section className="mx-auto mt-10 max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-white/10 dark:bg-[#111a24] sm:p-9">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
              <AlertCircle size={28} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Attempt already recorded</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Already submitted</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">You have already completed this quiz. It can only be taken once.</p>
            <button
              onClick={() => router.back()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#172b45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24466e] dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400"
            >
              Return to classroom <ArrowRight size={15} />
            </button>
          </section>
        ) : error || !quiz ? (
          <section className="mx-auto mt-10 max-w-lg rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm dark:border-rose-500/20 dark:bg-[#111a24]">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={27} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Unable to open this quiz</h2>
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{error || "Quiz not found."}</p>
            <button onClick={() => router.back()} className="mt-5 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Go back</button>
          </section>
        ) : (
          <div className="space-y-3">
            {/* Compact exam heading */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Back to classroom"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-[#111a24] dark:text-slate-300 dark:hover:border-blue-400/40 dark:hover:text-blue-300"
              >
                <ArrowLeft size={17} />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.19em] text-blue-600 dark:text-blue-400">Quiz session</p>
                <h1 className="truncate text-sm font-extrabold leading-5 text-slate-900 dark:text-white sm:text-base">{quiz.title}</h1>
              </div>

            </div>

            {quiz.description && (
              <p className="hidden truncate pl-[3.25rem] text-[11px] text-slate-500 dark:text-slate-400 sm:block">{quiz.description}</p>
            )}

            {!showSummary ? (
              <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_190px]">
                <div className="order-2 min-w-0 space-y-3 lg:order-1">
                  <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm dark:border-white/10 dark:bg-[#111a24]">
                    <div className="mb-2 flex items-center justify-between gap-3 text-[10px]">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        Question {currentQuestionIndex + 1} <span className="font-medium text-slate-400">/ {totalQuestions}</span>
                      </span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {answeredCount} answered <span className="px-1 text-slate-300 dark:text-slate-600">·</span> {totalQuestions - answeredCount} remaining
                      </span>
                      <span className="font-extrabold tabular-nums text-blue-700 dark:text-blue-300">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400" style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#111a24]">
                {(() => {
                  const q = quiz.questions[currentQuestionIndex];
                  let totalQMarks = q.marks;
                  if (q.type === 'essay' && q.subQuestions) {
                    totalQMarks = q.subQuestions.reduce((s: number, sq: any) => s + sq.marks, 0);
                  }

                  const questionImageSrc = getQuestionImageUrl(q.imageUrl);

                  return (
                    <div key={q._id || currentQuestionIndex}>
                      {/* Question prompt */}
                      <div className="border-b border-slate-100 px-4 py-4 dark:border-white/[0.07] sm:px-6 sm:py-5">
                        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#172b45] px-2 py-1 font-mono text-[10px] font-extrabold text-white dark:bg-blue-500">Q{String(currentQuestionIndex + 1).padStart(2, "0")}</span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{q.type === "mcq" ? "Multiple choice" : q.type === "single" ? "Single choice" : q.type === "short" ? "Short answer" : "Structured / essay"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-extrabold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">{totalQMarks} marks</span>
                          </div>
                        </div>
                        <h2 className="whitespace-pre-wrap break-words text-base font-bold leading-7 tracking-[-0.01em] text-slate-900 dark:text-slate-50 sm:text-xl sm:leading-8">{q.questionText}</h2>
                      </div>

                      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
                        {/* Question image */}
                        {questionImageSrc && (
                          <div className="flex justify-center rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-white/[0.07] dark:bg-[#0c141e]">
                            <img
                              src={questionImageSrc}
                              alt="Question visual"
                              className="max-h-[210px] max-w-full rounded-lg object-contain sm:max-h-[250px]"
                            />
                          </div>
                        )}

                        {/* Multiple choice */}
                        {q.type === 'mcq' && (
                          <div className="space-y-2.5">
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Select all correct answers</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {q.options.map((opt: string, optIdx: number) => {
                                const selectedArray = Array.isArray(answers[q._id]) ? answers[q._id] : [];
                                const isSelected = selectedArray.includes(opt);

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => handleMCQCheckboxChange(q._id, opt)}
                                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400/60 dark:bg-blue-400/10 dark:text-blue-100"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-300 dark:hover:border-blue-400/40 dark:hover:bg-white/[0.05]"
                                    }`}
                                  >
                                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                                      isSelected ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-[#07111f]" : "border-slate-300 text-transparent dark:border-slate-600"
                                    }`}>
                                      <CheckCircle2 size={12} />
                                    </span>
                                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-extrabold ${
                                      isSelected ? "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200" : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"
                                    }`}>{String(optIdx + 1).padStart(2, "0")}</span>
                                    <span className="min-w-0 flex-1 font-medium leading-5">{opt}</span>
                                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="sr-only" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Single choice */}
                        {q.type === 'single' && (
                          <div className="space-y-2.5">
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Select one correct answer</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {q.options.map((opt: string, optIdx: number) => {
                                const isSelected = answers[q._id] === opt;

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => handleAnswerChange(q._id, opt)}
                                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400/60 dark:bg-blue-400/10 dark:text-blue-100"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-300 dark:hover:border-blue-400/40 dark:hover:bg-white/[0.05]"
                                    }`}
                                  >
                                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                                      isSelected ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400" : "border-slate-300 dark:border-slate-600"
                                    }`}>
                                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#07111f]" />}
                                    </span>
                                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-extrabold ${
                                      isSelected ? "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200" : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"
                                    }`}>{String(optIdx + 1).padStart(2, "0")}</span>
                                    <span className="min-w-0 flex-1 font-medium leading-5">{opt}</span>
                                    <input type="radio" name={`single-q-${q._id}`} checked={isSelected} onChange={() => {}} className="sr-only" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Short answer */}
                        {q.type === 'short' && (
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-bold text-slate-600 dark:text-slate-300">Your answer</label>
                              <input
                                type="text"
                                value={answers[q._id] || ""}
                                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                placeholder="Type your answer here…"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#0c141e] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-blue-400/60 dark:focus:bg-[#101b29]"
                              />
                            </div>

                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 dark:border-white/15 dark:bg-white/[0.025]">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                  <Camera size={15} className="text-blue-600 dark:text-blue-400" />
                                  Attach written answer <span className="font-normal text-slate-400">(optional)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#172b45] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#24466e] dark:bg-blue-500 dark:hover:bg-blue-400">
                                    <Camera size={13} /> Camera
                                    <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)} />
                                  </label>
                                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-blue-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                                    <Upload size={13} /> Browse
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)} />
                                  </label>
                                </div>
                              </div>
                              {answerSheets[q._id] && answerSheets[q._id].length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 dark:border-white/10 sm:grid-cols-5">
                                  {answerSheets[q._id].map((file, fIdx) => (
                                    <div key={fIdx} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0c141e]">
                                      <img src={URL.createObjectURL(file)} alt={`Answer sheet ${fIdx + 1}`} className="h-full w-full object-cover" />
                                      <button type="button" onClick={() => handleRemoveAnswerSheet(q._id, fIdx)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-950/75 text-white hover:bg-rose-600"><X size={12} /></button>
                                      <span className="absolute bottom-1 left-1 rounded bg-slate-950/75 px-1.5 py-0.5 text-[8px] font-bold text-white">PAGE {fIdx + 1}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Essay and structured sub-questions */}
                        {q.type === 'essay' && (
                          <div className="space-y-3">
                            {q.subQuestions && q.subQuestions.length > 0 ? (
                              q.subQuestions.map((sq: any, sqIdx: number) => {
                                const subAnswersObj = (typeof answers[q._id] === 'object' && answers[q._id] !== null && !Array.isArray(answers[q._id]))
                                  ? answers[q._id]
                                  : {};

                                return (
                                  <div key={sq._id || sqIdx} className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                                    <div className="flex items-start justify-between gap-3 bg-slate-50 px-3 py-2.5 dark:bg-white/[0.035]">
                                      <label className="flex min-w-0 items-start gap-2 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">
                                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-100 font-mono text-[9px] font-extrabold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">{String(sqIdx + 1).padStart(2, "0")}</span>
                                        <span>{sq.subQuestionText}</span>
                                      </label>
                                      <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[9px] font-bold text-blue-700 dark:bg-white/[0.06] dark:text-blue-300">{sq.marks} marks</span>
                                    </div>
                                    <div className="p-2.5">
                                      <textarea
                                        rows={3}
                                        value={subAnswersObj[sqIdx] || ""}
                                        onChange={(e) => handleSubQuestionAnswerChange(q._id, sqIdx, e.target.value)}
                                        placeholder={`Write your answer for part (${sqIdx + 1})…`}
                                        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#0c141e] dark:text-white dark:placeholder:text-slate-600"
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div>
                                <label className="mb-1.5 block text-[11px] font-bold text-slate-600 dark:text-slate-300">Your essay answer</label>
                                <textarea
                                  rows={5}
                                  value={answers[q._id] || ""}
                                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                  placeholder="Write your answer here…"
                                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#0c141e] dark:text-white dark:placeholder:text-slate-600"
                                />
                              </div>
                            )}

                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 dark:border-white/15 dark:bg-white/[0.025]">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                  <Camera size={15} className="text-blue-600 dark:text-blue-400" />
                                  Upload answer sheets <span className="font-normal text-slate-400">(optional)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#172b45] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#24466e] dark:bg-blue-500 dark:hover:bg-blue-400">
                                    <Camera size={13} /> Camera
                                    <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)} />
                                  </label>
                                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-blue-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                                    <Upload size={13} /> Browse
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)} />
                                  </label>
                                </div>
                              </div>
                              {answerSheets[q._id] && answerSheets[q._id].length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 dark:border-white/10 sm:grid-cols-5">
                                  {answerSheets[q._id].map((file, fIdx) => (
                                    <div key={fIdx} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0c141e]">
                                      <img src={URL.createObjectURL(file)} alt={`Answer sheet ${fIdx + 1}`} className="h-full w-full object-cover" />
                                      <button type="button" onClick={() => handleRemoveAnswerSheet(q._id, fIdx)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-950/75 text-white hover:bg-rose-600"><X size={12} /></button>
                                      <span className="absolute bottom-1 left-1 rounded bg-slate-950/75 px-1.5 py-0.5 text-[8px] font-bold text-white">PAGE {fIdx + 1}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                  </section>
                </div>

                {/* Timer and calendar-style question navigator */}
                <aside className="order-1 space-y-2.5 lg:sticky lg:top-24 lg:order-2">
                  {!isSubmitted && (
                    <div className={`rounded-2xl border p-3 shadow-sm ${
                      isNearTimeout
                        ? "border-rose-200 bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/[0.08]"
                        : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#111a24]"
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Time remaining</p>
                          <p className="mt-0.5 text-[9px] font-medium text-slate-400">Keep an eye on your time</p>
                        </div>
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${
                          isNearTimeout
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300"
                        }`}>
                          <Clock size={16} className={isNearTimeout ? "animate-pulse" : ""} />
                        </span>
                      </div>
                      <div className={`mt-2 font-mono text-[1.65rem] font-extrabold leading-none tracking-[0.04em] tabular-nums ${
                        isNearTimeout ? "text-rose-600 dark:text-rose-300" : "text-slate-900 dark:text-white"
                      }`}>
                        {formatTime}
                      </div>
                      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">Hours : Minutes : Seconds</div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#111a24]">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">Question calendar</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">Jump to a question</p>
                      </div>
                      <div className="rounded-lg bg-slate-100 px-2 py-1 text-center dark:bg-white/[0.06]">
                        <span className="block text-sm font-extrabold leading-4 tabular-nums text-slate-800 dark:text-white">{totalQuestions}</span>
                        <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-1.5 lg:grid-cols-5">
                      {quiz.questions.map((q: any, idx: number) => {
                        const ans = answers[q._id];
                        const sheets = answerSheets[q._id];
                        let isAnswered = false;
                        if ((sheets && sheets.length > 0) || (ans !== undefined && ans !== null)) {
                          if (Array.isArray(ans)) isAnswered = ans.length > 0;
                          else if (typeof ans === 'object') isAnswered = Object.values(ans).some((val: any) => val && val.trim() !== "");
                          else isAnswered = String(ans).trim() !== "";
                          if (sheets && sheets.length > 0) isAnswered = true;
                        }
                        const isCurrent = idx === currentQuestionIndex;

                        return (
                          <button
                            key={q._id || idx}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(idx)}
                            aria-label={`Go to question ${idx + 1}${isAnswered ? ', answered' : ', not answered'}`}
                            aria-current={isCurrent ? "step" : undefined}
                            title={`Question ${idx + 1}${isAnswered ? " · Answered" : " · Not answered"}`}
                            className={`relative grid aspect-square w-full place-items-center rounded-lg border text-[11px] font-extrabold tabular-nums transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-[#111a24] ${
                              isCurrent
                                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-200 dark:border-blue-400 dark:bg-blue-500 dark:ring-blue-400/20"
                                : isAnswered
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 dark:border-emerald-500/25 dark:bg-emerald-500/[0.10] dark:text-emerald-300"
                                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:border-blue-400/40 dark:hover:bg-blue-400/[0.08]"
                            }`}
                          >
                            {idx + 1}
                            {isAnswered && !isCurrent && <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 dark:border-white/[0.07]">
                      <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-slate-500 dark:text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Answered</span>
                      <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-slate-500 dark:text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Pending</span>
                      <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-slate-500 dark:text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Current</span>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              /* Review answers */
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111a24]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-white/[0.07] sm:px-5">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Final check</p>
                    <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">Review your answers</h2>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">{answeredCount} of {totalQuestions} answered</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-3 sm:p-4">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-3 dark:bg-emerald-500/[0.07]">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-lg font-extrabold leading-5 text-emerald-700 dark:text-emerald-300">{answeredCount}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700/70 dark:text-emerald-300/70">Answered</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-rose-50 px-3 py-3 dark:bg-rose-500/[0.07]">
                    <AlertCircle size={18} className="text-rose-600 dark:text-rose-400" />
                    <div>
                      <p className="text-lg font-extrabold leading-5 text-rose-700 dark:text-rose-300">{totalQuestions - answeredCount}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-rose-700/70 dark:text-rose-300/70">Unanswered</p>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-4 sm:px-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Question list</h3>
                    <span className="text-[10px] text-slate-400">Select any number to edit</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                    {quiz.questions.map((q: any, idx: number) => {
                      const ans = answers[q._id];
                      const sheets = answerSheets[q._id];
                      let isAnswered = false;
                      if ((sheets && sheets.length > 0) || (ans !== undefined && ans !== null)) {
                        if (Array.isArray(ans)) isAnswered = ans.length > 0;
                        else if (typeof ans === 'object') isAnswered = Object.values(ans).some((val: any) => val && val.trim() !== "");
                        else isAnswered = String(ans).trim() !== "";
                        if (sheets && sheets.length > 0) isAnswered = true;
                      }

                      return (
                        <button
                          key={q._id || idx}
                          onClick={() => {
                            setCurrentQuestionIndex(idx);
                            setShowSummary(false);
                          }}
                          className={`flex h-12 flex-col items-center justify-center rounded-lg border text-[10px] font-extrabold transition hover:-translate-y-0.5 ${
                            isAnswered
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08] dark:text-emerald-300"
                              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/[0.08] dark:text-rose-300"
                          }`}
                        >
                          <span>Q{idx + 1}</span>
                          <span className="text-[8px] font-semibold opacity-70">{isAnswered ? "Done" : "Empty"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-3 dark:border-white/[0.07] dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                  >
                    <ArrowLeft size={14} /> Back to questions
                  </button>
                  <button
                    onClick={() => handleSubmitQuiz(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    <Send size={14} /> Confirm & submit quiz
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Fixed, compact navigation keeps the main question in focus */}
      {!loading && !alreadySubmitted && !error && quiz && !showSummary && !isSubmitted && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0e1722]/95 sm:px-5">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentQuestionIndex === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
            >
              <ArrowLeft size={14} /> <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
            </button>

            <div className="min-w-0 text-center">
              <p className="text-[10px] font-extrabold tabular-nums text-slate-700 dark:text-slate-200">{currentQuestionIndex + 1} <span className="font-medium text-slate-400">/ {totalQuestions}</span></p>
              <p className="hidden text-[8px] font-bold uppercase tracking-[0.13em] text-slate-400 sm:block">Question navigation</p>
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#172b45] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#24466e] dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setShowSummary(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                Review <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <QuizSubmitSuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => router.back()}
        message="Quiz submitted successfully! Your paper has been sent to the teacher for evaluation."
      />
    </div>
  );
}
