import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function AdminQuickActionCard({
  href,
  icon: Icon,
  title,
  description
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="gold-focus group flex min-h-44 cursor-pointer flex-col justify-between rounded-lg border border-[var(--gold)]/20 bg-white/[0.035] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--gold)]/65 hover:bg-white/[0.07] hover:shadow-[0_18px_45px_rgba(0,0,0,0.32)]"
    >
      <div>
        <div className="grid size-14 place-items-center rounded-md border border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold)] transition group-hover:border-[var(--gold)]/60 group-hover:bg-[var(--gold)]/16">
          <Icon size={30} />
        </div>
        <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">{description}</p>
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--gold)]">
        Abrir seccion
        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
