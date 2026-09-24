"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  Mail,
  Lock,
  User,
  Phone,
  LogIn,
  GraduationCap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import TorchToggle from "@/app/components/TorchToggle";
import SuccessPopup from "@/app/components/SuccessPopup"; // 👈 Success Popup Component එක import කර ඇත

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 👈 Success පණිවිඩය පාලනය කිරීම සඳහා නව state එක
  const [successMessage, setSuccessMessage] = useState(""); 

  const [isRoomLightOn, setIsRoomLightOn] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/student/register", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // 👈 සාර්ථක වූ විට පණිවිඩය පෙන්වා තත්පර 3කින් redirect වීම
      setSuccessMessage("Account created successfully!");
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await axios.post("http://localhost:5000/api/auth/student/google", {
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // 👈 සාර්ථක වූ විට පණිවිඩය පෙන්වා තත්පර 3කින් redirect වීම
      setSuccessMessage("Google registration successful!");
      setTimeout(() => {
        router.push("/");
      }, 3000);

    } catch (err: any) {
      console.error("Google Auth Error Details:", err);
      const errorMessage = err.response?.data?.message || err.message || "Google Login process failed.";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: isRoomLightOn
      ? "bg-slate-100"
      : "bg-gradient-to-b from-slate-950 to-slate-900",
    formBg: isRoomLightOn
      ? "bg-white border-slate-200 shadow-xl"
      : "bg-slate-900/70 border-slate-800 shadow-[0_0_50px_rgba(255,255,255,0.10)] backdrop-blur-xl",
    textPrimary: isRoomLightOn ? "text-slate-900" : "text-white",
    textSecondary: isRoomLightOn ? "text-slate-500" : "text-slate-400",
    inputBg: isRoomLightOn ? "bg-slate-50" : "bg-slate-950/60",
    inputBorder: isRoomLightOn
      ? "border-slate-200 focus:border-indigo-500"
      : "border-slate-700 focus:border-white/60 text-white",
    btnGoogleBg: isRoomLightOn
      ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
      : "bg-slate-900 border-slate-700 hover:bg-slate-800 text-white hover:border-white/50",
  };

  return (
    <div className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-colors duration-1000 px-4 ${theme.bg}`}>
      
      {/* 👈 Success Popup Component එක පිටුවට එකතු කිරීම */}
      <SuccessPopup 
        isVisible={!!successMessage} 
        message={successMessage} 
      />

      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-0 ${
          isRoomLightOn ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "radial-gradient(ellipse 60% 55% at 32% 78%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 75%)",
        }}
      />

      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-0 ${
          isRoomLightOn ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center mt-4 mb-10">
        <div
          className={`w-full rounded-3xl border p-8 transition-all duration-1000 ${theme.formBg}`}
          style={{
            boxShadow: isRoomLightOn
              ? undefined
              : "0 0 50px rgba(255, 255, 255, 0.10), 0 0 100px rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-colors duration-700 ${
                  isRoomLightOn
                    ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white"
                    : "bg-gradient-to-br from-white to-slate-300 text-neutral-900"
                }`}
              >
                <GraduationCap size={28} />
              </span>
            </div>
            <h2 className={`text-2xl font-bold tracking-tight transition-colors duration-1000 ${theme.textPrimary}`}>
              Create an Account
            </h2>
            <p className={`mt-2 text-sm transition-colors duration-1000 ${theme.textSecondary}`}>
              Register to the system as a student
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm leading-relaxed text-red-700 backdrop-blur-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading || !!successMessage}
            type="button"
            className={`group flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 border ${theme.btnGoogleBg}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <hr className={`flex-1 border-0 border-t ${isRoomLightOn ? "border-slate-200" : "border-slate-800"}`} />
            <span className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest ${theme.textSecondary}`}>
              Or register with email
            </span>
            <hr className={`flex-1 border-0 border-t ${isRoomLightOn ? "border-slate-200" : "border-slate-800"}`} />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="group relative">
              <User size={18} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isRoomLightOn ? "text-slate-400 group-focus-within:text-indigo-600" : "text-slate-500 group-focus-within:text-white"}`} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-opacity-20 border ${theme.inputBg} ${theme.inputBorder} ${isRoomLightOn ? "placeholder:text-slate-400 focus:ring-indigo-500" : "placeholder:text-slate-500 focus:ring-white/40"}`}
              />
            </div>

            <div className="group relative">
              <Mail size={18} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isRoomLightOn ? "text-slate-400 group-focus-within:text-indigo-600" : "text-slate-500 group-focus-within:text-white"}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                autoComplete="email"
                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-opacity-20 border ${theme.inputBg} ${theme.inputBorder} ${isRoomLightOn ? "placeholder:text-slate-400 focus:ring-indigo-500" : "placeholder:text-slate-500 focus:ring-white/40"}`}
              />
            </div>

            <div className="group relative">
              <Phone size={18} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isRoomLightOn ? "text-slate-400 group-focus-within:text-indigo-600" : "text-slate-500 group-focus-within:text-white"}`} />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-opacity-20 border ${theme.inputBg} ${theme.inputBorder} ${isRoomLightOn ? "placeholder:text-slate-400 focus:ring-indigo-500" : "placeholder:text-slate-500 focus:ring-white/40"}`}
              />
            </div>

            <div className="group relative">
              <Lock size={18} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isRoomLightOn ? "text-slate-400 group-focus-within:text-indigo-600" : "text-slate-500 group-focus-within:text-white"}`} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                autoComplete="new-password"
                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-opacity-20 border ${theme.inputBg} ${theme.inputBorder} ${isRoomLightOn ? "placeholder:text-slate-400 focus:ring-indigo-500" : "placeholder:text-slate-500 focus:ring-white/40"}`}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 shadow-lg ${isRoomLightOn ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-600/25" : "bg-gradient-to-r from-white to-slate-200 hover:from-slate-100 hover:to-white text-neutral-950 shadow-white/20"}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <LogIn size={18} /> Register
                </>
              )}
            </button>
          </form>

          <p className={`mt-6 text-center text-sm transition-colors duration-1000 ${theme.textSecondary}`}>
            Already have an account?{" "}
            <Link href="/login" className={`font-semibold underline-offset-4 transition-colors hover:underline ${isRoomLightOn ? "text-indigo-600 hover:text-indigo-700" : "text-white hover:text-slate-200"}`}>
              Login
            </Link>
          </p>
        </div>
      </div>

      <TorchToggle 
        isRoomLightOn={isRoomLightOn} 
        onToggle={() => setIsRoomLightOn(!isRoomLightOn)} 
      />

    </div>
  );
}