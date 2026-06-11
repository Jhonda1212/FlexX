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
  return value.length > 168 ? `${value.slice(0, 165)}...` : value;
}

function selectionMeta(selection: SpotlightSelection) {
  if (selection.kind === "event") {
    return {
      label: "Evento proximo",
      title: selection.event.title,
      body: selection.event.zone_name ? `${selection.event.zone_name} · ${dayLabel(selection.event.starts_at)} ${hourLabel(selection.event.starts_at)}` : `${dayLabel(selection.event.starts_at)} ${hourLabel(selection.event.starts_at)}`,
      imageUrl: selection.event.image_url || selection.event.cover_image_path || "/images/events/john-coltrane.jpg",
      visual: fallbackVisualByType.event,
      cta: { label: "Ver evento", href: `/app/events/${selection.event.id}` },
      Icon: Music2
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
    Icon
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

function quickFallbackPosts(posts: FeedPostView[]) {
  return posts
    .filter((post) => post.type === "promotion" || post.type === "vip" || post.type === "stage")
    .filter((post) => getFeedPostCta(post))
    .slice(0, 3);
}

export function TodaySpotlight({ posts, events }: { posts: FeedPostView[]; events: TodayEventPreview[] }) {
  const selection = pickSpotlight(posts, events);
  if (!selection) return null;

  const meta = selectionMeta(selection);
  const agendaEvents = events.filter((event) => event.id !== selection.linkedEventId).slice(0, 3);
  const fallbackPosts = agendaEvents.length > 0 ? [] : quickFallbackPosts(posts);
  const Icon = meta.Icon;

  return (
    <section className="soft-enter grid gap-4 lg:grid-cols-[minmax(0,2.05fr)_minmax(300px,0.95fr)]">
      <article className="group relative isolate min-h-[440px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--gold)]/28 hover:shadow-[0_24px_58px_rgba(0,0,0,0.30)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.visual}`} />
          {meta.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-86 transition-transform duration-500 group-hover:scale-[1.018]"
              style={{ backgroundImage: `url(${meta.imageUrl})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.30)_34%,rgba(0,0,0,0.88))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(240,194,100,0.16),transparent_16rem)]" />
        </div>

        <div className="relative flex min-h-[440px] flex-col justify-end p-5 sm:p-7">
          <div className="mb-auto flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/24 bg-black/35 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)] backdrop-blur-sm">
              <Icon size={14} />
              Spotlight de la noche
            </span>
            <span className="hidden rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-sm sm:inline">
              {meta.label}
            </span>
          </div>

          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[var(--gold-bright)]">{selection.kind === "post" ? feedTimeLabel(selection.post) : "Agenda FLEX"}</p>
            <h2 className="mt-3 text-4xl font-bold leading-none text-white sm:text-5xl">{meta.title}</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/74 sm:text-base sm:leading-7">{meta.body}</p>
            {meta.cta ? (
              <Link
                href={meta.cta.href}
                prefetch={false}
                className="gold-focus mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--gold)] px-5 text-xs font-bold uppercase tracking-[0.08em] text-black transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--gold-bright)]"
              >
                {meta.cta.label}
                <ArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </article>

      <aside className="self-start rounded-lg border border-white/10 bg-white/[0.026] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gold)]">Agenda rapida</p>
            <h3 className="mt-1 text-lg font-bold text-white">Esta noche</h3>
          </div>
          <CalendarClock size={18} className="text-[var(--gold)]" />
        </div>

        {agendaEvents.length > 0 ? (
          <div className="mt-3 divide-y divide-white/10">
            {agendaEvents.map((event) => (
              <Link
                key={event.id}
                href={`/app/events/${event.id}`}
                prefetch={false}
                className="gold-focus group grid grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-3 py-3 transition-[background-color,transform] duration-200 hover:-translate-y-0.5"
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
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-white/70 transition group-hover:border-[var(--gold)]/30 group-hover:text-[var(--gold-bright)]">
                  Ver
                </span>
              </Link>
            ))}
          </div>
        ) : fallbackPosts.length > 0 ? (
          <div className="mt-3 divide-y divide-white/10">
            {fallbackPosts.map((post) => {
              const cta = getFeedPostCta(post);
              if (!cta) return null;
              return (
                <Link
                  key={post.id}
                  href={cta.href}
                  prefetch={false}
                  className="gold-focus group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 transition-[color,transform] duration-200 hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gold)]">{feedTypeLabel(post.type)}</div>
                    <div className="mt-1 truncate text-sm font-bold text-white">{post.title}</div>
                  </div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-white/70 transition group-hover:border-[var(--gold)]/30 group-hover:text-[var(--gold-bright)]">
                    {cta.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-white/10 bg-black/24 p-3">
            <p className="font-bold text-white">La agenda se esta preparando.</p>
            <p className="mt-1.5 text-sm leading-6 text-white/56">Cuando haya eventos o acciones destacadas, apareceran aqui.</p>
          </div>
        )}
      </aside>
    </section>
  );
}
