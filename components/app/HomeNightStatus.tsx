import Link from "next/link";
import { Crown, Mic2, QrCode } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexCard } from "@/components/ui/FlexCard";

export function HomeNightStatus() {
  return (
    <aside className="content-auto order-3 grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-6 2xl:sticky 2xl:top-8 2xl:order-2 2xl:col-start-2 2xl:row-span-2 2xl:row-start-1 2xl:block 2xl:space-y-5 2xl:self-start">
      <FlexCard className="paint-contain overflow-hidden p-0">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Mi noche</p>
          <h2 className="font-display mt-1 text-3xl leading-none text-white">Estado personal</h2>
        </div>

        <div className="grid divide-y divide-white/10">
          <div className="px-5 py-5">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/82">
                  <Mic2 className="text-[var(--gold)]" size={17} />
                  <span>Turno en vivo</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">Tu posicion estimada</p>
              </div>
              <div className="text-right">
                <div className="font-display text-6xl leading-none text-[var(--gold)]">#4</div>
                <div className="mt-1 text-sm text-white/70">20 - 30 min</div>
              </div>
            </div>
            <Link
              href="/app/my-turn"
              prefetch={false}
              className="gold-focus mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] text-sm font-bold text-[var(--gold)] underline decoration-[var(--gold)]/30 underline-offset-4 transition-colors duration-200 hover:text-[var(--gold-bright)]"
            >
              Revisar turno
            </Link>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-white text-black">
                <QrCode size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-white">Jazz Nights</h3>
                  <FlexBadge tone="success">Valida</FlexBadge>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">Entrada general</p>
                <Link
                  href="/app/tickets"
                  prefetch={false}
                  className="gold-focus mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-control)] text-sm font-bold text-white/84 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-[var(--gold)]"
                >
                  Ver QR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FlexCard>

      <FlexCard tone="gold" className="paint-contain overflow-hidden p-0">
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <Crown className="mt-1 shrink-0 text-[var(--gold)]" size={18} />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Salas VIP</p>
              <h3 className="font-display mt-2 text-4xl leading-none text-white">Reserva privada</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">Ambientes privados, QR compartido y aforo limitado.</p>
              <Link
                href="/app/vip"
                prefetch={false}
                className="gold-focus mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--gold)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-black transition-[background-color,transform] duration-200 hover:bg-[var(--gold-bright)] active:scale-[0.985]"
              >
                Reservar sala
              </Link>
            </div>
          </div>
        </div>
      </FlexCard>
    </aside>
  );
}
