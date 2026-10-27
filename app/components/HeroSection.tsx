"use client";

import { useRef, type MouseEvent } from "react";
import { CheckCircle, Share2, ChevronRight, MessageCircle, Mail, Copy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import HeroCarousel from "@/app/components/HeroCarousel";
import CountUp from "@/app/components/CountUp";

interface HeroSectionProps {
  heroBadge: string;
  badgeAvatars: any[];
  badgeText: string;
  titleColor1: string;
  titleColor2: string;
  highlightColor: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleHighlight: string;
  heroDescription: string;
  primaryBtnText: string;
  socialLinks: any[];
  currentHeroImages: any[];
  isShareOpen: boolean;
  setIsShareOpen: (val: boolean) => void;
  currentUrl: string;
  copied: boolean;
  handleCopyLink: () => void;
  getMediaUrl: (path: string) => string;
  getSocialIcon: (platform: string) => React.ReactNode;
  // Stats props
  heroStatsBadge?: string;
  heroStatsTitle?: string;
  heroStatsDescription?: string;
  heroStatsList?: any[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Animation variants ---------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const lineReveal: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.85, ease: EASE } },
};

const statsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const statCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

/* ---------- Small helper: cursor spotlight card ---------- */
function SpotlightCard({ children }: { children: React.ReactNode }) {
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      variants={statCard}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onMouseMove={handleMove}
      className="group relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-slate-200 via-slate-200/40 to-slate-200 dark:from-slate-700 dark:via-slate-800/40 dark:to-slate-700 hover:from-[#00CBB8] hover:via-[#00CBB8]/10 hover:to-orange-400 transition-colors duration-500"
    >
      <div className="relative h-full rounded-[23px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-9 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(0,203,184,0.16), transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-[#00CBB8]/20 to-orange-400/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10 flex flex-col items-center text-center">{children}</div>
      </div>
    </motion.div>
  );
}

