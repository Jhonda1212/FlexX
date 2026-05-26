import { Card, SectionTitle } from "./Card";

export function SimpleListPage({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="max-w-4xl">
      <SectionTitle title={title} />
      <Card>
        <p className="text-[var(--muted)]">{description}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-white">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
