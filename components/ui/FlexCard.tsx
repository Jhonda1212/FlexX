import type { ReactNode } from "react";

const tones = {
  default: "surface",
  gold: "gold-surface border-[var(--gold)]/25",
  danger: "border-red-500/30 bg-red-500/10",
  success: "border-green-500/30 bg-green-500/10"
};

export function FlexCard({
  children,
  className = "",
  tone = "default"
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof tones;
}) {
  return (
    <section className={`${tones[tone]} rounded-lg p-5 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out ${className}`}>
      {children}
    </section>
  );
}
