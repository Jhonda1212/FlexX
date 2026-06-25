"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Crown, Megaphone, Music2, Sparkles, Star } from "lucide-react";
import { feedTimeLabel, feedTypeLabel, getFeedPostCta, getFeedPostImageUrl, type FeedPostView } from "./FeedPostCard";

export type TodayEventPreview = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  image_url: string | null;
  cover_image_path: string | null;
  artist_name: string | null;
  zone_name: string | null;
  featured: boolean | null;
};

type SpotlightSelection =
  | { kind: "post"; post: FeedPostView; linkedEventId: string | null }
  | { kind: "event"; event: TodayEventPreview; linkedEventId: string };

const fallbackVisualByType: Record<string, string> = {
  event: "from-[var(--gold)]/24 via-black/20 to-black",
  promotion: "from-emerald-400/18 via-[var(--gold)]/10 to-black",
  activity: "from-fuchsia-400/18 via-[var(--gold)]/8 to-black",
  announcement: "from-sky-400/16 via-[var(--gold)]/8 to-black",
  vip: "from-amber-300/18 via-red-900/18 to-black",
  stage: "from-red-400/18 via-[var(--gold)]/8 to-black"
};

const priorityLabels: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta prioridad",
  normal: "Prioridad normal",
  low: "Baja prioridad"
};

function postRankTime(post: FeedPostView) {
  const createdAt = post.created_at ? new Date(post.created_at).getTime() : 0;
  const startsAt = post.starts_at ? new Date(post.starts_at).getTime() : 0;
  return Math.max(createdAt, startsAt);
}

function pickSpotlight(posts: FeedPostView[], events: TodayEventPreview[]): SpotlightSelection | null {
  const pinnedHigh = posts
    .filter((post) => post.is_pinned && (post.priority === "high" || post.priority === "urgent"))
    .sort((a, b) => postRankTime(b) - postRankTime(a))[0];
  if (pinnedHigh) return { kind: "post", post: pinnedHigh, linkedEventId: pinnedHigh.type === "event" ? pinnedHigh.event_id ?? null : null };

  const pinnedRecent = posts
    .filter((post) => post.is_pinned)
    .sort((a, b) => postRankTime(b) - postRankTime(a))[0];
  if (pinnedRecent) return { kind: "post", post: pinnedRecent, linkedEventId: pinnedRecent.type === "event" ? pinnedRecent.event_id ?? null : null };

  const nextEvent = events[0];
  if (nextEvent) return { kind: "event", event: nextEvent, linkedEventId: nextEvent.id };

  const firstPost = posts[0];
  if (firstPost) return { kind: "post", post: firstPost, linkedEventId: firstPost.type === "event" ? firstPost.event_id ?? null : null };

  return null;
}

export function getTodaySpotlightPostId(posts: FeedPostView[], events: TodayEventPreview[]) {
  const selection = pickSpotlight(posts, events);
  return selection?.kind === "post" ? selection.post.id : null;
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  if (sameDay) return "Hoy";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(date);
}

