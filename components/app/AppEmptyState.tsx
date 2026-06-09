import Link from "next/link";
import type { ReactNode } from "react";
import { FlexCard } from "@/components/ui/FlexCard";

type EmptyStateAction = {
  href: string;
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "ghost";
};

const actionStyles = {
  primary:
    "border-[var(--gold)] bg-[var(--gold)] text-black hover:bg-[var(--gold-bright)]",
  ghost:
    "border-white/10 bg-white/[0.035] text-white hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/8"
};

function EmptyStateLink({ action }: { action: EmptyStateAction }) {
  return (
    <Link
      href={action.href}
      prefetch={false}
      className={`gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-xs font-bold uppercase tracking-[0.08em] transition-[background-color,border-color,color,transform] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.98] ${actionStyles[action.variant ?? "primary"]}`}
    >
      {action.icon}
      {action.label}
    </Link>
  );
}

export function AppEmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = ""
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}) {
  return (
    <FlexCard className={`border-[var(--gold)]/18 bg-[linear-gradient(145deg,rgba(217,166,64,0.09),rgba(10,10,10,0.96))] ${className}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {icon ? (
            <div className="grid size-12 place-items-center rounded-md border border-[var(--gold)]/28 bg-black/35 text-[var(--gold)]">
              {icon}
            </div>
          ) : null}
          <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/68">{description}</p>
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex shrink-0 flex-col gap-2 sm:w-52">
            {primaryAction ? <EmptyStateLink action={primaryAction} /> : null}
            {secondaryAction ? <EmptyStateLink action={secondaryAction} /> : null}
          </div>
        ) : null}
      </div>
    </FlexCard>
  );
}
