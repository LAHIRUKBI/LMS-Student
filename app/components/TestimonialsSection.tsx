"use client";

import { ChevronLeft, ChevronRight, Star, User, Quote } from "lucide-react";
import ScrollRevealCards from "@/app/components/ScrollRevealCards";

interface TestimonialsSectionProps {
  testimonials: any[];
  testimonialIndex: number;
  prevTestimonials: () => void;
  nextTestimonials: () => void;
  dashboardSettings: any;
  getMediaUrl: (path: string) => string;
}

export default function TestimonialsSection({
  testimonials,
  testimonialIndex,
  prevTestimonials,
  nextTestimonials,
  dashboardSettings,
  getMediaUrl,
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  const showControls = testimonials.length > 2;
  const rangeStart = testimonialIndex + 1;
  const rangeEnd = Math.min(testimonialIndex + 2, testimonials.length);

  return (
    <section className="relative mb-20">
      {/* ================= Image banner (cards float over its lower edge) ================= */}
      <div
        className="relative isolate overflow-hidden rounded-[32px] bg-cover bg-center bg-no-repeat px-6 pb-40 pt-14 md:px-12 md:pb-48 md:pt-16"
        style={{
          backgroundImage: dashboardSettings?.testimonialBgImage
            ? `url("${getMediaUrl(dashboardSettings.testimonialBgImage)}")`
            : `url("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&h=900&fit=crop")`,
        }}
      >
        <div className="absolute inset-0 -z-10 bg-slate-900/75" />

        <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-teal-300">
              <span className="h-px w-8 bg-teal-300" />
              Testimonials
            </p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              What our <span className="text-teal-300">clients</span> say
            </h2>
          </div>

          {showControls && (
            <div className="flex items-center gap-3">
              <span className="mr-2 text-xs font-semibold tabular-nums tracking-widest text-white/70">
                {String(rangeStart).padStart(2, "0")}
                {rangeEnd !== rangeStart && `–${String(rangeEnd).padStart(2, "0")}`}
                <span className="text-white/40"> / {String(testimonials.length).padStart(2, "0")}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= Cards floating over the banner ================= */}
      <div className="relative z-10 mx-auto -mt-28 max-w-5xl px-4 md:-mt-36 md:px-16">
        {showControls && (
          <button
            onClick={prevTestimonials}
            className="absolute left-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-xl shadow-slate-900/20 ring-1 ring-slate-200 transition-all hover:bg-teal-500 hover:text-white hover:ring-teal-500 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 md:left-2 md:h-12 md:w-12"
            title="Previous"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {showControls && (
          <button
            onClick={nextTestimonials}
            className="absolute right-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-xl shadow-slate-900/20 ring-1 ring-slate-200 transition-all hover:bg-teal-500 hover:text-white hover:ring-teal-500 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 md:right-2 md:h-12 md:w-12"
            title="Next"
            aria-label="Next testimonials"
          >
            <ChevronRight size={22} />
          </button>
        )}

        <ScrollRevealCards
          maxTranslateX={180}
          maxTranslateY={40}
          maxScaleReduction={0.18}
          maxRotate={6}
          maxOpacityReduction={0.9}
        >
          {testimonials.slice(testimonialIndex, testimonialIndex + 2).map((test: any) => {
            const stars = Number(test.rating) || 5;

            return (
              <div
                key={test.name + test.title}
                className="flex h-full flex-col justify-between rounded-3xl bg-white antialiased [backface-visibility:hidden] [text-rendering:optimizeLegibility] p-8 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-[#111827] dark:shadow-black/40 dark:ring-slate-800 md:p-10"
              >
                <div>
                  <Quote
                    size={38}
                    strokeWidth={0}
                    fill="currentColor"
                    className="mb-5 rotate-180 text-teal-500"
                  />
                  <p className="mb-10 text-base font-normal leading-8 text-slate-800 dark:text-slate-200 md:text-[17px]">
                    {test.idea}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-dashed border-slate-200 pt-6 dark:border-slate-800">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                      {test.image ? (
                        <img src={getMediaUrl(test.image)} alt={test.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-full w-full p-3 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white md:text-base">{test.name}</h4>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-slate-400">{test.title}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="currentColor"
                        className={i < stars ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollRevealCards>
      </div>
    </section>
  );
}
