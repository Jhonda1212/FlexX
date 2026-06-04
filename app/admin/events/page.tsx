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

type TicketTierRow = {
  id: string;
  event_id: string;
  name: string;
  zone_name: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  capacity: number | null;
  available_quantity: number | null;
  active: boolean;
  sort_order: number;
};

const defaultCapacity = 600;
const defaultTicketPriceCents = 0;

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
  capacity: String(defaultCapacity),
  ticket_price_cents: "1500",
  is_published: false,
  featured: false
};

const emptyTierForm = {
  name: "",
  zone_name: "",
  description: "",
  price_cents: "",
  currency: "EUR",
  capacity: "",
  available_quantity: "",
  active: true,
  sort_order: "0"
};

const inputClass = "gold-focus w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/38";
const labelClass = "text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]";

function isValidUrl(value: string) {
  if (!value.trim()) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidImageReference(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  return isValidUrl(trimmed);
}

function extensionForFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
}

function isFutureEvent(event: EventRow) {
  return new Date(event.starts_at).getTime() >= Date.now();
}

function formatTierPrice(priceCents: number, currency: string) {
  return `${(priceCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [ticketTiers, setTicketTiers] = useState<TicketTierRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [tierForm, setTierForm] = useState(emptyTierForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState("");
  const [editingTierId, setEditingTierId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTier, setSavingTier] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return form.image_url;
  }, [form.image_url, imageFile]);

  const tiersForEditingEvent = useMemo(
    () => ticketTiers.filter((tier) => tier.event_id === editingId).sort((a, b) => a.sort_order - b.sort_order || a.price_cents - b.price_cents),
    [editingId, ticketTiers]
  );

  async function load() {
    setError("");
    const supabase = await requireAdmin();
    const [eventsResult, tiersResult] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: false }),
      supabase
        .from("event_ticket_tiers")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("price_cents", { ascending: true })
    ]);
    if (eventsResult.error) throw eventsResult.error;
    if (tiersResult.error) throw tiersResult.error;
    setEvents((eventsResult.data ?? []) as EventRow[]);
    setTicketTiers((tiersResult.data ?? []) as TicketTierRow[]);
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
    setEditingTierId("");
    setImageFile(null);
    setForm(emptyForm);
    setTierForm(emptyTierForm);
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
      setError("Titulo y fecha de inicio son obligatorios.");
      return;
    }
    if (!isValidUrl(form.artist_url)) {
      setError("El link Spotify/artista debe ser una URL valida.");
      return;
    }
    if (!isValidUrl(form.external_url)) {
      setError("El link externo debe ser una URL valida.");
      return;
    }
    if (!imageFile && !isValidImageReference(form.image_url)) {
      setError("La imagen debe ser una URL valida o una ruta local que empiece por /.");
      return;
    }

    const capacity = form.capacity.trim() ? Number(form.capacity) : defaultCapacity;
    const ticketPriceCents = form.ticket_price_cents.trim() ? Number(form.ticket_price_cents) : defaultTicketPriceCents;
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
    setMessage("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("events").update(changes).eq("id", id);
      if (updateError) throw updateError;
      setMessage("Evento actualizado.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar el evento.");
    }
  }

  function resetTierForm() {
    setEditingTierId("");
    setTierForm(emptyTierForm);
  }

  function editTier(tier: TicketTierRow) {
    setEditingTierId(tier.id);
    setTierForm({
      name: tier.name,
      zone_name: tier.zone_name ?? "",
      description: tier.description ?? "",
      price_cents: String(tier.price_cents),
      currency: tier.currency,
      capacity: tier.capacity === null ? "" : String(tier.capacity),
      available_quantity: tier.available_quantity === null ? "" : String(tier.available_quantity),
      active: tier.active,
      sort_order: String(tier.sort_order)
    });
  }

  async function saveTier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!editingId) {
      setError("Guarda o selecciona un evento antes de agregar precios por zona.");
      return;
    }
    if (!tierForm.name.trim()) {
      setError("El nombre del tipo de entrada es obligatorio.");
      return;
    }

    const priceCents = Number(tierForm.price_cents);
    const capacity = tierForm.capacity.trim() ? Number(tierForm.capacity) : null;
    const availableQuantity = tierForm.available_quantity.trim() ? Number(tierForm.available_quantity) : null;
    const sortOrder = tierForm.sort_order.trim() ? Number(tierForm.sort_order) : 0;

    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError("El precio del tier no puede ser negativo.");
      return;
    }
    if (capacity !== null && (!Number.isFinite(capacity) || capacity < 0)) {
      setError("La capacidad del tier no puede ser negativa.");
      return;
    }
    if (availableQuantity !== null && (!Number.isFinite(availableQuantity) || availableQuantity < 0)) {
      setError("La disponibilidad del tier no puede ser negativa.");
      return;
    }
    if (!Number.isFinite(sortOrder)) {
      setError("El orden debe ser numerico.");
      return;
    }

    setSavingTier(true);
    try {
      const supabase = await requireAdmin();
      const payload = {
        event_id: editingId,
        name: tierForm.name.trim(),
        zone_name: tierForm.zone_name.trim() || null,
        description: tierForm.description.trim() || null,
        price_cents: priceCents,
        currency: (tierForm.currency.trim() || "EUR").toUpperCase(),
        capacity,
        available_quantity: availableQuantity,
        active: tierForm.active,
        sort_order: sortOrder
      };
      const result = editingTierId
        ? await supabase.from("event_ticket_tiers").update(payload).eq("id", editingTierId)
        : await supabase.from("event_ticket_tiers").insert(payload);
      if (result.error) throw result.error;
      const wasEditingTier = Boolean(editingTierId);
      resetTierForm();
      setMessage(wasEditingTier ? "Precio actualizado." : "Precio agregado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el precio.");
    } finally {
      setSavingTier(false);
    }
  }

  async function toggleTierActive(tier: TicketTierRow) {
    setError("");
    setMessage("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("event_ticket_tiers").update({ active: !tier.active }).eq("id", tier.id);
      if (updateError) throw updateError;
      setMessage(tier.active ? "Precio desactivado." : "Precio activado.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar el precio.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Eventos" description="Crea eventos con imagen, artista, Spotify y destacado para la home." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}

      <Card className="border-[var(--gold)]/20 bg-[var(--gold)]/8">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Publicacion en home</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Para aparecer en Proximos eventos, el evento debe estar publicado y tener una fecha de inicio futura. Los destacados se muestran primero.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/25 p-3 text-xs leading-5 text-[var(--muted)]">
            Imagen por subida a <span className="font-bold text-white">event-images</span> o ruta manual en <span className="font-bold text-white">image_url</span>.
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title={editingId ? "Editar evento" : "Crear evento"} />
        <form onSubmit={saveEvent} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className={labelClass}>Titulo *</span>
              <input required className={inputClass} placeholder="Jazz Nights" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Artista</span>
              <input className={inputClass} placeholder="John Coltrane" value={form.artist_name} onChange={(event) => setForm({ ...form, artist_name: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Inicio *</span>
              <input required type="datetime-local" className={inputClass} value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Fin opcional</span>
              <input type="datetime-local" className={inputClass} value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Zona</span>
              <input className={inputClass} placeholder="Pista principal" value={form.zone_name} onChange={(event) => setForm({ ...form, zone_name: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Link artista</span>
              <input className={inputClass} placeholder="https://open.spotify.com/..." value={form.artist_url} onChange={(event) => setForm({ ...form, artist_url: event.target.value })} />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className={labelClass}>Link externo opcional</span>
              <input className={inputClass} placeholder="https://..." value={form.external_url} onChange={(event) => setForm({ ...form, external_url: event.target.value })} />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className={labelClass}>Descripcion</span>
              <textarea className={`${inputClass} min-h-24 resize-y`} placeholder="Descripcion corta para la card y el detalle." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Capacidad opcional</span>
              <input type="number" min={1} className={inputClass} placeholder={String(defaultCapacity)} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Precio cents opcional</span>
              <input type="number" min={0} className={inputClass} placeholder="1500" value={form.ticket_price_cents} onChange={(event) => setForm({ ...form, ticket_price_cents: event.target.value })} />
            </label>
            <label className="gold-focus flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-4 text-sm font-bold text-white">
              <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />
              Publicado
            </label>
            <label className="gold-focus flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-4 text-sm font-bold text-white">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
              Destacar en home
            </label>
            <div className="flex flex-wrap gap-3 md:col-span-2 md:justify-end">
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
            <input className="gold-focus mt-3 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/38" placeholder="O pega image_url" value={form.image_url} onChange={(event) => { setImageFile(null); setForm({ ...form, image_url: event.target.value }); }} />
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              Las subidas usan el bucket publico `event-images`. Tambien puedes usar una URL absoluta o una ruta local como `/images/events/john-coltrane.jpg`.
            </p>
          </aside>
        </form>
      </Card>

      <Card>
        <SectionTitle title="Precios por zona" />
        {!editingId ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="font-bold text-white">Guarda o edita un evento para gestionar sus entradas.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Los precios por zona se agregan sobre un evento existente y luego aparecen en /app cuando el evento esta publicado y en fecha futura.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              {tiersForEditingEvent.length ? (
                tiersForEditingEvent.map((tier) => (
                  <div key={tier.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white">{tier.name}</div>
                        <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gold)]">{tier.zone_name || "Sin zona"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatTierPrice(tier.price_cents, tier.currency)}</div>
                        <div className="mt-1">{tier.active ? <FlexBadge tone="success">Activo</FlexBadge> : <FlexBadge>Inactivo</FlexBadge>}</div>
                      </div>
                    </div>
                    {tier.description ? <p className="mt-3 text-sm leading-6 text-white/68">{tier.description}</p> : null}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
                      <span>
                        Capacidad {tier.capacity ?? "-"} · Disponibles {tier.available_quantity ?? "-"} · Orden {tier.sort_order}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton variant="ghost" onClick={() => editTier(tier)}>Editar</AdminActionButton>
                        <AdminActionButton variant={tier.active ? "danger" : "success"} onClick={() => toggleTierActive(tier)}>
                          {tier.active ? "Desactivar" : "Activar"}
                        </AdminActionButton>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-bold text-white">Sin precios por zona</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Agrega General, Pista principal, VIP Lounge u otro tipo de entrada para este evento.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={saveTier} className="rounded-lg border border-[var(--gold)]/18 bg-black/25 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">{editingTierId ? "Editar precio" : "Nuevo precio"}</p>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-2">
                  <span className={labelClass}>Nombre *</span>
                  <input required className={inputClass} placeholder="General" value={tierForm.name} onChange={(event) => setTierForm({ ...tierForm, name: event.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Zona</span>
                  <input className={inputClass} placeholder="Pista principal" value={tierForm.zone_name} onChange={(event) => setTierForm({ ...tierForm, zone_name: event.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Descripcion</span>
                  <textarea className={`${inputClass} min-h-20 resize-y`} placeholder="Acceso a zona principal." value={tierForm.description} onChange={(event) => setTierForm({ ...tierForm, description: event.target.value })} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={labelClass}>Precio cents *</span>
                    <input required type="number" min={0} className={inputClass} placeholder="2000" value={tierForm.price_cents} onChange={(event) => setTierForm({ ...tierForm, price_cents: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className={labelClass}>Moneda</span>
                    <input className={inputClass} placeholder="EUR" value={tierForm.currency} onChange={(event) => setTierForm({ ...tierForm, currency: event.target.value })} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={labelClass}>Capacidad</span>
                    <input type="number" min={0} className={inputClass} placeholder="400" value={tierForm.capacity} onChange={(event) => setTierForm({ ...tierForm, capacity: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className={labelClass}>Disponibles</span>
                    <input type="number" min={0} className={inputClass} placeholder="120" value={tierForm.available_quantity} onChange={(event) => setTierForm({ ...tierForm, available_quantity: event.target.value })} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={labelClass}>Orden</span>
                    <input type="number" className={inputClass} placeholder="0" value={tierForm.sort_order} onChange={(event) => setTierForm({ ...tierForm, sort_order: event.target.value })} />
                  </label>
                  <label className="gold-focus flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-4 text-sm font-bold text-white">
                    <input type="checkbox" checked={tierForm.active} onChange={(event) => setTierForm({ ...tierForm, active: event.target.checked })} />
                    Activo
                  </label>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  {editingTierId ? <AdminActionButton variant="ghost" onClick={resetTierForm}>Cancelar</AdminActionButton> : null}
                  <FlexButton disabled={savingTier}>{savingTier ? "Guardando" : editingTierId ? "Guardar precio" : "Agregar precio"}</FlexButton>
                </div>
              </div>
            </form>
          </div>
        )}
      </Card>

      {!loading && !error && events.length === 0 ? <AdminEmptyState title="Sin eventos" description="Crea el primer evento de FLEX." /> : null}
      {events.length ? (
        <AdminDataTable columns={["Evento", "Fecha", "Imagen", "Precio", "Estado", "Acciones"]}>
          {events.map((event) => {
            const appearsInHome = event.is_published && isFutureEvent(event);
            const activeTiers = ticketTiers.filter((tier) => tier.event_id === event.id && tier.active).sort((a, b) => a.price_cents - b.price_cents);
            const priceLabel = activeTiers[0]
              ? `Desde ${formatTierPrice(activeTiers[0].price_cents, activeTiers[0].currency)}`
              : cents(event.ticket_price_cents);
            return (
              <tr key={event.id} className="text-white">
                <td className="px-4 py-3">
                  <div className="font-bold">{event.title}</div>
                  <div className="text-xs text-[var(--muted)]">{event.artist_name || "Sin artista"} - {event.zone_name || "Sin zona"}</div>
                </td>
                <td className="px-4 py-3">{new Date(event.starts_at).toLocaleString("es-ES")}</td>
                <td className="px-4 py-3">
                  <div className="size-14 rounded-md bg-cover bg-center ring-1 ring-white/10" style={{ backgroundImage: `url(${event.image_url || event.cover_image_path || "/images/events/john-coltrane.jpg"})` }} />
                </td>
                <td className="px-4 py-3">{priceLabel}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={event.is_published ? "published" : "draft"} />
                    {event.featured ? <FlexBadge tone="gold">Destacado</FlexBadge> : null}
                    {appearsInHome ? <FlexBadge tone="success">Visible home</FlexBadge> : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton variant="ghost" onClick={() => editEvent(event)}>Editar</AdminActionButton>
                    <AdminActionButton variant={event.is_published ? "danger" : "success"} onClick={() => updateFlags(event.id, { is_published: !event.is_published })}>{event.is_published ? "Despublicar" : "Publicar"}</AdminActionButton>
                    <AdminActionButton variant="ghost" onClick={() => updateFlags(event.id, { featured: !event.featured })}>{event.featured ? "Quitar destacado" : "Destacar"}</AdminActionButton>
                    {event.is_published ? <AdminActionButton variant="ghost" href={`/app/events/${event.id}`}>Ver</AdminActionButton> : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
