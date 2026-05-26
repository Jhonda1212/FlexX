import Link from "next/link";
import { CheckCircle2, QrCode, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSectionHeader } from "@/components/ui/FlexSectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { metrics, recentAccess } from "@/lib/demo-data";

export default function GuardDashboard() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <FlexSectionHeader eyebrow="Seguridad FLEX" title="Control de acceso" description="Validacion rapida, lectura clara y estado visible para la puerta." />
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </div>
        <FlexCard>
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Acciones principales</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/guard/scan"><Button className="h-24 w-full"><QrCode size={28} /> Escanear QR</Button></Link>
            <Link href="/guard/reports"><Button variant="ghost" className="h-24 w-full"><CheckCircle2 size={28} /> Ver accesos</Button></Link>
          </div>
        </FlexCard>
      </div>
      <FlexCard>
        <div className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Accesos recientes</div>
        <div className="space-y-4">
          {recentAccess.map((item) => (
            <div key={`${item.name}-${item.time}`} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-4 transition hover:border-[var(--gold)]/35">
              <div>
                <div className="font-semibold text-white">{item.name}</div>
                <div className={item.ok ? "text-sm text-[var(--muted)]" : "text-sm text-red-300"}>{item.detail}</div>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                {item.time}
                {item.ok ? <CheckCircle2 className="text-green-400" size={22} /> : <XCircle className="text-red-400" size={22} />}
              </div>
            </div>
          ))}
        </div>
      </FlexCard>
    </div>
  );
}
