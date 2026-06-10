"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Crown, Megaphone, Mic2, Music2, Radio, Sparkles, Ticket, Zap } from "lucide-react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { Card } from "@/components/ui/Card";
import { FeedPostCard, feedTimeLabel, feedTypeLabel, getFeedPostImageUrl, type FeedPostView } from "@/components/feed/FeedPostCard";
import { createBrowserSupabase } from "@/lib/supabase";

const priorityRank: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };

type CategoryKey = "promotion" | "event" | "activity" | "vip" | "stage" | "announcement";

type FilterItem = {
  label: string;
  value: "all" | CategoryKey;
  Icon: LucideIcon;
};

type CategoryConfig = {
  title: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
  visual: string;
  imageUrl?: string;
};

const filters: FilterItem[] = [
  { label: "Todos", value: "all", Icon: Sparkles },
  { label: "Promos", value: "promotion", Icon: Ticket },
  { label: "Eventos", value: "event", Icon: Music2 },
  { label: "Actividades", value: "activity", Icon: Zap },
  { label: "VIP", value: "vip", Icon: Crown },
  { label: "Escenario", value: "stage", Icon: Mic2 },
  { label: "Avisos", value: "announcement", Icon: Megaphone }
];

const sectionOrder: CategoryKey[] = ["promotion", "event", "activity", "vip", "stage", "announcement"];
const categoryAliases: Record<string, CategoryKey> = {
  promo: "promotion",
  promos: "promotion",
  promotion: "promotion",
  promotions: "promotion",
  evento: "event",
  eventos: "event",
  event: "event",
  events: "event",
  actividad: "activity",
  actividades: "activity",
  activity: "activity",
  activities: "activity",
  vip: "vip",
  escenario: "stage",
  stage: "stage",
  aviso: "announcement",
  avisos: "announcement",
  notice: "announcement",
  notices: "announcement",
  announcement: "announcement",
  announcements: "announcement"
};

const categoryConfig: Record<CategoryKey, CategoryConfig> = {
  promotion: {
    title: "Promos",
    description: "Ofertas de barra, accesos y momentos comerciales de la noche.",
    Icon: Ticket,
    accent: "text-emerald-100 border-emerald-300/18 bg-emerald-400/8",
    visual: "from-emerald-400/18 via-[var(--gold)]/10 to-black"
  },
  event: {
    title: "Eventos",
    description: "Programacion y anuncios vinculados a shows o sesiones.",
    Icon: Music2,
    accent: "text-[var(--gold-bright)] border-[var(--gold)]/24 bg-[var(--gold)]/9",
    visual: "from-[var(--gold)]/22 via-black/20 to-black",
    imageUrl: "/images/events/john-coltrane.jpg"
  },
  activity: {
    title: "Actividades",
    description: "Acciones especiales, juegos y dinamicas dentro del club.",
    Icon: Zap,
    accent: "text-fuchsia-100 border-fuchsia-300/16 bg-fuchsia-400/8",
    visual: "from-fuchsia-400/18 via-[var(--gold)]/8 to-black"
  },
  vip: {
    title: "VIP",
    description: "Reservas, salas y experiencias premium.",
    Icon: Crown,
    accent: "text-amber-100 border-amber-300/20 bg-amber-400/8",
    visual: "from-amber-300/18 via-red-900/18 to-black"
  },
  stage: {
    title: "Escenario",
    description: "Live sessions, turnos y actividad de escenario.",
    Icon: Mic2,
    accent: "text-red-100 border-red-300/16 bg-red-400/8",
    visual: "from-red-400/18 via-[var(--gold)]/8 to-black"
  },
  announcement: {
    title: "Avisos",
    description: "Informacion breve publicada por el equipo FLEX.",
    Icon: Megaphone,
    accent: "text-sky-100 border-sky-300/16 bg-sky-400/8",
    visual: "from-sky-400/16 via-[var(--gold)]/8 to-black"
  }
};

function safeCategory(type: string): CategoryKey {
  return categoryAliases[type.trim().toLowerCase()] ?? "announcement";
}

function isPostInDateWindow(post: Pick<FeedPostView, "starts_at" | "ends_at">, now = new Date()) {
  const startsAt = post.starts_at ? new Date(post.starts_at) : null;
  const endsAt = post.ends_at ? new Date(post.ends_at) : null;

  if (startsAt && startsAt.getTime() > now.getTime()) return false;
  if (endsAt && endsAt.getTime() < now.getTime()) return false;
  return true;
}

function sortPosts(posts: FeedPostView[]) {
  return [...posts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return Number(b.is_pinned) - Number(a.is_pinned);
    const priorityDiff = (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
    if (priorityDiff) return priorityDiff;
    if (a.starts_at && b.starts_at) return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    if (a.starts_at && !b.starts_at) return -1;
    if (!a.starts_at && b.starts_at) return 1;
    return 0;
  });
}

function ctaLabelForType(type: string) {
  const category = safeCategory(type);
  if (category === "promotion") return "Ver promo";
  if (category === "vip") return "Reservar VIP";
  if (category === "event") return "Ver evento";
  if (category === "stage") return "Ver escenario";
  return "Mas informacion";
}

