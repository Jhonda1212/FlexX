"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader
} from "@/components/admin/AdminComponents";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { cents, fromDateTimeLocal, isoInputValue, requireAdmin } from "@/lib/admin-actions";
import { deleteAdminEvent } from "./actions";

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
  ticket_price: "15.00",
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

const inputClass = "gold-focus h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/35";
const textareaClass = "gold-focus w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/35";
const labelClass = "text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]";
const numberInputCleanClass = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

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

function centsToPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2);
}

function priceInputToCents(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return defaultTicketPriceCents;
  const price = Number(normalized);
  if (!Number.isFinite(price)) return Number.NaN;
  return Math.round(price * 100);
}

function compactDate(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/[0.07] bg-white/[0.018] p-3.5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">{title}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ToggleField({ label, helper, checked, onChange }: { label: string; helper: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="gold-focus flex min-h-11 items-start gap-3 rounded-md border border-white/[0.08] bg-black/20 px-3 py-2.5 transition-colors hover:border-[var(--gold)]/25 hover:bg-white/[0.025]">
      <input className="mt-1 accent-[var(--gold)]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <span className="block text-sm font-bold leading-5 text-white">{label}</span>
        <span className="text-[11px] leading-4 text-[var(--muted)]">{helper}</span>
      </span>
    </label>
  );
}