export default function HeroSection({
  heroBadge,
  badgeAvatars,
  badgeText,
  titleColor1,
  titleColor2,
  highlightColor,
  heroTitleLine1,
  heroTitleLine2,
  heroTitleHighlight,
  heroDescription,
  primaryBtnText,
  socialLinks,
  currentHeroImages,
  isShareOpen,
  setIsShareOpen,
  currentUrl,
  copied,
  handleCopyLink,
  getMediaUrl,
  getSocialIcon,
  heroStatsBadge = "About Us",
  heroStatsTitle = "We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education. Our mission offering a diverse range of courses.",
  heroStatsList = [
    { value: "25+", label: "Years of eLearning Education Experience" },
    { value: "56k", label: "Students Enrolled in LMSZONE Courses" },
    { value: "170+", label: "Experienced Teacher's service." }
  ],
}: HeroSectionProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const parseStatValue = (val: string) => {
    if (!val) return { numericVal: 0, prefix: "", suffix: "" };

    let multiplier = 1;
    let cleanVal = val.trim();

    if (cleanVal.toLowerCase().includes('k')) {
      multiplier = 1000;
      cleanVal = cleanVal.replace(/k/gi, '');
    }

    const match = cleanVal.match(/(\d+)/);
    if (!match) return { numericVal: 0, prefix: "", suffix: val };

    const numericVal = parseInt(match[1], 10) * multiplier;
    const fullMatchStr = match[1];
    const index = cleanVal.indexOf(fullMatchStr);

    const prefix = cleanVal.substring(0, index);
    const suffix = cleanVal.substring(index + fullMatchStr.length) + (multiplier === 1000 ? 'k' : '');

    return { numericVal, prefix, suffix };
  };

  /* ---------- 3D tilt + parallax for the carousel ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 });

  const handleStageMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleStageLeave = () => {
    mx.set(0);
    my.set(0);
  };

  /* ---------- Share items ---------- */
  const shareItems = [
    {
      key: "whatsapp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`,
      cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      external: true,
      icon: <MessageCircle size={18} />,
    },
    {
      key: "linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      cls: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
      external: true,
      icon: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
      ),
    },
    {
      key: "twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`,
      cls: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      external: true,
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      ),
    },
    {
      key: "mail",
      href: `mailto:?subject=Check out this platform&body=${encodeURIComponent(currentUrl)}`,
      cls: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
      external: false,
      icon: <Mail size={18} />,
    },
  ];

  return (
    <div className="flex flex-col mb-24 relative pt-2 pb-1">
      {/* ================= Animated background ================= */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(100,116,139,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.18) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 75%)",
          }}
        />
        <motion.div
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-orange-400/20 dark:bg-orange-500/10 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, -70, 20, 0], y: [0, -30, 50, 0], scale: [1, 0.9, 1.12, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-violet-400/10 dark:bg-violet-500/10 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 50, -40, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 relative">

        {/* ================= Left Content Section ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 space-y-6 sm:space-y-8 z-20 w-full lg:max-w-2xl"
        >

          {/* Badge & Social Proof Right Beside It */}
          {(heroBadge || badgeAvatars.length > 0) && (
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 sm:gap-6">
              {heroBadge && (
                <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 text-orange-600 dark:text-orange-400 font-semibold px-4 py-2 rounded-full text-xs tracking-wide border border-orange-500/20 shadow-sm backdrop-blur-sm overflow-hidden">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  {heroBadge}
                  <motion.span
                    className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
                    initial={{ left: "-30%" }}
                    animate={reduceMotion ? undefined : { left: ["-30%", "130%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
                  />
                </div>
              )}

              {/* Social Proof right next to heroBadge */}
              {badgeAvatars.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {badgeAvatars.map((av: any, i: number) => (
                      av.image && (
                        <motion.img
                          key={i}
                          src={getMediaUrl(av.image)}
                          alt="Student"
                          initial={{ opacity: 0, scale: 0.4, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.9 + i * 0.1, type: "spring", stiffness: 260, damping: 18 }}
                          whileHover={{ y: -5, scale: 1.15, zIndex: 10 }}
                          className="h-9 w-9 rounded-full ring-[3px] ring-white dark:ring-slate-950 object-cover"
                        />
                      )
                    ))}
                  </div>
                  {badgeText && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {badgeText}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[60px] font-black leading-[1.12] tracking-tight">
            <span className="block overflow-hidden pb-1">
              <motion.span variants={lineReveal} style={{ color: titleColor1 }} className="block drop-shadow-sm">
                {heroTitleLine1}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span variants={lineReveal} style={{ color: titleColor2 }} className="block drop-shadow-sm">
                {heroTitleLine2}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2 mt-1">
              <motion.span variants={lineReveal} className="relative inline-block" style={{ color: highlightColor }}>
                {heroTitleHighlight}
                <motion.svg
                  className="absolute left-0 -bottom-1 w-full h-3 pointer-events-none"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <motion.path
                    d="M2 8 Q 50 0, 100 6 T 198 5"
                    stroke={highlightColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.45"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.1, duration: 0.9, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.span>
            </span>
          </h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="text-slate-600 dark:text-slate-400 max-w-lg text-base sm:text-lg leading-relaxed font-normal"
          >
            {heroDescription}
          </motion.p>

          {/* CTA Buttons Container */}
          <div className="space-y-4 pt-1">
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/class/class_view")}
                className="group relative flex items-center gap-4 pl-6 pr-2 py-2 border-2 border-slate-900 dark:border-white rounded-full text-slate-900 dark:text-white font-bold text-sm sm:text-base cursor-pointer overflow-hidden"
              >
                <motion.span
                  variants={{ hover: { scaleY: 1 } }}
                  initial={{ scaleY: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-0 bg-slate-900 dark:bg-white origin-bottom"
                />
                <span className="relative group-hover:text-white dark:group-hover:text-slate-900 transition-colors duration-300">
                  {primaryBtnText}
                </span>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#00CBB8] text-white overflow-hidden">
                  <ChevronRight size={18} className="group-hover:translate-x-7 transition-transform duration-300" />
                  <ChevronRight size={18} className="absolute -translate-x-7 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  title="Share Website"
                  className="relative z-50 h-11 w-11 flex items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-300 cursor-pointer shadow-md"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isShareOpen ? "close" : "share"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex"
                    >
                      {isShareOpen ? <X size={18} /> : <Share2 size={18} />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                {/* Responsive Drop-down Stack */}
                <AnimatePresence>
                  {isShareOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 sm:top-1/2 sm:left-full sm:translate-x-0 sm:-translate-y-1/2 pt-3 sm:pt-0 sm:pl-3 z-40">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl"
                      >
                        {shareItems.map((it, i) => (
                          <motion.a
                            key={it.key}
                            href={it.href}
                            target={it.external ? "_blank" : undefined}
                            rel={it.external ? "noopener noreferrer" : undefined}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.04 * i, type: "spring", stiffness: 420, damping: 20 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className={`h-9 w-9 flex items-center justify-center rounded-full ${it.cls}`}
                          >
                            {it.icon}
                          </motion.a>
                        ))}
                        <motion.button
                          onClick={handleCopyLink}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.04 * shareItems.length, type: "spring", stiffness: 420, damping: 20 }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400"
                        >
                          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </motion.button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Social Links Footer */}
            {socialLinks.length > 0 && (
              <motion.div variants={fadeUp} className="pt-2 flex flex-wrap items-center gap-2">
                {socialLinks.map((social: { platform: string; url: string }, index: number) => (
                  social.url && (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 350, damping: 16 }}
                      className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 hover:border-transparent transition-colors duration-300 cursor-pointer"
                    >
                      {getSocialIcon(social.platform)}
                    </motion.a>
                  )
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ================= Right Carousel (Smooth Edge Blended into Background) ================= */}
        <motion.div
          ref={stageRef}
          onMouseMove={handleStageMove}
          onMouseLeave={handleStageLeave}
          initial={{ opacity: 0, x: 50, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="flex-1 relative flex justify-center lg:justify-end items-center w-full pt-4 lg:pt-0"
          style={{ perspective: 1200 }}
        >
          {/* Main 3D Card Wrapper */}
          <motion.div
            className="relative z-10 w-full"
            style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            {/* Seamless edge container without hard borders */}
            <div className="relative w-full overflow-hidden">
              <div 
                className="relative w-full overflow-hidden"
                style={{
                  /* රූපයේ හතරවටේ දාර පිටුවට fade වී මිශ්‍ර වන සුමට mask එක */
                  maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 65%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 65%, transparent 100%)",
                }}
              >
                {/* Hero Carousel */}
                <div className="relative z-10 w-full overflow-hidden">
                  <HeroCarousel 
                    items={currentHeroImages} 
                    baseWidth={600} 
                    autoplay={true} 
                    autoplayDelay={5000} 
                    pauseOnHover={true} 
                    loop={true} 
                  />
                </div>

                {/* Light & Dark Modes සඳහා සුමට Vignette Blend එක */}
                <div 
                  className="pointer-events-none absolute inset-0 z-20"
                  style={{
                    background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 60%, var(--tw-page-blend, rgba(2, 6, 23, 0.6)) 100%)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ================= About us section with count up ================= */}
      <div className="relative mt-24 pt-16 text-center max-w-6xl mx-auto w-full px-4">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00CBB8]/60 to-transparent origin-center"
        />

        {heroStatsBadge && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#00CBB8]/10 text-[#00CBB8] dark:bg-[#00CBB8]/20 dark:text-[#00CBB8] font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-6 border border-[#00CBB8]/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CBB8]" />
            {heroStatsBadge}
          </motion.div>
        )}

        {heroStatsTitle && (
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="text-slate-700 dark:text-slate-300 text-lg sm:text-xl font-medium leading-relaxed max-w-5xl mx-auto mb-14"
          >
            {heroStatsTitle}
          </motion.p>
        )}

        <motion.div
          variants={statsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch justify-center"
        >
          {heroStatsList?.map((stat: any, index: number) => {
            const { numericVal, prefix, suffix } = parseStatValue(stat.value);

            return (
              <SpotlightCard key={index}>
                <span className="text-5xl sm:text-6xl font-black tracking-tight flex items-center justify-center mb-3 bg-gradient-to-br from-slate-900 via-slate-700 to-[#00CBB8] dark:from-white dark:via-slate-200 dark:to-[#00CBB8] bg-clip-text text-transparent">
                  {prefix}
                  <CountUp from={0} to={numericVal} duration={2.5} separator="," />
                  {suffix}
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.15, duration: 0.8, ease: EASE }}
                  className="block w-10 h-1 rounded-full bg-gradient-to-r from-[#00CBB8] to-orange-400 mb-4 origin-center"
                />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-[220px] leading-relaxed">
                  {stat.label}
                </span>
              </SpotlightCard>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}