function ctaUrlForType(type: string) {
  const category = safeCategory(type);
  if (category === "vip") return "/app/vip";
  if (category === "event") return "/app/events";
  if (category === "stage") return "/app/my-turn";
  return "/app/today";
}

function bodyPreview(body: string | null) {
  const fallback = "Anuncio oficial del equipo FLEX para seguir la noche con informacion clara.";
  const value = body?.trim() || fallback;
  return value.length > 132 ? `${value.slice(0, 129)}...` : value;
}

function postsByCategory(posts: FeedPostView[]) {
  return sectionOrder.map((category) => ({
    category,
    posts: posts.filter((post) => safeCategory(post.type) === category)
  })).filter((section) => section.posts.length > 0);
}

function feedLoadErrorInfo(error: unknown) {
  if (error && typeof error === "object") {
    const supabaseError = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    return {
      message: typeof supabaseError.message === "string" ? supabaseError.message : "Error desconocido",
      details: typeof supabaseError.details === "string" ? supabaseError.details : null,
      hint: typeof supabaseError.hint === "string" ? supabaseError.hint : null,
      code: typeof supabaseError.code === "string" ? supabaseError.code : null
    };
  }

  return {
    message: error instanceof Error ? error.message : String(error),
    details: null,
    hint: null,
    code: null
  };
}

function EditorialCard({ post, featured = false, index = 0 }: { post: FeedPostView; featured?: boolean; index?: number }) {
  const category = safeCategory(post.type);
  const config = categoryConfig[category];
  const Icon = config.Icon;
  const ctaLabel = post.cta_label || ctaLabelForType(post.type);
  const ctaUrl = post.cta_url || ctaUrlForType(post.type);
  const meta = post.club_zones?.name || feedTimeLabel(post);
  const imageUrl = getFeedPostImageUrl(post) || config.imageUrl;

  return (
    <article
      className={`soft-enter group relative isolate overflow-hidden rounded-lg border border-white/10 bg-white/[0.028] shadow-[0_16px_42px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/28 hover:shadow-[0_22px_56px_rgba(0,0,0,0.30)] ${
        featured ? "min-h-[430px] md:min-h-[520px]" : "min-h-[255px]"
      }`}
      style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.visual} transition-transform duration-500 group-hover:scale-[1.02]`} />
        {imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-82 transition-transform duration-500 group-hover:scale-[1.035]"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.34)_38%,rgba(0,0,0,0.86))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(217,166,64,0.16),transparent_15rem)]" />
      </div>

      <div className={`relative flex h-full min-h-[inherit] flex-col justify-end p-4 ${featured ? "sm:p-6" : "sm:p-5"}`}>
        <div className="mb-auto flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] backdrop-blur-sm ${config.accent}`}>
            <Icon size={13} />
            {feedTypeLabel(post.type)}
          </span>
          {post.is_pinned ? (
            <span className="rounded-full border border-[var(--gold)]/22 bg-black/35 px-3 py-1 text-xs font-semibold text-[var(--gold-bright)] backdrop-blur-sm">
              Fijado
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--gold-bright)]">{meta}</p>
          <h2 className={`${featured ? "mt-3 text-4xl sm:text-5xl" : "mt-2 text-2xl"} max-w-3xl font-bold leading-tight text-white`}>
            {post.title}
          </h2>
          <p className={`mt-3 max-w-2xl text-sm leading-6 text-white/74 ${featured ? "sm:text-base sm:leading-7" : ""}`}>
            {bodyPreview(post.body)}
          </p>
          <Link
            href={ctaUrl}
            prefetch={false}
            className="gold-focus mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--gold)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-black transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--gold-bright)]"
          >
            {ctaLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CategorySection({ category, posts }: { category: CategoryKey; posts: FeedPostView[] }) {
  const config = categoryConfig[category];
  const Icon = config.Icon;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className={`grid size-8 place-items-center rounded-md border ${config.accent}`}>
              <Icon size={16} />
            </span>
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/54">{config.description}</p>
        </div>
        <span className="hidden text-sm text-white/40 sm:inline">{posts.length}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => <EditorialCard key={post.id} post={post} index={index} />)}
      </div>
    </section>
  );
}

function CategoryOnlyView({ category, posts }: { category: CategoryKey; posts: FeedPostView[] }) {
  const config = categoryConfig[category];

  return (
    <section className="space-y-4">
      <div className="px-1">
        <p className="text-sm font-semibold text-[var(--gold)]">{config.title}</p>
        <h2 className="mt-1 text-2xl font-bold text-white">Publicaciones de {config.title.toLowerCase()}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">{config.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => <EditorialCard key={post.id} post={post} featured={index === 0} index={index} />)}
      </div>
    </section>
  );
}

