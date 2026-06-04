"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { featuredEvents } from "@/lib/featured-events";
import { listFeaturedPublishedEvents, type FeaturedEventView } from "@/lib/flex-actions";

const carouselIntervalMs = 5600;

function fallbackHeroEvents(): FeaturedEventView[] {
  const now = new Date();
  return featuredEvents.map((event, index) => {
    const startsAt = new Date(now);
    startsAt.setDate(now.getDate() + 2 + index * 3);
    startsAt.setHours(22, 0, 0, 0);

    return {
      id: event.id,
      title: event.title,
      artist: event.artist,
      description: event.description,
      startsAt: startsAt.toISOString(),
      endsAt: null,
      ticketPriceCents: null,
      dateLabel: event.date,
      zone: event.zone,
      imageUrl: event.image,
      artistUrl: event.artistUrl,
      externalUrl: null,
      featured: true,
      source: "local" as const
    };
  });
}

function mergeWithFallback(events: FeaturedEventView[]) {
  if (events.length >= 3) return events.slice(0, 5);
  const existingIds = new Set(events.map((event) => event.id));
  const fallback = fallbackHeroEvents().filter((event) => !existingIds.has(event.id));
  return [...events, ...fallback].slice(0, 5);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    function updatePreference(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
    }

    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

export function HomeEventCarousel() {
  const [events, setEvents] = useState<FeaturedEventView[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    listFeaturedPublishedEvents(5)
      .then((data) => {
        if (active) setEvents(mergeWithFallback(data));
      })
      .catch((loadError) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase hero events load error", loadError);
        }
        if (active) setEvents(fallbackHeroEvents().slice(0, 3));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeEvent = events[activeIndex] ?? events[0];
  const canRotate = events.length > 1;

  useEffect(() => {
    if (!canRotate || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % events.length);
    }, carouselIntervalMs);
    return () => window.clearInterval(timer);
  }, [canRotate, events.length, paused, reducedMotion]);

  useEffect(() => {
    if (activeIndex > events.length - 1) setActiveIndex(0);
  }, [activeIndex, events.length]);

  const dateParts = useMemo(() => activeEvent?.dateLabel.split(" ") ?? ["", ""], [activeEvent]);

  function move(direction: "previous" | "next") {
    if (!canRotate) return;
    setActiveIndex((index) => {
      if (direction === "previous") return index === 0 ? events.length - 1 : index - 1;
      return (index + 1) % events.length;
    });
  }

  if (loading) {
    return (
      <FlexCard className="overflow-hidden p-0">
        <div className="relative min-h-[360px] p-6 sm:p-9">
          <FlexSkeleton className="absolute inset-0 rounded-none" />
          <div className="relative z-10 flex min-h-[288px] max-w-xl flex-col justify-end">
            <FlexSkeleton className="h-7 w-40" />
            <FlexSkeleton className="mt-5 h-16 w-72" />
            <FlexSkeleton className="mt-4 h-5 w-64" />
            <FlexSkeleton className="mt-6 h-12 w-40" />
          </div>
        </div>
      </FlexCard>
    );
  }

  if (!activeEvent) {
    return null;
  }

  return (
    <FlexCard className="soft-enter group overflow-hidden p-0">
      <div
        className="relative min-h-[360px] overflow-hidden p-6 sm:p-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {events.map((event, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={`${event.id}-${index}`}
              className={`absolute inset-0 bg-cover bg-center transition-[opacity,transform,filter] duration-700 ease-out ${
                active
                  ? "scale-100 opacity-80 blur-0"
                  : "scale-[1.025] opacity-0 blur-[1px]"
              } ${reducedMotion ? "!transform-none !transition-none" : ""}`}
              style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : undefined }}
            >
              {!event.imageUrl ? <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(8,8,8,0.96)_56%,rgba(76,18,18,0.22))]" /> : null}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.90)_0%,rgba(0,0,0,0.76)_34%,rgba(0,0,0,0.38)_64%,rgba(0,0,0,0.10)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/78 via-black/28 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(217,166,64,0.11),transparent_26rem)]" />

        <div
          key={activeEvent.id}
          className={`soft-enter relative z-10 flex min-h-[300px] max-w-xl flex-col justify-end ${reducedMotion ? "!animate-none" : ""}`}
        >
          <span className="inline-flex w-fit rounded-full border border-[var(--gold)]/25 bg-black/42 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--gold-bright)]">
            Evento destacado
          </span>
          <h2 className="font-display mt-5 text-5xl font-bold leading-none text-white sm:text-7xl">{activeEvent.title}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/78">
            <span className="font-semibold text-white/88">{activeEvent.artist || "FLEX Live"}</span>
            <span className="text-[var(--gold)]/70">·</span>
            <span>{dateParts[0]} {dateParts[1]}</span>
            <span className="text-[var(--gold)]/70">·</span>
            <span className="text-[var(--gold-bright)]">{formatTime(activeEvent.startsAt)}</span>
            <span className="text-[var(--gold)]/70">·</span>
            <span>{activeEvent.zone || "FLEX"}</span>
          </div>
          {activeEvent.description ? <p className="mt-5 max-w-lg text-sm leading-6 text-white/70">{activeEvent.description}</p> : null}
          <Link href={`/app/events/${activeEvent.id}`} className="mt-7 w-full sm:w-fit">
            <FlexButton className="w-full sm:w-auto">
              Ver detalles <ArrowRight size={18} />
            </FlexButton>
          </Link>
        </div>

        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/38 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur sm:right-7 sm:top-7">
          <button
            className="gold-focus grid size-8 place-items-center rounded-full text-white/68 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Evento anterior"
            disabled={!canRotate}
            onClick={() => move("previous")}
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5 px-1">
            {events.map((event, index) => (
              <button
                key={`${event.id}-dot-${index}`}
                type="button"
                aria-label={`Mostrar evento ${index + 1}`}
                className={`gold-focus h-2 rounded-full transition-[background-color,width,opacity] duration-200 ${
                  index === activeIndex ? "w-6 bg-[var(--gold)]" : "w-2 bg-white/32 hover:bg-white/58"
                }`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button
            className="gold-focus grid size-8 place-items-center rounded-full text-white/68 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Evento siguiente"
            disabled={!canRotate}
            onClick={() => move("next")}
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {canRotate && !reducedMotion ? (
          <div className="absolute inset-x-0 bottom-0 z-10 h-px bg-white/10">
            <div
              key={activeIndex}
              className="hero-progress h-full bg-[linear-gradient(90deg,rgba(217,166,64,0.18),rgba(240,194,100,0.82))]"
              style={{
                animationDuration: `${carouselIntervalMs}ms`,
                animationPlayState: paused ? "paused" : "running"
              }}
            />
          </div>
        ) : null}
      </div>
    </FlexCard>
  );
}
