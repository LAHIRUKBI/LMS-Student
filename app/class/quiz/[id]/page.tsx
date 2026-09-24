"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Loader2, Clock, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

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
      // 1. සිසුවා දැනටමත් කර ඇද්දැයි පරීක්ෂා කිරීම
      const checkRes = await axios.get(`http://localhost:5000/api/quiz/${id}/check-submission`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (checkRes.data.submitted) {
        setAlreadySubmitted(true);
        setLoading(false);
        return;
      }

      // 2. Quiz විස්තර ලබා ගැනීම
      const res = await axios.get(`http://localhost:5000/api/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(res.data);
      setTimeLeft(res.data.duration * 60);
      setStartTime(Date.now());
    } catch (err: any) {
      setError(err.response?.data?.message || "ප්‍රශ්න පත්‍රය ලබාගැනීමේදී දෝෂයක් මතු විය.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
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
      timeTakenStr = `විනාඩි ${remMins}කට කලින් නිම කළා`;
    } else {
      timeTakenStr = "නියමිත වේලාවට නිම කළා";
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/quiz/${quizId}/submit`, {
        answers,
        timeTaken: timeTakenStr
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResultData(res.data);
      if (isAutoSubmit) {
        alert("කාලය අවසන්! ඔබගේ පිළිතුරු ස්වයංක්‍රීයව ඉදිරිපත් කරන ලදී.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "ප්‍රශ්න පත්‍රය ඉදිරිපත් කිරීම අසාර්ථක විය.");
      router.back();
    }
  };

  if (!user) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isNearTimeout = timeLeft <= 300 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans pb-20">
      <Navbar user={user} onLogout={() => { localStorage.clear(); router.push("/login"); }} />

      <main className="max-w-4xl mx-auto px-4 pt-28">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : alreadySubmitted ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border text-center space-y-4 shadow-sm">
            <AlertCircle size={56} className="text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Already Submitted!</h2>
            <p className="text-sm text-slate-500">ඔබ දැනටමත් මෙම Quiz එක සම්පූර්ණ කර ඇත. එය කළ හැක්කේ එක් වරක් පමණි.</p>
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
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-20 z-20">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{quiz.title}</h1>
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

            {isSubmitted && resultData ? (
              <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                <CheckCircle2 size={56} className="text-emerald-500 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Submitted Successfully!</h2>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Auto-Checked MCQ Score: <span className="text-blue-600 font-extrabold">{resultData.score} / {resultData.maxScore} Marks</span>
                </p>
                <p className="text-xs text-slate-400">Essay questions will be evaluated by your teacher.</p>
                <button onClick={() => router.back()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md">
                  Return to Class Room
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions.map((q: any, idx: number) => (
                  <div key={q._id || idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                        {idx + 1}. {q.questionText}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">{q.marks || 5} Marks ({q.type.toUpperCase()})</span>
                    </div>

                    {q.imageUrl && (
                      <img src={`http://localhost:5000${q.imageUrl}`} alt="Question visual" className="max-h-48 rounded-xl border object-contain" />
                    )}

                    {/* MCQ Options */}
                    {q.type === 'mcq' && (
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = answers[q._id] === opt;
                          return (
                            <div 
                              key={optIdx}
                              onClick={() => handleAnswerChange(q._id, opt)}
                              className={`p-3.5 rounded-2xl border cursor-pointer text-xs sm:text-sm font-medium transition-all flex items-center gap-3 ${
                                isSelected ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${isSelected ? "bg-white text-blue-600 border-white" : "border-slate-400"}`}>
                                {optIdx + 1}
                              </span>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Essay or Short Answer Textarea */}
                    {(q.type === 'essay' || q.type === 'short') && (
                      <div className="pt-2">
                        <textarea
                          rows={q.type === 'essay' ? 5 : 2}
                          value={answers[q._id] || ""}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button onClick={() => handleSubmitQuiz(false)} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all">
                    Submit Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}