function hourLabel(value: string) {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function bodyPreview(body: string | null) {
  const fallback = "Seleccion oficial del equipo FLEX para orientar la noche.";
  const value = body?.trim() || fallback;
  return value.length > 152 ? `${value.slice(0, 149)}...` : value;
}

function selectionMeta(selection: SpotlightSelection) {
  if (selection.kind === "event") {
    return {
      label: "Evento proximo",
      title: selection.event.title,
      body: selection.event.zone_name ? `${selection.event.zone_name} - ${dayLabel(selection.event.starts_at)} ${hourLabel(selection.event.starts_at)}` : `${dayLabel(selection.event.starts_at)} ${hourLabel(selection.event.starts_at)}`,
      imageUrl: selection.event.image_url || selection.event.cover_image_path || "/images/events/john-coltrane.jpg",
      visual: fallbackVisualByType.event,
      cta: { label: "Ver evento", href: `/app/events/${selection.event.id}` },
      Icon: Music2,
      priorityLabel: null
    };
  }

  const post = selection.post;
  const cta = getFeedPostCta(post);
  const type = post.type.trim().toLowerCase();
  const imageUrl = getFeedPostImageUrl(post) || (type === "event" ? "/images/events/john-coltrane.jpg" : "");
  const Icon = type === "vip" ? Crown : type === "event" ? Music2 : type === "stage" ? Star : type === "promotion" ? Sparkles : Megaphone;

  return {
    label: feedTypeLabel(post.type),
    title: post.title,
    body: bodyPreview(post.body),
    imageUrl,
    visual: fallbackVisualByType[type] ?? fallbackVisualByType.announcement,
    cta,
    Icon,
    priorityLabel: priorityLabels[post.priority] ?? priorityLabels.normal
  };
}

function eventStatus(event: TodayEventPreview) {
  const date = new Date(event.starts_at);
  const today = new Date();
  const sameDay = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  if (event.featured) return "Destacado";
  if (sameDay) return "Hoy";
  return "Proximo";
}

function quickFallbackPosts(posts: FeedPostView[], excludePostId: string | null) {
  return posts
    .filter((post) => post.id !== excludePostId)
    .filter((post) => post.type === "promotion" || post.type === "vip" || post.type === "stage")
    .filter((post) => getFeedPostCta(post))
    .slice(0, 3);
}

export function TodaySpotlight({ posts, events }: { posts: FeedPostView[]; events: TodayEventPreview[] }) {
  const selection = pickSpotlight(posts, events);
  if (!selection) return null;

  const meta = selectionMeta(selection);
  const agendaEvents = events.filter((event) => event.id !== selection.linkedEventId).slice(0, 3);
  const selectedPostId = selection.kind === "post" ? selection.post.id : null;
  const fallbackPosts = agendaEvents.length > 0 ? [] : quickFallbackPosts(posts, selectedPostId);
  const Icon = meta.Icon;

  return (
    <section className="soft-enter grid overflow-hidden rounded-lg border border-white/10 bg-white/[0.026] shadow-[0_18px_46px_rgba(0,0,0,0.24)] xl:grid-cols-[minmax(0,1fr)_340px]">
      <article className="group relative isolate min-h-[260px] overflow-hidden border-b border-white/10 transition-colors duration-300 hover:border-[var(--gold)]/28 sm:min-h-[292px] xl:border-b-0 xl:border-r">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.visual}`} />
          {meta.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-72 transition-transform duration-500 group-hover:scale-[1.012]"
              style={{ backgroundImage: `url(${meta.imageUrl})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.62)_48%,rgba(0,0,0,0.30))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(240,194,100,0.12),transparent_13rem)]" />
        </div>

        <div className="relative flex min-h-[260px] flex-col justify-between p-5 sm:min-h-[292px] sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 border-b border-[var(--gold)]/36 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gold-bright)]">
              <Icon size={14} />
              Programa destacado
            </span>
            <span className="text-xs font-semibold text-white/62">{meta.label}</span>
            {meta.priorityLabel ? <span className="text-xs font-semibold text-white/44">{meta.priorityLabel}</span> : null}
          </div>

          <div className="max-w-2xl pt-6">
            <p className="text-sm font-semibold text-[var(--gold-bright)]">{selection.kind === "post" ? feedTimeLabel(selection.post) : "Agenda FLEX"}</p>
            <h2 className="font-display mt-2 text-3xl leading-none text-white [text-wrap:balance] sm:text-4xl">{meta.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/74">{meta.body}</p>
            {meta.cta ? (
              <Link
                href={meta.cta.href}
                prefetch={false}
                className="gold-focus mt-5 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-[var(--gold)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-black transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--gold-bright)]"
              >
                {meta.cta.label}
                <ArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </article>

      <aside className="self-stretch p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gold)]">Agenda rapida</p>
            <h3 className="mt-1 text-lg font-bold text-white">Esta noche</h3>
          </div>
          <CalendarClock size={18} className="text-[var(--gold)]" />
        </div>

        {agendaEvents.length > 0 ? (
          <div className="divide-y divide-white/10">
            {agendaEvents.map((event) => (
              <Link
                key={event.id}
                href={`/app/events/${event.id}`}
                prefetch={false}
                className="gold-focus group grid min-h-16 grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-3 py-3 transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5"
              >
                <div className="rounded-md border border-[var(--gold)]/16 bg-[var(--gold)]/7 px-2 py-1.5 text-center">
                  <div className="text-xs font-bold uppercase text-[var(--gold-bright)]">{dayLabel(event.starts_at)}</div>
                  <div className="mt-1 text-xs text-white/66">{hourLabel(event.starts_at)}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">{event.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/52">
                    {event.zone_name ? <span>{event.zone_name}</span> : null}
                    <span>{eventStatus(event)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : fallbackPosts.length > 0 ? (
          <div className="divide-y divide-white/10">
            {fallbackPosts.map((post) => {
              const cta = getFeedPostCta(post);
              if (!cta) return null;
              return (
                <Link
                  key={post.id}
                  href={cta.href}
                  prefetch={false}
                  className="gold-focus group grid min-h-16 grid-cols-[minmax(0,1fr)] items-center gap-3 py-3 transition-[color,transform] duration-200 hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gold)]">{feedTypeLabel(post.type)}</div>
                    <div className="mt-1 truncate text-sm font-bold text-white">{post.title}</div>
                    <div className="mt-1 text-xs font-semibold text-white/48">{cta.label}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-white/10 bg-black/24 p-3">
            <p className="font-bold text-white">La agenda se esta preparando.</p>
            <p className="mt-1.5 text-sm leading-6 text-white/56">Cuando haya eventos o acciones destacadas, apareceran aqui.</p>
          </div>
        )}
      </aside>
    </section>
  );
}
