import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarClock, Crown, MapPin, Megaphone, Mic2, Music2, Pin, ShieldAlert, Shirt, Sparkles, Ticket } from "lucide-react";

export type FeedPostView = {
  id: string;
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
  club_zones?: { name?: string | null } | null;
  events?: { title?: string | null; image_url?: string | null; cover_image_path?: string | null } | null;
};

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

function getTypeStyle(type: string) {
  return typeStyles[typeAliases[type.trim().toLowerCase()] ?? "announcement"];
}

export function getFeedPostImageUrl(post: Pick<FeedPostView, "image_url" | "events">) {
  return post.image_url || post.events?.image_url || post.events?.cover_image_path || "";
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

export function FeedPostCard({ post }: { post: FeedPostView }) {
  const typeStyle = getTypeStyle(post.type);
  const Icon = typeStyle.Icon;
  const priorityLabel = priorityLabels[post.priority] ?? priorityLabels.normal;
  const showPriority = post.priority === "urgent" || post.priority === "high";
  const imageUrl = getFeedPostImageUrl(post);

  return (
    <article
      className={`rounded-lg border p-4 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,0.24)] ${
        post.is_pinned
          ? "border-[var(--gold)]/24 bg-[var(--gold)]/7 hover:border-[var(--gold)]/36"
          : "border-white/10 bg-white/[0.028] hover:border-white/16 hover:bg-white/[0.042]"
        }`}
    >
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
          {post.body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">{post.body}</p> : null}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/54">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={14} className="text-[var(--gold)]/80" />
              {formatRange(post.starts_at, post.ends_at)}
            </span>
            {post.club_zones?.name ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--gold)]/80" />
                {post.club_zones.name}
              </span>
            ) : null}
          </div>
        </div>
        </div>

        {post.cta_label && post.cta_url ? (
          <Link
            href={post.cta_url}
            prefetch={false}
            className="gold-focus inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 text-xs font-bold text-white transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px hover:border-[var(--gold)]/35 hover:bg-[var(--gold)]/8"
          >
            {post.cta_label}
            <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
