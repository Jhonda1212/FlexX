"use client";

import { useEffect, useMemo, useState } from "react";
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
    <div className="max-w-5xl space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Feed oficial</p>
        <h1 className="font-display mt-2 text-6xl text-white">Hoy en FLEX</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Promociones, live sessions, avisos y actividades publicados por el equipo de FLEX.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            className={`gold-focus min-h-10 rounded-md border px-4 text-xs font-bold uppercase tracking-[0.08em] transition ${filter === item.value ? "border-[var(--gold)] bg-[var(--gold)] text-black" : "border-white/10 bg-white/[0.03] text-white hover:border-[var(--gold)]/60"}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {loading ? <Card><p className="text-[var(--muted)]">Cargando Hoy en FLEX...</p></Card> : null}
      {error ? <Card className="border-red-500/30 bg-red-500/10"><p className="text-red-200">{error}</p></Card> : null}
      {!loading && !error && filteredPosts.length === 0 ? <Card><p className="text-[var(--muted)]">Todavia no hay anuncios para hoy</p></Card> : null}
      <div className="grid gap-4">
        {filteredPosts.map((post) => <FeedPostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
