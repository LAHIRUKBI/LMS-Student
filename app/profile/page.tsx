"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/app/components/Navbar"; 
import { Save, User, Mail, Phone, MapPin, GraduationCap, Loader2, Building, Camera, CheckCircle2, AlertCircle, Globe, Clock, BookOpen, Users } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [currentUser, setCurrentUser] = useState<any>(null);

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
    parentName: "",
    parentPhone: ""
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
      parentName: parsedUser.parentName || "",
      parentPhone: parsedUser.parentPhone || ""
    });

    if (parsedUser.profileImage) {
      const imgUrl = parsedUser.profileImage.startsWith("http") 
        ? parsedUser.profileImage 
        : `http://localhost:5000${parsedUser.profileImage}`;
      setImagePreview(imgUrl);
    }
    
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      formDataToSend.append("parentName", formData.parentName);
      formDataToSend.append("parentPhone", formData.parentPhone);
      
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
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F5FA] dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={44} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F5FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-12 transition-colors duration-500">
      
      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 mt-4">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-500">Student Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-500">Manage your personal and academic information</p>
        </div>

        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 shadow-sm border transition-colors duration-500 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors duration-500">
              
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-slate-50 dark:border-slate-800 shadow-md bg-blue-50 dark:bg-slate-800 flex items-center justify-center transition-colors duration-500">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-blue-300 dark:text-slate-500" />
                  )}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 bg-[#232B55] dark:bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors border-2 border-white dark:border-slate-800"
                  title="Change Photo"
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center transition-colors duration-500">{formData.name || "Student Name"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-500">{formData.email}</p>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-500">
                  <div className="bg-orange-100 dark:bg-orange-500/20 p-2.5 rounded-xl text-orange-600 dark:text-orange-400 transition-colors duration-500">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-500">Grade / Class</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-500">{formData.grade || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-500">
                  <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 transition-colors duration-500">
                    <Building size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-500">School</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-500">{formData.school || "Not specified"}</p>
                  </div>
                </div>

                {/* Country & TimeZone Summary */}
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-500">
                  <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 transition-colors duration-500">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-500">Country / Timezone</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-500">
                      {formData.country || "Not specified"} {formData.timeZone ? `(${formData.timeZone})` : ""}
                    </p>
                  </div>
                </div>

                {/* Medium of Education Summary */}
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-500">
                  <div className="bg-purple-100 dark:bg-purple-500/20 p-2.5 rounded-xl text-purple-600 dark:text-purple-400 transition-colors duration-500">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-500">Medium</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-500">{formData.medium || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-500">
                  <div className="bg-red-100 dark:bg-red-500/20 p-2.5 rounded-xl text-red-600 dark:text-red-400 transition-colors duration-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-500">Address</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-500">{formData.address || "Not specified"}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 transition-colors duration-500">
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 transition-colors duration-500">Edit Information</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        disabled 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Grade / Class</label>
                    <div className="relative">
                      <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="grade" 
                        value={formData.grade} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  {/* නව ක්ෂේත්‍ර 4: Country, TimeZone, Medium, Parent Details */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Country</label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange} 
                        placeholder="e.g. Sri Lanka"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Time Zone</label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="timeZone" 
                        value={formData.timeZone} 
                        onChange={handleChange} 
                        placeholder="e.g. UTC+5:30"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Medium of Education</label>
                    <div className="relative">
                      <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <select 
                        name="medium" 
                        value={formData.medium} 
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500"
                      >
                        <option value="">Select Medium</option>
                        <option value="Sinhala">Sinhala</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Parent / Guardian Name</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="parentName" 
                        value={formData.parentName} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Parent / Guardian Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="tel" 
                        name="parentPhone" 
                        value={formData.parentPhone} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">School</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="school" 
                        value={formData.school} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">Home Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#232B55] dark:focus:ring-blue-500 outline-none transition-all duration-500" 
                      />
                    </div>
                  </div>
                  
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end transition-colors duration-500">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}