function SmallActionButton({
  children,
  href,
  onClick,
  variant = "ghost",
  emphasis = false,
  disabled = false
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "success";
  emphasis?: boolean;
  disabled?: boolean;
}) {
  const variants = {
    primary: "border-[var(--gold)]/50 bg-[var(--gold)] text-black hover:bg-[var(--gold-bright)]",
    ghost: "border-white/10 bg-white/[0.025] text-white/82 hover:border-[var(--gold)]/35 hover:bg-[var(--gold)]/8 hover:text-white",
    danger: "border-red-500/20 bg-red-500/8 text-red-100 hover:border-red-400/35 hover:bg-red-500/14",
    success: "border-green-500/25 bg-green-500/12 text-green-100 hover:border-green-400/40 hover:bg-green-500/18"
  };
  const className = `gold-focus inline-flex h-9 whitespace-nowrap rounded-md border px-3 text-xs font-bold uppercase tracking-[0.06em] transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-45 ${emphasis ? "shadow-[0_8px_18px_rgba(217,166,64,0.1)]" : ""} ${variants[variant]}`;

  if (href && !disabled) {
    return <Link href={href} className={`${className} items-center justify-center`}>{children}</Link>;
  }

  return <button type="button" className={`${className} items-center justify-center`} onClick={onClick} disabled={disabled}>{children}</button>;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [ticketTiers, setTicketTiers] = useState<TicketTierRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [tierForm, setTierForm] = useState(emptyTierForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState("");
  const [editingTierId, setEditingTierId] = useState("");
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">("closed");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTier, setSavingTier] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [ticketOptionsOpen, setTicketOptionsOpen] = useState(false);
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

  const editingEvent = useMemo(() => events.find((event) => event.id === editingId), [editingId, events]);
  const isFormOpen = formMode !== "closed";

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
    setFormMode("closed");
    setTicketOptionsOpen(false);
  }

  function startNewEvent() {
    setEditingId("");
    setEditingTierId("");
    setImageFile(null);
    setForm(emptyForm);
    setTierForm(emptyTierForm);
    setFormMode("create");
    setTicketOptionsOpen(false);
  }

  function editEvent(event: EventRow) {
    setEditingId(event.id);
    setEditingTierId("");
    setImageFile(null);
    setTierForm(emptyTierForm);
    setFormMode("edit");
    setTicketOptionsOpen(false);
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
      ticket_price: centsToPriceInput(event.ticket_price_cents),
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
      setError("Completa titulo e inicio.");
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
    const ticketPriceCents = priceInputToCents(form.ticket_price);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError("La capacidad debe ser mayor que 0.");
      return;
    }
    if (!Number.isFinite(ticketPriceCents) || ticketPriceCents < 0) {
      setError("El precio desde no puede ser negativo.");
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

  async function deleteEvent(event: EventRow) {
    setError("");
    setMessage("");

    if (!window.confirm("¿Eliminar este evento? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeletingId(event.id);
    try {
      await deleteAdminEvent(event.id);
      if (editingId === event.id) {
        resetForm();
      }
      setMessage("Evento eliminado.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo eliminar el evento.");
    } finally {
      setDeletingId("");
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
      <AdminPageHeader
        title="Eventos"
        description="Crea, publica y gestiona los eventos que apareceran en la app de usuarios."
        action={<FlexButton className="h-10 min-h-0 whitespace-nowrap px-4 text-xs tracking-[0.06em]" onClick={startNewEvent}>Nuevo evento</FlexButton>}
      />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}

      {!loading && !error && events.length === 0 ? <AdminEmptyState title="Sin eventos" description="Crea el primer evento de FLEX." /> : null}
      {events.length ? (
        <Card className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle title="Eventos existentes" />
            {!isFormOpen ? <SmallActionButton onClick={startNewEvent}>Nuevo evento</SmallActionButton> : null}
          </div>
          <AdminDataTable columns={["Imagen", "Evento", "Fecha", "Precio", "Estado", "Acciones"]}>
            {events.map((event) => {
              const appearsInHome = event.is_published && isFutureEvent(event);
              const activeTiers = ticketTiers.filter((tier) => tier.event_id === event.id && tier.active).sort((a, b) => a.price_cents - b.price_cents);
              const priceLabel = activeTiers[0]
                ? `Desde ${formatTierPrice(activeTiers[0].price_cents, activeTiers[0].currency)}`
                : cents(event.ticket_price_cents);
              const eventImage = event.image_url || event.cover_image_path || "/images/events/john-coltrane.jpg";
              return (
                <tr key={event.id} className="text-white transition-colors hover:bg-white/[0.025]">
                  <td className="px-3 py-2.5">
                    <div className="size-11 rounded-md bg-cover bg-center ring-1 ring-white/10" style={{ backgroundImage: `url(${eventImage})` }} />
                  </td>
                  <td className="min-w-[220px] px-3 py-2.5">
                    <div className="line-clamp-2 max-w-[320px] font-bold leading-5">{event.title}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{event.artist_name || "Sin artista"} / {event.zone_name || "Sin zona"}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm">{compactDate(event.starts_at)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-[var(--gold-bright)]">{priceLabel}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {event.is_published ? <FlexBadge tone="success">Publicado</FlexBadge> : <FlexBadge tone="gold">Borrador</FlexBadge>}
                      {event.featured ? <FlexBadge tone="gold">Destacado</FlexBadge> : null}
                      {appearsInHome ? <FlexBadge tone="success">Visible home</FlexBadge> : null}
                    </div>
                  </td>
                  <td className="min-w-[250px] px-3 py-2.5">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <SmallActionButton variant="primary" emphasis onClick={() => editEvent(event)}>Editar</SmallActionButton>
                      {event.is_published ? <SmallActionButton variant="ghost" href={`/app/events/${event.id}`}>Ver</SmallActionButton> : null}
                      <SmallActionButton variant="ghost" onClick={() => updateFlags(event.id, { featured: !event.featured })}>{event.featured ? "Quitar destacado" : "Destacar"}</SmallActionButton>
                      <SmallActionButton variant={event.is_published ? "danger" : "success"} onClick={() => updateFlags(event.id, { is_published: !event.is_published })}>{event.is_published ? "Despublicar" : "Publicar"}</SmallActionButton>
                      <SmallActionButton variant="danger" disabled={deletingId === event.id} onClick={() => deleteEvent(event)}>{deletingId === event.id ? "Eliminando" : "Eliminar"}</SmallActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminDataTable>
        </Card>
      ) : null}

      {isFormOpen ? (
        <Card className="border-[var(--gold)]/12 bg-white/[0.025] p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <SectionTitle title={formMode === "edit" ? "Editando evento" : "Crear evento"} />
              {formMode === "edit" ? (
                <p className="-mt-2 text-sm text-[var(--muted)]">
                  {editingEvent?.title ?? "Evento seleccionado"} esta cargado en el formulario.
                </p>
              ) : (
                <p className="-mt-2 text-sm text-[var(--muted)]">Completa los datos principales y publica cuando este listo.</p>
              )}
            </div>
            <SmallActionButton onClick={resetForm}>{formMode === "edit" ? "Cancelar edicion" : "Cerrar formulario"}</SmallActionButton>
          </div>

          <form onSubmit={saveEvent} className="space-y-3.5">
            <FormGroup title="Informacion">
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
              <label className="grid gap-2 md:col-span-2">
                <span className={labelClass}>Descripcion</span>
                <textarea className={`${textareaClass} min-h-20 resize-y`} placeholder="Descripcion corta para la card y el detalle." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </label>
            </FormGroup>

            <FormGroup title="Imagen y enlaces">
              <div className="md:col-span-2">
                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-md border border-white/[0.08] bg-black/30">
                    {imagePreview ? (
                      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})` }} />
                    ) : (
                      <div className="grid h-32 place-items-center px-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Imagen recomendada</div>
                    )}
                  </div>
                  <div className="grid content-start gap-3">
                    <p className="text-sm leading-5 text-[var(--muted)]">Sube una imagen del artista o pega una URL.</p>
                    <input className="gold-focus h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-[var(--gold)] hover:file:text-black" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
                    <input className={inputClass} placeholder="O pega image_url" value={form.image_url} onChange={(event) => { setImageFile(null); setForm({ ...form, image_url: event.target.value }); }} />
                  </div>
                </div>
              </div>
              <label className="grid gap-2">
                <span className={labelClass}>Link artista</span>
                <input className={inputClass} placeholder="https://open.spotify.com/..." value={form.artist_url} onChange={(event) => setForm({ ...form, artist_url: event.target.value })} />
              </label>
              <label className="grid gap-2">
                <span className={labelClass}>Link externo opcional</span>
                <input className={inputClass} placeholder="https://..." value={form.external_url} onChange={(event) => setForm({ ...form, external_url: event.target.value })} />
              </label>
            </FormGroup>

            <FormGroup title="Publicacion y precio">
              <label className="grid gap-2">
                <span className={labelClass}>Capacidad opcional</span>
                <input type="number" min={1} className={`${inputClass} ${numberInputCleanClass}`} placeholder={String(defaultCapacity)} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
              </label>
              <label className="grid gap-2">
                <span className={labelClass}>Precio desde</span>
                <div className="flex h-11 overflow-hidden rounded-md border border-[var(--gold)]/18 bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-within:border-[var(--gold)]/55">
                  <input type="number" min={0} step="0.01" className={`w-full bg-transparent px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 ${numberInputCleanClass}`} placeholder="15.00" value={form.ticket_price} onChange={(event) => setForm({ ...form, ticket_price: event.target.value })} />
                  <span className="grid place-items-center border-l border-white/10 px-3 text-xs font-bold text-[var(--gold)]">EUR</span>
                </div>
                <span className="text-[11px] leading-4 text-[var(--muted)]">Se guarda internamente en centavos.</span>
              </label>
              <ToggleField label="Publicado" helper="Visible para usuarios." checked={form.is_published} onChange={(checked) => setForm({ ...form, is_published: checked })} />
              <ToggleField label="Destacar en home" helper="Puede aparecer en el carrusel principal." checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} />
              <div className="flex items-end justify-end md:col-span-2">
                <FlexButton className="h-10 min-h-0 whitespace-nowrap px-5 text-xs tracking-[0.06em]" disabled={saving}>
                  {saving ? "Guardando" : formMode === "edit" ? "Guardar cambios" : "Crear evento"}
                </FlexButton>
              </div>
            </FormGroup>
          </form>
        </Card>
      ) : null}

      <Card className={editingId && ticketOptionsOpen ? "p-4" : "py-3.5"}>
        <div className={editingId && ticketOptionsOpen ? "mb-4 flex flex-wrap items-start justify-between gap-3" : "flex flex-wrap items-center justify-between gap-3 px-4"}>
          <div>
            <SectionTitle title="Opciones avanzadas de entradas" />
            {!editingId ? <p className="-mt-2 text-sm text-[var(--muted)]">Edita un evento para abrir la gestion de entradas por zona.</p> : null}
            {editingId ? <p className="-mt-2 text-sm text-[var(--muted)]">{ticketOptionsOpen ? "Gestiona entradas por zona del evento seleccionado." : "Entradas por zona disponibles al abrir esta seccion."}</p> : null}
          </div>
          {editingId ? (
            <SmallActionButton onClick={() => setTicketOptionsOpen((open) => !open)}>
              {ticketOptionsOpen ? "Ocultar" : "Abrir"}
            </SmallActionButton>
          ) : null}
        </div>
        {!editingId ? (
          null
        ) : ticketOptionsOpen ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-3">
              {tiersForEditingEvent.length ? (
                tiersForEditingEvent.map((tier) => (
                  <div key={tier.id} className="rounded-lg border border-white/[0.08] bg-white/[0.018] p-3 transition-colors hover:border-[var(--gold)]/18 hover:bg-white/[0.025]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white">{tier.name}</div>
                        <div className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--gold)]">{tier.zone_name || "Sin zona"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatTierPrice(tier.price_cents, tier.currency)}</div>
                        <div className="mt-1">{tier.active ? <FlexBadge tone="success">Activo</FlexBadge> : <FlexBadge>Inactivo</FlexBadge>}</div>
                      </div>
                    </div>
                    {tier.description ? <p className="mt-2 text-sm leading-6 text-white/68">{tier.description}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
                      <span>
                        Capacidad {tier.capacity ?? "-"} / Disponibles {tier.available_quantity ?? "-"} / Orden {tier.sort_order}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <SmallActionButton onClick={() => editTier(tier)}>Editar</SmallActionButton>
                        <SmallActionButton variant={tier.active ? "danger" : "success"} onClick={() => toggleTierActive(tier)}>
                          {tier.active ? "Desactivar" : "Activar"}
                        </SmallActionButton>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.018] p-3.5">
                  <p className="font-bold text-white">Sin precios por zona</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Agrega General, Pista principal, VIP Lounge u otro tipo de entrada para este evento.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={saveTier} className="rounded-lg border border-[var(--gold)]/14 bg-black/22 p-3.5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--gold)]">{editingTierId ? "Editar precio" : "Nuevo precio"}</p>
              <div className="mt-3 grid gap-3">
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
                  <textarea className={`${textareaClass} min-h-20 resize-y`} placeholder="Acceso a zona principal." value={tierForm.description} onChange={(event) => setTierForm({ ...tierForm, description: event.target.value })} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={labelClass}>Precio cents *</span>
                    <input required type="number" min={0} className={`${inputClass} ${numberInputCleanClass}`} placeholder="2000" value={tierForm.price_cents} onChange={(event) => setTierForm({ ...tierForm, price_cents: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className={labelClass}>Moneda</span>
                    <input className={inputClass} placeholder="EUR" value={tierForm.currency} onChange={(event) => setTierForm({ ...tierForm, currency: event.target.value })} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={labelClass}>Capacidad</span>
                    <input type="number" min={0} className={`${inputClass} ${numberInputCleanClass}`} placeholder="400" value={tierForm.capacity} onChange={(event) => setTierForm({ ...tierForm, capacity: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className={labelClass}>Disponibles</span>
                    <input type="number" min={0} className={`${inputClass} ${numberInputCleanClass}`} placeholder="120" value={tierForm.available_quantity} onChange={(event) => setTierForm({ ...tierForm, available_quantity: event.target.value })} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={labelClass}>Orden</span>
                    <input type="number" className={`${inputClass} ${numberInputCleanClass}`} placeholder="0" value={tierForm.sort_order} onChange={(event) => setTierForm({ ...tierForm, sort_order: event.target.value })} />
                  </label>
                  <ToggleField label="Activo" helper="Disponible para venta." checked={tierForm.active} onChange={(checked) => setTierForm({ ...tierForm, active: checked })} />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {editingTierId ? <SmallActionButton onClick={resetTierForm}>Cancelar</SmallActionButton> : null}
                  <FlexButton className="h-10 min-h-0 whitespace-nowrap px-5 text-xs tracking-[0.06em]" disabled={savingTier}>{savingTier ? "Guardando" : editingTierId ? "Guardar precio" : "Agregar precio"}</FlexButton>
                </div>
              </div>
            </form>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
