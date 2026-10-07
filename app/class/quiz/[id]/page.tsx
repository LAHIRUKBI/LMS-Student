// src/app/class/quiz/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Loader2, Clock, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle, HelpCircle, Send, Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import QuizSubmitSuccessPopup from "@/app/components/QuizSubmitSuccessPopup";

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
      const checkRes = await axios.get(`http://localhost:5000/api/quiz/${id}/check-submission`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (checkRes.data.submitted) {
        setAlreadySubmitted(true);
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(res.data);
      setTimeLeft(res.data.duration * 60);
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

  // පිළිතුරු කොළ (පින්තූර) එකතු කිරීම (කැමරාවෙන් හෝ ගැලරියෙන්)
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
    const totalDurationSec = quiz.duration * 60;
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

      // Short සහ Essay ප්‍රශ්නවල පිළිතුරු කොළ FormData එකට ඇතුළත් කිරීම
      Object.keys(answerSheets).forEach((qKey) => {
        answerSheets[qKey].forEach((file) => {
          formData.append(`answerSheets_${qKey}`, file);
        });
      });

      await axios.post(`http://localhost:5000/api/quiz/${quizId}/submit`, formData, {
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans pb-20">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-3xl mx-auto px-4 pt-28">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : alreadySubmitted ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border text-center space-y-4 shadow-sm">
            <AlertCircle size={56} className="text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Already Submitted!</h2>
            <p className="text-sm text-slate-500">You have already completed this quiz. It can only be taken once.</p>
            <button onClick={() => router.back()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md">
              Return to Class Room
            </button>
          </div>
        ) : error || !quiz ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border text-center text-red-500 font-bold">
            {error || "Quiz not found."}
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-20 z-20">
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">{quiz.title}</h1>
                <p className="text-xs text-slate-500 mt-0.5">{quiz.description}</p>
              </div>

              {!isSubmitted && (
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-sm font-bold ${
                  isNearTimeout ? "bg-rose-500/10 text-rose-500 border-rose-300 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  <Clock size={16} /> Time Left: <span className="font-mono text-base">{formatTime}</span>
                </div>
              )}
            </div>

            {!showSummary && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                  <span className="text-blue-600 dark:text-blue-400">{answeredCount} Answered / {totalQuestions - answeredCount} Remaining</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            )}

            {!showSummary ? (
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                
                {(() => {
                  const q = quiz.questions[currentQuestionIndex];
                  let totalQMarks = q.marks;
                  if (q.type === 'essay' && q.subQuestions) {
                    totalQMarks = q.subQuestions.reduce((s: number, sq: any) => s + sq.marks, 0);
                  }

                  return (
                    <div className="space-y-6" key={q._id || currentQuestionIndex}>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
                          {currentQuestionIndex + 1}. {q.questionText}
                        </h3>
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                          {totalQMarks} Marks ({q.type.toUpperCase()})
                        </span>
                      </div>

                      {q.imageUrl && (
                        <div className="flex justify-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border">
                          <img src={`http://localhost:5000${q.imageUrl}`} alt="Question visual" className="max-h-64 rounded-xl object-contain" />
                        </div>
                      )}

                      {q.type === 'mcq' && (
                        <div className="space-y-3 pt-2">
                          <p className="text-xs font-semibold text-indigo-400">Select all correct answers:</p>
                          {q.options.map((opt: string, optIdx: number) => {
                            const selectedArray = Array.isArray(answers[q._id]) ? answers[q._id] : [];
                            const isSelected = selectedArray.includes(opt);

                            return (
                              <div 
                                key={optIdx}
                                onClick={() => handleMCQCheckboxChange(q._id, opt)}
                                className={`p-4 rounded-2xl border cursor-pointer text-sm font-medium transition-all flex items-center gap-3.5 ${
                                  isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.01]" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} 
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 bg-white/20">
                                  {optIdx + 1}
                                </span>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'single' && (
                        <div className="space-y-3 pt-2">
                          <p className="text-xs font-semibold text-indigo-400">Select 1 correct answer:</p>
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = answers[q._id] === opt;

                            return (
                              <div 
                                key={optIdx}
                                onClick={() => handleAnswerChange(q._id, opt)}
                                className={`p-4 rounded-2xl border cursor-pointer text-sm font-medium transition-all flex items-center gap-3.5 ${
                                  isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.01]" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                                }`}
                              >
                                <input 
                                  type="radio"
                                  name={`single-q-${q._id}`}
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 bg-white/20">
                                  {optIdx + 1}
                                </span>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Short Answer (Text input සහ Answer Sheet Upload එකතු කර ඇත) */}
                      {q.type === 'short' && (
                        <div className="space-y-4 pt-2">
                          <input
                            type="text"
                            value={answers[q._id] || ""}
                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                            placeholder="Type your short answer here..."
                            className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 border-slate-200 dark:border-slate-700"
                          />

                          {/* Short ප්‍රශ්න සඳහාද කොළයක ලියා ෆොටෝ/ගැලරියෙන් එකතු කිරීමට ඇති UI කොටස */}
                          <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                  <Camera size={16} /> Upload Written Paper / Answer Sheet (Optional)
                                </h4>
                                <p className="text-[11px] text-slate-500">Take a photo using your camera or choose existing photos if you wrote on paper.</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                                  <Camera size={14} /> Open Camera
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)}
                                  />
                                </label>

                                <label className="cursor-pointer px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                                  <Upload size={14} /> Choose File
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)}
                                  />
                                </label>
                              </div>
                            </div>

                            {answerSheets[q._id] && answerSheets[q._id].length > 0 && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                                {answerSheets[q._id].map((file, fIdx) => (
                                  <div key={fIdx} className="relative group rounded-xl overflow-hidden border bg-white dark:bg-slate-900 aspect-square">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={`Answer sheet ${fIdx + 1}`} 
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAnswerSheet(q._id, fIdx)}
                                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition"
                                    >
                                      <X size={12} />
                                    </button>
                                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                                      Page {fIdx + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Essay / Structured Sub-questions & Answer Sheet Upload Section */}
                      {q.type === 'essay' && (
                        <div className="space-y-4 pt-2">
                          {q.subQuestions && q.subQuestions.length > 0 ? (
                            q.subQuestions.map((sq: any, sqIdx: number) => {
                              const subAnswersObj = (typeof answers[q._id] === 'object' && answers[q._id] !== null && !Array.isArray(answers[q._id])) 
                                ? answers[q._id] 
                                : {};

                              return (
                                <div key={sq._id || sqIdx} className="p-4 rounded-2xl border bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    ({sqIdx + 1}) {sq.subQuestionText} <span className="text-blue-500 font-normal">[{sq.marks} marks]</span>
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={subAnswersObj[sqIdx] || ""}
                                    onChange={(e) => handleSubQuestionAnswerChange(q._id, sqIdx, e.target.value)}
                                    placeholder={`Write answer for part (${sqIdx + 1})...`}
                                    className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 border-slate-200 dark:border-slate-700"
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <textarea
                              rows={6}
                              value={answers[q._id] || ""}
                              onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                              placeholder="Type your essay answer here..."
                              className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 border-slate-200 dark:border-slate-700"
                            />
                          )}

                          {/* ළමයාට කොළයක ලියා ෆොටෝ/ගැලරියෙන් එකතු කිරීමට ඇති UI කොටස */}
                          <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                  <Camera size={16} /> Upload Answer Sheets (Optional)
                                </h4>
                                <p className="text-[11px] text-slate-500">Take a photo using your camera or choose existing paper photos (Multiple pages allowed).</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                                  <Camera size={14} /> Open Camera
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)}
                                  />
                                </label>

                                <label className="cursor-pointer px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                                  <Upload size={14} /> Choose File
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => handleAnswerSheetAdd(q._id, e.target.files)}
                                  />
                                </label>
                              </div>
                            </div>

                            {answerSheets[q._id] && answerSheets[q._id].length > 0 && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                                {answerSheets[q._id].map((file, fIdx) => (
                                  <div key={fIdx} className="relative group rounded-xl overflow-hidden border bg-white dark:bg-slate-900 aspect-square">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={`Answer sheet ${fIdx + 1}`} 
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAnswerSheet(q._id, fIdx)}
                                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition"
                                    >
                                      <X size={12} />
                                    </button>
                                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                                      Page {fIdx + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-2.5 rounded-2xl border font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSummary(true)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
                    >
                      Review & Submit <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="text-center space-y-2 border-b pb-4 dark:border-slate-800">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Quiz Summary</h2>
                  <p className="text-xs text-slate-500">Review your answered and unanswered questions before final submission.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl text-center">
                    <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Answered Questions</span>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl text-center">
                    <span className="block text-2xl font-extrabold text-rose-600 dark:text-rose-400">{totalQuestions - answeredCount}</span>
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Unanswered Questions</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Palette (Click to Edit):</h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
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
                          className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                            isAnswered 
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800" 
                              : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-300 dark:border-rose-800"
                          }`}
                        >
                          <span>Q{idx + 1}</span>
                          <span className="text-[9px]">{isAnswered ? "Done" : "Empty"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="px-5 py-2.5 rounded-2xl border font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Back to Questions
                  </button>

                  <button
                    onClick={() => handleSubmitQuiz(false)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg transition flex items-center gap-2"
                  >
                    <Send size={16} /> Confirm & Submit Quiz
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <QuizSubmitSuccessPopup 
        isOpen={showSuccessPopup}
        onClose={() => router.back()}
        message="Quiz submitted successfully! Your paper has been sent to the teacher for evaluation."
      />
    </div>
  );
}