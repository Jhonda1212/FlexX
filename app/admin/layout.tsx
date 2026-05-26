"use client";

import { AppShell } from "@/components/layout/AppShell";
import { adminNav } from "@/lib/navigation/role-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell nav={adminNav} title="Admin" staff>{children}</AppShell>;
}
