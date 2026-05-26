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
import { FlexCard } from "@/components/ui/FlexCard";
import { FeedPriorityBadge, FeedTypeBadge, feedPriorities, feedTypes } from "@/components/feed/FeedBadges";
import { FeedPostForm, emptyFeedPostForm, type FeedPostFormState } from "@/components/feed/FeedPostForm";
import { fromDateTimeLocal, isoInputValue, requireAdmin } from "@/lib/admin-actions";

type FeedAdminRow = {
  id: string;
  event_id: string | null;
  zone_id: string | null;
  title: string;
  body: string | null;
  type: string;
  priority: string;
  starts_at: string | null;
  ends_at: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  club_zones?: { name?: string | null } | null;
  events?: { title?: string | null } | null;
};

function toForm(post: FeedAdminRow): FeedPostFormState {
  return {
    title: post.title,
    body: post.body ?? "",
    type: post.type,
    priority: post.priority,
    zone_id: post.zone_id ?? "",
    event_id: post.event_id ?? "",
    starts_at: isoInputValue(post.starts_at),
    ends_at: isoInputValue(post.ends_at),
    cta_label: post.cta_label ?? "",
    cta_url: post.cta_url ?? "",
    is_published: post.is_published,
    is_pinned: post.is_pinned
  };
}

function validateForm(form: FeedPostFormState) {
  if (!form.title.trim()) return "El titulo es obligatorio.";
  if (!(feedTypes as readonly string[]).includes(form.type)) return "Tipo de publicacion invalido.";
  if (!(feedPriorities as readonly string[]).includes(form.priority)) return "Prioridad invalida.";
  if (form.cta_url && !form.cta_url.startsWith("/") && !form.cta_url.startsWith("https://")) {
    return "La URL del CTA debe empezar con / o con https://.";
  }
  if (form.starts_at && form.ends_at && new Date(form.ends_at).getTime() <= new Date(form.starts_at).getTime()) {
    return "La fecha de fin debe ser mayor que la fecha de inicio.";
  }
  return "";
}

export default function AdminFeedPage() {
  const [posts, setPosts] = useState<FeedAdminRow[]>([]);
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [form, setForm] = useState<FeedPostFormState>(emptyFeedPostForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = await requireAdmin();
    const [postResult, zoneResult, eventResult] = await Promise.all([
      supabase
        .from("daily_feed_posts")
        .select("id, event_id, zone_id, title, body, type, priority, starts_at, ends_at, cta_label, cta_url, is_published, is_pinned, created_at, club_zones(name), events(title)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("club_zones").select("id, name").order("name", { ascending: true }),
      supabase.from("events").select("id, title").order("starts_at", { ascending: false })
    ]);
    if (postResult.error) throw postResult.error;
    if (zoneResult.error) throw zoneResult.error;
    if (eventResult.error) throw eventResult.error;
    setPosts((postResult.data ?? []) as FeedAdminRow[]);
    setZones((zoneResult.data ?? []) as Array<{ id: string; name: string }>);
    setEvents((eventResult.data ?? []) as Array<{ id: string; title: string }>);
  }

  useEffect(() => {
    let active = true;
    load().catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el feed.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setForm(emptyFeedPostForm);
    setEditingId("");
    setShowForm(false);
  }

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const validation = validateForm(form);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    try {
      const supabase = await requireAdmin();
      const { data: userData } = await supabase.auth.getUser();
      const payload = {
        event_id: form.event_id || null,
        zone_id: form.zone_id || null,
        created_by: userData.user?.id ?? null,
        title: form.title.trim(),
        body: form.body.trim() || null,
        type: form.type,
        priority: form.priority,
        starts_at: fromDateTimeLocal(form.starts_at),
        ends_at: fromDateTimeLocal(form.ends_at),
        cta_label: form.cta_label.trim() || null,
        cta_url: form.cta_url.trim() || null,
        is_published: form.is_published,
        is_pinned: form.is_pinned
      };
      const result = editingId
        ? await supabase.from("daily_feed_posts").update(payload).eq("id", editingId)
        : await supabase.from("daily_feed_posts").insert(payload);
      if (result.error) throw result.error;
      setMessage(editingId ? "Publicacion actualizada." : "Publicacion creada.");
      resetForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la publicacion.");
    } finally {
      setSaving(false);
    }
  }

  async function patchPost(id: string, patch: Partial<FeedAdminRow>) {
    setError("");
    setMessage("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("daily_feed_posts").update(patch).eq("id", id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar la publicacion.");
    }
  }

  async function deletePost(id: string) {
    setError("");
    setMessage("");
    try {
      const supabase = await requireAdmin();
      const { error: deleteError } = await supabase.from("daily_feed_posts").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setMessage("Publicacion eliminada.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo eliminar la publicacion.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Hoy en FLEX"
        description="Feed oficial para promociones, avisos y actividades del dia."
        action={<AdminActionButton onClick={() => { setShowForm(true); setEditingId(""); setForm(emptyFeedPostForm); }}>Crear publicacion</AdminActionButton>}
      />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <FlexCard tone="success"><p className="text-green-200">{message}</p></FlexCard> : null}
      {showForm ? (
        <Card>
          <SectionTitle title={editingId ? "Editar publicacion" : "Crear publicacion"} />
          <form onSubmit={savePost}>
            <FeedPostForm form={form} setForm={setForm} zones={zones} events={events} saving={saving} submitLabel={editingId ? "Guardar cambios" : "Crear publicacion"} />
          </form>
          <div className="mt-3">
            <AdminActionButton variant="ghost" onClick={resetForm}>Cancelar</AdminActionButton>
          </div>
        </Card>
      ) : null}
      {!loading && !error && posts.length === 0 ? <AdminEmptyState title="Sin publicaciones" description="Crea la primera publicacion oficial de Hoy en FLEX." /> : null}
      {posts.length ? (
        <AdminDataTable columns={["Publicacion", "Tipo", "Prioridad", "Estado", "Contexto", "Creada", "Acciones"]}>
          {posts.map((post) => (
            <tr key={post.id} className="text-white">
              <td className="px-4 py-3">
                <div className="font-bold">{post.title}</div>
                <div className="max-w-sm text-xs text-[var(--muted)]">{post.body}</div>
              </td>
              <td className="px-4 py-3"><FeedTypeBadge type={post.type} /></td>
              <td className="px-4 py-3"><FeedPriorityBadge priority={post.priority} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={post.is_published ? "published" : "draft"} />
                  {post.is_pinned ? <StatusBadge status="pinned" /> : null}
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--muted)]">{post.club_zones?.name ?? post.events?.title ?? "-"}</td>
              <td className="px-4 py-3">{new Date(post.created_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <AdminActionButton variant="ghost" onClick={() => { setEditingId(post.id); setForm(toForm(post)); setShowForm(true); }}>Editar</AdminActionButton>
                  <AdminActionButton variant={post.is_published ? "danger" : "success"} onClick={() => patchPost(post.id, { is_published: !post.is_published })}>{post.is_published ? "Despublicar" : "Publicar"}</AdminActionButton>
                  <AdminActionButton variant="ghost" onClick={() => patchPost(post.id, { is_pinned: !post.is_pinned })}>{post.is_pinned ? "Desfijar" : "Fijar"}</AdminActionButton>
                  <AdminActionButton variant="danger" onClick={() => deletePost(post.id)}>Eliminar</AdminActionButton>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
