"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { requireAdmin } from "@/lib/admin-actions";

type QueueRow = {
  id: string;
  performer_name: string;
  instrument: string | null;
  position: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name?: string } | null;
};

const statusOrder: Record<string, number> = { waiting: 0, called: 1, done: 2, cancelled: 3 };

export default function AdminQueuePage() {
  const [items, setItems] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase
      .from("live_session_queue")
      .select("id, performer_name, instrument, position, status, created_at, user_id, profiles(full_name)")
      .order("position", { ascending: true });
    if (queryError) throw queryError;
    setItems(((data ?? []) as QueueRow[]).sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9) || a.position - b.position));
  }

  useEffect(() => {
    let active = true;
    load().catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la cola.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function setStatus(id: string, status: string) {
    setError("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("live_session_queue").update({ status }).eq("id", id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar el turno.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Cola live" description="Gestiona artistas esperando para cantar, tocar o subir al escenario." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {!loading && !error && items.length === 0 ? <AdminEmptyState title="Cola vacia" description="No hay artistas registrados en la cola." /> : null}
      {items.length ? (
        <AdminDataTable columns={["Artista", "Posicion", "Usuario", "Estado", "Fecha", "Acciones"]}>
          {items.map((item) => (
            <tr key={item.id} className="text-white">
              <td className="px-4 py-3"><div className="font-bold">{item.performer_name}</div><div className="text-xs text-[var(--muted)]">{item.instrument ?? "Sin instrumento"}</div></td>
              <td className="px-4 py-3">#{item.position}</td>
              <td className="px-4 py-3">{item.profiles?.full_name || item.user_id}</td>
              <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-3">{new Date(item.created_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                <AdminActionButton variant="success" onClick={() => setStatus(item.id, "called")}>Llamar</AdminActionButton>
                <AdminActionButton variant="ghost" onClick={() => setStatus(item.id, "done")}>Terminado</AdminActionButton>
                <AdminActionButton variant="danger" onClick={() => setStatus(item.id, "cancelled")}>Cancelar</AdminActionButton>
              </div></td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
