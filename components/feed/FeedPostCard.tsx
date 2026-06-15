import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarClock, Crown, MapPin, Megaphone, Mic2, Music2, Pin, ShieldAlert, Shirt, Sparkles, Ticket } from "lucide-react";

export type FeedPostView = {
  id: string;
  event_id?: string | null;
  zone_id?: string | null;
  title: string;
  body: string | null;
  type: string;
  priority: string;
  starts_at: string | null;
  ends_at: string | null;
  image_url?: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_pinned: boolean;
  is_published?: boolean;
  created_at?: string | null;
  club_zones?: { name?: string | null } | null;
  events?: {
    title?: string | null;
    image_url?: string | null;
    cover_image_path?: string | null;
    artist_name?: string | null;
    zone_name?: string | null;
    starts_at?: string | null;
  } | null;
};

export type FeedPostCta = {
  label: string;
  href: string;
};

const seedEventTitles = new Set([
  "Flex Live Sessions: Jazz Night",
  "Jazz Nights",
  "Latin Urban Night",
  "Reggaeton Classics"
]);

type FeedTypeStyle = {
  label: string;
  Icon: LucideIcon;
  className: string;
};

const typeStyles: Record<string, FeedTypeStyle> = {
  event: { label: "Evento", Icon: Music2, className: "border-[var(--gold)]/18 bg-[var(--gold)]/7 text-[var(--gold-bright)]" },
  promotion: { label: "Promo", Icon: Ticket, className: "border-emerald-300/16 bg-emerald-400/7 text-emerald-100" },
  activity: { label: "Actividad", Icon: Sparkles, className: "border-fuchsia-300/14 bg-fuchsia-400/7 text-fuchsia-100" },
  announcement: { label: "Aviso", Icon: Megaphone, className: "border-sky-300/16 bg-sky-400/7 text-sky-100" },
  vip: { label: "VIP", Icon: Crown, className: "border-amber-300/18 bg-amber-400/7 text-amber-100" },
  stage: { label: "Escenario", Icon: Mic2, className: "border-red-300/14 bg-red-400/7 text-red-100" },
  security: { label: "Seguridad", Icon: ShieldAlert, className: "border-orange-300/16 bg-orange-400/7 text-orange-100" },
  storage: { label: "Storage", Icon: Shirt, className: "border-white/10 bg-white/[0.035] text-white/70" }
};

const typeAliases: Record<string, keyof typeof typeStyles> = {
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
  announcements: "announcement",
  security: "security",
  seguridad: "security",
  storage: "storage",
  guardarropa: "storage"
};

const priorityLabels: Record<string, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente"
};

const visualStyles: Record<string, { visual: string; imageUrl?: string }> = {
  event: { visual: "from-[var(--gold)]/22 via-black/20 to-black", imageUrl: "/images/events/john-coltrane.jpg" },
  promotion: { visual: "from-emerald-400/18 via-[var(--gold)]/10 to-black" },
  activity: { visual: "from-fuchsia-400/18 via-[var(--gold)]/8 to-black" },
  announcement: { visual: "from-sky-400/16 via-[var(--gold)]/8 to-black" },
  vip: { visual: "from-amber-300/18 via-red-900/18 to-black" },
  stage: { visual: "from-red-400/18 via-[var(--gold)]/8 to-black" },
  security: { visual: "from-orange-400/16 via-[var(--gold)]/8 to-black" },
  storage: { visual: "from-white/12 via-[var(--gold)]/8 to-black" }
};

function getTypeStyle(type: string) {
  return typeStyles[typeAliases[type.trim().toLowerCase()] ?? "announcement"];
}

function getSafeType(type: string) {
  return typeAliases[type.trim().toLowerCase()] ?? "announcement";
}

export function getFeedPostImageUrl(post: Pick<FeedPostView, "image_url" | "events">) {
  return post.image_url || post.events?.image_url || post.events?.cover_image_path || "";
}

function safeCtaUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed.startsWith("//") ? "" : trimmed;
  if (!/^https:\/\//i.test(trimmed)) return "";

  try {
    return new URL(trimmed).href;
  } catch {
    return "";
  }
}

export function getFeedPostCta(post: Pick<FeedPostView, "type" | "event_id" | "cta_label" | "cta_url" | "events">): FeedPostCta | null {
  const type = getSafeType(post.type);
  const manualUrl = safeCtaUrl(post.cta_url);
  if (manualUrl) {
    const fallbackLabel =
      type === "event" ? "Ver evento" :
      type === "vip" ? "Reservar VIP" :
      type === "stage" ? "Participar" :
      type === "promotion" ? "Ver promo" :
      type === "activity" ? "Ver actividad" :
      "Más información";
    return {
      label: post.cta_label?.trim() || fallbackLabel,
      href: manualUrl
    };
  }

  if (type === "event" && post.event_id && !seedEventTitles.has(post.events?.title ?? "")) {
    return { label: post.cta_label?.trim() || "Ver evento", href: `/app/events/${post.event_id}` };
  }

  if (type === "vip") {
    return { label: post.cta_label?.trim() || "Reservar VIP", href: "/app/vip" };
  }

  if (type === "stage") {
    return { label: post.cta_label?.trim() || "Participar", href: "/app/my-turn" };
  }

  return null;
}

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "Disponible hoy";
  const formatter = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (start && end) return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
  if (start) return `Desde ${formatter.format(new Date(start))}`;
  return `Hasta ${formatter.format(new Date(end as string))}`;
}

export function feedTypeLabel(type: string) {
  return getTypeStyle(type).label;
}

export function feedTimeLabel(post: Pick<FeedPostView, "starts_at" | "ends_at">) {
  return formatRange(post.starts_at, post.ends_at);
}

