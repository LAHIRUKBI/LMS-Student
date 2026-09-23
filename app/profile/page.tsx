"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, GraduationCap, Loader2, Building, Camera } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // පින්තූරය සඳහා State සහ Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    grade: "",
    school: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      address: parsedUser.address || "",
      grade: parsedUser.grade || "",
      school: parsedUser.school || ""
    });

    // දැනට පින්තූරයක් ඇත්නම් එය පෙන්වීම
    if (parsedUser.profileImage) {
      // Google ගිණුමෙන් ආපු එකක්ද නැත්නම් අපේ ලෝකල් අප්ලෝඩ් කරපු එකක්ද කියල බලන්න
      const imgUrl = parsedUser.profileImage.startsWith("http") 
        ? parsedUser.profileImage 
        : `http://localhost:5000${parsedUser.profileImage}`;
      setImagePreview(imgUrl);
    }
    
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // පින්තූරයක් තේරූ විට එය Preview කිරීම
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // තාවකාලිකව පෙන්වීමට
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      
      // File යැවීම සඳහා FormData සෑදීම
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("grade", formData.grade);
      formDataToSend.append("school", formData.school);
      
      // පින්තූරයක් තෝරා ඇත්නම් එයත් එකතු කරන්න
      if (imageFile) {
        formDataToSend.append("profileImage", imageFile);
      }

      // Content-Type "multipart/form-data" ලෙස යැවීම
      const res = await axios.put("http://localhost:5000/api/auth/student/profile", formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      // අලුත් දත්ත (පින්තූරයේ URL එකත් එක්කම) Local Storage එකේ යාවත්කාලීන කිරීම
      localStorage.setItem("user", JSON.stringify(res.data));
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 px-8 py-8 text-white">
            <h1 className="text-3xl font-bold">Student Profile</h1>
            <p className="text-blue-100 mt-2">Manage your personal information and contact details.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                </div>
                
                {/* Camera Icon Button */}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-blue-600 rounded-full text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Camera size={18} />
                </button>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-sm text-slate-500 mt-3 font-medium">Click the camera icon to change photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* මෙතැන් සිට පහලට කලින් තිබූ Full Name, Email, Phone, Grade, School, Address input fields සියල්ලම එලෙසම තබාගන්න */}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-slate-400" /> Full Name
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" /> Email Address
                </label>
                <input type="email" name="email" value={formData.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" /> Phone Number
                </label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 0712345678" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <GraduationCap size={16} className="text-slate-400" /> Grade / Class
                </label>
                <input type="text" name="grade" value={formData.grade} onChange={handleChange} placeholder="e.g. Grade 12" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building size={16} className="text-slate-400" /> School
                </label>
                <input type="text" name="school" value={formData.school} onChange={handleChange} placeholder="Your School Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" /> Home Address
                </label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your full address" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}