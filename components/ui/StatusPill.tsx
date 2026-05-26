export function StatusPill({ tone, children }: { tone: "ok" | "danger" | "gold"; children: string }) {
  const tones = {
    ok: "bg-green-500/15 text-green-300 border-green-500/30",
    danger: "bg-red-500/15 text-red-300 border-red-500/30",
    gold: "bg-[var(--gold)]/15 text-[var(--gold-bright)] border-[var(--gold)]/30"
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
