"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { userNav } from "@/lib/navigation/role-nav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="user">
      <AppShell
        nav={userNav}
        title="Bienvenido a FLEX"
        subtitle="Tu noche, tus canciones y tus accesos en un solo lugar."
        routeHeaders={{
          "/app/profile": {
            title: "Mi perfil",
            subtitle: "Gestiona tu cuenta, seguridad y preferencias."
          }
        }}
        role="user"
      >
        {children}
      </AppShell>
    </RoleGate>
  );
}
