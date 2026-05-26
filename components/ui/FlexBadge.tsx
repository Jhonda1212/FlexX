const tones = {
  neutral: "border-white/10 bg-white/[0.04] text-white/78",
  gold: "border-[var(--gold)]/30 bg-[var(--gold)]/15 text-[var(--gold-bright)]",
  success: "border-green-500/30 bg-green-500/15 text-green-200",
  danger: "border-red-500/30 bg-red-500/15 text-red-200"
};

export function FlexBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}
