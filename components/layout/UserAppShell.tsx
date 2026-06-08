"use client";

import { AppShell } from "@/components/layout/AppShell";
import { userNav } from "@/lib/navigation/role-nav";

const userRouteHeaders = {
  "/app/today": {
    title: "Hoy en FLEX",
    subtitle: "Promociones, eventos y avisos oficiales para vivir la noche."
  },
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
    subtitle: "Apuntate para cantar, tocar o subir al escenario esta noche."
  },
  "/app/song-request": {
    title: "Pide tu cancion",
    subtitle: "Envia el tema que quieres escuchar esta noche."
  }
};

export function UserAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      nav={userNav}
      title="Bienvenido a FLEX"
      subtitle="Tu noche, tus canciones y tus accesos en un solo lugar."
      routeHeaders={userRouteHeaders}
      role="user"
    >
      {children}
    </AppShell>
  );
}
