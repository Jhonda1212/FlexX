import type { ReactNode } from "react";

export function FlexSectionHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">{eyebrow}</p> : null}
        <h1 className="font-display mt-2 text-5xl text-white">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
