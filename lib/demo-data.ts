import { Bell, CalendarDays, Crown, History, LineChart, Megaphone, Mic2, Music, QrCode, Shirt, ShoppingBag, Ticket, Users } from "lucide-react";
import type { Metric, NavItem } from "./types";

export const userNav: NavItem[] = [
  { href: "/app", label: "Inicio", icon: CalendarDays },
  { href: "/app/today", label: "Hoy", icon: Megaphone },
  { href: "/app/song-request", label: "Canción", icon: Music },
  { href: "/app/my-turn", label: "Mi turno", icon: Mic2 },
  { href: "/app/products", label: "Productos", icon: ShoppingBag },
  { href: "/app/tickets", label: "Entradas", icon: QrCode },
  { href: "/app/vip", label: "VIP", icon: Crown },
  { href: "/app/profile", label: "Perfil", icon: Users },
  { href: "/app/notifications", label: "Avisos", icon: Bell }
];

export const guardNav: NavItem[] = [
  { href: "/guard", label: "Resumen", icon: Users },
  { href: "/guard/scan", label: "Escanear", icon: QrCode },
  { href: "/guard/tickets", label: "Entradas", icon: Ticket },
  { href: "/guard/guests", label: "Invitados", icon: Crown },
  { href: "/guard/alerts", label: "Alertas", icon: Megaphone },
  { href: "/guard/reports", label: "Reportes", icon: LineChart }
];

export const storageNav: NavItem[] = [
  { href: "/storage", label: "Resumen", icon: Shirt },
  { href: "/storage/new", label: "Registrar", icon: QrCode },
  { href: "/storage/scan", label: "Escanear", icon: QrCode },
  { href: "/storage/active", label: "Activas", icon: Ticket },
  { href: "/storage/history", label: "Historial", icon: History }
];

export const metrics: Metric[] = [
  { label: "Aforo", value: "342", hint: "de 600 personas" },
  { label: "Accesos hoy", value: "198", hint: "191 validos" },
  { label: "VIP activas", value: "3/5", hint: "salas en uso" }
];

export { featuredEvents as upcomingEvents } from "./featured-events";

export const recentAccess = [
  { name: "Maria Gonzalez", detail: "Entrada general", time: "23:47", ok: true },
  { name: "Juan Perez", detail: "Sala Dorada", time: "23:44", ok: true },
  { name: "Andres Lopez", detail: "QR invalido", time: "23:40", ok: false }
];

export const storageItems = [
  { number: "A-024", owner: "Sofia L.", item: "Abrigo negro", status: "Activa" },
  { number: "A-025", owner: "Diego M.", item: "Bolso pequeno", status: "Activa" },
  { number: "B-011", owner: "Laura S.", item: "Chaqueta piel", status: "Activa" }
];
