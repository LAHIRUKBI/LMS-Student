// src/components/AIChatWidget.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { X, Bot, User, Loader2, BookOpen, ChevronRight, GraduationCap, Mail, Phone, MapPin } from "lucide-react";
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

  // Ref to detect clicks outside the chat window
  const chatRef = useRef<HTMLDivElement>(null);

  // Free Dragging States for Toggle Button
  const [position, setPosition] = useState({ x: 30, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 0, posY: 0 });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I'm your NovaSkill AI Assistant. How can I help you today? Please choose an option below:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: [
        { label: "📚 Explore Live Classes", action: "view_classes" },
        { label: "👩‍🏫 Explore Teachers", action: "view_teachers" },
        { label: "📅 View Class Schedule", action: "view_schedule" },
        { label: "❓ Help & FAQs", action: "goto_faq" }
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

  // Click Outside Handler to close chat window
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Dragging Handlers for Free Movement
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(10, dragRef.current.posX - dx),
      y: Math.max(10, dragRef.current.posY - dy)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // Touch handlers for mobile free dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y
    };
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    const dy = touch.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(10, dragRef.current.posX - dx),
      y: Math.max(10, dragRef.current.posY - dy)
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

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

  const fetchTeachersForChat = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/teachers");
      return res.data || [];
    } catch (err) {
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
          options: [{ label: "🔄 Back to Main Menu", action: "reset_options" }]
        };
        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 400);
    } 
    else if (action === "view_teachers") {
      setTimeout(async () => {
        const fetchedTeachers = await fetchTeachersForChat();
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Here are our experienced educators. Click on any teacher to view their credentials:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          teachersList: fetchedTeachers,
          options: [{ label: "🔄 Back to Main Menu", action: "reset_options" }]
        };
        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 400);
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
      }, 300);
    }
    else if (action === "help_faq") {
      setTimeout(() => {
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Need more information about NovaSkill? You can explore our Frequently Asked Questions (FAQs) page.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: "❓ Go to FAQs Page", action: "goto_faq" },
            { label: "👩‍🏫 Explore Teachers", action: "view_teachers" },
            { label: "📚 Explore Live Classes", action: "view_classes" },
            { label: "🔙 Back to Main Menu", action: "reset_options" }
          ]
        };
        setMessages(prev => [...prev, botReply]);
        setLoading(false);
      }, 300);
    }
    else if (action === "goto_class_view") {
      router.push("/class/class_view");
      setIsOpen(false);
    }
    else if (action === "goto_faq") {
      router.push("/faq");
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
      }, 300);
    }
  };

  const handleSelectClass = (classItem: any) => {
    const targetUrl = classItem._id ? `/class/class_view?id=${classItem._id}` : "/class/class_view";
    router.push(targetUrl);
    setIsOpen(false);
  };

  return (
    <div ref={chatRef} className="fixed z-50 font-sans" style={{ right: `${position.x}px`, bottom: `${position.y}px` }}>
      {/* Free Draggable Toggle Button */}
      {!isOpen && (
        <button
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => {
            if (!isDragging) setIsOpen(true);
          }}
          className="relative group bg-slate-900 dark:bg-slate-100 hover:bg-black dark:hover:bg-white text-white dark:text-slate-900 p-1.5 rounded-full shadow-2xl hover:scale-105 transition-transform duration-200 flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-700 dark:border-slate-300"
          title="Drag or Click to chat with AI Assistant"
        >
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-10 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-900 dark:bg-white border-2 border-slate-100 dark:border-slate-900"></span>
          </span>

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full object-cover scale-110 translate-y-1">
              <path d="M 25 45 Q 50 15 75 45 Q 85 30 70 20 Q 50 5 30 20 Q 15 30 25 45 Z" fill="#334155" />
              <circle cx="50" cy="55" r="28" fill="#e2e8f0" />
              <circle cx="36" cy="62" r="4" fill="#cbd5e1" opacity="0.8" />
              <circle cx="64" cy="62" r="4" fill="#cbd5e1" opacity="0.8" />
              <circle cx="40" cy="52" r="3" fill="#0f172a" />
              <circle cx="60" cy="52" r="3" fill="#0f172a" />
              <path d="M 44 64 Q 50 70 56 64" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 30 90 Q 50 75 70 90 Z" fill="#0f172a" />
            </svg>
          </div>
        </button>
      )}

      {/* Compact Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[370px] h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative">
          
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                <GraduationCap size={16} className="text-white" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm tracking-wide text-white">
                Nova AI Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-2 max-w-[92%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className={`flex gap-2 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-[10px] shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}>
                    {msg.sender === "user" ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
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
                  <div className="w-full pl-9 space-y-1.5 mt-0.5">
                    {msg.classesList.map((cls: any, idx: number) => (
                      <div
                        key={cls._id || idx}
                        onClick={() => handleSelectClass(cls)}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-sm cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                            <BookOpen size={13} />
                          </div>
                          <div className="truncate">
                            <h4 className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                              {cls.title || cls.name}
                            </h4>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                              {cls.subject || "General"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={12} className="text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Teachers List */}
                {msg.teachersList && msg.teachersList.length > 0 && (
                  <div className="w-full pl-9 space-y-1.5 mt-0.5 max-h-48 overflow-y-auto pr-1">
                    {msg.teachersList.map((t: any, idx: number) => (
                      <div
                        key={t._id || idx}
                        onClick={() => setSelectedTeacherModal(t)}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-sm cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600">
                            {t.profilePhoto ? (
                              <img src={getProfileImageUrl(t.profilePhoto) || ""} alt={t.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={14} className="m-auto mt-2 text-slate-500" />
                            )}
                          </div>
                          <div className="truncate">
                            <h4 className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                              {t.name}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold inline-block mt-0.5">
                              {t.subject}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={12} className="text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="w-full pl-9 flex flex-col gap-1.5 mt-0.5">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt.action, opt.label)}
                        className="w-full text-left bg-white dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-[11px] font-bold shadow-sm transition-all flex items-center justify-between group cursor-pointer active:scale-95"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight size={12} className="text-slate-400 group-hover:text-white dark:group-hover:text-slate-900" />
                      </button>
                    ))}
                  </div>
                )}
                
                <span className={`text-[9px] text-slate-400 px-9 font-medium ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 max-w-[85%] mr-auto items-center">
                <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <Bot size={13} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-slate-800 dark:text-slate-200" />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Loading...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Teacher Profile Preview Modal */}
          {selectedTeacherModal && (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-3 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden text-xs">
                <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-white/20">
                      {selectedTeacherModal.profilePhoto ? (
                        <img src={getProfileImageUrl(selectedTeacherModal.profilePhoto) || ""} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={15} className="m-auto mt-2 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{selectedTeacherModal.name}</h4>
                      <span className="text-[9px] text-slate-300">{selectedTeacherModal.subject}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeacherModal(null)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3.5 flex-1 overflow-y-auto space-y-2.5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail size={13} className="text-slate-400 shrink-0" /> {selectedTeacherModal.email || "No email"}
                    </p>
                    {selectedTeacherModal.phone && (
                      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone size={13} className="text-slate-400 shrink-0" /> {selectedTeacherModal.phone}
                      </p>
                    )}
                    {selectedTeacherModal.address && (
                      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin size={13} className="text-slate-400 shrink-0" /> {selectedTeacherModal.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedTeacherModal(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[11px] shadow"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Powered by NovaSkill AI
            </p>
          </div>

        </div>
      )}
    </div>
  );
}