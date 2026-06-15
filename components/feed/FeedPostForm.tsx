"use client";

import { feedPriorities, feedTypes } from "./FeedBadges";

export type FeedPostFormState = {
  title: string;
  body: string;
  type: string;
  priority: string;
  zone_id: string;
  event_id: string;
  starts_at: string;
  ends_at: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  is_published: boolean;
  is_pinned: boolean;
};

export const emptyFeedPostForm: FeedPostFormState = {
  title: "",
  body: "",
  type: "announcement",
  priority: "normal",
  zone_id: "",
  event_id: "",
  starts_at: "",
  ends_at: "",
  image_url: "",
  cta_label: "",
  cta_url: "",
  is_published: false,
  is_pinned: false
};

const feedTypeLabels: Record<string, string> = {
  event: "Evento",
  promotion: "Promo",
  vip: "VIP",
  activity: "Actividad",
  stage: "Escenario",
  announcement: "Aviso"
};

function ctaHelpForType(type: string) {
  if (type === "event") return "Destino por defecto: Ver evento -> /app/events/[event_id]. Los anuncios de evento deben vincularse a un evento creado en /admin/events.";
  if (type === "vip") return "Destino por defecto: Reservar VIP -> /app/vip. Puedes asociar una sala VIP como contexto visual.";
  if (type === "stage") return "Destino por defecto: Participar -> /app/my-turn.";
  if (type === "promotion") return "Destino opcional: Ver promo usa la URL manual si existe. Si no hay URL, no se muestra botón.";
  if (type === "activity") return "Destino opcional: Ver actividad usa la URL manual si existe. Si no hay URL, no se muestra botón.";
  return "Destino opcional: Más información usa la URL manual si existe. Si no hay URL, no se muestra botón.";
}

function previewImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const withoutPublic = trimmed.replace(/^public\//i, "");
  return withoutPublic.startsWith("/") ? withoutPublic : `/${withoutPublic}`;
}

