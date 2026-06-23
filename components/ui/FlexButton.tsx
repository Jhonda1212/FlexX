import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type FlexButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "success";
  loading?: boolean;
  children: ReactNode;
};

const baseClass =
  "gold-focus inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 text-sm font-bold uppercase tracking-[0.08em] transition-[background-color,border-color,box-shadow,color,transform,opacity] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none disabled:active:scale-100";

const variants = {
  primary:
    "border border-[var(--gold)]/70 bg-[var(--gold)] text-black shadow-[0_10px_24px_rgba(217,166,64,0.12)] hover:border-[var(--gold-bright)] hover:bg-[var(--gold-bright)] hover:shadow-[0_12px_28px_rgba(217,166,64,0.16)]",
  ghost:
    "border border-white/10 bg-white/[0.025] text-white/88 shadow-none hover:border-[var(--line-gold)] hover:bg-[var(--gold)]/8 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
  danger:
    "border border-red-400/45 bg-red-500/90 text-white shadow-[0_10px_24px_rgba(239,68,68,0.10)] hover:border-red-300/70 hover:bg-red-400 hover:shadow-[0_12px_28px_rgba(239,68,68,0.14)]",
  success:
    "border border-green-400/35 bg-green-600/90 text-white shadow-[0_10px_24px_rgba(34,197,94,0.08)] hover:border-green-300/60 hover:bg-green-500 hover:shadow-[0_12px_28px_rgba(34,197,94,0.12)]"
};

export function FlexButton({ variant = "primary", loading = false, className = "", children, disabled, ...props }: FlexButtonProps) {
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : null}
      {children}
    </button>
  );
}
