"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexCard } from "@/components/ui/FlexCard";
import { listPublishedEvents, type FlexEvent } from "@/lib/flex-actions";

export default function EventsPage() {
  const [events, setEvents] = useState<FlexEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listPublishedEvents()
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((eventError) => {
        if (active) setError(eventError instanceof Error ? eventError.message : "No se pudieron cargar los eventos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <SectionTitle title="Eventos" />
      {loading ? <Card><p className="text-[var(--muted)]">Cargando eventos...</p></Card> : null}
      {error ? <Card><p className="text-red-200">{error}</p></Card> : null}
      {!loading && !error && events.length === 0 ? <Card><p className="text-[var(--muted)]">No hay eventos publicados.</p></Card> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Link key={event.id} href={`/app/events/${event.id}`} className="gold-focus group block rounded-lg">
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
                <div className="absolute right-4 top-4">
                  <FlexBadge tone={event.featured ? "gold" : "neutral"}>{event.featured ? "Destacado" : "Publicado"}</FlexBadge>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">{event.artist || "FLEX Live"}</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">{event.title}</h2>
                  <div className="mt-1 flex items-center gap-2 text-sm text-white/72">
                    <CalendarDays size={15} />
                    {event.zone || "FLEX"}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{event.description ?? "Live session FLEX"}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">
                    Ver detalle <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-1" size={16} />
                  </div>
                </div>
              </div>
            </FlexCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