export function FeedPostForm({
  form,
  setForm,
  zones,
  events,
  imagePreviewUrl,
  imageInputKey,
  onImageFileChange,
  onClearImage,
  saving,
  submitLabel
}: {
  form: FeedPostFormState;
  setForm: (form: FeedPostFormState) => void;
  zones: Array<{ id: string; name: string }>;
  events: Array<{ id: string; title: string; image_url?: string | null; cover_image_path?: string | null }>;
  imagePreviewUrl: string;
  imageInputKey: number;
  onImageFileChange: (file: File | null) => void;
  onClearImage: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  const datesAreEmpty = !form.starts_at && !form.ends_at;
  const manualImagePreviewUrl = previewImageUrl(form.image_url);
  const selectedEvent = events.find((event) => event.id === form.event_id);
  const eventImagePreviewUrl = selectedEvent?.image_url || selectedEvent?.cover_image_path || "";
  const activeImagePreviewUrl = imagePreviewUrl || manualImagePreviewUrl || eventImagePreviewUrl;
  const isEventPost = form.type === "event";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Titulo" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <select
        className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white"
        value={form.type}
        onChange={(event) => {
          const nextType = event.target.value;
          setForm({ ...form, type: nextType, event_id: nextType === "event" ? form.event_id : "" });
        }}
      >
        {feedTypes.map((type) => <option key={type} value={type}>{feedTypeLabels[type] ?? type}</option>)}
      </select>
      <p className="text-xs leading-5 text-[var(--muted)] md:col-span-2">{ctaHelpForType(form.type)}</p>
      <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
        {feedPriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
      </select>
      <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.zone_id} onChange={(event) => setForm({ ...form, zone_id: event.target.value })}>
        <option value="">Sin zona</option>
        {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
      </select>
      {isEventPost ? (
        <label className="space-y-2 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Evento real vinculado</span>
          <select className="w-full rounded-md border border-[var(--gold)]/30 bg-black/40 px-4 py-3 text-white" value={form.event_id} onChange={(event) => setForm({ ...form, event_id: event.target.value })}>
            <option value="">Selecciona un evento creado en /admin/events</option>
            {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
          </select>
          <span className="block text-xs leading-5 text-[var(--muted)]">
            Los anuncios de evento deben vincularse a un evento creado en /admin/events.
          </span>
        </label>
      ) : null}
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Inicio</span>
        <div className="flex gap-2">
          <input type="datetime-local" className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
          <button type="button" className="gold-focus rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition hover:border-[var(--gold)]/40 hover:text-white" onClick={() => setForm({ ...form, starts_at: "" })}>
            Limpiar
          </button>
        </div>
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Fin</span>
        <div className="flex gap-2">
          <input type="datetime-local" className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
          <button type="button" className="gold-focus rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition hover:border-[var(--gold)]/40 hover:text-white" onClick={() => setForm({ ...form, ends_at: "" })}>
            Limpiar
          </button>
        </div>
      </label>
      <p className="text-xs leading-5 text-[var(--muted)] md:col-span-2">
        {datesAreEmpty
          ? "Visible inmediatamente y sin expiración."
          : "Deja las fechas vacías para mostrarlo inmediatamente sin expiración. Si usas fecha de fin, debe ser posterior al inicio."}
      </p>
      <div className="rounded-lg border border-white/10 bg-black/24 p-3 md:col-span-2">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Imagen</span>
            <div className="grid gap-2">
              <input
                key={imageInputKey}
                className="gold-focus h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-[var(--gold)] hover:file:text-black"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  onImageFileChange(file);
                  if (file) {
                    setForm({ ...form, image_url: "" });
                  }
                }}
              />
              <span className="block text-xs leading-5 text-[var(--muted)]">
                Sube una imagen para la tarjeta del mural. JPG, PNG o WebP, máximo 5 MB.
              </span>
              <input
                className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white"
                placeholder="URL manual opcional: /images/feed/promo-barra.jpg o https://..."
                value={form.image_url}
                onChange={(event) => {
                  onImageFileChange(null);
                  setForm({ ...form, image_url: event.target.value });
                }}
              />
              <span className="block text-xs leading-5 text-[var(--muted)]">
                Si subes un archivo, ese archivo tiene prioridad. La URL manual queda como respaldo.
              </span>
              {form.event_id ? (
                <span className="block text-xs leading-5 text-[var(--gold-bright)]">
                  Si esta publicación está vinculada a un evento y no subes imagen, se usará la imagen del evento.
                </span>
              ) : null}
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div
              className="min-h-28 overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-[var(--gold)]/18 via-red-950/16 to-black bg-cover bg-center"
              style={activeImagePreviewUrl ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.38)), url(${activeImagePreviewUrl})` } : undefined}
            >
              {!activeImagePreviewUrl ? <div className="grid h-full min-h-28 place-items-center px-3 text-center text-xs text-white/42">Sin imagen</div> : null}
            </div>
            <button type="button" className="gold-focus min-h-9 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition hover:border-[var(--gold)]/40 hover:text-white" onClick={onClearImage}>
              Quitar imagen
            </button>
          </div>
        </div>
      </div>
      <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="CTA label opcional" value={form.cta_label} onChange={(event) => setForm({ ...form, cta_label: event.target.value })} />
      <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="CTA URL opcional: /app/vip, /app/my-turn, /app/tickets o https://..." value={form.cta_url} onChange={(event) => setForm({ ...form, cta_url: event.target.value })} />
      <p className="text-xs leading-5 text-[var(--muted)] md:col-span-2">
        Ejemplos: /app/vip, /app/my-turn, /app/tickets. Usa /app/events/[id] solo para publicaciones tipo evento.
      </p>
      <textarea className="min-h-28 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" placeholder="Mensaje" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
      <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Publicado</label>
      <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.is_pinned} onChange={(event) => setForm({ ...form, is_pinned: event.target.checked })} /> Fijado</label>
      <button className="gold-focus min-h-12 rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black disabled:opacity-50 md:col-span-2" disabled={saving}>
        {saving ? "Guardando" : submitLabel}
      </button>
    </div>
  );
}
