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
import { getFeedPostImageUrl } from "@/components/feed/FeedPostCard";
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
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  club_zones?: { name?: string | null } | null;
  events?: {
    title?: string | null;
    image_url?: string | null;
    cover_image_path?: string | null;
    artist_name?: string | null;
    zone_name?: string | null;
    starts_at?: string | null;
  } | null;
};

const seedEventTitles = new Set([
  "Flex Live Sessions: Jazz Night",
  "Jazz Nights",
  "Latin Urban Night",
  "Reggaeton Classics"
]);

function normalizeFeedImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const withoutPublic = trimmed.replace(/^public\//i, "");
  return withoutPublic.startsWith("/") ? withoutPublic : `/${withoutPublic}`;
}

function extensionForFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
}

function sanitizeImagePrefix(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "feed";
}

function isValidManualImageReference(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  const normalized = trimmed.replace(/^public\//i, "");
  return normalized.length > 0 && !/\s/.test(normalized);
}

function isValidCtaUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//");
  if (!/^https:\/\//i.test(trimmed)) return false;

  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function toForm(post: FeedAdminRow): FeedPostFormState {
  return {
    title: post.title,
    body: post.body ?? "",
    type: post.type,
    priority: post.priority,
    zone_id: post.zone_id ?? "",
    event_id: post.type === "event" ? post.event_id ?? "" : "",
    starts_at: isoInputValue(post.starts_at),
    ends_at: isoInputValue(post.ends_at),
    image_url: post.image_url ?? "",
    cta_label: post.cta_label ?? "",
    cta_url: post.cta_url ?? "",
    is_published: post.is_published,
    is_pinned: post.is_pinned
  };
}

function getDateWindowError(startsAt: string | null | undefined, endsAt: string | null | undefined) {
  if (!startsAt || !endsAt) return "";
  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return "Revisa las fechas de publicacion.";
  if (endTime <= startTime) return "La fecha de fin debe ser posterior a la fecha de inicio.";
  return "";
}

function getVisibilityBadge(post: FeedAdminRow) {
  if (!post.is_published) {
    return {
      label: "SIN PUBLICAR",
      className: "border-white/12 bg-white/[0.04] text-white/58"
    };
  }

  const now = Date.now();
  const startsAt = post.starts_at ? new Date(post.starts_at).getTime() : null;
  const endsAt = post.ends_at ? new Date(post.ends_at).getTime() : null;

  if (startsAt && startsAt > now) {
    return {
      label: "PROGRAMADA",
      className: "border-sky-300/25 bg-sky-400/10 text-sky-100"
    };
  }

  if (endsAt && endsAt < now) {
    return {
      label: "VENCIDA",
      className: "border-red-300/25 bg-red-500/10 text-red-100"
    };
  }

  return {
    label: "VISIBLE AHORA",
    className: "border-green-300/25 bg-green-400/10 text-green-100"
  };
}

function VisibilityBadge({ post }: { post: FeedAdminRow }) {
  const visibility = getVisibilityBadge(post);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${visibility.className}`}>
      {visibility.label}
    </span>
  );
}

function contextLabelForPost(post: FeedAdminRow) {
  if (post.type === "event") return post.events?.title ?? "Evento pendiente";
  return post.club_zones?.name ?? "-";
}

function validateForm(form: FeedPostFormState) {
  if (!form.title.trim()) return "El titulo es obligatorio.";
  if (!(feedTypes as readonly string[]).includes(form.type)) return "Tipo de publicacion invalido.";
  if (!(feedPriorities as readonly string[]).includes(form.priority)) return "Prioridad invalida.";
  if (form.type === "event" && !form.event_id) {
    return "Los anuncios de evento deben vincularse a un evento creado en /admin/events.";
  }
  if (!isValidCtaUrl(form.cta_url)) {
    return "La URL del CTA debe empezar con / o con https://.";
  }
  const dateWindowError = getDateWindowError(form.starts_at, form.ends_at);
  if (dateWindowError) return dateWindowError;
  return "";
}

export default function AdminFeedPage() {
  const [posts, setPosts] = useState<FeedAdminRow[]>([]);
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string; image_url?: string | null; cover_image_path?: string | null }>>([]);
  const [form, setForm] = useState<FeedPostFormState>(emptyFeedPostForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
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
        .select("id, event_id, zone_id, title, body, type, priority, starts_at, ends_at, image_url, cta_label, cta_url, is_published, is_pinned, created_at, club_zones(name), events(title, image_url, cover_image_path, artist_name, zone_name, starts_at)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("club_zones").select("id, name").order("name", { ascending: true }),
      supabase.from("events").select("id, title, image_url, cover_image_path").order("starts_at", { ascending: false })
    ]);
    if (postResult.error) throw postResult.error;
    if (zoneResult.error) throw zoneResult.error;
    if (eventResult.error) throw eventResult.error;
    setPosts((postResult.data ?? []) as FeedAdminRow[]);
    setZones((zoneResult.data ?? []) as Array<{ id: string; name: string }>);
    setEvents(((eventResult.data ?? []) as Array<{ id: string; title: string; image_url?: string | null; cover_image_path?: string | null }>).filter((event) => !seedEventTitles.has(event.title)));
  }

  useEffect(() => {
    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreviewUrl(previewUrl);
      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    }

    setImagePreviewUrl(normalizeFeedImageUrl(form.image_url) ?? "");
    return undefined;
  }, [form.image_url, imageFile]);

  useEffect(() => {
    let active = true;
    load().catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el feed.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setForm(emptyFeedPostForm);
    setImageFile(null);
    setImageInputKey((value) => value + 1);
    setImagePreviewUrl("");
    setEditingId("");
    setShowForm(false);
  }

  function clearImage() {
    setImageFile(null);
    setImageInputKey((value) => value + 1);
    setForm({ ...form, image_url: "" });
  }

  async function uploadFeedImage(file: File, postTitle: string) {
    const supabase = await requireAdmin();
    const safePrefix = sanitizeImagePrefix(postTitle);
    const path = `feed/${safePrefix}-${crypto.randomUUID()}.${extensionForFile(file)}`;
    const { error: uploadError } = await supabase.storage.from("feed-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("feed-images").getPublicUrl(path);
    return data.publicUrl;
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
    if (!imageFile && !isValidManualImageReference(form.image_url)) {
      setError("La imagen debe ser una URL valida o una ruta local que empiece por /.");
      return;
    }
    if (imageFile && !imageFile.type.startsWith("image/")) {
      setError("La imagen seleccionada no es valida.");
      return;
    }
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      setError("La imagen supera el tamaño permitido.");
      return;
    }
    setSaving(true);
    try {
      const supabase = await requireAdmin();
      const { data: userData } = await supabase.auth.getUser();
      let imageUrl = normalizeFeedImageUrl(form.image_url);
      if (imageFile) {
        imageUrl = await uploadFeedImage(imageFile, form.title);
      }
      const payload = {
        event_id: form.type === "event" ? form.event_id || null : null,
        zone_id: form.zone_id || null,
        created_by: userData.user?.id ?? null,
        title: form.title.trim(),
        body: form.body.trim() || null,
        type: form.type,
        priority: form.priority,
        starts_at: fromDateTimeLocal(form.starts_at),
        ends_at: fromDateTimeLocal(form.ends_at),
        image_url: imageUrl,
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

  function handleImageFileChange(file: File | null) {
    setImageFile(file);
    if (file) {
      setForm({ ...form, image_url: "" });
    }
  }

  function handleClearImage() {
    setImageFile(null);
    setImageInputKey((value) => value + 1);
    setForm({ ...form, image_url: "" });
  }

  async function patchPost(id: string, patch: Partial<FeedAdminRow>) {
    setError("");
    setMessage("");
    const currentPost = posts.find((post) => post.id === id);
    const dateWindowError = getDateWindowError(
      typeof patch.starts_at === "string" ? patch.starts_at : currentPost?.starts_at,
      typeof patch.ends_at === "string" ? patch.ends_at : currentPost?.ends_at
    );
    if (dateWindowError) {
      setError(dateWindowError);
      return;
    }
    if (patch.is_published === true && currentPost?.type === "event" && !currentPost.event_id) {
      setError("No se puede publicar un anuncio de evento sin vincularlo a un evento real.");
      return;
    }
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
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
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
            <FeedPostForm
              form={form}
              setForm={setForm}
              zones={zones}
              events={events}
              imagePreviewUrl={imagePreviewUrl}
              imageInputKey={imageInputKey}
              onImageFileChange={handleImageFileChange}
              onClearImage={handleClearImage}
              saving={saving}
              submitLabel={editingId ? "Guardar cambios" : "Crear publicacion"}
            />
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
                <div className="flex items-start gap-3">
                  <div
                    className="h-14 w-16 shrink-0 rounded-md border border-white/10 bg-gradient-to-br from-[var(--gold)]/14 via-red-950/18 to-black bg-cover bg-center"
                    style={getFeedPostImageUrl(post) ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.36)), url(${getFeedPostImageUrl(post)})` } : undefined}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="font-bold">{post.title}</div>
                    <div className="max-w-sm text-xs text-[var(--muted)]">{post.body}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3"><FeedTypeBadge type={post.type} /></td>
              <td className="px-4 py-3"><FeedPriorityBadge priority={post.priority} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <VisibilityBadge post={post} />
                  <StatusBadge status={post.is_published ? "published" : "draft"} />
                  {post.is_pinned ? <StatusBadge status="pinned" /> : null}
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--muted)]">{contextLabelForPost(post)}</td>
              <td className="px-4 py-3">{new Date(post.created_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3">
                <div className="grid min-w-[9rem] grid-cols-1 gap-2 sm:min-w-[13rem] sm:grid-cols-2 [&_button]:min-h-9 [&_button]:w-full [&_button]:px-3 [&_button]:text-[11px] [&_button]:tracking-[0.06em]">
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
