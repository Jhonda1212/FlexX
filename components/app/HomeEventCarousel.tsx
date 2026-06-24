"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { OptimizedBackdropImage } from "@/components/ui/OptimizedBackdropImage";
import { featuredEvents } from "@/lib/featured-events";
import { listFeaturedPublishedEvents, mocksEnabled, type FeaturedEventView } from "@/lib/flex-actions";

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

function mergeWithFallback(events: FeaturedEventView[], allowFallback: boolean) {
  if (!allowFallback || events.length >= 3) return events.slice(0, 5);
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

function isNearbySlide(index: number, activeIndex: number, total: number) {
  if (total <= 3) return true;
  return index === activeIndex || index === (activeIndex + 1) % total || index === (activeIndex - 1 + total) % total;
}

function HomeEventCarouselComponent() {
  const [events, setEvents] = useState<FeaturedEventView[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    const allowMocks = mocksEnabled();

    listFeaturedPublishedEvents(5)
      .then((data) => {
        if (!active) return;

        if (!allowMocks) {
          const supabaseEvents = data.filter((event) => event.source === "supabase");
          setEvents(supabaseEvents.slice(0, 5));
          setError(supabaseEvents.length > 0 ? "" : "No hay eventos destacados publicados desde Supabase ahora mismo.");
          return;
        }

        setEvents(mergeWithFallback(data, true));
        setError("");
      })
      .catch((loadError) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase hero events load error", loadError);
        }
        if (!active) return;

        if (allowMocks) {
          setEvents(fallbackHeroEvents().slice(0, 3));
          setError("");
          return;
        }

        setEvents([]);
        setError("No pudimos cargar los eventos destacados desde Supabase. Revisa la conexion y los eventos publicados.");
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
        <div className="relative min-h-[300px] p-5 sm:min-h-[330px] sm:p-7 2xl:min-h-[380px] 2xl:p-9">
          <FlexSkeleton className="absolute inset-0 rounded-none" />
          <div className="relative z-10 flex min-h-[240px] max-w-xl flex-col justify-end sm:min-h-[270px] 2xl:min-h-[310px]">
            <FlexSkeleton className="h-7 w-40" />
            <FlexSkeleton className="mt-4 h-14 w-72" />
            <FlexSkeleton className="mt-4 h-5 w-64" />
            <FlexSkeleton className="mt-6 h-12 w-40" />
          </div>
        </div>
      </FlexCard>
    );
  }

  if (error) {
    return (
      <FlexCard tone="danger" className="soft-enter">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-200">Eventos destacados</p>
        <h2 className="font-display mt-3 text-3xl text-white">No se pudo preparar el carrusel</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-red-100/82">{error}</p>
        <Link href="/app/events" prefetch={false} className="mt-5 inline-flex text-sm font-bold text-red-100 underline decoration-red-200/40 underline-offset-4">
          Ver pagina de eventos
        </Link>
      </FlexCard>
    );
  }

  if (!activeEvent) {
    return (
      <FlexCard className="soft-enter">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Eventos destacados</p>
        <h2 className="font-display mt-3 text-3xl text-white">Sin eventos destacados</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Cuando admin publique eventos futuros, apareceran aqui.</p>
      </FlexCard>
    );
  }

  return (
    <FlexCard className="soft-enter group overflow-hidden p-0">
      <div
        className="relative min-h-[300px] overflow-hidden p-5 sm:min-h-[330px] sm:p-7 lg:min-h-[340px] xl:p-8 2xl:min-h-[390px] 2xl:p-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {events.map((event, index) => {
          const active = index === activeIndex;
          if (!isNearbySlide(index, activeIndex, events.length)) return null;

          return (
            <div
              key={`${event.id}-${index}`}
              className={`absolute inset-0 overflow-hidden transition-[opacity,transform] duration-500 ease-out ${
                active
                  ? "scale-100 opacity-95"
                  : "scale-[1.015] opacity-0"
              } ${reducedMotion ? "!transform-none !transition-none" : ""}`}
            >
              {event.imageUrl ? (
                <OptimizedBackdropImage
                  src={event.imageUrl}
                  alt=""
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, (max-width: 1536px) calc(100vw - 280px), calc(100vw - 680px)"
                  className="absolute inset-0"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(8,8,8,0.96)_56%,rgba(76,18,18,0.22))]" />
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.72)_36%,rgba(0,0,0,0.28)_68%,rgba(0,0,0,0.04)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/72 via-black/24 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(217,166,64,0.09),transparent_24rem)]" />

        <div
          key={activeEvent.id}
          className={`soft-enter relative z-10 flex min-h-[238px] max-w-[36rem] flex-col justify-end pr-0 sm:min-h-[272px] sm:pr-28 lg:pr-36 xl:pr-0 2xl:min-h-[320px] ${reducedMotion ? "!animate-none" : ""}`}
        >
          <span className="inline-flex w-fit rounded-full border border-[var(--gold)]/25 bg-black/46 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold-bright)] sm:text-[11px]">
            EVENTO DESTACADO
          </span>
          <h2 className="font-display mt-4 line-clamp-2 max-w-[15ch] text-4xl font-bold leading-[0.96] text-white [text-wrap:balance] sm:text-5xl lg:text-[3.35rem] 2xl:text-6xl">{activeEvent.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/78 sm:text-sm">
            <span className="font-semibold text-white/88">{activeEvent.artist || "FLEX Live"}</span>
            <span className="text-[var(--gold)]/70">·</span>
            <span>{dateParts[0]} {dateParts[1]}</span>
            <span className="text-[var(--gold)]/70">·</span>
            <span className="text-[var(--gold-bright)]">{formatTime(activeEvent.startsAt)}</span>
            <span className="text-[var(--gold)]/70">·</span>
            <span>{activeEvent.zone || "FLEX"}</span>
          </div>
          {activeEvent.description ? <p className="mt-4 line-clamp-1 max-w-lg text-sm leading-6 text-white/72 sm:line-clamp-2">{activeEvent.description}</p> : null}
          <Link
            href={`/app/events/${activeEvent.id}`}
            prefetch={false}
            className="gold-focus mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--gold)]/70 bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black shadow-[0_10px_24px_rgba(217,166,64,0.12)] transition-[background-color,border-color,box-shadow,color,transform,opacity] duration-200 ease-out hover:-translate-y-px hover:border-[var(--gold-bright)] hover:bg-[var(--gold-bright)] hover:shadow-[0_12px_28px_rgba(217,166,64,0.16)] active:translate-y-0 active:scale-[0.985] sm:w-fit"
          >
            Ver detalles <ArrowRight size={18} />
          </Link>
        </div>

        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/42 p-1 shadow-[0_8px_18px_rgba(0,0,0,0.14)] sm:right-6 sm:top-6 2xl:right-8 2xl:top-8">
          <button
            className="gold-focus grid size-11 place-items-center rounded-full text-white/58 transition-[background-color,color,opacity] duration-200 ease-out hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Mostrar evento anterior"
            disabled={!canRotate}
            onClick={() => move("previous")}
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-0.5" role="group" aria-label="Seleccionar evento destacado">
            {events.map((event, index) => (
              <button
                key={`${event.id}-dot-${index}`}
                type="button"
                aria-label={`Mostrar evento ${index + 1}: ${event.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className="gold-focus group grid size-11 place-items-center rounded-full"
                onClick={() => setActiveIndex(index)}
              >
                <span
                  className={`block h-2 w-2 rounded-full transition-[background-color,opacity] duration-200 ${
                    index === activeIndex ? "bg-[var(--gold-bright)] opacity-100" : "bg-white/28 opacity-55 group-hover:bg-white/52 group-hover:opacity-80"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            className="gold-focus grid size-11 place-items-center rounded-full text-white/58 transition-[background-color,color,opacity] duration-200 ease-out hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Mostrar evento siguiente"
            disabled={!canRotate}
            onClick={() => move("next")}
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {canRotate && !reducedMotion ? (
          <div className="absolute inset-x-5 bottom-4 z-10 h-1 overflow-hidden rounded-full bg-white/10 sm:inset-x-7 2xl:inset-x-10">
            <div
              key={activeIndex}
              className="hero-progress h-full rounded-full bg-[linear-gradient(90deg,rgba(217,166,64,0.18),rgba(240,194,100,0.78))]"
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

export const HomeEventCarousel = memo(HomeEventCarouselComponent);
