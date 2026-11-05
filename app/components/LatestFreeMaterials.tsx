"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  GraduationCap,
  Layers3,
  UserRound,
} from "lucide-react";

interface FreeMaterial {
  _id: string;
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
  type?: "pdf" | "paper" | "video" | string;
  fileUrl?: string;
  coverImage?: string | { url?: string } | null;
  youtubeVideoId?: string;
  teacherId?: { name?: string } | null;
  createdAt?: string;
}


const FREE_MATERIALS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/materials/free/all`;
const FREE_MATERIALS_PAGE_URL = "/class/free";

const getCoverImageUrl = (coverImage: FreeMaterial["coverImage"]) => {
  if (!coverImage) return null;

  const rawUrl =
    typeof coverImage === "object" && coverImage !== null
      ? coverImage.url
      : coverImage;

  if (!rawUrl || typeof rawUrl !== "string") return null;
  if (rawUrl.startsWith("http")) return rawUrl;

  const normalizedPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${process.env.NEXT_PUBLIC_API_URL || ""}${normalizedPath}`;
};

const getYouTubeVideoId = (url?: string) => {
  if (!url) return null;

  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );

  return match ? match[1] : null;
};

const getMaterialDate = (createdAt?: string) => {
  if (!createdAt) return "Recently added";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Recently added";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const getMaterialType = (material: FreeMaterial) => {
  if (material.type === "video") {
    return {
      label: "Video lesson",
      icon: Film,
      color: "text-violet-700 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300",
      accent: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
    };
  }

  if (material.type === "paper") {
    return {
      label: "Past paper",
      icon: GraduationCap,
      color: "text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300",
      accent: "from-amber-500/20 via-orange-400/10 to-transparent",
    };
  }

  return {
    label: "PDF notes",
    icon: FileText,
    color: "text-sky-700 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300",
    accent: "from-sky-500/20 via-cyan-400/10 to-transparent",
  };
};

