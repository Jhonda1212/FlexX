"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { requireAdmin, shortToken } from "@/lib/admin-actions";

type TicketRow = {
  id: string;
  user_id: string;
  event_id: string;
  qr_token: string;
  status: string;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
};

const filters = ["active", "used", "expired", "cancelled"];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(status = filter) {
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase.from("tickets").select("*").eq("status", status).order("created_at", { ascending: false });
    if (queryError) throw queryError;
    setTickets((data ?? []) as TicketRow[]);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    load(filter).catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tickets.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filter]);

  async function setStatus(id: string, status: string) {
    setError("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("tickets").update({ status }).eq("id", id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar el ticket.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Tickets" description="Consulta tickets y cambia estados operativos sin editar tokens QR." />
      <div className="flex flex-wrap gap-2">{filters.map((item) => <AdminActionButton key={item} variant={filter === item ? "primary" : "ghost"} onClick={() => setFilter(item)}>{item}</AdminActionButton>)}</div>
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {!loading && !error && tickets.length === 0 ? <AdminEmptyState title="Sin tickets" description={`No hay tickets con estado ${filter}.`} /> : null}
      {tickets.length ? (
        <AdminDataTable columns={["Token", "Estado", "Evento", "Usuario", "Expira", "Usado", "Creado", "Acciones"]}>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="text-white">
              <td className="px-4 py-3 font-mono text-xs">{shortToken(ticket.qr_token)}</td>
              <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
              <td className="px-4 py-3 font-mono text-xs">{ticket.event_id}</td>
              <td className="px-4 py-3 font-mono text-xs">{ticket.user_id}</td>
              <td className="px-4 py-3">{ticket.expires_at ? new Date(ticket.expires_at).toLocaleString("es-ES") : "-"}</td>
              <td className="px-4 py-3">{ticket.used_at ? new Date(ticket.used_at).toLocaleString("es-ES") : "-"}</td>
              <td className="px-4 py-3">{new Date(ticket.created_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                <AdminActionButton variant="success" onClick={() => setStatus(ticket.id, "active")}>Reactivar</AdminActionButton>
                <AdminActionButton variant="ghost" onClick={() => setStatus(ticket.id, "expired")}>Expirar</AdminActionButton>
                <AdminActionButton variant="danger" onClick={() => setStatus(ticket.id, "cancelled")}>Cancelar</AdminActionButton>
              </div></td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
