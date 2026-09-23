"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /login after 3 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    // Clear the timer on component unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 font-sans p-4">
      <main className="flex flex-col items-center justify-center text-center space-y-8 bg-white/60 dark:bg-black/40 p-12 rounded-3xl shadow-xl backdrop-blur-sm max-w-2xl w-full border border-white/20">
        
        {/* Educational Icon / Logo */}
        <div className="relative flex items-center justify-center w-24 h-24 bg-indigo-600 text-white rounded-full shadow-lg animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Welcome to Learning
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
            Empowering your future through education. Your journey starts here.
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center justify-center w-full pt-6 space-y-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse delay-150"></div>
          </div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
            Redirecting to login...
          </p>
        </div>

      </main>
    </div>
  );
}