"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { createBrowserSupabase } from "@/lib/supabase";

type TodayPost = {
  id: string;
  title: string;
  type: string;
  priority: string;
};

function toneForPriority(priority: string): "gold" | "danger" | "neutral" {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "gold";
  return "neutral";
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
          .limit(3);

        if (queryError) throw queryError;
        if (active) setPosts((data ?? []) as TodayPost[]);
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
    <FlexCard className={posts.length === 0 && !loading && !error ? "py-4" : ""}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="text-[var(--gold)]" size={20} />
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Hoy en FLEX</h2>
        </div>
        <Link href="/app/today" className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">Ver avisos</Link>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <FlexSkeleton className="h-16" />
          <FlexSkeleton className="h-16" />
          <FlexSkeleton className="h-16" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-200">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-white/[0.025] px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">Hoy todavía está tranquilo</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Cuando haya promociones, actividades o avisos aparecerán aquí.
              </p>
            </div>
            <Link href="/app/today" className="shrink-0">
              <FlexButton variant="ghost" className="w-full sm:w-auto">Ver avisos</FlexButton>
            </Link>
          </div>
        </div>
      ) : null}

      {posts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4 transition-[background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)]/30 hover:bg-white/[0.05]">
              <FlexBadge tone={toneForPriority(post.priority)}>{post.type}</FlexBadge>
              <div className="mt-3 line-clamp-2 text-sm font-bold text-white">{post.title}</div>
            </div>
          ))}
        </div>
      ) : null}
    </FlexCard>
  );
}
