"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Users } from "lucide-react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { listVipRooms, type VipRoom } from "@/lib/flex-actions";

type RoomTheme = {
  eyebrow: string;
  atmosphere: string;
  badges: string[];
  card: string;
  icon: string;
  accent: string;
  glow: string;
  detail: string;
  button: string;
  cta: string;
  fallbackDescription: string;
};

function roomTheme(room: VipRoom): RoomTheme {
  const name = room.name.toLowerCase();
  const theme = room.colorTheme?.toLowerCase() ?? "";

  if (name.includes("dorada") || theme.includes("gold")) {
    return {
      eyebrow: "Lujo privado",
      atmosphere: "Experiencia premium para grupos exclusivos.",
      badges: ["Premium", "Mas exclusiva"],
      card: "border-[var(--gold)]/30 bg-[radial-gradient(circle_at_78%_0%,rgba(212,175,55,0.16),transparent_32%),linear-gradient(145deg,rgba(212,175,55,0.09),rgba(255,255,255,0.03)_52%,rgba(0,0,0,0.26))]",
      icon: "bg-[var(--gold)]/18 text-[var(--gold)] ring-1 ring-[var(--gold)]/30",
      accent: "from-[var(--gold)]/55 via-[var(--gold)]/22 to-transparent",
      glow: "group-hover:shadow-[0_10px_28px_rgba(212,175,55,0.08)]",
      detail: "border-[var(--gold)]/18 bg-[var(--gold)]/[0.055]",
      button: "rounded-full",
      cta: "Reservar premium",
      fallbackDescription: "Una sala luminosa, exclusiva y pensada para una noche de alto nivel."
    };
  }

  if (name.includes("roja") || theme.includes("red")) {
    return {
      eyebrow: "Ambiente social",
      atmosphere: "Energia social para celebrar.",
      badges: ["Social"],
      card: "border-red-500/22 bg-[radial-gradient(circle_at_78%_0%,rgba(127,29,29,0.24),transparent_32%),linear-gradient(145deg,rgba(92,15,32,0.15),rgba(255,255,255,0.03)_52%,rgba(0,0,0,0.26))]",
      icon: "bg-red-500/14 text-red-200 ring-1 ring-red-300/15",
      accent: "from-red-400/55 via-red-500/22 to-transparent",
      glow: "group-hover:shadow-[0_10px_28px_rgba(127,29,29,0.1)]",
      detail: "border-red-300/12 bg-red-500/[0.045]",
      button: "rounded-full",
      cta: "Ver sala",
      fallbackDescription: "Energia, conversacion y una vista ideal para compartir la noche."
    };
  }

  return {
    eyebrow: "Lounge reservado",
    atmosphere: "Ambiente intimo y reservado.",
    badges: ["Intima"],
    card: "border-white/12 bg-[radial-gradient(circle_at_78%_0%,rgba(229,231,235,0.09),transparent_32%),linear-gradient(145deg,rgba(0,0,0,0.58),rgba(255,255,255,0.03)_52%,rgba(31,41,55,0.15))]",
    icon: "bg-white/8 text-white ring-1 ring-white/15",
    accent: "from-zinc-200/35 via-zinc-400/14 to-transparent",
    glow: "group-hover:shadow-[0_10px_28px_rgba(229,231,235,0.06)]",
    detail: "border-white/10 bg-white/[0.035]",
    button: "rounded-full",
    cta: "Ver sala",
    fallbackDescription: "Elegante, oscura y discreta para vivir FLEX con mas privacidad."
  };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(cents / 100);
}

