import type { LucideIcon } from "lucide-react";

export type StaffRole = "guard" | "storage" | "dj" | "admin";
export type QrKind = "ticket" | "private_room" | "storage";
export type QrStatus = "valid" | "used" | "expired" | "invalid" | "full" | "inactive";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type Metric = {
  label: string;
  value: string;
  hint: string;
};
