import type { Metric } from "@/lib/types";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{metric.label}</div>
      <div className="mt-2 text-4xl font-semibold text-white">{metric.value}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{metric.hint}</div>
    </div>
  );
}
