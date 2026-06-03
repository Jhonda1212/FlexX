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
          },
          "/app/vip": {
            title: "Salas VIP",
            subtitle: "Reserva un ambiente privado para tu noche en FLEX."
          },
          "/app/my-turn": {
            title: "Mi turno en vivo",
            subtitle: "Apúntate para cantar, tocar o subir al escenario esta noche."
          },
          "/app/song-request": {
            title: "Pide tu canción",
            subtitle: "Envía el tema que quieres escuchar esta noche."
          }
        }}
        role="user"
      >
        {children}
      </AppShell>
    </RoleGate>
  );
}
