import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { FlexCard } from "@/components/ui/FlexCard";

export function FlexEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <FlexCard>
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-md border border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold)]">
          <Inbox size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </FlexCard>
  );
}
