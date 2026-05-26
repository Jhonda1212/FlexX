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
  cta_label: "",
  cta_url: "",
  is_published: false,
  is_pinned: false
};

export function FeedPostForm({
  form,
  setForm,
  zones,
  events,
  saving,
  submitLabel
}: {
  form: FeedPostFormState;
  setForm: (form: FeedPostFormState) => void;
  zones: Array<{ id: string; name: string }>;
  events: Array<{ id: string; title: string }>;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Titulo" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
        {feedTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
        {feedPriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
      </select>
      <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.zone_id} onChange={(event) => setForm({ ...form, zone_id: event.target.value })}>
        <option value="">Sin zona</option>
        {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
      </select>
      <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.event_id} onChange={(event) => setForm({ ...form, event_id: event.target.value })}>
        <option value="">Sin evento</option>
        {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
      </select>
      <input type="datetime-local" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
      <input type="datetime-local" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
      <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="CTA label" value={form.cta_label} onChange={(event) => setForm({ ...form, cta_label: event.target.value })} />
      <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="CTA URL (/app/vip o https://...)" value={form.cta_url} onChange={(event) => setForm({ ...form, cta_url: event.target.value })} />
      <textarea className="min-h-28 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" placeholder="Mensaje" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
      <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Publicado</label>
      <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.is_pinned} onChange={(event) => setForm({ ...form, is_pinned: event.target.checked })} /> Fijado</label>
      <button className="gold-focus min-h-12 rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black disabled:opacity-50 md:col-span-2" disabled={saving}>
        {saving ? "Guardando" : submitLabel}
      </button>
    </div>
  );
}
