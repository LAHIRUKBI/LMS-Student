// src/app/student/profile/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import FreeCardRequestModal from "@/app/page_components/free_card_request/page"; 
import { Save, User, Mail, Phone, MapPin, GraduationCap, Loader2, Building, Camera, CheckCircle2, AlertCircle, Globe, Clock, BookOpen, Users, Download, Award, Check, X, ShieldCheck, Sparkles, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { io } from "socket.io-client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [myResults, setMyResults] = useState<any[]>([]);
  const [joinedClassesCount, setJoinedClassesCount] = useState(0);

  // Edit Profile Section Collapse State (localStorage මඟින් මතක තබා ගනී)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("isEditProfileOpen");
      return savedState !== null ? JSON.parse(savedState) : true;
    }
    return true;
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Free Card Modal State
  const [isFreeCardModalOpen, setIsFreeCardModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    grade: "",
    school: "",
    country: "",
    timeZone: "",
    medium: "",
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    hasGuardian: false,
    guardianName: "",
    guardianRelation: "",
    guardianPhone: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);

    setCurrentUser(parsedUser);

    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      address: parsedUser.address || "",
      grade: parsedUser.grade || "",
      school: parsedUser.school || "",
      country: parsedUser.country || "",
      timeZone: parsedUser.timeZone || "",
      medium: parsedUser.medium || "",
      fatherName: parsedUser.fatherName || "",
      fatherOccupation: parsedUser.fatherOccupation || "",
      fatherPhone: parsedUser.fatherPhone || "",
      motherName: parsedUser.motherName || "",
      motherOccupation: parsedUser.motherOccupation || "",
      motherPhone: parsedUser.motherPhone || "",
      hasGuardian: parsedUser.hasGuardian || false,
      guardianName: parsedUser.guardianName || "",
      guardianRelation: parsedUser.guardianRelation || "",
      guardianPhone: parsedUser.guardianPhone || ""
    });

    if (parsedUser.profileImage) {
      const imgUrl = parsedUser.profileImage.startsWith("http")
        ? parsedUser.profileImage
        : `http://localhost:5000${parsedUser.profileImage}`;
      setImagePreview(imgUrl);
    }

    fetchJoinedClassesCount(token);
    setLoading(false);
  }, [router]);

  // Student Real-time Online Socket Effect
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser._id) {
        const socket = io("http://localhost:5000");

        // Notifying the backend that the student has joined.
        socket.emit("student_connected", parsedUser._id);

        const handleBeforeUnload = () => {
          socket.emit("student_logout", parsedUser._id);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
          socket.emit("student_logout", parsedUser._id);
          socket.disconnect();
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      }
    }
  }, []);

  // Obtaining the number of registered and approved classes
  const fetchJoinedClassesCount = async (authToken: string) => {
    try {
      const [classRes, reqRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes/all", { headers: { Authorization: `Bearer ${authToken}` } }),
        axios.get("http://localhost:5000/api/classes/student-requests", { headers: { Authorization: `Bearer ${authToken}` } })
      ]);

      const requests = reqRes.data;
      const approvedClassIds = requests
        .filter((r: any) => r.status === 'Approved')
        .map((r: any) => r.classId);

      const filteredClasses = classRes.data.filter((cls: any) => approvedClassIds.includes(cls._id));
      setJoinedClassesCount(filteredClasses.length);
    } catch (err) {
      console.error("Error fetching joined classes count:", err);
    }
  };

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/quiz/student/my-results", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyResults(res.data);
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };
    fetchMyResults();
  }, []);

  const handleToggleEditProfile = () => {
    const newState = !isEditProfileOpen;
    setIsEditProfileOpen(newState);
    localStorage.setItem("isEditProfileOpen", JSON.stringify(newState));
  };

  // සිසුවාගේ පිළිතුරු පත්‍රය සහ එක් එක් ප්‍රශ්නයට ලැබුණු ලකුණු PDF එකක් ලෙස ඩවුන්ලෝඩ් කරගැනීම
  const handleDownloadStudentPaperPDF = (result: any) => {
    const quiz = result.quizId;
    if (!quiz) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the PDF.");
      return;
    }

    const studentAnswers = result.answers instanceof Map ? Object.fromEntries(result.answers) : (result.answers || {});
    const teacherEssayMarks = result.essayMarks instanceof Map ? Object.fromEntries(result.essayMarks) : (result.essayMarks || {});
    const teacherCorrections = result.teacherCorrections instanceof Map ? Object.fromEntries(result.teacherCorrections) : (result.teacherCorrections || {});

    let htmlContent = `
      <html>
        <head>
          <title>${quiz.title} - My Submission & Results</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 22px; color: #0f172a; margin-bottom: 5px; }
            p { font-size: 13px; color: #64748b; margin-bottom: 15px; }
            .score-box { background: #e0e7ff; color: #3730a3; padding: 12px; border-radius: 8px; font-weight: bold; margin-bottom: 25px; font-size: 14px; }
            .question-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .q-title { font-weight: bold; font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
            .badge { background: #f1f5f9; color: #475569; padding: 3px 8px; font-size: 11px; border-radius: 4px; font-weight: bold; }
            .q-score { background: #e0e7ff; color: #3730a3; padding: 2px 8px; font-size: 11px; border-radius: 4px; font-weight: bold; }
            ul { margin: 8px 0; padding-left: 20px; font-size: 13px; }
            li { margin-bottom: 4px; }
            .ans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
            .ans-item { padding: 8px; border-radius: 6px; font-size: 12px; border: 1px solid #e2e8f0; background: #f8fafc; }
            .correct { color: #065f46; font-weight: bold; }
            .incorrect { color: #991b1b; font-weight: bold; }
            .feedback-box { margin-top: 10px; padding: 10px; border-radius: 6px; background: #eef2ff; border: 1px solid #c7d2fe; font-size: 12px; color: #312e81; }
          </style>
        </head>
        <body>
          <h1>${quiz.title}</h1>
          <p>Student Name: <strong>${currentUser?.name}</strong> | Time Taken: ${result.timeTaken || 'N/A'}</p>
          <div class="score-box">Total Score Awarded: ${result.score} / ${result.maxScore} Marks</div>
    `;

    quiz.questions.forEach((q: any, idx: number) => {
      const qId = q._id.toString();
      const studentAns = String(studentAnswers[qId] || "No Answer Given").trim();
      const correctAns = String(q.correctAnswer || "").trim();

      // Verifying correctness/incorrectness
      let isCorrect = false;
      if (q.type === 'single') {
        const cleanStudent = studentAns.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanCorrect = correctAns.toLowerCase().replace(/[^a-z0-9]/g, '');
        isCorrect = cleanStudent === cleanCorrect && cleanStudent !== "";
      } else if (q.type === 'short') {
        if (correctAns) {
          const cleanStudent = studentAns.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanRef = correctAns.toLowerCase().replace(/[^a-z0-9]/g, '');
          isCorrect = cleanStudent === cleanRef;
        } else {
          isCorrect = false;
        }
      } else if (q.type === 'mcq') {
        const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const studentAnsArr = studentAnswers[qId];
        if (Array.isArray(studentAnsArr)) {
          isCorrect = correctArr.every((a: string) => studentAnsArr.includes(a)) && studentAnsArr.every((a: string) => correctArr.includes(a));
        }
      }

      // Calculation of marks obtained for the question
      let earnedQMarks = 0;
      let maxQMarks = q.marks || 5;
      if (q.type === 'essay' && q.subQuestions && q.subQuestions.length > 0) {
        maxQMarks = q.subQuestions.reduce((s: number, sq: any) => s + sq.marks, 0);
      }

      if (q.type !== 'essay') {
        if (isCorrect) earnedQMarks = q.marks;
        else {
          const mMark = teacherEssayMarks[qId];
          earnedQMarks = mMark !== undefined ? Number(mMark) : 0;
        }
      } else {
        const val = teacherEssayMarks[qId];
        if (typeof val === 'object' && val !== null) {
          earnedQMarks = Object.values(val).reduce((s: number, m: any) => s + (Number(m) || 0), 0);
        } else {
          earnedQMarks = Number(val) || 0;
        }
      }

      let displayStudentAns = "";
      if (Array.isArray(studentAnswers[qId])) {
        displayStudentAns = studentAnswers[qId].join(', ');
      } else if (typeof studentAnswers[qId] === 'object' && studentAnswers[qId] !== null) {
        displayStudentAns = Object.entries(studentAnswers[qId])
          .map(([k, v]) => `Part (${Number(k) + 1}): ${v}`)
          .join(' | ');
      } else {
        displayStudentAns = studentAns;
      }

      // Receiving Teacher's Corrections / Feedback
      let correctionText = "";
      const tCorrections = result.teacherCorrections;
      if (tCorrections) {
        if (typeof tCorrections.get === 'function') {
          correctionText = tCorrections.get(qId) || "";
        } else if (typeof tCorrections === 'object') {
          correctionText = tCorrections[qId] || "";
        }
      }

      htmlContent += `
        <div class="question-box">
          <div class="q-title">
            <span>${idx + 1}. ${q.questionText} <span class="badge">${q.type.toUpperCase()}</span></span>
            <span class="q-score">Score: ${earnedQMarks} / ${maxQMarks} Marks</span>
          </div>
      `;
      if ((q.type === 'mcq' || q.type === 'single') && q.options && q.options.length > 0) {
        htmlContent += `<ul>`;
        q.options.forEach((opt: string, oIdx: number) => {
          htmlContent += `<li><strong>(${oIdx + 1})</strong> ${opt}</li>`;
        });
        htmlContent += `</ul>`;
      }
      htmlContent += `
          <div class="ans-grid">
            <div class="ans-item">
              <strong>Your Answer:</strong><br/>
              <span class="${q.type !== 'essay' && q.type !== 'short' ? (isCorrect ? 'correct' : 'incorrect') : ''}">${displayStudentAns} ${q.type !== 'essay' && q.type !== 'short' ? (isCorrect ? '(Correct ✅)' : '(Incorrect ❌)') : ''}</span>
            </div>
            ${q.type !== 'essay' ? `
            <div class="ans-item" style="background: #d1fae5; border-color: #a7f3d0;">
              <strong>Correct Answer Key:</strong><br/>
              <span class="correct">${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : (q.correctAnswer || 'None specified')}</span>
            </div>` : ''}
          </div>
          
          ${correctionText ? `
          <div class="feedback-box">
            <strong>Teacher's Correction / Feedback:</strong><br/>
            <span>${correctionText}</span>
          </div>` : ''}
        </div>
      `;
    });

    htmlContent += `
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("grade", formData.grade);
      formDataToSend.append("school", formData.school);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("timeZone", formData.timeZone);
      formDataToSend.append("medium", formData.medium);
      
      formDataToSend.append("fatherName", formData.fatherName);
      formDataToSend.append("fatherOccupation", formData.fatherOccupation);
      formDataToSend.append("fatherPhone", formData.fatherPhone);
      formDataToSend.append("motherName", formData.motherName);
      formDataToSend.append("motherOccupation", formData.motherOccupation);
      formDataToSend.append("motherPhone", formData.motherPhone);
      formDataToSend.append("hasGuardian", String(formData.hasGuardian));
      formDataToSend.append("guardianName", formData.guardianName);
      formDataToSend.append("guardianRelation", formData.guardianRelation);
      formDataToSend.append("guardianPhone", formData.guardianPhone);

      if (imageFile) {
        formDataToSend.append("profileImage", imageFile);
      }

      const res = await axios.put("http://localhost:5000/api/auth/student/profile", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      setCurrentUser(res.data);

      if (res.data.profileImage) {
        const imgUrl = res.data.profileImage.startsWith("http")
          ? res.data.profileImage
          : `http://localhost:5000${res.data.profileImage}`;
        setImagePreview(imgUrl);
      }
      setImageFile(null);

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

