"use client";

import FeatureCarousel from "@/app/components/FeatureCarousel";

interface FeaturesSectionProps {
  featureBadge: string;
  featureTitleLine1: string;
  featureTitleHighlight: string;
  featureDescription: string;
  currentFeatureItems: any[];
}

export default function FeaturesSection({
  featureBadge,
  featureTitleLine1,
  featureTitleHighlight,
  featureDescription,
  currentFeatureItems,
}: FeaturesSectionProps) {
  return (
    <section className="py-16 mb-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-block bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 font-bold px-4 py-1.5 rounded-full text-xs mb-4 shadow-sm tracking-wide">
          {featureBadge}
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
          {featureTitleLine1} <span className="text-[#00CBB8]">{featureTitleHighlight}</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          {featureDescription}
        </p>
      </div>

      <FeatureCarousel 
        items={currentFeatureItems}
        autoplay={true}
        autoplayDelay={4000}
        pauseOnHover={true}
      />
    </section>
  );
}