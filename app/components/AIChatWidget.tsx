"use client";

import { useState, useRef, useEffect } from "react";
import { X, Bot, User, Loader2, Sparkles, BookOpen, ChevronRight, GraduationCap, Heart, Mail, Phone, MapPin, Award, Globe, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  classesList?: any[];
  teachersList?: any[];
  options?: { label: string; action: string }[];
}

export default function AIChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<any | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello!, I'm your NovaSkill AI Study Assistant. How can I help you today? Please choose an option below:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: [
        { label: "📚 Explore Live Classes", action: "view_classes" },
        { label: "👩‍🏫 Explore Teachers", action: "view_teachers" },
        { label: "📅 View Class Schedule", action: "view_schedule" },
        { label: "❓ Help & FAQs", action: "help_faq" }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, selectedTeacherModal]);

  // Fetch classes safely with fallback
  const fetchClassesForChat = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      return res.data || [];
    } catch (err) {
      return [
        { _id: "1", title: "Advanced Mathematics - Grade 12/13", subject: "Mathematics" },
        { _id: "2", title: "Combined Science & ICT", subject: "Science" },
        { _id: "3", title: "English Language & Literature", subject: "English" }
      ];
    }
  };

  // Fetch teachers from backend API
  const fetchTeachersForChat = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/teachers");
      return res.data || [];
    } catch (err) {
      console.warn("Teachers API error, using sample teachers.");
      return [
        { _id: "t1", name: "Dr. Samantha Perera", subject: "Mathematics", email: "samantha@novaskill.com", phone: "+94 71 234 5678" },
        { _id: "t2", name: "Prof. Kamal Gunawardena", subject: "Science & ICT", email: "kamal@novaskill.com", phone: "+94 77 987 6543" }
      ];
    }
  };

  const getProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000/profile_photos/${photoUrl}`;
  };

  const handleOptionClick = async (action: string, label: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    if (action === "view_classes") {
      setTimeout(async () => {
        const fetchedClasses = await fetchClassesForChat();
        
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Here are the available classes right now. Click on any class to view details:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classesList: fetchedClasses,
          options: [
            { label: "🔄 Back to Main Menu", action: "reset_options" }
          ]
        };

        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 500);
    } 
    else if (action === "view_teachers") {
      setTimeout(async () => {
        const fetchedTeachers = await fetchTeachersForChat();

        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Here are our experienced educators. Click on any teacher to view their full credentials:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          teachersList: fetchedTeachers,
          options: [
            { label: "🔄 Back to Main Menu", action: "reset_options" }
          ]
        };

        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 500);
    }
    else if (action === "view_schedule") {
      setTimeout(() => {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "You can check the full class schedule on our Class View page. Click below to proceed:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: "🚀 Go to Class View", action: "goto_class_view" },
            { label: "🔙 Back to Main Menu", action: "reset_options" }
          ]
        };
        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 400);
    }
    else if (action === "help_faq") {
      setTimeout(() => {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "NovaSkill helps you access courses, meet expert teachers, and join live sessions effortlessly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: "👩‍🏫 Explore Teachers", action: "view_teachers" },
            { label: "📚 Explore Live Classes", action: "view_classes" },
            { label: "🔙 Back to Main Menu", action: "reset_options" }
          ]
        };
        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 400);
    }
    else if (action === "goto_class_view") {
      router.push("/class/class_view");
      setIsOpen(false);
    }
    else if (action === "reset_options") {
      setTimeout(() => {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Welcome back! What would you like to do next?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: "📚 Explore Live Classes", action: "view_classes" },
            { label: "👩‍🏫 Explore Teachers", action: "view_teachers" },
            { label: "📅 View Class Schedule", action: "view_schedule" },
            { label: "❓ Help & FAQs", action: "help_faq" }
          ]
        };
        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 400);
    }
  };

  const handleSelectClass = (classItem: any) => {
    const targetUrl = classItem._id ? `/class/class_view?id=${classItem._id}` : "/class/class_view";
    router.push(targetUrl);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Monochrome & Dark Mode Adaptive Cute Toggle Button - Made more compact */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-slate-900 dark:bg-slate-100 hover:bg-black dark:hover:bg-white text-white dark:text-slate-900 p-1 rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.15)] hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer border border-slate-700 dark:border-slate-300"
          title="Chat with AI Assistant"
        >
          {/* Status Online Ping Badge */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900 dark:bg-white border-2 border-slate-100 dark:border-slate-900"></span>
          </span>

          {/* More Compact Cute Child Avatar Illustration Container */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 shadow-inner relative">
            <svg viewBox="0 0 100 100" className="w-full h-full object-cover scale-110 translate-y-1">
              <path d="M 25 45 Q 50 15 75 45 Q 85 30 70 20 Q 50 5 30 20 Q 15 30 25 45 Z" fill="#334155" />
              <circle cx="50" cy="55" r="28" fill="#e2e8f0" />
              <circle cx="36" cy="62" r="5" fill="#cbd5e1" opacity="0.8" />
              <circle cx="64" cy="62" r="5" fill="#cbd5e1" opacity="0.8" />
              <circle cx="40" cy="52" r="3.5" fill="#0f172a" />
              <circle cx="60" cy="52" r="3.5" fill="#0f172a" />
              <circle cx="41.5" cy="50.5" r="1.2" fill="#ffffff" />
              <circle cx="61.5" cy="50.5" r="1.2" fill="#ffffff" />
              <path d="M 44 64 Q 50 71 56 64" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 30 90 Q 50 75 70 90 Z" fill="#0f172a" />
            </svg>
          </div>
        </button>
      )}

      {/* Black & White / Dark Mode Adaptive Chat Window */}
      {isOpen && (
        <div className="w-[370px] sm:w-[410px] h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative">
          
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-4.5 flex items-center justify-between shadow-sm relative border-b border-slate-800">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 dark:bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5 text-white">
                  Nova AI Assistant
                </h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-all cursor-pointer relative z-10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-2.5 max-w-[94%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className={`flex gap-2.5 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center text-xs shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}>
                    {msg.sender === "user" ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none font-medium"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-tl-none font-normal"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Classes List */}
                {msg.classesList && msg.classesList.length > 0 && (
                  <div className="w-full pl-10 space-y-2 mt-1">
                    {msg.classesList.map((cls: any, idx: number) => (
                      <div
                        key={cls._id || idx}
                        onClick={() => handleSelectClass(cls)}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between group hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors">
                            <BookOpen size={15} />
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-black dark:group-hover:text-white">
                              {cls.title || cls.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {cls.subject || "General Class"}
                            </p>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all shrink-0">
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teachers List inside Chat */}
                {msg.teachersList && msg.teachersList.length > 0 && (
                  <div className="w-full pl-10 space-y-2 mt-1 max-h-64 overflow-y-auto pr-1">
                    {msg.teachersList.map((t: any, idx: number) => (
                      <div
                        key={t._id || idx}
                        onClick={() => setSelectedTeacherModal(t)}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between group hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600">
                            {t.profilePhoto ? (
                              <img src={getProfileImageUrl(t.profilePhoto) || ""} alt={t.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={16} className="m-auto mt-2 text-slate-500" />
                            )}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-black dark:group-hover:text-white">
                              {t.name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold inline-block mt-0.5">
                              {t.subject}
                            </span>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all shrink-0">
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="w-full pl-10 flex flex-col gap-2 mt-1">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt.action, opt.label)}
                        className="w-full text-left bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-95"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
                
                <span className={`text-[10px] text-slate-400 px-10 font-medium ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 rounded-tl-none flex items-center gap-2.5 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-slate-800 dark:text-slate-200" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading for you...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Teacher Profile Preview Modal inside Chat */}
          {selectedTeacherModal && (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/20">
                      {selectedTeacherModal.profilePhoto ? (
                        <img src={getProfileImageUrl(selectedTeacherModal.profilePhoto) || ""} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="m-auto mt-2 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{selectedTeacherModal.name}</h4>
                      <span className="text-[10px] text-slate-300 font-medium">{selectedTeacherModal.subject}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeacherModal(null)} className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail size={14} className="text-slate-400 shrink-0" /> {selectedTeacherModal.email || "No email provided"}
                    </p>
                    {selectedTeacherModal.phone && (
                      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone size={14} className="text-slate-400 shrink-0" /> {selectedTeacherModal.phone}
                      </p>
                    )}
                    {selectedTeacherModal.address && (
                      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin size={14} className="text-slate-400 shrink-0" /> {selectedTeacherModal.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px] mb-2 flex items-center gap-1">
                      <GraduationCap size={13} /> Qualifications
                    </p>
                    {selectedTeacherModal.qualifications && selectedTeacherModal.qualifications.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTeacherModal.qualifications.map((q: any, i: number) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-slate-900 dark:text-white">{q.degree}</p>
                            <p className="text-[11px] text-slate-500">{q.institution} ({q.period})</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No qualifications listed.</p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedTeacherModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center flex items-center justify-center gap-1.5">
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              Powered by NovaSkill AI
            </p>
          </div>

        </div>
      )}
    </div>
  );
}