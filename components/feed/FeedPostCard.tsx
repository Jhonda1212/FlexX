import Link from "next/link";
import { Pin } from "lucide-react";
import { FeedPriorityBadge, FeedTypeBadge, getFeedTypeIcon } from "./FeedBadges";

export type FeedPostView = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  priority: string;
  starts_at: string | null;
  ends_at: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_pinned: boolean;
  is_published?: boolean;
  club_zones?: { name?: string | null } | null;
};

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "Disponible hoy";
  const formatter = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (start && end) return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
  if (start) return `Desde ${formatter.format(new Date(start))}`;
  return `Hasta ${formatter.format(new Date(end as string))}`;
}

export function FeedPostCard({ post }: { post: FeedPostView }) {
  return (
    <article className={`rounded-lg border p-5 transition ${post.is_pinned ? "border-[var(--gold)]/55 bg-[var(--gold)]/10" : "border-white/10 bg-white/[0.035] hover:border-[var(--gold)]/35 hover:bg-white/[0.055]"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-md border border-[var(--gold)]/25 bg-black/35 text-3xl">
            {getFeedTypeIcon(post.type)}
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <FeedTypeBadge type={post.type} />
              <FeedPriorityBadge priority={post.priority} />
              {post.is_pinned ? <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)]"><Pin size={13} /> Fijado</span> : null}
            </div>
            <h2 className="font-display mt-4 text-4xl text-white">{post.title}</h2>
            {post.body ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">{post.body}</p> : null}
          </div>
        </div>
        <div className="text-sm font-semibold text-[var(--gold)] sm:text-right">
          <div>{formatRange(post.starts_at, post.ends_at)}</div>
          {post.club_zones?.name ? <div className="mt-1 text-white/60">{post.club_zones.name}</div> : null}
        </div>
      </div>
      {post.cta_label && post.cta_url ? (
        <Link href={post.cta_url} className="gold-focus mt-5 inline-flex min-h-11 items-center rounded-md bg-[var(--gold)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-black hover:bg-[var(--gold-bright)]">
          {post.cta_label}
        </Link>
      ) : null}
    </article>
  );
}