export default function TodayPage() {
  const [posts, setPosts] = useState<FeedPostView[]>([]);
  const [filter, setFilter] = useState<FilterItem["value"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createBrowserSupabase();
        const { data, error: queryError } = await supabase
          .from("daily_feed_posts")
          .select("id, title, body, type, priority, starts_at, ends_at, image_url, cta_label, cta_url, is_published, is_pinned, club_zones(name), events(title, image_url, cover_image_path)")
          .eq("is_published", true)
          .order("is_pinned", { ascending: false })
          .order("starts_at", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        const publishedPosts = (data ?? []) as FeedPostView[];
        const activePosts = publishedPosts.filter((post) => isPostInDateWindow(post));
        if (process.env.NODE_ENV !== "production" && publishedPosts.length > 0 && activePosts.length === 0) {
          console.info("Hoy en FLEX: hay publicaciones publicadas, pero ninguna está dentro de su ventana starts_at/ends_at.", {
            published: publishedPosts.length,
            posts: publishedPosts.map((post) => ({
              id: post.id,
              title: post.title,
              starts_at: post.starts_at,
              ends_at: post.ends_at
            }))
          });
        }
        if (active) setPosts(sortPosts(activePosts));
      } catch (loadError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Hoy en FLEX feed load error", feedLoadErrorInfo(loadError));
        }
        if (active) setError("No se pudo cargar Hoy en FLEX ahora.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const highlightedPosts = useMemo(() => posts.slice(0, 4), [posts]);
  const primaryPost = highlightedPosts[0] ?? null;
  const secondaryPosts = highlightedPosts.slice(1, 4);
  const sections = useMemo(() => postsByCategory(posts), [posts]);
  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((post) => safeCategory(post.type) === filter);
  }, [filter, posts]);

  return (
    <div className="mx-auto max-w-6xl space-y-7 overflow-hidden">
      <header className="space-y-3 px-1">
        <span className="inline-flex rounded-full border border-[var(--gold)]/18 bg-[var(--gold)]/7 px-3 py-1 text-xs font-semibold text-[var(--gold-bright)]">
          Mural oficial
        </span>
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl leading-none text-white sm:text-6xl">Hoy en FLEX</h1>
          <p className="mt-3 text-base leading-7 text-white/68">
            Promos, eventos y avisos importantes de la noche, organizados por el equipo FLEX.
          </p>
        </div>
      </header>

      <nav className="-mx-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
          {filters.map((item) => {
            const Icon = item.Icon;
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                className={`gold-focus inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] ${
                  active
                    ? "border-[var(--gold)]/60 bg-[var(--gold)] text-black"
                    : "border-white/10 bg-white/[0.025] text-white/66 hover:border-[var(--gold)]/30 hover:bg-[var(--gold)]/7 hover:text-white"
                }`}
                onClick={() => setFilter(item.value)}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {loading ? <Card><p className="text-[var(--muted)]">Cargando Hoy en FLEX...</p></Card> : null}
      {error ? <Card className="border-red-500/30 bg-red-500/10"><p className="text-red-200">{error}</p></Card> : null}

      {!loading && !error && posts.length === 0 ? (
        <AppEmptyState
          icon={<Megaphone size={24} />}
          title="La noche todavía está tranquila"
          description="Cuando el equipo publique promociones, actividades o avisos, aparecerán aquí."
          primaryAction={{ href: "/app/events", label: "Ver eventos", icon: <Radio size={16} /> }}
          secondaryAction={{ href: "/app/vip", label: "Reservar VIP", icon: <Crown size={16} />, variant: "ghost" }}
        />
      ) : null}

      {!loading && !error && posts.length > 0 && filter === "all" ? (
        <>
          <section className="space-y-4">
            <div className="px-1">
              <p className="text-sm font-semibold text-[var(--gold)]">Destacados de la noche</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Lo primero que conviene mirar</h2>
            </div>
            {primaryPost ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.14fr)_minmax(320px,0.86fr)]">
                <EditorialCard post={primaryPost} featured />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {secondaryPosts.map((post, index) => <EditorialCard key={post.id} post={post} index={index + 1} />)}
                </div>
              </div>
            ) : null}
          </section>

          <div className="space-y-8">
            {sections.map((section) => (
              <CategorySection key={section.category} category={section.category} posts={section.posts} />
            ))}
          </div>
        </>
      ) : null}

      {!loading && !error && posts.length > 0 && filter !== "all" ? (
        filteredPosts.length > 0 ? (
          <CategoryOnlyView category={filter} posts={filteredPosts} />
        ) : (
          <AppEmptyState
            icon={<Sparkles size={24} />}
            title="Sin publicaciones en esta categoría"
            description="Prueba otro filtro para revisar el resto del mural oficial."
            primaryAction={{ href: "/app/today", label: "Ver todos", icon: <Radio size={16} /> }}
          />
        )
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-semibold text-[var(--gold)]">Avisos rápidos</p>
              <h2 className="mt-1 text-xl font-bold text-white">Feed compacto</h2>
            </div>
            <span className="hidden text-sm text-white/40 sm:inline">{filteredPosts.length} visibles</span>
          </div>
          <div className="grid gap-3">
            {filteredPosts.slice(0, 5).map((post) => <FeedPostCard key={post.id} post={post} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
