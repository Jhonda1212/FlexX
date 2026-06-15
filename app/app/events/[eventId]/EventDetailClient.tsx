"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, CalendarDays, Clock3, Crown, Disc3, ExternalLink, Loader2, MapPin, Mic2, Music, Sparkles, Ticket, Users } from "lucide-react";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import {
  getPublishedEventDetail,
  listActiveTicketTiersForEvent,
  minimumTicketPriceLabel,
  type EventTicketTierView,
  type FeaturedEventView
} from "@/lib/flex-actions";

function availabilityLabel(tier: EventTicketTierView) {
  if (tier.availableQuantity !== null) return `${tier.availableQuantity} disponibles`;
  if (tier.capacity !== null) return `${tier.capacity} cupos`;
  return null;
}

const eventFallbackDescription = "Una experiencia musical disenada para vivir la noche con ritmo, ambiente premium y conexion con el escenario.";
const eventShortDescriptionSupport = "FLEX completa la noche con ambiente premium, pista viva y una conexion cercana con el escenario.";

const experienceHighlights: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Ambiente premium", description: "Sonido cuidado, luces calidas y una atmosfera lounge para entrar en modo noche.", icon: Sparkles },
  { title: "Pista principal", description: "El punto de encuentro para seguir el ritmo cerca del escenario.", icon: Disc3 },
  { title: "Musica en vivo / DJ set", description: "Live session y seleccion musical para sostener la energia del club.", icon: Mic2 },
  { title: "Zonas VIP disponibles", description: "Espacios reservados para vivir FLEX con mas privacidad y comodidad.", icon: Crown }
];

