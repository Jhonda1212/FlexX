import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type FlexButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "success";
  loading?: boolean;
  children: ReactNode;
};

const variants = {
  primary: "bg-[var(--gold)] text-black hover:bg-[var(--gold-bright)]",
  ghost: "border border-white/10 bg-white/[0.03] text-white hover:border-[var(--gold)]/60 hover:bg-white/[0.06]",
  danger: "bg-red-500 text-white hover:bg-red-400",
  success: "bg-green-600 text-white hover:bg-green-500"
};

export function FlexButton({ variant = "primary", loading = false, className = "", children, disabled, ...props }: FlexButtonProps) {
  return (
    <button
      className={`gold-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : null}
      {children}
    </button>
  );
}
