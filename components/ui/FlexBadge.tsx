const tones = {
  neutral: "rounded-[var(--radius-control)] border-white/10 bg-white/[0.035] text-white/72",
  gold: "rounded-[var(--radius-control)] border-[var(--line-gold)] bg-[var(--gold)]/10 text-[var(--gold-bright)] shadow-[inset_3px_0_0_rgba(217,166,64,0.48)]",
  success: "rounded-full border-green-400/30 bg-green-500/12 text-green-200",
  danger: "rounded-full border-red-400/30 bg-red-500/12 text-red-200"
};

export function FlexBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] leading-none ${tones[tone]}`}>
      {children}
    </span>
  );
}
