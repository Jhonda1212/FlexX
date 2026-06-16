import {
  Bell,
  CalendarDays,
  CreditCard,
  Crown,
  History,
  LayoutDashboard,
  LineChart,
  ListOrdered,
  Megaphone,
  Mic2,
  Music,
  QrCode,
  ShoppingBag,
  Shirt,
  Ticket,
  Users
} from "lucide-react";
import type { StaffRole } from "@/lib/auth/server-role";
import type { NavItem } from "@/lib/types";

export type AppRole = StaffRole | "user";

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

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/feed", label: "Feed", icon: Megaphone },
  { href: "/admin/events", label: "Eventos", icon: CalendarDays },
  { href: "/admin/tickets", label: "Entradas", icon: Ticket },
  { href: "/admin/vip", label: "VIP", icon: Crown },
  { href: "/admin/songs", label: "Canciones", icon: Music },
  { href: "/admin/queue", label: "Cola", icon: ListOrdered },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/payments", label: "Pagos", icon: CreditCard },
  { href: "/guard", label: "Guardias", icon: QrCode },
  { href: "/storage", label: "Storage", icon: Shirt }
];

export const djNav: NavItem[] = [
  { href: "/admin/songs", label: "Canciones", icon: Music },
  { href: "/admin/queue", label: "Cola", icon: ListOrdered },
  { href: "/app", label: "App", icon: CalendarDays }
];

export const guardNav: NavItem[] = [
  { href: "/guard", label: "Resumen", icon: Users },
  { href: "/guard/scan", label: "Escanear", icon: QrCode },
  { href: "/guard/tickets", label: "Entradas", icon: Ticket },
  { href: "/guard/guests", label: "Invitados", icon: Crown },
  { href: "/guard/alerts", label: "Alertas", icon: Megaphone },
  { href: "/guard/reports", label: "Reportes", icon: LineChart },
  { href: "/app", label: "App", icon: CalendarDays }
];

export const storageNav: NavItem[] = [
  { href: "/storage", label: "Resumen", icon: Shirt },
  { href: "/storage/new", label: "Registrar", icon: QrCode },
  { href: "/storage/scan", label: "Escanear", icon: QrCode },
  { href: "/storage/active", label: "Activas", icon: Ticket },
  { href: "/storage/history", label: "Historial", icon: History },
  { href: "/app", label: "App", icon: CalendarDays }
];

export function getNavForRole(role: AppRole | null): NavItem[] {
  if (role === "admin") return adminNav;
  if (role === "dj") return djNav;
  if (role === "guard") return guardNav;
  if (role === "storage") return storageNav;
  return userNav;
}
