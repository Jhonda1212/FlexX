import Link from "next/link";
import { Crown, QrCode } from "lucide-react";
import { FlexCard } from "@/components/ui/FlexCard";

export function HomeNightStatus() {
  return (
    <aside className="content-auto order-3 grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-6 2xl:sticky 2xl:top-8 2xl:order-2 2xl:col-start-2 2xl:row-span-2 2xl:row-start-1 2xl:block 2xl:space-y-5 2xl:self-start">
      <FlexCard className="paint-contain overflow-hidden p-0">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-3xl leading-none text-white">Mi noche</h2>
          <p className="mt-2 text-sm leading-5 text-[var(--muted)]">Tu pase operativo para seguir el ritmo.</p>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-5">
            <div className="w-20 shrink-0">
              <div className="font-display text-6xl leading-none text-[var(--gold)]">#4</div>
              <p className="mt-1 max-w-16 text-xs font-semibold leading-4 text-white/52">Tu posicion estimada</p>
            </div>

            <div className="min-w-0 flex-1 pt-1.5">
              <p className="text-base font-bold text-white">Turno en vivo</p>
              <p className="mt-2 text-sm leading-5 text-white/78">
                <span className="text-[var(--muted)]">Espera estimada</span>
                <span className="mx-1 text-white/28">·</span>
                <span className="whitespace-nowrap font-semibold text-white/86">20 - 30 min</span>
              </p>

              <Link
                href="/app/my-turn"
                prefetch={false}
                className="gold-focus mt-2 inline-flex min-h-11 items-center rounded-[var(--radius-control)] text-sm font-bold text-[var(--gold)] underline decoration-[var(--gold)]/30 underline-offset-4 transition-colors duration-200 hover:text-[var(--gold-bright)]"
              >
                Revisar turno
              </Link>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-white text-black">
                <QrCode size={22} />
              </div>
              <div className="min-w-0 flex-1 pr-1">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="min-w-0 break-words font-bold text-white">Jazz Nights</h3>
                  <span className="shrink-0 border-l border-white/12 pl-3 text-xs font-semibold text-emerald-200">Valida</span>
                </div>
                <p className="mt-0.5 text-sm text-[var(--muted)]">Entrada general</p>
              </div>
              <Link
                href="/app/tickets"
                prefetch={false}
                className="gold-focus inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-control)] text-sm font-bold text-white/84 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-[var(--gold)]"
              >
                Ver QR
              </Link>
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
