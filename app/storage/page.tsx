import Link from "next/link";
import { QrCode, Shirt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlexCard } from "@/components/ui/FlexCard";
import { storageItems } from "@/lib/demo-data";

export default function StorageDashboard() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <FlexCard tone="gold">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Storage FLEX</p>
        <h1 className="font-display mt-2 text-4xl text-white">Storage activo</h1>
        <p className="mt-2 text-sm text-white/72">Registro y entrega de prendas con QR operativo.</p>
        <div className="text-6xl font-bold text-white">42</div>
        <p className="mt-2 text-white/72">Prendas en custodia ahora.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/storage/new"><Button className="w-full"><Shirt size={22} /> Registrar prenda</Button></Link>
          <Link href="/storage/scan"><Button variant="ghost" className="w-full"><QrCode size={22} /> Escanear QR</Button></Link>
          <Link href="/storage/active"><Button variant="ghost" className="w-full">Ver activas</Button></Link>
        </div>
      </FlexCard>
      <FlexCard>
        <div className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-white">Ultimas entregas</div>
        <div className="space-y-3">
          {storageItems.map((item) => (
            <div key={item.number} className="rounded-md border border-white/10 bg-white/[0.03] p-4 transition hover:border-[var(--gold)]/35">
              <div className="flex justify-between gap-3">
                <strong className="text-[var(--gold)]">{item.number}</strong>
                <span className="text-sm text-green-300">{item.status}</span>
              </div>
              <div className="mt-2 text-white">{item.item}</div>
              <div className="text-sm text-[var(--muted)]">{item.owner}</div>
            </div>
          ))}
        </div>
      </FlexCard>
    </div>
  );
}
