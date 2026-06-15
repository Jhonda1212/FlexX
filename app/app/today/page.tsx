"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Crown, Megaphone, Mic2, Music2, Radio, Sparkles, Ticket, Zap } from "lucide-react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { Card } from "@/components/ui/Card";
import { FeedRail } from "@/components/feed/FeedRail";
import { TodaySpotlight, type TodayEventPreview } from "@/components/feed/TodaySpotlight";
import type { FeedPostView } from "@/components/feed/FeedPostCard";
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
  railVariant?: "featured" | "standard" | "compact";
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
    description: "Ofertas de barra, accesos y momentos comerciales de la noche."
  },
  event: {
    title: "Eventos",
    description: "Programacion y anuncios vinculados a shows o sesiones."
  },
  activity: {
    title: "Actividades",
    description: "Acciones especiales, juegos y dinamicas dentro del club."
  },
  vip: {
    title: "VIP",
    description: "Reservas, salas y experiencias premium."
  },
  stage: {
    title: "Escenario",
    description: "Live sessions, turnos y actividad de escenario."
  },
  announcement: {
    title: "Avisos",
    description: "Informacion breve publicada por el equipo FLEX.",
    railVariant: "compact"
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

function CategoryOnlyView({ category, posts }: { category: CategoryKey; posts: FeedPostView[] }) {
  const config = categoryConfig[category];

  return (
    <FeedRail
      title={`Publicaciones de ${config.title.toLowerCase()}`}
      subtitle={config.description}
      posts={posts}
      variant={config.railVariant ?? "standard"}
    />
  );
}

export default function TodayPage() {
  const [posts, setPosts] = useState<FeedPostView[]>([]);
  const [events, setEvents] = useState<TodayEventPreview[]>([]);
  const [filter, setFilter] = useState<FilterItem["value"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createBrowserSupabase();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [postResult, eventResult] = await Promise.all([
          supabase
            .from("daily_feed_posts")
            .select("id, event_id, zone_id, title, body, type, priority, starts_at, ends_at, image_url, cta_label, cta_url, is_published, is_pinned, created_at, club_zones(name), events(title, image_url, cover_image_path, artist_name, zone_name, starts_at)")
            .eq("is_published", true)
            .order("is_pinned", { ascending: false })
            .order("starts_at", { ascending: true, nullsFirst: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("events")
            .select("id, title, starts_at, ends_at, image_url, cover_image_path, artist_name, zone_name, featured")
            .eq("is_published", true)
            .gte("starts_at", todayStart.toISOString())
            .order("starts_at", { ascending: true })
            .limit(6)
        ]);
        if (postResult.error) throw postResult.error;
        if (eventResult.error) throw eventResult.error;
        const publishedPosts = (postResult.data ?? []) as FeedPostView[];
        const activePosts = publishedPosts.filter((post) => isPostInDateWindow(post));
        if (process.env.NODE_ENV !== "production" && publishedPosts.length > 0 && activePosts.length === 0) {
          console.info("Hoy en FLEX: hay publicaciones publicadas, pero ninguna esta dentro de su ventana starts_at/ends_at.", {
            published: publishedPosts.length,
            posts: publishedPosts.map((post) => ({
              id: post.id,
              title: post.title,
              starts_at: post.starts_at,
              ends_at: post.ends_at
            }))
          });
        }
        if (active) {
          setPosts(sortPosts(activePosts));
          setEvents((eventResult.data ?? []) as TodayEventPreview[]);
        }
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

      {!loading && !error && posts.length === 0 && events.length === 0 ? (
        <AppEmptyState
          icon={<Megaphone size={24} />}
          title="La noche todavia esta tranquila"
          description="Cuando el equipo publique promociones, actividades o avisos, apareceran aqui."
          primaryAction={{ href: "/app/events", label: "Ver eventos", icon: <Radio size={16} /> }}
          secondaryAction={{ href: "/app/vip", label: "Reservar VIP", icon: <Crown size={16} />, variant: "ghost" }}
        />
      ) : null}

      {!loading && !error && (posts.length > 0 || events.length > 0) && filter === "all" ? (
        <>
          <TodaySpotlight posts={posts} events={events} />

          <div className="space-y-8">
            {sections.map((section) => {
              const config = categoryConfig[section.category];
              return (
                <FeedRail
                  key={section.category}
                  title={config.title}
                  subtitle={config.description}
                  posts={section.posts}
                  variant={config.railVariant ?? "standard"}
                />
              );
            })}
          </div>
        </>
      ) : null}

      {!loading && !error && (posts.length > 0 || events.length > 0) && filter !== "all" ? (
        filteredPosts.length > 0 ? (
          <CategoryOnlyView category={filter} posts={filteredPosts} />
        ) : (
          <AppEmptyState
            icon={<Sparkles size={24} />}
            title="Sin publicaciones en esta categoria"
            description="Prueba otro filtro para revisar el resto del mural oficial."
            primaryAction={{ href: "/app/today", label: "Ver todos", icon: <Radio size={16} /> }}
          />
        )
      ) : null}

      {!loading && !error && filter !== "all" && filteredPosts.length > 0 ? (
        <FeedRail
          title="Avisos rapidos"
          subtitle={`${filteredPosts.length} publicaciones visibles en el mural.`}
          posts={filteredPosts.slice(0, 8)}
          variant="compact"
        />
      ) : null}
    </div>
  );
}
