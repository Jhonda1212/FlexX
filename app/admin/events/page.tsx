"use client";

import { useEffect, useState } from "react";
import {
  AdminActionButton,
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
  StatusBadge
} from "@/components/admin/AdminComponents";
import { Card, SectionTitle } from "@/components/ui/Card";
import { cents, fromDateTimeLocal, isoInputValue, requireAdmin } from "@/lib/admin-actions";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  ticket_price_cents: number;
  is_published: boolean;
  cover_image_path: string | null;
};

const emptyForm = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  capacity: "600",
  ticket_price_cents: "1500",
  is_published: false,
  cover_image_path: ""
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setError("");
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
    if (queryError) throw queryError;
    setEvents((data ?? []) as EventRow[]);
  }

  useEffect(() => {
    let active = true;
    load().catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar eventos.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function editEvent(event: EventRow) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? "",
      starts_at: isoInputValue(event.starts_at),
      ends_at: isoInputValue(event.ends_at),
      capacity: String(event.capacity),
      ticket_price_cents: String(event.ticket_price_cents),
      is_published: event.is_published,
      cover_image_path: event.cover_image_path ?? ""
    });
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.title.trim() || !form.starts_at || !form.capacity || !form.ticket_price_cents) {
      setError("Titulo, fecha de inicio, capacidad y precio son obligatorios.");
      return;
    }
    const capacity = Number(form.capacity);
    const ticketPriceCents = Number(form.ticket_price_cents);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError("La capacidad debe ser mayor que 0.");
      return;
    }
    if (!Number.isFinite(ticketPriceCents) || ticketPriceCents < 0) {
      setError("El precio de entrada no puede ser negativo.");
      return;
    }
    setSaving(true);
    try {
      const supabase = await requireAdmin();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        starts_at: fromDateTimeLocal(form.starts_at),
        ends_at: fromDateTimeLocal(form.ends_at),
        capacity,
        ticket_price_cents: ticketPriceCents,
        is_published: form.is_published,
        cover_image_path: form.cover_image_path.trim() || null
      };
      const result = editingId
        ? await supabase.from("events").update(payload).eq("id", editingId)
        : await supabase.from("events").insert(payload);
      if (result.error) throw result.error;
      setForm(emptyForm);
      setEditingId("");
      setMessage(editingId ? "Evento actualizado." : "Evento creado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function setPublished(id: string, isPublished: boolean) {
    setError("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("events").update({ is_published: isPublished }).eq("id", id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo cambiar publicacion.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Eventos" description="Crea, edita, publica o despublica eventos de FLEX." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}
      <Card>
        <SectionTitle title={editingId ? "Editar evento" : "Crear evento"} />
        <form onSubmit={saveEvent} className="grid gap-3 md:grid-cols-2">
          <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Titulo" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Cover image path" value={form.cover_image_path} onChange={(event) => setForm({ ...form, cover_image_path: event.target.value })} />
          <input type="datetime-local" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
          <input type="datetime-local" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
          <input type="number" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Capacidad" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
          <input type="number" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Precio cents" value={form.ticket_price_cents} onChange={(event) => setForm({ ...form, ticket_price_cents: event.target.value })} />
          <textarea className="min-h-24 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" placeholder="Descripcion" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Publicado</label>
          <div className="flex gap-3 md:justify-end">
            {editingId ? <AdminActionButton variant="ghost" onClick={() => { setEditingId(""); setForm(emptyForm); }}>Cancelar</AdminActionButton> : null}
            <button className="gold-focus min-h-12 rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black disabled:opacity-50" disabled={saving}>{saving ? "Guardando" : editingId ? "Guardar cambios" : "Crear"}</button>
          </div>
        </form>
      </Card>
      {!loading && !error && events.length === 0 ? <AdminEmptyState title="Sin eventos" description="Crea el primer evento de FLEX." /> : null}
      {events.length ? (
        <AdminDataTable columns={["Evento", "Fecha", "Precio", "Capacidad", "Estado", "Acciones"]}>
          {events.map((event) => (
            <tr key={event.id} className="text-white">
              <td className="px-4 py-3"><div className="font-bold">{event.title}</div><div className="text-xs text-[var(--muted)]">{event.description}</div></td>
              <td className="px-4 py-3">{new Date(event.starts_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3">{cents(event.ticket_price_cents)}</td>
              <td className="px-4 py-3">{event.capacity}</td>
              <td className="px-4 py-3"><StatusBadge status={event.is_published ? "published" : "draft"} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton variant="ghost" onClick={() => editEvent(event)}>Editar</AdminActionButton>
                  <AdminActionButton variant={event.is_published ? "danger" : "success"} onClick={() => setPublished(event.id, !event.is_published)}>{event.is_published ? "Despublicar" : "Publicar"}</AdminActionButton>
                  <AdminActionButton variant="danger" onClick={() => setPublished(event.id, false)}>Cancelar</AdminActionButton>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
