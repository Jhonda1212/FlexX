"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { storageNav } from "@/lib/navigation/role-nav";

export default function StorageLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate role="storage"><AppShell nav={storageNav} title="Storage" staff>{children}</AppShell></RoleGate>;
}
