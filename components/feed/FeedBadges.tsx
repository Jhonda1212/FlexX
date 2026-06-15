export const feedTypes = ["event", "promotion", "vip", "activity", "stage", "announcement"] as const;
export const feedPriorities = ["low", "normal", "high", "urgent"] as const;

export type FeedPostType = typeof feedTypes[number];
export type FeedPriority = typeof feedPriorities[number];

const typeLabels: Record<FeedPostType, string> = {
  event: "Evento",
  promotion: "Promo",
  activity: "Actividad",
  announcement: "Aviso",
  vip: "VIP",
  stage: "Escenario"
};

const typeMarkers: Record<FeedPostType, string> = {
  event: "EV",
  promotion: "PR",
  activity: "AC",
  announcement: "AV",
  vip: "VIP",
  stage: "ST"
};

const priorityLabels: Record<FeedPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente"
};

const priorityClass: Record<FeedPriority, string> = {
  low: "border-white/15 bg-white/[0.04] text-white/70",
  normal: "border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold-bright)]",
  high: "border-orange-400/35 bg-orange-400/12 text-orange-200",
  urgent: "border-red-400/40 bg-red-500/15 text-red-200"
};

export function getFeedTypeIcon(type: string) {
  const safeType = (feedTypes as readonly string[]).includes(type) ? type as FeedPostType : "announcement";
  return typeMarkers[safeType];
}

export function FeedTypeBadge({ type }: { type: string }) {
  const safeType = (feedTypes as readonly string[]).includes(type) ? type as FeedPostType : "announcement";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold-bright)]">
      <span className="text-[10px]">{typeMarkers[safeType]}</span>
      {typeLabels[safeType]}
    </span>
  );
}

export function FeedPriorityBadge({ priority }: { priority: string }) {
  const safePriority = (feedPriorities as readonly string[]).includes(priority) ? priority as FeedPriority : "normal";
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${priorityClass[safePriority]}`}>
      {priorityLabels[safePriority]}
    </span>
  );
}
