import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexEmptyState } from "@/components/ui/FlexEmptyState";
import { FlexSectionHeader } from "@/components/ui/FlexSectionHeader";
import { FlexSkeletonCard } from "@/components/ui/FlexSkeleton";

export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <FlexSectionHeader eyebrow="Admin FLEX" title={title} description={description} action={action} />;
}

export function AdminStatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <FlexCard className="hover:border-[var(--gold)]/30">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{label}</div>
      <div className="mt-3 text-4xl font-bold text-white">{value}</div>
      {hint ? <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p> : null}
    </FlexCard>
  );
}

export function AdminDataTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-bold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/10">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return <FlexEmptyState title={title} description={description} />;
}

export function AdminErrorState({ message }: { message: string }) {
  return (
    <FlexCard tone="danger">
      <div className="flex items-start gap-3 text-red-100">
        <AlertTriangle size={22} />
        <div>
          <div className="font-bold">No se pudo cargar esta seccion</div>
          <p className="mt-1 text-sm text-red-100/80">{message}</p>
        </div>
      </div>
    </FlexCard>
  );
}

export function AdminLoadingState({ label = "Cargando datos..." }: { label?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <FlexSkeletonCard />
      <FlexSkeletonCard />
      <FlexCard>
        <div className="flex items-center gap-3 text-[var(--muted)]">
          <Loader2 className="animate-spin" size={20} />
          {label}
        </div>
      </FlexCard>
    </div>
  );
}

export function AdminActionButton({ children, href, onClick, variant = "primary", disabled = false }: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "success";
  disabled?: boolean;
}) {
  if (href) {
    return <Link href={href}><Button variant={variant} disabled={disabled}>{children}</Button></Link>;
  }
  return <Button type="button" variant={variant} disabled={disabled} onClick={onClick}>{children}</Button>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" || status === "paid" || status === "approved" || status === "playing" || status === "called"
      ? "border-green-500/30 bg-green-500/15 text-green-200"
      : status === "pending" || status === "waiting"
        ? "border-[var(--gold)]/30 bg-[var(--gold)]/15 text-[var(--gold-bright)]"
        : "border-red-500/30 bg-red-500/15 text-red-200";

  const badgeTone =
    tone.includes("green") ? "success" :
    tone.includes("red") ? "danger" :
    "gold";

  return <FlexBadge tone={badgeTone}>{status}</FlexBadge>;
}
