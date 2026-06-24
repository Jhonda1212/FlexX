"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { OptimizedBackdropImage } from "@/components/ui/OptimizedBackdropImage";
import {
  groupTicketTiersByEvent,
  listActiveTicketTiersForEvents,
  listFeaturedPublishedEvents,
  minimumTicketPriceLabel,
  type FeaturedEventView
} from "@/lib/flex-actions";

function EventCard({ event, priceLabel }: { event: FeaturedEventView; priceLabel: string }) {
  return (
    <Link href={`/app/events/${event.id}`} prefetch={false} className="gold-focus group block h-full min-w-0 rounded-lg">
      <FlexCard className="h-full overflow-hidden p-0 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-[var(--gold)]/45 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] group-active:scale-[0.99]">
        <div className="relative flex min-h-[21rem] overflow-hidden">
          {event.imageUrl ? (
            <OptimizedBackdropImage
              src={event.imageUrl}
              alt=""
              sizes="(max-width: 640px) 100vw, (max-width: 1536px) 50vw, 33vw"
              className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.015]"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(8,8,8,0.96)_56%,rgba(76,18,18,0.22))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
          <div className="absolute inset-0 bg-[var(--gold)]/0 transition-colors duration-300 ease-out group-hover:bg-[var(--gold)]/6" />
          <div className="relative z-10 flex min-h-[21rem] w-full flex-col p-4">
            <div className="w-fit rounded-md border border-[var(--gold)]/35 bg-black/72 px-3 py-2 text-center shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
              <div className="text-xl font-bold text-white">{event.dateLabel.split(" ")[0]}</div>
              <div className="text-xs text-[var(--muted)]">{event.dateLabel.split(" ")[1] ?? ""}</div>
            </div>
            <div className="mt-8 flex min-w-0 flex-1 flex-col">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">{event.artist || "FLEX Live"}</p>
              <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight text-white sm:text-2xl">{event.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 truncate text-white/72">{event.zone || "FLEX"}</span>
                <span className="h-1 w-1 rounded-full bg-white/32" />
                <span className="min-w-0 truncate font-bold text-[var(--gold)]">{priceLabel}</span>
              </div>
              <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-white/70">{event.description || "Live session FLEX."}</p>
              <div className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">
                Ver detalle <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" size={16} />
              </div>
            </div>
          </div>
        </div>
      </FlexCard>
    </Link>
  );
}

export function HomeUpcomingEvents() {
  const [events, setEvents] = useState<FeaturedEventView[]>([]);
  const [priceLabels, setPriceLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      const data = await listFeaturedPublishedEvents(3);
      if (!active) return;
      setEvents(data);

      try {
        const tiers = await listActiveTicketTiersForEvents(data.map((event) => event.id));
        const tiersByEvent = groupTicketTiersByEvent(tiers);
        if (active) {
          setPriceLabels(
            Object.fromEntries(
              data.map((event) => [
                event.id,
                minimumTicketPriceLabel(tiersByEvent[event.id] ?? [], event.ticketPriceCents)
              ])
            )
          );
        }
      } catch (tierError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase event ticket tiers load error", tierError);
        }
        if (active) {
          setPriceLabels(
            Object.fromEntries(
              data.map((event) => [event.id, minimumTicketPriceLabel([], event.ticketPriceCents)])
            )
          );
        }
      }
    }

    loadEvents()
      .catch((loadError) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase events load error", loadError);
        }
        if (active) setError("No pudimos cargar los eventos ahora. Intentalo de nuevo en unos minutos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
        <FlexSkeleton className="h-[21rem]" />
        <FlexSkeleton className="h-[21rem]" />
        <FlexSkeleton className="h-[21rem]" />
      </div>
    );
  }

  if (error) {
    return <FlexCard tone="danger"><p className="text-sm text-red-100">{error}</p></FlexCard>;
  }

  return (
    <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} priceLabel={priceLabels[event.id] ?? minimumTicketPriceLabel([], event.ticketPriceCents)} />
      ))}
    </div>
  );
}
