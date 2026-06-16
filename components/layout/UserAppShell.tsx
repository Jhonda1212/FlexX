"use client";

import { AppShell } from "@/components/layout/AppShell";
import { userNav } from "@/lib/navigation/role-nav";

const userRouteHeaders = {
  "/app/today": {
    title: "Hoy en FLEX",
    subtitle: "Promociones, eventos y avisos oficiales para vivir la noche."
  },
  "/app/events": {
    title: "Eventos",
    subtitle: "Explora las proximas sesiones, conciertos y noches especiales."
  },
  "/app/profile": {
    title: "Mi perfil",
    subtitle: "Gestiona tu cuenta, seguridad y preferencias."
  },
  "/app/vip": {
    title: "Salas VIP",
    subtitle: "Reserva un espacio privado para compartir la noche con tu grupo."
  },
  "/app/products": {
    title: "Productos",
    subtitle: "Catalogo de barra y merch con carrito persistente y checkout preparado."
  },
  "/app/my-turn": {
    title: "Mi turno en vivo",
    subtitle: "Apuntate para cantar, tocar o subir al escenario esta noche."
  },
  "/app/song-request": {
    title: "Pedir cancion",
    subtitle: "Envia tu tema al DJ y haz parte del ambiente de la noche."
  },
  "/app/tickets": {
    title: "Mis entradas",
    subtitle: "Consulta tus accesos, codigos QR y entradas activas."
  },
  "/app/notifications": {
    title: "Avisos",
    subtitle: "Revisa notificaciones importantes sobre eventos, turnos y accesos."
  }
};

export function UserAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      nav={userNav}
      title="Bienvenido a FLEX"
      subtitle="Tu noche, tus canciones y tus accesos en un solo lugar."
      routeHeaders={userRouteHeaders}
      hideHeaderPrefixes={["/app/events/"]}
      role="user"
    >
      {children}
    </AppShell>
  );
}
