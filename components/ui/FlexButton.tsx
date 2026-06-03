import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type FlexButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "success";
  loading?: boolean;
  children: ReactNode;
};

const variants = {
  primary: "bg-[var(--gold)] text-black shadow-[0_10px_28px_rgba(217,166,64,0.12)] hover:bg-[var(--gold-bright)] hover:shadow-[0_14px_34px_rgba(217,166,64,0.18)]",
  ghost: "border border-white/10 bg-white/[0.03] text-white hover:border-[var(--gold)]/55 hover:bg-[var(--gold)]/8 hover:text-white",
  danger: "bg-red-500 text-white hover:bg-red-400 hover:shadow-[0_12px_32px_rgba(239,68,68,0.16)]",
  success: "bg-green-600 text-white hover:bg-green-500 hover:shadow-[0_12px_32px_rgba(34,197,94,0.14)]"
};

export function FlexButton({ variant = "primary", loading = false, className = "", children, disabled, ...props }: FlexButtonProps) {
  return (
    <button
      className={`gold-focus inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md px-5 text-sm font-bold uppercase tracking-[0.08em] transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : null}
      {children}
    </button>
  );
}
