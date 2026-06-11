"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeedPostCard, type FeedPostView } from "./FeedPostCard";

type FeedRailVariant = "featured" | "standard" | "compact";

function itemWidthClass(variant: FeedRailVariant) {
  if (variant === "featured") return "w-[86vw] sm:w-[66vw] lg:w-[44rem]";
  if (variant === "compact") return "w-[78vw] sm:w-[42vw] lg:w-[23rem]";
  return "w-[82vw] sm:w-[48vw] lg:w-[31%]";
}

export function FeedRail({
  title,
  subtitle,
  posts,
  variant = "standard"
}: {
  title: string;
  subtitle?: string;
  posts: FeedPostView[];
  variant?: FeedRailVariant;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const rail = railRef.current;
    if (!rail) return;
    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(rail.scrollLeft < maxScrollLeft - 4);
  }

  function scrollRail(direction: "left" | "right") {
    const rail = railRef.current;
    if (!rail) return;
    const delta = Math.max(rail.clientWidth * 0.82, 280);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction === "left" ? -delta : delta, behavior: reduceMotion ? "auto" : "smooth" });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [posts.length]);

  if (posts.length === 0) return null;

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          <h2 className={variant === "featured" ? "text-2xl font-bold text-white" : "text-xl font-bold text-white"}>{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">{subtitle}</p> : null}
        </div>
        {posts.length > 1 ? (
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Ver tarjetas anteriores"
              disabled={!canScrollLeft}
              onClick={() => scrollRail("left")}
              className="gold-focus grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-white/72 transition-[border-color,background-color,color,opacity,transform] duration-200 hover:-translate-y-px hover:border-[var(--gold)]/35 hover:bg-[var(--gold)]/8 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              aria-label="Ver más tarjetas"
              disabled={!canScrollRight}
              onClick={() => scrollRail("right")}
              className="gold-focus grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-white/72 transition-[border-color,background-color,color,opacity,transform] duration-200 hover:-translate-y-px hover:border-[var(--gold)]/35 hover:bg-[var(--gold)]/8 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative min-w-0 overflow-hidden">
        <div
          ref={railRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:px-1 [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          aria-label={title}
        >
          {posts.map((post, index) => (
            <div key={post.id} className={`min-w-0 shrink-0 snap-start scroll-ml-4 ${itemWidthClass(variant)}`}>
              <FeedPostCard post={post} variant={variant} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
