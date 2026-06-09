import type { ReactNode } from "react";
import { FlexCard } from "@/components/ui/FlexCard";

export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = ""
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <FlexCard
      className={`overflow-hidden border-[var(--gold)]/20 bg-[radial-gradient(circle_at_top_right,rgba(217,166,64,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.022)_52%,rgba(91,18,24,0.14))] p-5 shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{eyebrow}</p>
          ) : null}
          <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
      </div>
    </FlexCard>
  );
}
