"use client";

import AccordionGallery from "@/app/components/AccordionGallery";

interface GallerySectionProps {
  galleryDescription: string;
  currentGalleryItems: any[];
}

export default function GallerySection({
  galleryDescription,
  currentGalleryItems,
}: GallerySectionProps) {
  return (
    <div className="w-full relative mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">Our Gallery</h3>
        {galleryDescription && (
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {galleryDescription}
          </p>
        )}
      </div>

      <AccordionGallery 
        items={currentGalleryItems} 
        height={460}
        accentColor="#00CBB8"
        overlayColor="#0a0713"
        textColor="#ffffff"
        radius={16}
      />
    </div>
  );
}