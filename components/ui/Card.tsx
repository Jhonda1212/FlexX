import type { ReactNode } from "react";
import { FlexCard } from "@/components/ui/FlexCard";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <FlexCard className={className}>{children}</FlexCard>;
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{title}</h2>
      {action ? <span className="text-xs font-semibold text-[var(--gold)]">{action}</span> : null}
    </div>
  );
}
