import Link from "next/link";
import { ArrowRight, Crown, Mic2, Music, QrCode, ShoppingBag, Sparkles } from "lucide-react";
import { HomeEventCarousel } from "@/components/app/HomeEventCarousel";
import { HomeTodayPreview } from "@/components/app/HomeTodayPreview";
import { HomeUpcomingEvents } from "@/components/app/HomeUpcomingEvents";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";

const quickActions = [
  { href: "/app/song-request", label: "Pedir cancion", helper: "Envia tu tema al DJ", icon: Music },
  { href: "/app/my-turn", label: "Mi turno", helper: "Consulta tu posicion", icon: Mic2 },
  { href: "/app/tickets", label: "Mis entradas", helper: "Muestra tu QR", icon: QrCode },
  { href: "/app/vip", label: "Salas VIP", helper: "Reserva para tu grupo", icon: Crown },
  { href: "/app/products", label: "Productos", helper: "Barra y merch en un solo carrito", icon: ShoppingBag }
];

export default function UserDashboard() {
  return (
    <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:gap-7">
      <div className="order-1 min-w-0 space-y-6 2xl:col-start-1">
        <div className="lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Bienvenido a FLEX</p>
          <h1 className="font-display mt-2 text-5xl text-white">Tu noche</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Tus canciones y tus accesos en un solo lugar.</p>
        </div>

        <HomeEventCarousel />

        <section className="content-auto soft-enter soft-enter-delay-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Accesos rapidos</h2>
            <Sparkles className="text-[var(--gold)]" size={18} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} prefetch={false} className="gold-focus group block h-full rounded-lg">
                  <FlexCard className="paint-contain flex min-h-[136px] h-full flex-col border border-white/10 bg-white/[0.035] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-[var(--gold)]/50 group-hover:bg-white/[0.055] group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] group-focus-visible:border-[var(--gold)]/60">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid size-11 place-items-center rounded-md bg-[var(--gold)]/10 text-[var(--gold)] transition-colors duration-200 ease-out group-hover:bg-[var(--gold)]/15">
                        <Icon size={24} />
                      </div>
                      <ArrowRight className="text-white/35 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--gold)]" size={18} />
                    </div>
                    <div className="mt-auto pt-5">
                      <div className="text-base font-bold text-white">{action.label}</div>
                      <div className="mt-1 text-sm leading-5 text-[var(--muted)]">{action.helper}</div>
                    </div>
                  </FlexCard>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="content-auto soft-enter soft-enter-delay-2">
          <HomeTodayPreview />
        </div>
      </div>

      <aside className="content-auto order-3 grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-6 2xl:sticky 2xl:top-8 2xl:order-2 2xl:col-start-2 2xl:row-span-2 2xl:row-start-1 2xl:block 2xl:space-y-6 2xl:self-start">
        <FlexCard className="paint-contain">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Mi turno</h2>
            <Link href="/app/my-turn" prefetch={false} className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">Ver lista</Link>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-[var(--muted)]">Tu posicion estimada</div>
              <div className="mt-2 text-5xl font-bold text-[var(--gold)]">#4</div>
              <div className="mt-3 text-sm text-white/72">20 - 30 min</div>
            </div>
            <div className="grid size-28 place-items-center rounded-full border-[10px] border-[var(--gold)]/80">
              <Mic2 size={42} />
            </div>
          </div>
          <Link href="/app/my-turn" prefetch={false}><FlexButton variant="ghost" className="mt-5 w-full">Revisar turno</FlexButton></Link>
        </FlexCard>

        <FlexCard className="paint-contain">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Mis entradas</div>
          <div className="flex items-center gap-4">
            <div className="grid size-24 place-items-center rounded-md bg-white text-black"><QrCode size={58} /></div>
            <div className="min-w-0">
              <div className="font-bold text-white">Jazz Nights</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Entrada general</div>
              <div className="mt-3"><FlexBadge tone="success">Valida</FlexBadge></div>
            </div>
          </div>
          <Link href="/app/tickets" prefetch={false}><FlexButton className="mt-5 w-full">Ver QR</FlexButton></Link>
        </FlexCard>

        <FlexCard tone="gold" className="paint-contain">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Salas VIP</p>
          <h3 className="font-display mt-2 text-4xl text-white">Reserva privada</h3>
          <p className="mt-2 text-sm text-white/75">Ambientes privados, QR compartido y aforo limitado.</p>
          <Link href="/app/vip" prefetch={false}><FlexButton className="mt-5 w-full">Reservar sala</FlexButton></Link>
        </FlexCard>
      </aside>

      <section className="content-auto soft-enter soft-enter-delay-3 order-2 min-w-0 space-y-4 2xl:order-3 2xl:col-start-1">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Proximos eventos</h2>
          <Link href="/app/events" prefetch={false} className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">Ver todos</Link>
        </div>
        <HomeUpcomingEvents />
      </section>
    </div>
  );
}
