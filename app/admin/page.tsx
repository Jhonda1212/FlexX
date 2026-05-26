"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, Crown, ListOrdered, Megaphone, Music, Ticket, Users } from "lucide-react";
import {
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
  AdminStatCard
} from "@/components/admin/AdminComponents";
import { AdminQuickActionCard } from "@/components/admin/AdminQuickActionCard";
import { Card, SectionTitle } from "@/components/ui/Card";
import { cents, requireAdmin } from "@/lib/admin-actions";
import type { createBrowserSupabase } from "@/lib/supabase";

type Metrics = {
  events: number;
  publishedEvents: number;
  tickets: number;
  activeTickets: number;
  pendingSongs: number;
  waitingQueue: number;
  activeStorage: number;
  paidOrders: number;
  revenueCents: number;
  activeFeedPosts: number;
};

const quickLinks = [
  { href: "/admin/feed", title: "Hoy en FLEX", description: "Publica promociones, avisos y actividades del dia.", icon: Megaphone },
  { href: "/admin/events", title: "Gestionar eventos", description: "Crea, edita y publica noches de FLEX.", icon: CalendarDays },
  { href: "/admin/vip", title: "Salas VIP", description: "Controla Sala Negra, Sala Roja y Sala Dorada.", icon: Crown },
  { href: "/admin/songs", title: "Canciones pedidas", description: "Aprueba, reproduce o rechaza solicitudes.", icon: Music },
  { href: "/admin/queue", title: "Cola del escenario", description: "Llama artistas y controla turnos en vivo.", icon: ListOrdered },
  { href: "/admin/staff", title: "Equipo y roles", description: "Gestiona guardias, storage, DJ y admins.", icon: Users },
  { href: "/admin/payments", title: "Pagos y ordenes", description: "Revisa ventas, estados e ingresos.", icon: CreditCard },
  { href: "/admin/tickets", title: "Entradas QR", description: "Consulta tickets, estados y accesos.", icon: Ticket }
];

type AdminSupabaseClient = ReturnType<typeof createBrowserSupabase>;

async function countRows(supabase: AdminSupabaseClient, table: string, filter?: (query: any) => any) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = await requireAdmin();
        const [
          events,
          publishedEvents,
          tickets,
          activeTickets,
          pendingSongs,
          waitingQueue,
          activeStorage,
          paidOrders,
          activeFeedPosts,
          paidOrderRows
        ] = await Promise.all([
          countRows(supabase, "events"),
          countRows(supabase, "events", (query) => query.eq("is_published", true)),
          countRows(supabase, "tickets"),
          countRows(supabase, "tickets", (query) => query.eq("status", "active")),
          countRows(supabase, "song_requests", (query) => query.eq("status", "pending")),
          countRows(supabase, "live_session_queue", (query) => query.eq("status", "waiting")),
          countRows(supabase, "storage_items", (query) => query.eq("status", "active")),
          countRows(supabase, "orders", (query) => query.eq("status", "paid")),
          countRows(supabase, "daily_feed_posts", (query) => query.eq("is_published", true)),
          supabase.from("orders").select("amount_total_cents").eq("status", "paid")
        ]);
        if (paidOrderRows.error) throw paidOrderRows.error;
        const revenueCents = (paidOrderRows.data ?? []).reduce((sum, order) => sum + Number(order.amount_total_cents ?? 0), 0);
        if (active) setMetrics({ events, publishedEvents, tickets, activeTickets, pendingSongs, waitingQueue, activeStorage, paidOrders, revenueCents, activeFeedPosts });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el dashboard admin.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Panel admin" description="Gestion centralizada de eventos, VIP, tickets, pagos, staff y operativa en vivo." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {metrics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Eventos" value={metrics.events} hint={`${metrics.publishedEvents} publicados`} />
            <AdminStatCard label="Tickets" value={metrics.tickets} hint={`${metrics.activeTickets} activos`} />
            <AdminStatCard label="Canciones pendientes" value={metrics.pendingSongs} hint="song_requests pending" />
            <AdminStatCard label="Cola esperando" value={metrics.waitingQueue} hint="artistas waiting" />
            <AdminStatCard label="Storage activo" value={metrics.activeStorage} hint="prendas en custodia" />
            <AdminStatCard label="Ordenes pagadas" value={metrics.paidOrders} hint="orders paid" />
            <AdminStatCard label="Ingresos estimados" value={cents(metrics.revenueCents)} hint="suma de ordenes pagadas" />
            <AdminStatCard label="Hoy en FLEX" value={metrics.activeFeedPosts} hint="publicaciones activas" />
            <AdminStatCard label="Estado" value="Live" hint="Supabase real conectado" />
          </div>
          <Card>
            <SectionTitle title="Accesos rapidos" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickLinks.map((item) => <AdminQuickActionCard key={item.href} {...item} />)}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