const handleLogout = async () => {
    try {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser._id) {
          // 1. Sending notification via socket
          const socket = io("http://localhost:5000");
          socket.emit("student_logout", parsedUser._id);

          if (token) {
            await axios.post(
              "http://localhost:5000/api/auth/student/logout",
              { studentId: parsedUser._id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clearing LocalStorage and redirecting to the login page
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={44} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-6 transition-colors duration-500 overflow-hidden relative">

      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24">

        {message.text && (
          <div className={`flex items-center gap-3 py-2.5 px-4 rounded-2xl mb-3 shadow-sm border backdrop-blur-md transition-all duration-500 ${message.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50/90 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <p className="text-xs font-semibold">{message.text}</p>
          </div>
        )}

        {/* Global Executive Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Column 1: Profile Summary & Family/Guardian Info Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Main Profile Identity Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center transition-all duration-500">

              <div className="relative group mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-blue-500/10 dark:ring-blue-400/20 shadow-inner bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-blue-400 dark:text-slate-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full text-white shadow-lg transition-transform hover:scale-105 border-2 border-white dark:border-slate-900"
                  title="Change Photo"
                >
                  <Camera size={12} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{formData.name || "Student Name"}</h2>
                <span title="Verified Student" className="inline-flex items-center">
                  <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">{formData.email}</p>

              {/* Free Card Request Button */}
              <button
                onClick={() => setIsFreeCardModalOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <CreditCard size={14} />
                <span>Free Card Request</span>
              </button>

              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-left">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="bg-orange-500/10 dark:bg-orange-500/20 p-1.5 rounded-lg text-orange-600 dark:text-orange-400">
                    <GraduationCap size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Grade</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{formData.grade || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="bg-blue-500/10 dark:bg-blue-500/20 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                    <BookOpen size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Medium</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{formData.medium || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Joined Classes Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Classes</p>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{joinedClassesCount} Active Classes</h4>
                </div>
              </div>
              <button 
                onClick={() => router.push("/class/myclass")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View
              </button>
            </div>

            {/* Parent & Guardian Summary Info Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Users size={12} />
                </div>
                Parent / Guardian Contacts
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 flex justify-between">
                  <span className="text-slate-400 font-medium">Father:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{formData.fatherName || "Not specified"}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 flex justify-between">
                  <span className="text-slate-400 font-medium">Mother:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{formData.motherName || "Not specified"}</span>
                </div>
                {formData.hasGuardian && (
                  <div className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 flex justify-between">
                    <span className="text-slate-400 font-medium">Guardian ({formData.guardianRelation || "Other"}):</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formData.guardianName || "Not specified"}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Column 2: Edit Form */}
          <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Edit Profile Information</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">Secure Profile</span>
                  <button
                    type="button"
                    onClick={handleToggleEditProfile}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEditProfileOpen ? "Collapse Form" : "Expand Form"}
                  >
                    {isEditProfileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Form Container */}
              {isEditProfileOpen && (
                <form onSubmit={handleSubmit} id="profile-form" className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 border border-slate-200/40 dark:border-slate-700/40 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grade / Class</label>
                      <div className="relative">
                        <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                      <div className="relative">
                        <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Zone</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="timeZone"
                          value={formData.timeZone}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medium</label>
                      <div className="relative">
                        <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          name="medium"
                          value={formData.medium}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="">Select Medium</option>
                          <option value="Sinhala">Sinhala</option>
                          <option value="English">English</option>
                          <option value="Tamil">Tamil</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">School</label>
                      <div className="relative">
                        <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Father Details */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father's Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Father's Name"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father's Occupation</label>
                      <input
                        type="text"
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={handleChange}
                        placeholder="Occupation"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father's Phone</label>
                      <input
                        type="tel"
                        name="fatherPhone"
                        value={formData.fatherPhone}
                        onChange={handleChange}
                        placeholder="Father's Phone"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                      />
                    </div>

                    {/* Mother Details */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother's Name</label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        placeholder="Mother's Name"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother's Occupation</label>
                      <input
                        type="text"
                        name="motherOccupation"
                        value={formData.motherOccupation}
                        onChange={handleChange}
                        placeholder="Occupation"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother's Phone</label>
                      <input
                        type="tel"
                        name="motherPhone"
                        value={formData.motherPhone}
                        onChange={handleChange}
                        placeholder="Mother's Phone"
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
                        <input
                          type="checkbox"
                          name="hasGuardian"
                          checked={formData.hasGuardian}
                          onChange={handleChange}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        Under other Guardian
                      </label>
                    </div>

                    {formData.hasGuardian && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Name</label>
                          <input
                            type="text"
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            placeholder="Guardian Name"
                            className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Relationship</label>
                          <input
                            type="text"
                            name="guardianRelation"
                            value={formData.guardianRelation}
                            onChange={handleChange}
                            placeholder="Relationship (e.g. Uncle)"
                            className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Phone</label>
                          <input
                            type="tel"
                            name="guardianPhone"
                            value={formData.guardianPhone}
                            onChange={handleChange}
                            placeholder="Guardian Phone"
                            className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 outline-none"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Home Address</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-50/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                  </div>
                </form>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Total Results: <strong className="text-blue-600 dark:text-blue-400 font-bold">{myResults.length}</strong>
              </div>

              {isEditProfileOpen && (
                <button
                  type="submit"
                  form="profile-form"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Section: Clean Quiz Results Grid */}
        <div className="mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <div className="p-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Award size={12} />
              </div>
              My Quiz Results & Papers
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Downloadable Answer Sheets</span>
          </div>

          {myResults.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No evaluated quiz results sent by your teacher yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {myResults.map((res) => (
                <div key={res._id} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                  <div className="truncate mr-2">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{res.quizId?.title}</h4>
                    <p className="text-slate-400 text-[10px] mt-0.5">Score: <strong className="text-emerald-600 dark:text-emerald-400">{res.score} / {res.maxScore}</strong></p>
                  </div>
                  <button
                    onClick={() => handleDownloadStudentPaperPDF(res)}
                    className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 text-[10px] shrink-0 shadow-sm transition-transform hover:scale-105"
                  >
                    <Download size={12} /> PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ===== Free Card Request Modal Component Render ===== */}
      <FreeCardRequestModal 
        isOpen={isFreeCardModalOpen} 
        onClose={() => setIsFreeCardModalOpen(false)} 
        currentUser={currentUser} 
      />

    </div>
  );
}