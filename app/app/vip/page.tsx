"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Sparkles, Users } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { listVipRooms, type VipRoom } from "@/lib/flex-actions";

type RoomTheme = {
  eyebrow: string;
  mood: string;
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
      mood: "Premium y reservado",
      badges: ["Premium", "Mas exclusiva"],
      card: "border-[var(--gold)]/30 bg-[radial-gradient(circle_at_78%_0%,rgba(212,175,55,0.2),transparent_34%),linear-gradient(145deg,rgba(212,175,55,0.1),rgba(255,255,255,0.035)_50%,rgba(0,0,0,0.3))]",
      icon: "bg-[var(--gold)]/18 text-[var(--gold)] ring-1 ring-[var(--gold)]/30",
      accent: "from-[var(--gold)]/55 via-[var(--gold)]/22 to-transparent",
      glow: "group-hover:shadow-[0_14px_42px_rgba(212,175,55,0.1)]",
      detail: "border-[var(--gold)]/18 bg-[var(--gold)]/[0.055]",
      button: "rounded-full",
      cta: "Reservar premium",
      fallbackDescription: "Una sala luminosa, exclusiva y pensada para una noche de alto nivel."
    };
  }

  if (name.includes("roja") || theme.includes("red")) {
    return {
      eyebrow: "Ambiente social",
      mood: "Energia y conversacion",
      badges: ["Social"],
      card: "border-red-500/24 bg-[radial-gradient(circle_at_78%_0%,rgba(127,29,29,0.3),transparent_34%),linear-gradient(145deg,rgba(92,15,32,0.18),rgba(255,255,255,0.035)_50%,rgba(0,0,0,0.3))]",
      icon: "bg-red-500/14 text-red-200 ring-1 ring-red-300/15",
      accent: "from-red-400/55 via-red-500/22 to-transparent",
      glow: "group-hover:shadow-[0_14px_42px_rgba(127,29,29,0.12)]",
      detail: "border-red-300/12 bg-red-500/[0.045]",
      button: "rounded-full",
      cta: "Reservar sala",
      fallbackDescription: "Energia, conversacion y una vista ideal para compartir la noche."
    };
  }

  return {
    eyebrow: "Lounge reservado",
    mood: "Oscura e intima",
    badges: ["Intima"],
    card: "border-white/12 bg-[radial-gradient(circle_at_78%_0%,rgba(229,231,235,0.11),transparent_34%),linear-gradient(145deg,rgba(0,0,0,0.62),rgba(255,255,255,0.035)_50%,rgba(31,41,55,0.18))]",
    icon: "bg-white/8 text-white ring-1 ring-white/15",
    accent: "from-zinc-200/35 via-zinc-400/14 to-transparent",
    glow: "group-hover:shadow-[0_14px_42px_rgba(229,231,235,0.07)]",
    detail: "border-white/10 bg-white/[0.035]",
    button: "rounded-full",
    cta: "Reservar sala",
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
    <FlexCard className={`group flex min-h-[452px] flex-col overflow-hidden rounded-2xl p-0 transition-[transform,border-color,box-shadow,background-color] duration-500 ease-out hover:-translate-y-0.5 hover:border-white/20 focus-within:border-[var(--gold)]/45 ${theme.glow} ${theme.card}`}>
      <div className={`h-1.5 bg-gradient-to-r ${theme.accent}`} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid size-12 place-items-center rounded-full transition duration-500 ease-out group-hover:scale-[1.03] ${theme.icon}`}>
            <Crown size={24} />
          </div>
          <div className="flex min-h-16 max-w-[180px] flex-wrap content-start justify-end gap-2">
            <FlexBadge tone="success">Disponible</FlexBadge>
            {theme.badges.map((badge) => (
              <FlexBadge key={badge} tone={badge === "Premium" || badge === "Mas exclusiva" ? "gold" : "neutral"}>
                {badge}
              </FlexBadge>
            ))}
          </div>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{theme.eyebrow}</p>
        <h2 className="font-display mt-2 text-4xl leading-none text-white">{room.name}</h2>
        <p className="mt-2 text-sm font-semibold text-white/78">{theme.mood}</p>
        <p className="mt-3 min-h-16 text-sm leading-6 text-white/68">
          {room.description ?? theme.fallbackDescription}
        </p>

        <div className="mt-5 grid gap-2 text-sm text-white/76">
          <div className={`flex items-center justify-between rounded-full border px-4 py-2.5 ${theme.detail}`}>
            <span>Capacidad</span>
            <strong className="text-white">{room.capacity} personas</strong>
          </div>
          <div className={`flex items-center justify-between rounded-full border px-4 py-2.5 ${theme.detail}`}>
            <span>Planta</span>
            <strong className="text-white">{room.floor}</strong>
          </div>
          <div className={`flex items-center justify-between rounded-full border px-4 py-2.5 ${theme.detail}`}>
            <span>Precio desde</span>
            <strong className="text-[var(--gold)]">{formatPrice(room.vipPriceCents)}</strong>
          </div>
        </div>

        <Link href={`/app/vip/${room.id}/share`} className="gold-focus mt-auto rounded-full pt-5">
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
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-2xl border border-[var(--gold)]/20 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025)_46%,rgba(92,15,32,0.18))] p-5 shadow-xl shadow-black/25 sm:p-8">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            <Sparkles size={16} /> Salas VIP FLEX
          </p>
          <h1 className="font-display mt-4 text-5xl leading-none text-white sm:text-6xl">Reserva tu espacio privado</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
            Tres ambientes exclusivos, capacidad limitada y acceso compartido para tus invitados.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <FlexBadge tone="gold">QR compartido</FlexBadge>
          <FlexBadge tone="neutral">Maximo 10 personas</FlexBadge>
          <FlexBadge tone="neutral">Servicio exclusivo</FlexBadge>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FlexSkeleton className="h-[452px] rounded-2xl" />
          <FlexSkeleton className="h-[452px] rounded-2xl" />
          <FlexSkeleton className="h-[452px] rounded-2xl" />
        </div>
      ) : null}

      {error ? (
        <FlexCard tone="danger">
          <p className="text-red-100">{error}</p>
        </FlexCard>
      ) : null}

      {!loading && !error && rooms.length === 0 ? (
        <FlexCard className="text-center">
          <Users className="mx-auto text-[var(--gold)]" size={32} />
          <h2 className="mt-3 text-xl font-bold text-white">No hay salas VIP activas</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Cuando el equipo active nuevas salas privadas, apareceran aqui.</p>
        </FlexCard>
      ) : null}

      {!loading && !error && rooms.length > 0 ? (
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
