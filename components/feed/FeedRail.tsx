import { FeedPostCard, type FeedPostView } from "./FeedPostCard";

type FeedRailVariant = "featured" | "standard" | "compact";

function gridClass(count: number) {
  if (count === 1) return "grid gap-3";
  if (count === 2) return "grid gap-4 md:grid-cols-2";
  return "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
}

export function FeedRail({
  title,
  subtitle,
  posts,
  variant = "standard"
}: {
  title: string;
  subtitle?: string;
  posts: FeedPostView[];
  variant?: FeedRailVariant;
}) {
  if (posts.length === 0) return null;

  const single = posts.length === 1;
  const cardVariant = single ? "wide" : variant === "compact" ? "compact" : "grid";

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className={variant === "featured" ? "text-2xl font-bold text-white" : "text-xl font-bold text-white"}>{title}</h2>
          {subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/54">{subtitle}</p> : null}
        </div>
        {posts.length > 1 ? (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/38">
            {`${posts.length} publicaciones`}
          </span>
        ) : null}
      </div>

      <div className={gridClass(posts.length)}>
        {posts.map((post, index) => (
          <FeedPostCard key={post.id} post={post} variant={cardVariant} index={index} />
        ))}
      </div>
    </section>
  );
}