function RoomCard({ room }: { room: VipRoom }) {
  const theme = roomTheme(room);

  return (
    <FlexCard className={`group flex min-h-[390px] flex-col overflow-hidden rounded-xl p-0 transition-[transform,border-color,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/20 focus-within:border-[var(--gold)]/45 ${theme.glow} ${theme.card}`}>
      <div className={`h-1 bg-gradient-to-r ${theme.accent}`} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid size-10 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:scale-[1.03] ${theme.icon}`}>
            <Crown size={20} />
          </div>
          <div className="flex max-w-[170px] flex-wrap content-start justify-end gap-2">
            <FlexBadge tone="success">Disponible</FlexBadge>
            {theme.badges.map((badge) => (
              <FlexBadge key={badge} tone={badge === "Premium" || badge === "Mas exclusiva" ? "gold" : "neutral"}>
                {badge}
              </FlexBadge>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{theme.eyebrow}</p>
        <h2 className="font-display mt-2 text-3xl leading-none text-white sm:text-4xl">{room.name}</h2>
        <p className="mt-2 text-sm font-semibold text-white/82">{theme.atmosphere}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/62">
          {room.description ?? theme.fallbackDescription}
        </p>

        <div className="mt-4 grid gap-2 text-sm text-white/76">
          <div className={`flex items-center justify-between rounded-md border px-3 py-2 ${theme.detail}`}>
            <span>Capacidad</span>
            <strong className="text-white">{room.capacity} personas</strong>
          </div>
          <div className={`flex items-center justify-between rounded-md border px-3 py-2 ${theme.detail}`}>
            <span>Planta</span>
            <strong className="text-white">{room.floor}</strong>
          </div>
          <div className={`flex items-center justify-between rounded-md border px-3 py-2 ${theme.detail}`}>
            <span>Precio desde</span>
            <strong className="text-[var(--gold)]">{formatPrice(room.vipPriceCents)}</strong>
          </div>
        </div>

        <Link href={`/app/vip/${room.id}/share`} prefetch={false} className="gold-focus mt-auto rounded-full pt-4">
          <FlexButton className={`w-full ${theme.button}`}>
            {theme.cta} <ArrowRight className="transition-transform duration-300 ease-out group-hover:translate-x-0.5" size={18} />
          </FlexButton>
        </Link>
      </div>
    </FlexCard>
  );
}

export default function VipPage() {
  const [rooms, setRooms] = useState<VipRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listVipRooms()
      .then((data) => {
        if (active) setRooms(data);
      })
      .catch((roomError) => {
        if (active) setError(roomError instanceof Error ? roomError.message : "No se pudieron cargar las salas VIP.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AppPageHeader
        eyebrow="Salas VIP FLEX"
        title="Salas VIP"
        description="Reserva un espacio privado para compartir la noche con tu grupo."
        actions={
          <div className="flex flex-wrap gap-2 sm:max-w-sm sm:justify-end">
          <FlexBadge tone="gold">QR compartido</FlexBadge>
          <FlexBadge tone="neutral">Hasta 10 invitados</FlexBadge>
          <FlexBadge tone="neutral">Servicio exclusivo</FlexBadge>
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <FlexSkeleton className="h-[390px] rounded-xl" />
          <FlexSkeleton className="h-[390px] rounded-xl" />
          <FlexSkeleton className="h-[390px] rounded-xl" />
        </div>
      ) : null}

      {error ? (
        <FlexCard tone="danger">
          <p className="text-red-100">{error}</p>
        </FlexCard>
      ) : null}

      {!loading && !error && rooms.length === 0 ? (
        <AppEmptyState
          icon={<Users size={24} />}
          title="Aun no hay salas disponibles"
          description="Cuando el equipo active salas privadas, apareceran aqui."
          primaryAction={{ href: "/app", label: "Volver al inicio" }}
        />
      ) : null}

      {!loading && !error && rooms.length > 0 ? (
        <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : null}

      <section className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-3 sm:p-5">
        {[
          "Elige tu sala.",
          "Confirma la reserva con el equipo.",
          "Comparte el acceso con tus invitados."
        ].map((step, index) => (
          <div key={step} className="flex items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--gold)]/24 bg-[var(--gold)]/10 text-sm font-bold text-[var(--gold-bright)]">
              {index + 1}
            </div>
            <div>
              <p className="font-bold text-white">{step}</p>
              <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                {index === 0 ? "Compara ambiente, capacidad y precio." : index === 1 ? "El equipo valida disponibilidad y detalles." : "Usa el acceso compartido para tu grupo."}
              </p>
            </div>
          </div>
        ))}
      </section>

      <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
        Las salas privadas tienen capacidad limitada para mantener una experiencia comoda y exclusiva.
      </p>
    </div>
  );
}
