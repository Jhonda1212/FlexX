"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { guardNav } from "@/lib/navigation/role-nav";

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate role="guard"><AppShell nav={guardNav} title="Seguridad" staff>{children}</AppShell></RoleGate>;
}
