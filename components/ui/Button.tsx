import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FlexButton } from "@/components/ui/FlexButton";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "success";
  children: ReactNode;
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return <FlexButton variant={variant} className={className} {...props}>{children}</FlexButton>;
}
