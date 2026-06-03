"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { listFeaturedPublishedEvents, type FeaturedEventView } from "@/lib/flex-actions";

function EventCard({ event }: { event: FeaturedEventView }) {
  return (
    <Link href={`/app/events/${event.id}`} className="gold-focus group block rounded-lg">
      <FlexCard className="h-full overflow-hidden p-0 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-[var(--gold)]/45 group-hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)] group-active:scale-[0.99]">
        <div className="relative h-64">
          {event.imageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out group-hover:scale-[1.02]" style={{ backgroundImage: `url(${event.imageUrl})` }} />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(8,8,8,0.96)_56%,rgba(76,18,18,0.22))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
          <div className="absolute left-4 top-4 rounded-md border border-[var(--gold)]/35 bg-black/72 px-3 py-2 text-center shadow-[0_10px_26px_rgba(0,0,0,0.28)]">
            <div className="text-xl font-bold text-white">{event.dateLabel.split(" ")[0]}</div>
            <div className="text-xs text-[var(--muted)]">{event.dateLabel.split(" ")[1] ?? ""}</div>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">{event.artist || "FLEX Live"}</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{event.title}</h3>
            <p className="mt-1 text-sm text-white/72">{event.zone || "FLEX"}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{event.description || "Live session FLEX."}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">
              Ver detalle <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-1" size={16} />
            </div>
          </div>
        </div>
      </FlexCard>
    </Link>
  );
}

export function HomeUpcomingEvents() {
  const [events, setEvents] = useState<FeaturedEventView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listFeaturedPublishedEvents(3)
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los eventos.");
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
      <div className="grid gap-4 md:grid-cols-3">
        <FlexSkeleton className="h-64" />
        <FlexSkeleton className="h-64" />
        <FlexSkeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <FlexCard tone="danger"><p className="text-sm text-red-100">{error}</p></FlexCard>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {events.map((event) => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
