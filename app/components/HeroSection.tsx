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

/* ---------- Clean stat cell for the About section ---------- */
function StatItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={statCard}
      className="group relative flex flex-col items-start px-0 py-8 text-left md:px-8 md:py-2 md:first:pl-0 md:last:pr-0"
    >
      {children}
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
    <div className="relative isolate flex flex-col mb-24 pt-2 pb-1">
      <div className="relative flex flex-col items-center justify-between gap-14 lg:flex-row lg:gap-16">
        {/* ================= Left Content ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="z-20 w-full flex-1 space-y-7 sm:space-y-8 lg:max-w-2xl"
        >
          {/* Badge + social proof */}
          {(heroBadge || badgeAvatars.length > 0) && (
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 sm:gap-5">
              {heroBadge && (
                <div className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/70 py-1.5 pl-2 pr-4 text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur">
                  <span className="flex h-6 items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    New
                  </span>
                  {heroBadge}
                  <motion.span
                    className="absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    initial={{ left: "-30%" }}
                    animate={reduceMotion ? undefined : { left: ["-30%", "130%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
                  />
                </div>
              )}

              {badgeAvatars.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
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
                          className="h-10 w-10 rounded-full object-cover ring-[3px] ring-white dark:ring-slate-950 shadow-md"
                        />
                      )
                    ))}
                  </div>
                  {badgeText && (
                    <span className="max-w-[170px] text-xs font-semibold leading-snug text-slate-600 dark:text-slate-300 sm:text-sm">
                      {badgeText}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Title */}
          <h1 className="text-[40px] font-black leading-[1.06] tracking-[-0.03em] sm:text-6xl lg:text-[64px]">
            <span className="block overflow-hidden pb-1">
              <motion.span variants={lineReveal} style={{ color: titleColor1 }} className="block">
                {heroTitleLine1}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span variants={lineReveal} style={{ color: titleColor2 }} className="block">
                {heroTitleLine2}
              </motion.span>
            </span>
            <span className="mt-1 block overflow-hidden pb-3">
              <motion.span variants={lineReveal} className="relative inline-block" style={{ color: highlightColor }}>
                {heroTitleHighlight}
                <motion.svg
                  className="pointer-events-none absolute -bottom-1.5 left-0 h-3.5 w-full"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <motion.path
                    d="M2 8 Q 50 0, 100 6 T 198 5"
                    stroke={highlightColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.4"
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
            className="max-w-xl border-l-2 border-[#00CBB8]/60 pl-4 text-base font-normal leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg"
          >
            {heroDescription}
          </motion.p>

          {/* CTA */}
          <div className="space-y-6 pt-1">
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/class/class_view")}
                className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-full bg-slate-900 py-2 pl-7 pr-2 text-sm font-bold text-white shadow-xl shadow-slate-900/25 transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#00CBB8]/30 dark:bg-white dark:text-slate-900 dark:shadow-black/30 sm:text-base"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-slate-900/10" />
                <span className="relative">{primaryBtnText}</span>
                <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#00CBB8] to-teal-500 text-white">
                  <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-8" />
                  <ChevronRight size={18} className="absolute -translate-x-8 transition-transform duration-300 group-hover:translate-x-0" />
                </span>
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  title="Share Website"
                  className="relative z-50 flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-md backdrop-blur transition-colors duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
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

                {/* Share pop-over */}
                <AnimatePresence>
                  {isShareOpen && (
                    <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-3 sm:left-full sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:pl-3 sm:pt-0">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center gap-2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:flex-row"
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
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${it.cls}`}
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
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400"
                        >
                          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </motion.button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ================= Right: framed carousel stage ================= */}
        <motion.div
          ref={stageRef}
          onMouseMove={handleStageMove}
          onMouseLeave={handleStageLeave}
          initial={{ opacity: 0, x: 50, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="relative flex w-full flex-1 flex-col items-center gap-6 pt-4 lg:items-end lg:self-start lg:pt-0"
          style={{ perspective: 1200 }}
        >
          <motion.div
            className="relative z-10 w-full max-w-[640px]"
            style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            

            {/* Carousel area (no background box) */}
            <div className="relative aspect-[5/4] w-full">
              <div className="absolute inset-0">
                <HeroCarousel
                  items={currentHeroImages}
                  baseWidth={600}
                  autoplay={true}
                  autoplayDelay={5000}
                  pauseOnHover={true}
                  loop={true}
                />
              </div>
            </div>
          </motion.div>

          {/* Social links (under the carousel) */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
              className="flex w-full max-w-[640px] flex-wrap items-center justify-center gap-3"
            >
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
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors duration-300 hover:bg-[#00CBB8] hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#00CBB8]"
                  >
                    {getSocialIcon(social.platform)}
                  </motion.a>
                )
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ================= About us / stats ================= */}
      <div className="relative mx-auto mt-28 w-full max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-10 sm:py-12"
        >
          {/* Header: label + statement */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {heroStatsBadge && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3"
              >
                <div className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-[#00CBB8]" />
                  {heroStatsBadge}
                </div>
              </motion.div>
            )}

            {heroStatsTitle && (
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                className={`text-base font-medium leading-relaxed tracking-tight text-slate-700 dark:text-slate-300 sm:text-lg ${
                  heroStatsBadge ? "lg:col-span-9" : "lg:col-span-12"
                }`}
              >
                {heroStatsTitle}
              </motion.p>
            )}
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE }}
            className="my-8 h-px w-full origin-left bg-slate-200 dark:bg-slate-800 sm:my-10"
          />

          {/* Stats */}
          <motion.div
            variants={statsContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 divide-y divide-slate-200 dark:divide-slate-800 md:grid-cols-3 md:divide-x md:divide-y-0"
          >
            {heroStatsList?.map((stat: any, index: number) => {
              const { numericVal, prefix, suffix } = parseStatValue(stat.value);

              return (
                <StatItem key={index}>
                  <span className="mb-3 text-[10px] font-bold tabular-nums tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mb-3 flex items-baseline text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    {prefix}
                    <CountUp from={0} to={numericVal} duration={2.5} separator="," />
                    <span className="text-[#00CBB8]">{suffix}</span>
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.8, ease: EASE }}
                    className="mb-3 block h-[2px] w-8 origin-left rounded-full bg-[#00CBB8]"
                  />
                  <span className="max-w-[240px] text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                </StatItem>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
