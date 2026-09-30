"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, X, Mail, Send, CheckCircle2, AlertCircle, Loader2, User } from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  studentName?: string;
  studentEmail?: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [user, setUser] = useState<any>(null);

  const [messageData, setMessageData] = useState({
    name: "",
    senderEmail: "",
    subject: "",
    description: "",
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const formatImageUrl = (path: string) => {
    if (!path) return "";
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  };

  useEffect(() => {
    fetchFAQs();
    fetchAdmins();
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faqs");
      setFaqs(res.data);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      // /api/admin/admins වෙනුවට /api/faqs/public-admins භාවිතා කරයි
      const res = await axios.get("http://localhost:5000/api/faqs/public-admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/faqs/send-email", messageData);
      setSuccess(res.data.message || "Message sent successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess("");
        setMessageData({ name: "", senderEmail: "", subject: "", description: "" });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 md:px-12 lg:px-24">
        
        <div className="mb-12">
          <span className="text-sm font-bold tracking-wider text-orange-600 dark:text-orange-400 uppercase">• FAQs</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          <div className="lg:col-span-4 space-y-6">
            
            {/* Admin Team Showcase Section (අලුතින් එකතු කරන ලද කොටස) */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-100 dark:shadow-black/20 transition-all">
              <h3 className="font-bold text-base mb-4 text-slate-800 dark:text-slate-200">Our Administrative Team</h3>
              {admins.length === 0 ? (
                <p className="text-xs text-slate-400">No admins available.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {admins.map((admin) => (
                    <div key={admin._id} className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-orange-200 dark:border-slate-700 bg-orange-50 dark:bg-slate-800 flex items-center justify-center">
                        {admin.profilePhoto ? (
                          <img src={formatImageUrl(admin.profilePhoto)} alt={admin.name} className="h-full w-full object-cover" />
                        ) : (
                          <User size={20} className="text-orange-600 dark:text-orange-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm truncate text-slate-900 dark:text-white">{admin.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Message Card */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-100 dark:shadow-black/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-orange-500 bg-orange-50 dark:bg-slate-800 flex items-center justify-center">
                  {admins.length > 0 && admins[0].profilePhoto ? (
                    <img src={formatImageUrl(admins[0].profilePhoto)} alt="Admin" className="h-full w-full object-cover" />
                  ) : (
                    <Mail size={28} className="text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">Have Questions?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reach out directly to our admins</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                If you have any questions, feel free to send a direct message to our support team before subscribing.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 py-3.5 px-6 text-center font-bold text-white shadow-lg shadow-orange-500/30 transition-transform active:scale-95 hover:from-orange-600 hover:to-orange-700"
              >
                Send Email
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {faqs.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No FAQs available right now.</p>
            ) : (
              faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={faq._id}
                    className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-6 text-left font-bold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="text-lg">{faq.question}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-45 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400" : ""}`}>
                        <Plus size={18} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-4 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-50 dark:border-slate-800 space-y-3">
                        <p>{faq.answer}</p>
                        
                        {(faq.studentName || faq.studentEmail) && (
                          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-500/10 px-3 py-1 font-medium text-orange-700 dark:text-orange-400">
                              <User size={12} /> Asked by: {faq.studentName || "Anonymous"} {faq.studentEmail ? `(${faq.studentEmail})` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold mb-2">Send Message to Admin</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Fill out the form below and it will be sent to our administrative team.</p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 size={16} /> <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={messageData.name}
                    onChange={(e) => setMessageData({ ...messageData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={messageData.senderEmail}
                    onChange={(e) => setMessageData({ ...messageData, senderEmail: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Inquiry about courses..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Description / Message</label>
                <textarea
                  required
                  rows={4}
                  value={messageData.description}
                  onChange={(e) => setMessageData({ ...messageData, description: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}