function cleanEventDescription(description: string | null) {
  const clean = description?.trim();
  return clean && clean.length > 0 ? clean : null;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function EventDetailClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<FeaturedEventView | null>(null);
  const [ticketTiers, setTicketTiers] = useState<EventTicketTierView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutTierId, setCheckoutTierId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      const data = await getPublishedEventDetail(eventId);
      if (!active) return;
      setEvent(data);

      if (!data) return;
      try {
        const tiers = await listActiveTicketTiersForEvent(data.id);
        if (active) setTicketTiers(tiers);
      } catch (tierError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase event ticket tiers detail load error", tierError);
        }
        if (active) setTicketTiers([]);
      }
    }

    loadDetail()
      .catch((loadError) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase event detail load error", loadError);
        }
        if (active) setError("No pudimos cargar este evento ahora.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  async function startTicketCheckout(tier: EventTicketTierView) {
    setCheckoutError("");
    setCheckoutTierId(tier.id);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: "ticket",
          event_id: eventId,
          ticket_tier_id: tier.id,
          quantity: 1
        })
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }
      window.location.href = data.url as string;
    } catch (checkoutError) {
      setCheckoutError(checkoutError instanceof Error ? checkoutError.message : "No se pudo iniciar el pago.");
      setCheckoutTierId(null);
    }
  }

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

  const cleanDescription = cleanEventDescription(event.description);
  const heroDescription = cleanDescription || eventFallbackDescription;
  const showSupportDescription = cleanDescription !== null && cleanDescription.length < 90;
  const aboutDescription = cleanDescription || eventFallbackDescription;
  const priceSummary = minimumTicketPriceLabel(ticketTiers, event.ticketPriceCents);
  const featuredBadge = event.featured ? "Evento destacado" : "Proximo evento";

  return (
    <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <main className="min-w-0 space-y-5">
        <FlexCard className="overflow-hidden p-0">
          <div className="relative min-h-[340px] p-5 sm:min-h-[380px] sm:p-8 xl:min-h-[400px]">
            {event.imageUrl ? (
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }} />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(8,8,8,0.96)_56%,rgba(76,18,18,0.22))]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.52)_48%,rgba(0,0,0,0.16)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.54)_44%,rgba(0,0,0,0.08)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(217,166,64,0.10),transparent_25rem)]" />

            <div className="relative z-10 flex min-h-[290px] max-w-3xl flex-col justify-end sm:min-h-[316px] xl:min-h-[328px]">
              <p className="inline-flex w-fit rounded-md border border-[var(--gold)]/35 bg-black/55 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                {featuredBadge}
              </p>
              <h1 className="font-display mt-4 max-w-4xl text-5xl leading-[0.94] text-white sm:text-6xl xl:text-7xl">{event.title}</h1>
              <p className="mt-4 text-xl font-bold text-white/88">{event.artist || "FLEX Live"}</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">{heroDescription}</p>
            </div>
          </div>
        </FlexCard>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <FlexCard tone="gold" className="min-h-full border-[var(--gold)]/30 bg-[linear-gradient(145deg,rgba(217,166,64,0.16),rgba(12,10,7,0.96))]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Sobre el evento</p>
            <h2 className="mt-2 text-3xl font-bold text-white">La noche en escena</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">{aboutDescription}</p>
            {showSupportDescription ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">{eventShortDescriptionSupport}</p> : null}
          </FlexCard>

          <FlexCard className="min-h-full hover:border-[var(--gold)]/22 hover:bg-white/[0.04]">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 shrink-0 text-[var(--gold)]" size={22} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Programacion</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Ritmo de la noche</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-white">Apertura</p>
                  <p className="text-right text-sm text-[var(--muted)]">Programacion detallada proximamente.</p>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--gold)]/22 bg-[var(--gold)]/8 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-white">Live session / show principal</p>
                  <p className="whitespace-nowrap text-sm font-bold text-[var(--gold)]">{formatEventTime(event.startsAt)}</p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-white">DJ set / cierre</p>
                  <p className="text-sm text-[var(--muted)]">Despues del show</p>
                </div>
              </div>
            </div>
          </FlexCard>
        </div>

        <FlexCard>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Experiencia incluida</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Todo listo para vivir FLEX</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {experienceHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-[background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)]/28 hover:bg-white/[0.045]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--gold)]/28 bg-[var(--gold)]/10 text-[var(--gold)]">
                    <Icon size={19} />
                  </div>
                  <h3 className="mt-4 font-bold text-white">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </FlexCard>
      </main>

      <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-8 2xl:self-start">
        <FlexCard>
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
              <CalendarDays className="mt-0.5 text-[var(--gold)]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Fecha</p>
                <p className="mt-1 font-bold text-white">{formatEventDate(event.startsAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
              <MapPin className="mt-0.5 text-[var(--gold)]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Zona</p>
                <p className="mt-1 font-bold text-white">{event.zone || "FLEX"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
              <Music className="mt-0.5 text-[var(--gold)]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Artista</p>
                <p className="mt-1 font-bold text-white">{event.artist || "Sin artista definido"}</p>
              </div>
            </div>
          </div>
        </FlexCard>

        <FlexCard className="border-[var(--gold)]/18">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Entradas</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Entradas disponibles</h2>
              <p className="mt-2 inline-flex rounded-full border border-[var(--gold)]/22 bg-[var(--gold)]/10 px-3 py-1 text-sm font-bold text-[var(--gold-bright)]">{priceSummary}</p>
            </div>
            <Ticket className="text-[var(--gold)]" size={22} />
          </div>

          {ticketTiers.length ? (
            <div className="space-y-3">
              {checkoutError ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {checkoutError}
                </div>
              ) : null}
              {ticketTiers.map((tier) => {
                const availability = availabilityLabel(tier);
                return (
                  <div key={tier.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--gold)]/28 hover:bg-white/[0.05]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white">{tier.name}</h3>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gold)]">{tier.zoneName || event.zone || "FLEX"}</p>
                      </div>
                      <div className="whitespace-nowrap text-right font-bold text-[var(--gold)]">{tier.priceLabel}</div>
                    </div>
                    {tier.description ? <p className="mt-3 text-sm leading-6 text-white/68">{tier.description}</p> : null}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {availability ? (
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-white/58">
                          <Users size={15} /> {availability}
                        </div>
                      ) : <span />}
                      <FlexButton
                        variant="ghost"
                        className="min-h-10 px-4 text-xs"
                        loading={checkoutTierId === tier.id}
                        onClick={() => startTicketCheckout(tier)}
                      >
                        Comprar
                      </FlexButton>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="font-bold text-white">{priceSummary}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                El equipo de FLEX publicara los tipos de entrada disponibles para este evento.
              </p>
            </div>
          )}
        </FlexCard>

        <FlexCard tone="gold">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Detalle</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Informacion del evento</h2>
          <p className="mt-2 text-sm leading-6 text-white/72">Consulta la sesion y abre el enlace del artista cuando este disponible.</p>
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
