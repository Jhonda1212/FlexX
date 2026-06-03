"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, ExternalLink, Loader2, MapPin, Music } from "lucide-react";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { getPublishedEventDetail, type FeaturedEventView } from "@/lib/flex-actions";

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<FeaturedEventView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPublishedEventDetail(params.eventId)
      .then((data) => {
        if (active) setEvent(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el evento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.eventId]);

  if (loading) {
    return (
      <FlexCard>
        <div className="flex items-center gap-3 text-[var(--muted)]">
          <Loader2 className="animate-spin" size={20} />
          Cargando evento...
        </div>
      </FlexCard>
    );
  }

  if (error || !event) {
    return (
      <FlexCard tone="danger">
        <h1 className="text-2xl font-bold text-white">Evento no disponible</h1>
        <p className="mt-2 text-sm text-red-100/80">{error || "No encontramos este evento publicado."}</p>
        <Link href="/app" className="mt-5 inline-flex">
          <FlexButton variant="ghost"><ArrowLeft size={18} /> Volver</FlexButton>
        </Link>
      </FlexCard>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <FlexCard className="overflow-hidden p-0">
        <div className="relative min-h-[420px] p-5 sm:p-8">
          {event.imageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }} />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(8,8,8,0.96)_56%,rgba(76,18,18,0.22))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/62 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />

          <div className="relative z-10 flex min-h-[360px] max-w-3xl flex-col justify-end">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Próximo evento</p>
            <h1 className="font-display mt-3 text-5xl leading-none text-white sm:text-7xl">{event.title}</h1>
            <p className="mt-4 text-xl font-bold text-white/88">{event.artist || "FLEX Live"}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/74">{event.description || "Live session FLEX."}</p>
          </div>
        </div>
      </FlexCard>

      <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
        <FlexCard>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 text-[var(--gold)]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Fecha</p>
                <p className="mt-1 font-bold text-white">{new Date(event.startsAt).toLocaleString("es-ES")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 text-[var(--gold)]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Zona</p>
                <p className="mt-1 font-bold text-white">{event.zone || "FLEX"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Music className="mt-0.5 text-[var(--gold)]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Artista</p>
                <p className="mt-1 font-bold text-white">{event.artist || "Sin artista definido"}</p>
              </div>
            </div>
          </div>
        </FlexCard>

        <FlexCard tone="gold">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Detalle</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Información del evento</h2>
          <p className="mt-2 text-sm leading-6 text-white/72">Consulta la sesión y abre el enlace del artista cuando esté disponible.</p>
          <div className="mt-5 grid gap-3">
            {event.artistUrl ? (
              <a href={event.artistUrl} target="_blank" rel="noreferrer">
                <FlexButton className="w-full">
                  Ver artista en Spotify <ExternalLink size={18} />
                </FlexButton>
              </a>
            ) : null}
            <Link href="/app">
              <FlexButton variant="ghost" className="w-full">
                <ArrowLeft size={18} /> Volver
              </FlexButton>
            </Link>
          </div>
        </FlexCard>
      </aside>
    </div>
  );
}
