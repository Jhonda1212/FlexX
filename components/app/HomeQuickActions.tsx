import Link from "next/link";
import { Crown, Mic2, Music, QrCode, ShoppingBag, type LucideIcon } from "lucide-react";

type QuickAction = {
  href: string;
  label: string;
  helper: string;
  icon: LucideIcon;
  primary?: boolean;
};

const quickActions: QuickAction[] = [
  { href: "/app/song-request", label: "Pedir cancion", helper: "Envia tu tema al DJ", icon: Music, primary: true },
  { href: "/app/my-turn", label: "Mi turno", helper: "Consulta tu posicion", icon: Mic2, primary: true },
  { href: "/app/tickets", label: "Mis entradas", helper: "Muestra tu QR", icon: QrCode },
  { href: "/app/vip", label: "Salas VIP", helper: "Reserva para tu grupo", icon: Crown },
  { href: "/app/products", label: "Productos", helper: "Barra y merch en un solo carrito", icon: ShoppingBag }
];

const primaryActions = quickActions.filter((action) => action.primary);
const secondaryActions = quickActions.filter((action) => !action.primary);

export function HomeQuickActions() {
  return (
    <section className="content-auto soft-enter soft-enter-delay-1">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Setlist operativo</p>
          <h2 className="font-display mt-1 text-3xl leading-none text-white">Accesos de la noche</h2>
        </div>
        <div className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(217,166,64,0.38),transparent)] sm:block" />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/[0.028]">
        <div className="grid gap-px bg-white/10 md:grid-cols-2">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                prefetch={false}
                className="gold-focus group min-h-24 bg-[var(--bg-elevated)] px-5 py-4 transition-[background-color,color] duration-200 ease-out hover:bg-white/[0.055]"
              >
                <div className="flex min-h-16 items-center justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
                      <Icon size={15} />
                      <span>Principal</span>
                    </div>
                    <div className="mt-2 text-lg font-bold text-white">{action.label}</div>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{action.helper}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-white/42 transition-colors duration-200 group-hover:text-[var(--gold)]">
                    Abrir
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-3">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                prefetch={false}
                className="gold-focus group min-h-14 bg-black/22 px-4 py-3 transition-[background-color,color] duration-200 ease-out hover:bg-white/[0.045]"
              >
                <div className="flex min-h-11 items-center gap-3">
                  <Icon className="shrink-0 text-white/52 transition-colors duration-200 group-hover:text-[var(--gold)]" size={17} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">{action.label}</div>
                    <div className="truncate text-xs text-[var(--muted-soft)]">{action.helper}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
