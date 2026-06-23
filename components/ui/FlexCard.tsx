import type { ReactNode } from "react";

const tones = {
  default: "surface",
  gold: "gold-surface",
  danger: "border-red-400/28 bg-red-500/9 shadow-[0_14px_34px_rgba(127,29,29,0.12)]",
  success: "border-green-400/24 bg-green-500/9 shadow-[0_14px_34px_rgba(34,197,94,0.08)]"
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
    <section className={`${tones[tone]} rounded-[var(--radius-card)] p-5 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out ${className}`}>
      {children}
    </section>
  );
}