function bodyPreview(body: string | null, limit: number) {
  const fallback = "Anuncio oficial del equipo FLEX para seguir la noche con información clara.";
  const value = body?.trim() || fallback;
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

export function FeedPostCard({ post, variant = "list", index = 0 }: { post: FeedPostView; variant?: "list" | "featured" | "standard" | "compact"; index?: number }) {
  const typeStyle = getTypeStyle(post.type);
  const Icon = typeStyle.Icon;
  const safeType = getSafeType(post.type);
  const priorityLabel = priorityLabels[post.priority] ?? priorityLabels.normal;
  const showPriority = post.priority === "urgent" || post.priority === "high";
  const visual = visualStyles[safeType] ?? visualStyles.announcement;
  const imageUrl = getFeedPostImageUrl(post) || visual.imageUrl || "";
  const cta = getFeedPostCta(post);
  const eventHref = safeType === "event" && post.event_id ? `/app/events/${post.event_id}` : null;
  const zoneLabel = post.club_zones?.name || post.events?.zone_name || "";

  if (variant !== "list") {
    const featured = variant === "featured";
    const compact = variant === "compact";
    const minHeight = featured ? "min-h-[390px] sm:min-h-[460px]" : compact ? "min-h-[205px]" : "min-h-[270px]";
    const titleSize = featured ? "text-3xl sm:text-4xl" : compact ? "text-xl" : "text-2xl";
    const bodyLimit = featured ? 156 : compact ? 90 : 118;

    const cardClassName = `soft-enter group relative isolate block h-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.028] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--gold)]/26 hover:shadow-[0_18px_42px_rgba(0,0,0,0.24)] ${minHeight}`;
    const cardContent = (
      <>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${visual.visual} transition-transform duration-500 group-hover:scale-[1.015]`} />
          {imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-82 transition-transform duration-500 group-hover:scale-[1.025]"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.32)_40%,rgba(0,0,0,0.86))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(217,166,64,0.14),transparent_15rem)]" />
        </div>

        <div className={`relative flex h-full min-h-[inherit] flex-col justify-end ${featured ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}>
          <div className="mb-auto flex items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] backdrop-blur-sm ${typeStyle.className}`}>
              <Icon size={13} />
              {typeStyle.label}
            </span>
            {post.is_pinned ? (
              <span className="rounded-full border border-[var(--gold)]/22 bg-black/35 px-3 py-1 text-xs font-semibold text-[var(--gold-bright)] backdrop-blur-sm">
                Fijado
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--gold-bright)]">{zoneLabel || formatRange(post.starts_at, post.ends_at)}</p>
            <h2 className={`mt-2 max-w-3xl font-bold leading-tight text-white ${titleSize}`}>{post.title}</h2>
            {eventHref ? (
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)]">
                Ver evento
                <ArrowRight size={14} />
              </span>
            ) : (
              <p className={`mt-3 max-w-2xl text-sm leading-6 text-white/74 ${compact ? "line-clamp-2" : ""}`}>{bodyPreview(post.body, bodyLimit)}</p>
            )}
            {cta && !eventHref ? (
              <Link
                href={cta.href}
                prefetch={false}
                className="gold-focus mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--gold)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-black transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--gold-bright)]"
              >
                {cta.label}
                <ArrowRight size={15} />
              </Link>
            ) : null}
          </div>
        </div>
      </>
    );

    if (eventHref) {
      return (
        <Link href={eventHref} prefetch={false} className={`gold-focus ${cardClassName}`} style={{ animationDelay: `${Math.min(index, 5) * 35}ms` }}>
          {cardContent}
        </Link>
      );
    }

    return (
      <article className={cardClassName} style={{ animationDelay: `${Math.min(index, 5) * 35}ms` }}>
        {cardContent}
      </article>
    );
  }

  const listClassName = `rounded-lg border p-4 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,0.24)] ${
    post.is_pinned
      ? "border-[var(--gold)]/24 bg-[var(--gold)]/7 hover:border-[var(--gold)]/36"
      : "border-white/10 bg-white/[0.028] hover:border-white/16 hover:bg-white/[0.042]"
    }`;
  const listContent = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          {imageUrl ? (
            <div
              className="min-h-28 rounded-md border border-white/10 bg-gradient-to-br from-[var(--gold)]/18 via-red-950/16 to-black bg-cover bg-center sm:h-32 sm:w-40 sm:shrink-0"
              style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.42)), url(${imageUrl})` }}
              aria-hidden="true"
            />
          ) : null}
          <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${typeStyle.className}`}>
              <Icon size={13} />
              {typeStyle.label}
            </span>
            {showPriority ? (
              <span className="inline-flex rounded-full border border-red-300/18 bg-red-500/8 px-2.5 py-1 text-xs font-semibold text-red-100">
                {priorityLabel}
              </span>
            ) : null}
            {post.is_pinned ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/18 bg-[var(--gold)]/8 px-2.5 py-1 text-xs font-semibold text-[var(--gold-bright)]">
                <Pin size={12} />
                Fijado
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">{post.title}</h2>
          {post.body && !eventHref ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">{post.body}</p> : null}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/54">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={14} className="text-[var(--gold)]/80" />
              {formatRange(post.starts_at, post.ends_at)}
            </span>
            {zoneLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--gold)]/80" />
                {zoneLabel}
              </span>
            ) : null}
          </div>
        </div>
        </div>

        {eventHref ? (
          <span className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 text-xs font-bold text-white transition-[background-color,border-color,color,transform] duration-200 group-hover:border-[var(--gold)]/35 group-hover:bg-[var(--gold)]/8">
            Ver evento
            <ArrowRight size={14} />
          </span>
        ) : cta ? (
          <Link
            href={cta.href}
            prefetch={false}
            className="gold-focus inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 text-xs font-bold text-white transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px hover:border-[var(--gold)]/35 hover:bg-[var(--gold)]/8"
          >
            {cta.label}
            <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
    </>
  );

  if (eventHref) {
    return (
      <Link href={eventHref} prefetch={false} className={`gold-focus group block ${listClassName}`}>
        {listContent}
      </Link>
    );
  }

  return (
    <article className={listClassName}>
      {listContent}
    </article>
  );
}
