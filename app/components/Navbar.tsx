import { BookOpen, User, LogOut } from "lucide-react";
import Link from "next/link"; // Link import කරගන්න

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Area */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Student Portal</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Clickable User Profile Link */}
            <Link 
              href="/profile" 
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
              title="Go to Profile"
            >
              <User size={16} className="text-blue-500" />
              {user?.name}
            </Link>

            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}