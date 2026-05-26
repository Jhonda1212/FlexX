"use client";

import { useEffect, useState } from "react";
import { Card, SectionTitle } from "@/components/ui/Card";
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
    <div>
      <SectionTitle title="Eventos" />
      {loading ? <Card><p className="text-[var(--muted)]">Cargando eventos...</p></Card> : null}
      {error ? <Card><p className="text-red-200">{error}</p></Card> : null}
      {!loading && !error && events.length === 0 ? <Card><p className="text-[var(--muted)]">No hay eventos publicados.</p></Card> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="min-h-56">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{event.dateLabel}</p>
            <h2 className="font-display mt-4 text-4xl text-white">{event.title}</h2>
            <p className="mt-2 text-[var(--muted)]">{event.description ?? "Live session FLEX"}</p>
            <p className="mt-4 text-sm font-bold text-[var(--gold)]">{(event.ticketPriceCents / 100).toFixed(2)} EUR</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