export default function LatestFreeMaterials() {
  const [materials, setMaterials] = useState<FreeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    deltaX: number;
    dragging: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestMaterials = async () => {
      try {
        // Use the same public free-materials endpoint as FreeMaterialsPage.
        const response = await axios.get(FREE_MATERIALS_URL);
        const receivedMaterials = Array.isArray(response.data)
          ? response.data
          : [];

        if (isMounted) {
          setMaterials(receivedMaterials);
        }
      } catch (error) {
        console.error("Error fetching latest free materials:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestMaterials();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestMaterials = useMemo(() => {
    return [...materials]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const validDateA = Number.isNaN(dateA) ? 0 : dateA;
        const validDateB = Number.isNaN(dateB) ? 0 : dateB;
        return validDateB - validDateA;
      })
      .slice(0, 4);
  }, [materials]);

  const currentIndex = latestMaterials.length > 0
    ? Math.min(activeIndex, latestMaterials.length - 1)
    : 0;

  const goToNextMaterial = () => {
    if (latestMaterials.length <= 1) return;
    setActiveIndex((index) => (index + 1) % latestMaterials.length);
  };

  const goToPreviousMaterial = () => {
    if (latestMaterials.length <= 1) return;
    setActiveIndex((index) =>
      (index - 1 + latestMaterials.length) % latestMaterials.length
    );
  };

  // Let vertical page scrolling work normally, while a clear horizontal
  // pointer gesture moves the mobile carousel and snaps to the next card.
  const handleCarouselPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (latestMaterials.length <= 1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, textarea, [data-no-carousel-drag]")) return;

    pointerStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      dragging: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCarouselPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = pointerStartRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;

    if (!pointer.dragging) {
      if (Math.abs(deltaX) < 8) return;

      // A predominantly vertical movement belongs to the page, not the carousel.
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.15) {
        pointerStartRef.current = null;
        return;
      }

      pointer.dragging = true;
      setIsDragging(true);
    }

    pointer.deltaX = deltaX;
    setDragOffset(deltaX);
    if (event.cancelable) event.preventDefault();
  };

  const finishCarouselPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = pointerStartRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const shouldNavigate = pointer.dragging && Math.abs(pointer.deltaX) > 55;
    const direction = pointer.deltaX;

    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (pointer.dragging) {
      // Prevent the card Link from opening after the user has dragged it.
      // Clear the guard as a fallback in case the browser does not synthesize a click.
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);
    }

    if (shouldNavigate) {
      if (direction < 0) goToNextMaterial();
      else goToPreviousMaterial();
    }
  };

  const handleCarouselPointerCancel = () => {
    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleCarouselClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const renderMaterialCard = (
    material: FreeMaterial,
    isMobileCarousel = false
  ) => {
    const resourceType = getMaterialType(material);
    const TypeIcon = resourceType.icon;
    const coverImage = getCoverImageUrl(material.coverImage);
    const youtubeId = material.youtubeVideoId || getYouTubeVideoId(material.fileUrl);
    const previewImage =
      material.type === "video" && youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : coverImage;
    const isCarouselCard = isMobileCarousel;

    return (
      <Link
        key={material._id}
        href={FREE_MATERIALS_PAGE_URL}
        aria-label={`Explore ${material.title || "free learning resource"} in Free Materials`}
        className={
          isCarouselCard
            ? "group flex h-[430px] w-full max-w-[370px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white/95 text-left shadow-[0_12px_34px_rgba(15,23,42,0.12)] transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950/95 dark:focus-visible:ring-offset-slate-900"
            : "group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white/90 text-left shadow-[0_5px_18px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-sky-800 dark:hover:shadow-[0_16px_34px_rgba(0,0,0,0.22)] dark:focus-visible:ring-offset-slate-900"
        }
      >
        <div className="relative h-36 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-40">
          <div className={`absolute inset-0 bg-gradient-to-br ${resourceType.accent}`} />
          {previewImage ? (
            <img
              src={previewImage}
              alt={material.title || "Free learning resource"}
              loading="lazy"
              draggable={false}
              className="relative h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="flex h-[74px] w-[74px] items-center justify-center rounded-[24px] border border-white/70 bg-white/80 text-sky-700 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-sky-300">
                <TypeIcon size={34} strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-slate-500 backdrop-blur dark:bg-slate-900/75 dark:text-slate-300">
                <Layers3 size={16} />
              </div>
            </div>
          )}

          <div
            className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-bold shadow-sm backdrop-blur-sm ${resourceType.color}`}
          >
            <TypeIcon size={11} /> {resourceType.label}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
              {material.subject || "General"}
            </span>
            {material.grade && (
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {material.grade}
              </span>
            )}
          </div>

          <h3 className="mt-2 line-clamp-2 min-h-[42px] text-sm font-extrabold leading-[1.45] text-slate-900 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300">
            {material.title || "Untitled learning resource"}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-[38px] text-[10px] leading-[1.9] text-slate-500 dark:text-slate-400">
            {material.description?.trim() ||
              "Open this resource to view its learning content and details."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-[9px] font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
            {material.teacherId?.name && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <UserRound size={11} />
                <span className="max-w-[105px] truncate">{material.teacherId.name}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={11} /> {getMaterialDate(material.createdAt)}
            </span>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-sky-700 transition-all group-hover:gap-2.5 dark:text-sky-300">
            Explore resource <ArrowUpRight size={13} />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section
      className="relative isolate py-10 sm:py-14"
      aria-labelledby="latest-free-materials-title"
    >
      <div className="pointer-events-none absolute -right-8 top-10 -z-10 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute -bottom-2 left-8 -z-10 h-32 w-32 rounded-full bg-orange-200/25 blur-3xl dark:bg-orange-500/10" />

      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-[#fffaf7] to-[#f2f9ff] p-4 shadow-[0_16px_50px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-[#0d2033] sm:rounded-[32px] sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-center gap-4 text-center sm:mb-7">
          <div className="w-full max-w-2xl">
            <h2
              id="latest-free-materials-title"
              className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl"
            >
              Discover what&apos;s <span className="text-sky-600 dark:text-sky-400">new</span>
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-slate-500 dark:text-slate-400 sm:text-sm">
              Fresh notes, past papers and video lessons shared by your teachers —
              all free and ready to explore.
            </p>
          </div>

          <Link
            href={FREE_MATERIALS_PAGE_URL}
            className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-900/10 dark:bg-sky-200 dark:text-slate-950 dark:hover:bg-sky-100"
          >
            Explore all free resources
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {loading ? (
          <>
            {/* Mobile loading preview follows the same horizontal carousel layout. */}
            <div className="relative mx-auto h-[455px] w-full md:hidden">
              <div className="absolute left-1/2 top-1/2 h-[390px] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-slate-200/80 bg-white/70 opacity-60 dark:border-slate-800 dark:bg-slate-950/30" />
              <div className="absolute left-1/2 top-1/2 h-[430px] w-[84%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            {/* Desktop loading skeleton stays in the original grid layout. */}
            <div className="hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4 sm:gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/30"
                >
                  <div className="h-36 animate-pulse bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : latestMaterials.length > 0 ? (
          <>
            {/* Mobile only: a horizontal slide track controlled by the buttons. */}
            <div className="mx-auto w-full max-w-[430px] md:hidden">
              <div
                className={`w-full overflow-hidden rounded-[24px] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                aria-label="Latest free materials carousel"
                aria-live="polite"
                onPointerDown={handleCarouselPointerDown}
                onPointerMove={handleCarouselPointerMove}
                onPointerUp={finishCarouselPointer}
                onPointerCancel={handleCarouselPointerCancel}
                onLostPointerCapture={handleCarouselPointerCancel}
                onClickCapture={handleCarouselClickCapture}
                style={{ touchAction: "pan-y" }}
              >
                <div
                  className={`flex w-full ${isDragging ? "transition-none" : "transition-transform duration-500 ease-out motion-reduce:transition-none"}`}
                  style={{ transform: `translate3d(calc(-${currentIndex * 100}% + ${dragOffset}px), 0, 0)` }}
                >
                  {latestMaterials.map((material) => (
                    <div
                      key={material._id}
                      className="flex w-full shrink-0 justify-center px-1"
                    >
                      {renderMaterialCard(material, true)}
                    </div>
                  ))}
                </div>
              </div>

              {latestMaterials.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={goToPreviousMaterial}
                    aria-label="Previous free material"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 active:scale-90 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-sky-950/50 dark:hover:text-sky-300"
                  >
                    <ChevronLeft size={19} />
                  </button>
                  <span className="min-w-[62px] text-center text-[10px] font-extrabold tabular-nums tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {String(currentIndex + 1).padStart(2, "0")} <span className="mx-1 text-slate-300 dark:text-slate-600">/</span> {String(latestMaterials.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextMaterial}
                    aria-label="Next free material"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 active:scale-90 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-sky-950/50 dark:hover:text-sky-300"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
              )}
            </div>

            {/* Desktop only: preserve the existing static four-card grid. */}
            <div className="hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4 sm:gap-4">
              {latestMaterials.map((material) => renderMaterialCard(material))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-950/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              <BookOpen size={22} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
              New free resources are on the way
            </h3>
            <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Your teachers&apos; free notes, past papers and video lessons will appear here when they are added.
            </p>
            <Link
              href={FREE_MATERIALS_PAGE_URL}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-bold text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-sky-300"
            >
              Visit Free Materials <ArrowUpRight size={13} />
            </Link>
          </div>
        )}
      </div>


    </section>
  );
}
