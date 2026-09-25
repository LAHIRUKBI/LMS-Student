// app/components/Footer.tsx
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Share2, 
  MessageCircle, 
  Camera,
  Video,
  Send,
  GraduationCap
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 border-t border-slate-800 mt-auto overflow-hidden">
      
      {/* Decorative Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00CBB8]/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Brand & About Section */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#00CBB8]/10 rounded-xl border border-[#00CBB8]/20">
                <GraduationCap className="text-[#00CBB8]" size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Nova<span className="text-[#00CBB8]">Skill</span>
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering learners worldwide with a modern, intuitive, and comprehensive Learning Management System. Your journey to excellence starts here.
            </p>

            {/* Social Media Icons (lucide-react හි ඇති සාමාන්‍ය අයිකන) */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#" 
                className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:bg-[#00CBB8] hover:border-[#00CBB8] transition-all duration-300 hover:-translate-y-1" 
                title="Website"
                aria-label="Website"
              >
                <Globe size={18} />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:bg-[#00CBB8] hover:border-[#00CBB8] transition-all duration-300 hover:-translate-y-1" 
                title="Share"
                aria-label="Share"
              >
                <Share2 size={18} />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:bg-[#00CBB8] hover:border-[#00CBB8] transition-all duration-300 hover:-translate-y-1" 
                title="Chat"
                aria-label="Chat"
              >
                <MessageCircle size={18} />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:bg-[#00CBB8] hover:border-[#00CBB8] transition-all duration-300 hover:-translate-y-1" 
                title="Photos"
                aria-label="Photos"
              >
                <Camera size={18} />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:bg-[#00CBB8] hover:border-[#00CBB8] transition-all duration-300 hover:-translate-y-1" 
                title="Videos"
                aria-label="Videos"
              >
                <Video size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/home" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/class/class_view" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  Classes
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-[#00CBB8] transition-colors duration-200 inline-flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#00CBB8] rounded-full"></span>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#00CBB8] mt-0.5 shrink-0" />
                <a href="mailto:support@edusmart.com" className="text-slate-400 hover:text-[#00CBB8] transition-colors break-all">
                  support@novaSkill.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[#00CBB8] mt-0.5 shrink-0" />
                <a href="tel:+94112345678" className="text-slate-400 hover:text-[#00CBB8] transition-colors">
                  +94 xx xxx xxxx
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#00CBB8] mt-0.5 shrink-0" />
                <span className="text-slate-400 leading-relaxed">
                  Colombo, Sri Lanka
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00CBB8] focus:ring-2 focus:ring-[#00CBB8]/20 transition-all"
              />
              <button 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#00CBB8] hover:bg-[#00B5A4] rounded-md text-white transition-colors shadow-sm"
                aria-label="Subscribe"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p className="text-center md:text-left">
            &copy; {currentYear} <span className="text-white font-semibold">NovaSkill</span>. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-[#00CBB8] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#00CBB8] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#00CBB8] transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}