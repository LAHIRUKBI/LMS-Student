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
  ShieldCheck,
  BookOpen,
  CalendarCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Email & Password මගින් ලියාපදිංචි වීම (Logic Kept Intact)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/student/register", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/"); // මුල් පිටුවට යවයි
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Google හරහා ලියාපදිංචි වීම (Logic Kept Intact)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Firebase හරහා Google Login Popup එක පෙන්වීම
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // ලබාගත් දත්ත අපගේ Backend එකට යැවීම
      const res = await axios.post("http://localhost:5000/api/auth/student/google", {
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/");
    } catch (err: any) {
      console.error("Google Auth Error Details:", err); // නියම දෝෂය Console එකේ පෙන්වීමට
      
      // දෝෂය Firebase එකෙන් ආවක්ද නැතහොත් Backend එකෙන් ආවක්ද යන්න වෙන්කර පෙන්වීම
      const errorMessage = err.response?.data?.message || err.message || "Google Login process failed.";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,#eef2ff_0%,#f8fafc_45%,#eff6ff_100%)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white/85 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
        
        {/* ---------- Brand panel (desktop only) ---------- */}
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
          <Image
            src="/images/campus.jpg"
            alt="Campus"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-700/80 via-indigo-800/75 to-slate-900/85" />

          <div className="relative p-10">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/15 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur">
              <GraduationCap size={18} />
              Student Portal
            </div>

            <h1 className="mt-10 text-3xl font-bold leading-tight text-white xl:text-[2.1rem]">
              Join Us.
              <br />
              Start learning.
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-indigo-100/90">
              Create your student account and begin your educational journey with us.
            </p>
          </div>

          <ul className="relative space-y-4 p-10 pt-0 text-sm text-indigo-50">
            {[
              { icon: BookOpen, label: "Access all course materials easily" },
              { icon: CalendarCheck, label: "Stay updated on upcoming assignments" },
              { icon: ShieldCheck, label: "Secure and private student profile" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                  <Icon size={17} className="text-white" />
                </span>
                <span className="text-indigo-100/95">{label}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ---------- Form panel ---------- */}
        <main className="px-6 py-9 sm:px-10 sm:py-12 lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-5 flex justify-center lg:hidden">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30">
                  <GraduationCap size={26} />
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create an Account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Register to the system as a student
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-relaxed text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
            >
              {/* Standard Google Logo SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:scale-110"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="my-7 flex items-center gap-4">
              <hr className="flex-1 border-0 border-t border-slate-200" />
              <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Or register with email
              </span>
              <hr className="flex-1 border-0 border-t border-slate-200" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="group relative">
                <User
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/12"
                />
              </div>

              <div className="group relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/12"
                />
              </div>

              <div className="group relative">
                <Phone
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600"
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (Optional)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/12"
                />
              </div>

              <div className="group relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/12"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-lg"
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

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-indigo-600 underline-offset-4 transition-colors hover:text-indigo-700 hover:underline"
              >
                Login
              </Link>
            </p>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
              Protected by secure encryption · © {new Date().getFullYear()} Student Portal
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}