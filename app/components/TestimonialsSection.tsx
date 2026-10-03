"use client";

import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";
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

  return (
    <section 
      className="py-20 mb-20 relative rounded-3xl overflow-visible shadow-2xl bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: dashboardSettings?.testimonialBgImage 
          ? `url("${getMediaUrl(dashboardSettings.testimonialBgImage)}")` 
          : `url("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&h=900&fit=crop")`
      }}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] -z-10 rounded-3xl overflow-hidden"></div>

      {testimonials.length > 2 && (
        <button 
          onClick={prevTestimonials}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 bg-teal-500 hover:bg-teal-600 text-white p-3.5 rounded-full shadow-2xl ring-4 ring-white/20 transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
          title="Previous"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {testimonials.length > 2 && (
        <button 
          onClick={nextTestimonials}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 bg-teal-500 hover:bg-teal-600 text-white p-3.5 rounded-full shadow-2xl ring-4 ring-white/20 transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
          title="Next"
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div className="text-center max-w-3xl mx-auto mb-12 px-4 relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          What our <span className="text-teal-400">clients</span> say
        </h2>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 md:px-10">
        <ScrollRevealCards
          maxTranslateX={180}
          maxTranslateY={40}
          maxScaleReduction={0.18}
          maxRotate={6}
          maxOpacityReduction={0.9}
        >
          {testimonials.slice(testimonialIndex, testimonialIndex + 2).map((test: any) => (
            <div 
              key={test.name + test.title}
              className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center gap-1 mb-6 text-yellow-400">
                  {[...Array(Number(test.rating) || 5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-8 font-medium">
                  "{test.idea}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                  {test.image ? (
                    <img src={getMediaUrl(test.image)} alt={test.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{test.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.title}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollRevealCards>
      </div>
    </section>
  );
}