"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
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
  image_url: string | null;
  artist_name: string | null;
  artist_url: string | null;
  external_url: string | null;
  featured: boolean;
  zone_name: string | null;
};

const emptyForm = {
  title: "",
  artist_name: "",
  starts_at: "",
  ends_at: "",
  zone_name: "",
  description: "",
  image_url: "",
  artist_url: "",
  external_url: "",
  capacity: "600",
  ticket_price_cents: "1500",
  is_published: false,
  featured: false
};

function isValidUrl(value: string) {
  if (!value.trim()) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function extensionForFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return form.image_url;
  }, [form.image_url, imageFile]);

  async function load() {
    setError("");
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: false });
    if (queryError) throw queryError;
    setEvents((data ?? []) as EventRow[]);
  }

  useEffect(() => {
    let active = true;
    load()
      .catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar eventos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setEditingId("");
    setImageFile(null);
    setForm(emptyForm);
  }

  function editEvent(event: EventRow) {
    setEditingId(event.id);
    setImageFile(null);
    setForm({
      title: event.title,
      artist_name: event.artist_name ?? "",
      starts_at: isoInputValue(event.starts_at),
      ends_at: isoInputValue(event.ends_at),
      zone_name: event.zone_name ?? "",
      description: event.description ?? "",
      image_url: event.image_url ?? event.cover_image_path ?? "",
      artist_url: event.artist_url ?? "",
      external_url: event.external_url ?? "",
      capacity: String(event.capacity),
      ticket_price_cents: String(event.ticket_price_cents),
      is_published: event.is_published,
      featured: event.featured
    });
  }

  async function uploadImage(file: File, eventTitle: string) {
    const supabase = await requireAdmin();
    const safeTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
    const path = `${safeTitle}-${crypto.randomUUID()}.${extensionForFile(file)}`;
    const { error: uploadError } = await supabase.storage.from("event-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("event-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.starts_at) {
      setError("Título y fecha son obligatorios.");
      return;
    }
    if (!isValidUrl(form.artist_url)) {
      setError("El link Spotify/artista debe ser una URL válida.");
      return;
    }
    if (!isValidUrl(form.external_url)) {
      setError("El link externo debe ser una URL válida.");
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
      const imageUrl = imageFile ? await uploadImage(imageFile, form.title) : form.image_url.trim();
      const payload = {
        title: form.title.trim(),
        artist_name: form.artist_name.trim() || null,
        description: form.description.trim() || null,
        starts_at: fromDateTimeLocal(form.starts_at),
        ends_at: fromDateTimeLocal(form.ends_at),
        zone_name: form.zone_name.trim() || null,
        image_url: imageUrl || null,
        cover_image_path: imageUrl || null,
        artist_url: form.artist_url.trim() || null,
        external_url: form.external_url.trim() || null,
        capacity,
        ticket_price_cents: ticketPriceCents,
        is_published: form.is_published,
        featured: form.featured
      };
      const result = editingId
        ? await supabase.from("events").update(payload).eq("id", editingId)
        : await supabase.from("events").insert(payload);
      if (result.error) throw result.error;
      resetForm();
      setMessage(editingId ? "Evento actualizado." : "Evento creado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function updateFlags(id: string, changes: Partial<Pick<EventRow, "is_published" | "featured">>) {
    setError("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("events").update(changes).eq("id", id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar el evento.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Eventos" description="Crea eventos con imagen, artista, Spotify y destacado para la home." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}

      <Card>
        <SectionTitle title={editingId ? "Editar evento" : "Crear evento"} />
        <form onSubmit={saveEvent} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Título" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <input className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Artista" value={form.artist_name} onChange={(event) => setForm({ ...form, artist_name: event.target.value })} />
            <input type="datetime-local" className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
            <input type="datetime-local" className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
            <input className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Zona" value={form.zone_name} onChange={(event) => setForm({ ...form, zone_name: event.target.value })} />
            <input className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Link Spotify/artista" value={form.artist_url} onChange={(event) => setForm({ ...form, artist_url: event.target.value })} />
            <input className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" placeholder="Link externo opcional" value={form.external_url} onChange={(event) => setForm({ ...form, external_url: event.target.value })} />
            <textarea className="gold-focus min-h-24 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" placeholder="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <input type="number" className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Capacidad" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            <input type="number" className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Precio cents" value={form.ticket_price_cents} onChange={(event) => setForm({ ...form, ticket_price_cents: event.target.value })} />
            <label className="gold-focus flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-4 text-sm font-bold text-white">
              <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />
              Publicado
            </label>
            <label className="gold-focus flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-4 text-sm font-bold text-white">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
              Destacar en home
            </label>
            <div className="flex gap-3 md:col-span-2 md:justify-end">
              {editingId ? <AdminActionButton variant="ghost" onClick={resetForm}>Cancelar</AdminActionButton> : null}
              <FlexButton disabled={saving}>{saving ? "Guardando" : editingId ? "Guardar cambios" : "Crear evento"}</FlexButton>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Imagen</p>
            <div className="mt-3 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
              {imagePreview ? (
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})` }} />
              ) : (
                <div className="grid h-40 place-items-center px-4 text-center text-sm text-[var(--muted)]">Imagen opcional recomendada</div>
              )}
            </div>
            <input className="gold-focus mt-3 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
            <input className="gold-focus mt-3 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" placeholder="O pega image_url" value={form.image_url} onChange={(event) => { setImageFile(null); setForm({ ...form, image_url: event.target.value }); }} />
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Las subidas usan el bucket público `event-images`.</p>
          </aside>
        </form>
      </Card>

      {!loading && !error && events.length === 0 ? <AdminEmptyState title="Sin eventos" description="Crea el primer evento de FLEX." /> : null}
      {events.length ? (
        <AdminDataTable columns={["Evento", "Fecha", "Imagen", "Precio", "Estado", "Acciones"]}>
          {events.map((event) => (
            <tr key={event.id} className="text-white">
              <td className="px-4 py-3">
                <div className="font-bold">{event.title}</div>
                <div className="text-xs text-[var(--muted)]">{event.artist_name || "Sin artista"} · {event.zone_name || "Sin zona"}</div>
              </td>
              <td className="px-4 py-3">{new Date(event.starts_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3">
                <div className="size-14 rounded-md bg-cover bg-center ring-1 ring-white/10" style={{ backgroundImage: `url(${event.image_url || event.cover_image_path || "/images/events/john-coltrane.jpg"})` }} />
              </td>
              <td className="px-4 py-3">{cents(event.ticket_price_cents)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <StatusBadge status={event.is_published ? "published" : "draft"} />
                  {event.featured ? <FlexBadge tone="gold">Destacado</FlexBadge> : null}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton variant="ghost" onClick={() => editEvent(event)}>Editar</AdminActionButton>
                  <AdminActionButton variant={event.is_published ? "danger" : "success"} onClick={() => updateFlags(event.id, { is_published: !event.is_published })}>{event.is_published ? "Despublicar" : "Publicar"}</AdminActionButton>
                  <AdminActionButton variant="ghost" onClick={() => updateFlags(event.id, { featured: !event.featured })}>{event.featured ? "Quitar destacado" : "Destacar"}</AdminActionButton>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
