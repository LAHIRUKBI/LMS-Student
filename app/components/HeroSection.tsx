
"use client";

import { useRef, type MouseEvent } from "react";
import {
  CheckCircle,
  Share2,
  ChevronRight,
  MessageCircle,
  Mail,
  Copy,
  X,
} from "lucide-react";

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

  heroStatsBadge?: string;
  heroStatsTitle?: string;
  heroStatsDescription?: string;
  heroStatsList?: any[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const lineReveal: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.85, ease: EASE },
  },
};

const statsContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const statCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

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
  heroStatsTitle =
    "We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education. Our mission offering a diverse range of courses.",

  heroStatsList = [
    { value: "25+", label: "Years of eLearning Education Experience" },
    { value: "56k", label: "Students Enrolled in LMSZONE Courses" },
    { value: "170+", label: "Experienced Teacher's service." },
  ],
}: HeroSectionProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  /* ---------- Statistics logic ---------- */

  const parseStatValue = (val: string) => {
    if (!val) {
      return { numericVal: 0, prefix: "", suffix: "" };
    }

    let multiplier = 1;
    let cleanVal = val.trim();

    if (cleanVal.toLowerCase().includes("k")) {
      multiplier = 1000;
      cleanVal = cleanVal.replace(/k/gi, "");
    }

    const match = cleanVal.match(/(\d+)/);

    if (!match) {
      return { numericVal: 0, prefix: "", suffix: val };
    }

    const numericVal = parseInt(match[1], 10) * multiplier;
    const fullMatchStr = match[1];
    const index = cleanVal.indexOf(fullMatchStr);

    const prefix = cleanVal.substring(0, index);
    const suffix =
      cleanVal.substring(index + fullMatchStr.length) +
      (multiplier === 1000 ? "k" : "");

    return { numericVal, prefix, suffix };
  };

  /* ---------- 3D image interaction ---------- */

  const stageRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(my, [-0.5, 0.5], [3, -3]),
    { stiffness: 120, damping: 18 }
  );

  const rotateY = useSpring(
    useTransform(mx, [-0.5, 0.5], [-4, 4]),
    { stiffness: 120, damping: 18 }
  );

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

  /* ---------- Share functionality ---------- */

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
        <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      key: "twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`,
      cls: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      external: true,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
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
    <div className="relative isolate mb-16 w-full pt-0 pb-0">

      {/* ================= MAIN HERO ================= */}

      <div className="relative w-full max-w-none">

        <div className="relative grid w-full min-h-[460px] grid-cols-1 overflow-hidden bg-[#f7e9e2] dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900 sm:min-h-[560px] lg:min-h-[calc(100svh-110px)] lg:h-auto lg:grid-cols-[48%_52%]">

          {/* ================= MOBILE HERO INTRO ================= */}
          <div className="px-5 pb-5 pt-8 text-center lg:hidden sm:px-8 sm:pb-7">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mx-auto flex w-full max-w-2xl flex-col items-center"
            >
              {heroBadge && (
                <motion.span
                  variants={fadeUp}
                  className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                  {heroBadge}
                </motion.span>
              )}

              {/* Mobile title: centered above the image */}
              <h1 className="mb-4 w-full text-center text-[34px] font-black leading-[1.12] tracking-[-0.045em] sm:text-5xl">
                <span className="block overflow-hidden pb-1">
                  <motion.span
                    variants={lineReveal}
                    style={{ color: titleColor1 }}
                    className="block"
                  >
                    {heroTitleLine1}
                  </motion.span>
                </span>

                <span className="block overflow-hidden pb-1">
                  <motion.span
                    variants={lineReveal}
                    style={{ color: titleColor2 }}
                    className="block"
                  >
                    {heroTitleLine2}
                  </motion.span>
                </span>

                <span className="mt-1 block overflow-hidden pb-2">
                  <motion.span
                    variants={lineReveal}
                    className="relative inline-block"
                    style={{ color: highlightColor }}
                  >
                    {heroTitleHighlight}

                    <motion.svg
                      className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full"
                      viewBox="0 0 200 12"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <motion.path
                        d="M2 8 Q 50 0, 100 6 T 198 5"
                        stroke={highlightColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.35"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          delay: 1.1,
                          duration: 0.9,
                          ease: "easeOut",
                        }}
                      />
                    </motion.svg>
                  </motion.span>
                </span>
              </h1>

              {/* Mobile floating student avatars: directly below title */}
              {badgeAvatars.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  className="mb-1 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <div className="flex -space-x-2.5">
                    {badgeAvatars.slice(0, 4).map((av: any, i: number) => (
                      av.image && (
                        <motion.img
                          key={i}
                          src={getMediaUrl(av.image)}
                          alt="Student"
                          initial={{ opacity: 0, scale: 0.4 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.7 + i * 0.1,
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          }}
                          className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm dark:border-slate-800 sm:h-9 sm:w-9"
                        />
                      )
                    ))}
                  </div>

                  {badgeText && (
                    <span className="max-w-[170px] text-left text-[11px] font-semibold leading-snug text-slate-700 dark:text-slate-200 sm:text-xs">
                      {badgeText}
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ================= LEFT IMAGE PANEL ================= */}

          <motion.div
            ref={stageRef}
            onMouseMove={handleStageMove}
            onMouseLeave={handleStageLeave}
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative h-[460px] min-h-0 overflow-hidden bg-[#fffaf7] dark:bg-transparent sm:h-[560px] lg:h-full lg:min-h-0 lg:w-full"
          >

            {/* Carousel */}

            <motion.div
              className="absolute inset-0 h-full w-full"
              style={
                reduceMotion
                  ? undefined
                  : {
                      rotateX,
                      rotateY,
                      scale: 1,
                      transformOrigin: "center center",
                      transformStyle: "preserve-3d",
                    }
              }
            >
              <HeroCarousel
                items={currentHeroImages}
                baseWidth={600}
                autoplay={true}
                autoplayDelay={5000}
                pauseOnHover={true}
                loop={true}
              />
            </motion.div>

          </motion.div>

          {/* ================= RIGHT CONTENT PANEL ================= */}

          <div className="relative flex h-full min-h-full flex-col justify-center bg-[#fffaf7] px-6 py-12 dark:bg-transparent sm:px-10 sm:py-14 lg:px-10 lg:py-7 xl:px-14">

            {/* Decorative background */}

            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-100/40 blur-[90px] dark:bg-orange-900/10" />

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="relative z-10 mx-auto w-full max-w-[580px] lg:mx-0"
            >

              {/* Small label */}

              <motion.div
                variants={fadeUp}
                className="mb-4 hidden flex-wrap items-center gap-3 lg:flex"
              >
                {heroBadge && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                    {heroBadge}
                  </span>
                )}

                {badgeAvatars.length > 0 && (
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1.5 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/80">
                    <div className="flex -space-x-2.5">
                      {badgeAvatars.slice(0, 4).map((av: any, i: number) => (
                        av.image && (
                          <motion.img
                            key={i}
                            src={getMediaUrl(av.image)}
                            alt="Student"
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.7 + i * 0.1,
                              type: "spring",
                              stiffness: 260,
                              damping: 18,
                            }}
                            className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm dark:border-slate-800 sm:h-9 sm:w-9"
                          />
                        )
                      ))}
                    </div>

                    {badgeText && (
                      <span className="max-w-[150px] text-[11px] font-semibold leading-snug text-slate-700 dark:text-slate-200 sm:text-xs">
                        {badgeText}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Main title */}

              <h1 className="mb-4 hidden text-[38px] font-black leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:block lg:text-[50px] xl:text-[58px]">

                <span className="block overflow-hidden pb-1">
                  <motion.span
                    variants={lineReveal}
                    style={{ color: titleColor1 }}
                    className="block"
                  >
                    {heroTitleLine1}
                  </motion.span>
                </span>

                <span className="block overflow-hidden pb-1">
                  <motion.span
                    variants={lineReveal}
                    style={{ color: titleColor2 }}
                    className="block"
                  >
                    {heroTitleLine2}
                  </motion.span>
                </span>

                <span className="mt-1 block overflow-hidden pb-2">
                  <motion.span
                    variants={lineReveal}
                    className="relative inline-block"
                    style={{ color: highlightColor }}
                  >
                    {heroTitleHighlight}

                    <motion.svg
                      className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full"
                      viewBox="0 0 200 12"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <motion.path
                        d="M2 8 Q 50 0, 100 6 T 198 5"
                        stroke={highlightColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.35"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          delay: 1.1,
                          duration: 0.9,
                          ease: "easeOut",
                        }}
                      />
                    </motion.svg>
                  </motion.span>
                </span>

              </h1>

              {/* Description */}

              <motion.p
                variants={fadeUp}
                className="mb-6 max-w-[510px] text-sm font-normal leading-[1.75] text-slate-600 dark:text-slate-400 sm:text-base"
              >
                {heroDescription}
              </motion.p>

              {/* CTA buttons */}

              <motion.div
                variants={fadeUp}
                className="mb-6 flex flex-wrap items-center gap-4"
              >

                <motion.button
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/class/class_view")}
                  className="group relative inline-flex cursor-pointer items-center gap-5 overflow-hidden rounded-full bg-[#f15a24] py-2 pl-7 pr-2 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(241,90,36,0.6)] transition-shadow hover:shadow-[0_12px_25px_-8px_rgba(241,90,36,0.7)] sm:text-base"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative">
                    {primaryBtnText}
                  </span>

                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#f15a24]">
                    <ChevronRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </motion.button>

                {/* Share button */}

                <div className="relative">

                  <motion.button
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsShareOpen(!isShareOpen)}
                    title="Share Website"
                    aria-label="Share Website"
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
                        {isShareOpen ? <X size={19} /> : <Share2 size={19} />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>

                  {/* Share popover */}

                  <AnimatePresence>
                    {isShareOpen && (
                      <div className="absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 sm:bottom-auto sm:left-full sm:top-1/2 sm:ml-3 sm:translate-x-0 sm:-translate-y-1/2">

                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-row items-center gap-2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
                        >

                          {shareItems.map((it, i) => (
                            <motion.a
                              key={it.key}
                              href={it.href}
                              target={it.external ? "_blank" : undefined}
                              rel={it.external ? "noopener noreferrer" : undefined}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: 0.04 * i,
                                type: "spring",
                                stiffness: 420,
                                damping: 20,
                              }}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label={`Share via ${it.key}`}
                              className={`flex h-9 w-9 items-center justify-center rounded-full ${it.cls}`}
                            >
                              {it.icon}
                            </motion.a>
                          ))}

                          <motion.button
                            type="button"
                            onClick={handleCopyLink}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Copy website link"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400"
                          >
                            {copied ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </motion.button>

                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                </div>

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Share NovaSkill
                </span>

              </motion.div>

              {/* Social links */}

              {socialLinks.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-4 pb-1 dark:border-slate-700"
                >
                  <span className="mr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Follow us
                  </span>

                  {socialLinks.map(
                    (social: { platform: string; url: string }, index: number) =>
                      social.url && (
                        <motion.a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.platform}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.92 }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 16,
                          }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-[#f15a24] hover:text-white dark:bg-slate-800 dark:text-slate-300"
                        >
                          {getSocialIcon(social.platform)}
                        </motion.a>
                      )
                  )}
                </motion.div>
              )}

            </motion.div>
          </div>

        </div>
      </div>

      {/* ================= ABOUT US / STATISTICS ================= */}

      <div className="relative mx-auto mt-12 w-full max-w-6xl px-1 sm:mt-16 sm:px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >

          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Intro */}

            {(heroStatsBadge || heroStatsTitle) && (
              <div className="relative p-5 sm:p-6 lg:col-span-5 lg:p-8">

                <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#f15a24] to-orange-400" />

                {heroStatsBadge && (
                  <div className="mb-2.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-[#f15a24]" />
                    {heroStatsBadge}
                  </div>
                )}

                {heroStatsTitle && (
                  <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
                    {heroStatsTitle}
                  </p>
                )}

              </div>
            )}

            {/* Statistics */}

            <motion.ul
              variants={statsContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className={`grid grid-cols-1 divide-y divide-slate-200 border-t border-slate-200 bg-slate-50/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:border-l lg:border-t-0 ${
                heroStatsBadge || heroStatsTitle
                  ? "lg:col-span-7"
                  : "lg:col-span-12"
              }`}
            >

              {heroStatsList?.map((stat: any, index: number) => {
                const { numericVal, prefix, suffix } = parseStatValue(
                  stat.value
                );

                return (
                  <motion.li
                    key={index}
                    variants={statCard}
                    className="flex items-center gap-4 px-5 py-3.5 sm:flex-col sm:items-start sm:justify-center sm:gap-1.5 sm:px-6 sm:py-6"
                  >

                    <span className="flex w-[92px] shrink-0 items-baseline text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white sm:w-auto sm:text-3xl lg:text-4xl">
                      {prefix}

                      <CountUp
                        from={0}
                        to={numericVal}
                        duration={2.5}
                        separator=","
                      />

                      <span className="text-[#f15a24]">
                        {suffix}
                      </span>
                    </span>

                    <motion.span
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + index * 0.15,
                        duration: 0.6,
                        ease: EASE,
                      }}
                      className="h-8 w-[2px] shrink-0 origin-top rounded-full bg-[#f15a24] sm:hidden"
                    />

                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + index * 0.15,
                        duration: 0.6,
                        ease: EASE,
                      }}
                      className="hidden h-[2px] w-8 origin-left rounded-full bg-[#f15a24] sm:block"
                    />

                    <span className="text-xs font-medium leading-snug text-slate-500 dark:text-slate-400 sm:max-w-[200px]">
                      {stat.label}
                    </span>

                  </motion.li>
                );
              })}

            </motion.ul>

          </div>
        </motion.div>
      </div>

    </div>
  );
}
