"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { createBrowserSupabase } from "@/lib/supabase";

type TodayPost = {
  id: string;
  title: string;
  type: string;
  priority: string;
};

const homeFeedTypes = new Set(["promotion", "vip", "stage", "activity", "announcement"]);

function pickHomePosts(posts: TodayPost[]) {
  const nonEventPosts = posts.filter((post) => homeFeedTypes.has(post.type));
  if (nonEventPosts.length > 0) return nonEventPosts.slice(0, 3);
  const eventFallback = posts.find((post) => post.type === "event");
  return eventFallback ? [eventFallback] : [];
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    announcement: "Aviso",
    promotion: "Promo",
    vip: "VIP",
    stage: "Escenario",
    activity: "Actividad",
    event: "Evento"
  };
  return labels[type] ?? type;
}

function priorityLabel(priority: string) {
  if (priority === "urgent") return "Urgente";
  if (priority === "high") return "Destacado";
  return "Programacion";
}

export function HomeTodayPreview() {
  const [posts, setPosts] = useState<TodayPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const now = new Date().toISOString();
        const supabase = createBrowserSupabase();
        const { data, error: queryError } = await supabase
          .from("daily_feed_posts")
          .select("id, title, type, priority")
          .eq("is_published", true)
          .or(`starts_at.is.null,starts_at.lte.${now}`)
          .or(`ends_at.is.null,ends_at.gte.${now}`)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(6);

        if (queryError) throw queryError;
        if (active) setPosts(pickHomePosts((data ?? []) as TodayPost[]));
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

  return (
    <FlexCard className={posts.length === 0 && !loading && !error ? "p-4" : "p-4 sm:p-5"}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Cartelera oficial</p>
          <h2 className="font-display mt-1 text-3xl leading-none text-white">Hoy en FLEX</h2>
          <p className="mt-2 text-sm leading-5 text-[var(--muted)]">Promos, avisos y movimientos rapidos de la noche.</p>
        </div>
        <Link
          href="/app/today"
          prefetch={false}
          className="gold-focus inline-flex min-h-11 w-fit shrink-0 items-center rounded-[var(--radius-control)] text-xs font-bold uppercase tracking-[0.08em] text-white/62 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-[var(--gold)]"
        >
          Ver mural
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-white/10 border-y border-white/10">
          <FlexSkeleton className="my-3 h-14" />
          <FlexSkeleton className="my-3 h-14" />
          <FlexSkeleton className="my-3 h-14" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-200">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <div className="border-y border-white/10 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">Hoy todavia esta tranquilo</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Promos, avisos y movimientos rapidos de la noche apareceran aqui.
              </p>
            </div>
            <Link
              href="/app/today"
              prefetch={false}
              className="gold-focus inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-control)] text-sm font-bold text-[var(--gold)] underline decoration-[var(--gold)]/30 underline-offset-4"
            >
              Ver mural
            </Link>
          </div>
        </div>
      ) : null}

      {posts.length > 0 ? (
        <div className="border-y border-white/10">
          {posts.map((post, index) => {
            const priority = priorityLabel(post.priority);
            const type = typeLabel(post.type);
            const highlighted = post.priority === "urgent" || post.priority === "high";

            return (
              <article
                key={post.id}
                className={`grid gap-2.5 py-2.5 ${index > 0 ? "border-t border-white/10" : ""} lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-4`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 lg:block">
                    <div className={`text-[11px] font-bold uppercase leading-4 tracking-[0.12em] ${highlighted ? "text-[var(--gold)]" : "text-white/52"}`}>
                      {priority}
                    </div>
                    <div className="hidden mt-1.5 h-px bg-[linear-gradient(90deg,rgba(217,166,64,0.34),transparent)] lg:block" />
                    <div className="text-[11px] font-semibold uppercase leading-4 tracking-[0.1em] text-white/48 lg:mt-1.5">
                      {type}
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold leading-6 text-white">{post.title}</h3>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </FlexCard>
  );
}
