import Link from "next/link";
import { ArrowRight, Crown, Mic2, Music, QrCode, Sparkles } from "lucide-react";
import { HomeTodayPreview } from "@/components/app/HomeTodayPreview";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { upcomingEvents } from "@/lib/demo-data";

const quickActions = [
  { href: "/app/song-request", label: "Pedir canción", helper: "Elige tu tema", icon: Music },
  { href: "/app/my-turn", label: "Mi turno", helper: "Revisa tu posición", icon: Mic2 },
  { href: "/app/tickets", label: "Mis entradas", helper: "Ver QR", icon: QrCode },
  { href: "/app/vip", label: "Salas VIP", helper: "Reservar sala", icon: Crown }
];

export default function UserDashboard() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-5 xl:col-start-1">
        <div className="lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Bienvenido a FLEX</p>
          <h1 className="font-display mt-2 text-5xl text-white">Tu noche</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Tus canciones y tus accesos en un solo lugar.</p>
        </div>

        <FlexCard className="overflow-hidden p-0">
          <div className="relative min-h-[350px] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[url('/images/jazz-night.png')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
            <div className="relative z-10 flex min-h-[290px] max-w-xl flex-col justify-end">
              <FlexBadge tone="gold">Próxima Live Session</FlexBadge>
              <h2 className="font-display mt-4 text-6xl font-bold leading-none text-white sm:text-7xl">Jazz Nights</h2>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/82">
                <span>Sábado 25 MAY</span>
                <span className="text-[var(--gold)]">22:00</span>
                <span>Pista principal</span>
              </div>
              <Link href="/app/events">
                <FlexButton className="mt-6 w-full sm:w-auto">
                  Ver detalles <ArrowRight size={18} />
                </FlexButton>
              </Link>
            </div>
          </div>
        </FlexCard>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Accesos rápidos</h2>
            <Sparkles className="text-[var(--gold)]" size={18} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="gold-focus rounded-lg">
                  <FlexCard className="min-h-32 border border-white/10 bg-white/[0.035] transition hover:border-[var(--gold)]/50 hover:bg-white/[0.055]">
                    <div className="flex items-start justify-between gap-4">
                      <Icon className="text-[var(--gold)]" size={32} />
                      <ArrowRight className="text-white/35" size={18} />
                    </div>
                    <div className="mt-5 text-base font-bold text-white">{action.label}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">{action.helper}</div>
                  </FlexCard>
                </Link>
              );
            })}
          </div>
        </section>

        <HomeTodayPreview />
      </div>

      <aside className="space-y-5 xl:sticky xl:top-8 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-start">
        <FlexCard>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Mi turno</h2>
            <Link href="/app/my-turn" className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">Ver lista</Link>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-[var(--muted)]">Tu posición estimada</div>
              <div className="mt-2 text-5xl font-bold text-[var(--gold)]">#4</div>
              <div className="mt-3 text-sm text-white/72">20 - 30 min</div>
            </div>
            <div className="grid size-28 place-items-center rounded-full border-[10px] border-[var(--gold)]/80">
              <Mic2 size={42} />
            </div>
          </div>
          <Link href="/app/my-turn"><FlexButton variant="ghost" className="mt-5 w-full">Revisar turno</FlexButton></Link>
        </FlexCard>

        <FlexCard>
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Mis entradas</div>
          <div className="flex items-center gap-4">
            <div className="grid size-24 place-items-center rounded-md bg-white text-black"><QrCode size={58} /></div>
            <div className="min-w-0">
              <div className="font-bold text-white">Jazz Nights</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Entrada general</div>
              <div className="mt-3"><FlexBadge tone="success">Válida</FlexBadge></div>
            </div>
          </div>
          <Link href="/app/tickets"><FlexButton className="mt-5 w-full">Ver QR</FlexButton></Link>
        </FlexCard>

        <FlexCard tone="gold">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Salas VIP</p>
          <h3 className="font-display mt-2 text-4xl text-white">Reserva privada</h3>
          <p className="mt-2 text-sm text-white/75">Ambientes privados, QR compartido y aforo limitado.</p>
          <Link href="/app/vip"><FlexButton className="mt-5 w-full">Reservar sala</FlexButton></Link>
        </FlexCard>
      </aside>

      <section className="space-y-4 xl:col-start-1">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Próximos eventos</h2>
          <Link href="/app/events" className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">Ver todos</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingEvents.map((event) => (
            <FlexCard key={event.title} className="overflow-hidden p-0 transition hover:border-[var(--gold)]/40">
              <div className="relative h-52">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 rounded-md border border-[var(--gold)]/35 bg-black/70 px-3 py-2 text-center">
                  <div className="text-xl font-bold text-white">{event.date.split(" ")[0]}</div>
                  <div className="text-xs text-[var(--muted)]">{event.date.split(" ")[1]}</div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  <p className="text-sm text-white/72">{event.zone}</p>
                </div>
              </div>
            </FlexCard>
          ))}
        </div>
      </section>
    </div>
  );
}
