"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Crown, Megaphone, Radio } from "lucide-react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { Card } from "@/components/ui/Card";
import { FeedPostCard, type FeedPostView } from "@/components/feed/FeedPostCard";
import { createBrowserSupabase } from "@/lib/supabase";

const priorityRank: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };

const filters = [
  { label: "Todos", value: "all" },
  { label: "Eventos", value: "event" },
  { label: "Promos", value: "promotion" },
  { label: "Actividades", value: "activity" },
  { label: "VIP", value: "vip" },
  { label: "Escenario", value: "stage" },
  { label: "Avisos", value: "announcement" }
];

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

export default function TodayPage() {
  const [posts, setPosts] = useState<FeedPostView[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createBrowserSupabase();
        const now = new Date().toISOString();
        const { data, error: queryError } = await supabase
          .from("daily_feed_posts")
          .select("id, title, body, type, priority, starts_at, ends_at, cta_label, cta_url, is_pinned, club_zones(name)")
          .eq("is_published", true)
          .or(`starts_at.is.null,starts_at.lte.${now}`)
          .or(`ends_at.is.null,ends_at.gte.${now}`)
          .order("is_pinned", { ascending: false })
          .order("starts_at", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        if (active) setPosts(sortPosts((data ?? []) as FeedPostView[]));
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Hoy en FLEX.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((post) => post.type === filter);
  }, [filter, posts]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 overflow-hidden">
      <AppPageHeader
        eyebrow="Mural oficial"
        title="Hoy en FLEX"
        description="Promociones, eventos y avisos oficiales para vivir la noche."
        actions={
          <div className="rounded-lg border border-white/10 bg-black/28 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">En directo</p>
            <p className="mt-2 max-w-56 text-sm leading-6 text-white/72">
              Prioridad, horarios y avisos importantes reunidos en un solo feed.
            </p>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
              {filters.map((item) => (
                <button
                  key={item.value}
                  className={`gold-focus min-h-10 rounded-md border px-4 text-xs font-bold uppercase tracking-[0.08em] transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out active:scale-[0.98] ${filter === item.value ? "border-[var(--gold)] bg-[var(--gold)] text-black shadow-[0_10px_26px_rgba(217,166,64,0.16)]" : "border-white/10 bg-white/[0.03] text-white hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/8 hover:text-white"}`}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? <Card><p className="text-[var(--muted)]">Cargando Hoy en FLEX...</p></Card> : null}
          {error ? <Card className="border-red-500/30 bg-red-500/10"><p className="text-red-200">{error}</p></Card> : null}
          {!loading && !error && filteredPosts.length === 0 ? (
            <AppEmptyState
              icon={<Megaphone size={24} />}
              title="La noche aun esta tranquila"
              description="Cuando el equipo publique promociones, actividades o avisos, apareceran aqui."
              primaryAction={{ href: "/app", label: "Ver proximos eventos", icon: <Radio size={16} /> }}
              secondaryAction={{ href: "/app/vip", label: "Reservar VIP", icon: <Crown size={16} />, variant: "ghost" }}
            />
          ) : null}

          <div className="grid gap-4">
            {filteredPosts.map((post) => <FeedPostCard key={post.id} post={post} />)}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="border-[var(--gold)]/18 bg-white/[0.025]">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-md border border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold)]">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Feed oficial</h2>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Aqui veras anuncios publicados por el equipo de FLEX: promociones, actividades, cambios de horario, VIP y avisos importantes.
                </p>
              </div>
            </div>
          </Card>
          <Card className="hidden border-white/10 bg-white/[0.025] lg:block">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">Lectura rapida</p>
                <p className="mt-2 text-sm leading-6 text-white/66">Los avisos fijados y urgentes siempre aparecen primero.</p>
              </div>
              <ArrowRight className="text-[var(--gold)]" size={18} />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
