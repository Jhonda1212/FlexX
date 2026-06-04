"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Crown, Megaphone, Radio } from "lucide-react";
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
      <section className="relative overflow-hidden rounded-lg border border-[var(--gold)]/24 bg-[linear-gradient(135deg,rgba(217,166,64,0.16),rgba(12,12,12,0.96)_44%,rgba(91,18,24,0.22))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] sm:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-56 bg-[radial-gradient(circle_at_center,rgba(217,166,64,0.14),transparent_68%)] sm:block" />
        <div className="relative z-10 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/28 bg-black/28 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gold-bright)]">
              <Radio size={13} />
              Mural oficial
            </div>
            <h1 className="font-display mt-4 text-5xl leading-none text-white sm:text-6xl">Hoy en FLEX</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/74">
              Promociones, eventos y avisos oficiales para vivir la noche.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/28 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">En directo</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Prioridad, horarios y avisos importantes reunidos en un solo feed.
            </p>
          </div>
        </div>
      </section>

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
            <Card className="border-[var(--gold)]/18 bg-[linear-gradient(145deg,rgba(217,166,64,0.10),rgba(10,10,10,0.96))]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="grid size-12 place-items-center rounded-md border border-[var(--gold)]/28 bg-black/35 text-[var(--gold)]">
                    <Megaphone size={24} />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">La noche aún está tranquila</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/68">
                    Cuando el equipo publique promociones, actividades o avisos, aparecerán aquí.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:w-48">
                  <Link href="/app" className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/8">
                    <CalendarDays size={16} />
                    Ver próximos
                  </Link>
                  <Link href="/app/vip" className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/12 px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)] transition hover:border-[var(--gold)]/55 hover:bg-[var(--gold)]/18">
                    <Crown size={16} />
                    Reservar VIP
                  </Link>
                </div>
              </div>
            </Card>
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
                  Aquí verás anuncios publicados por el equipo de FLEX: promociones, actividades, cambios de horario, VIP y avisos importantes.
                </p>
              </div>
            </div>
          </Card>
          <Card className="hidden border-white/10 bg-white/[0.025] lg:block">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">Lectura rápida</p>
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
