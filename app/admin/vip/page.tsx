"use client";

import { useEffect, useState } from "react";
import {
  AdminActionButton,
  AdminDataTable,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
  StatusBadge
} from "@/components/admin/AdminComponents";
import { Card, SectionTitle } from "@/components/ui/Card";
import { cents, requireAdmin } from "@/lib/admin-actions";

type ZoneRow = {
  id: string;
  name: string;
  type: string;
  floor: number;
  capacity: number;
  vip_price_cents: number;
  color_theme: string | null;
  active: boolean;
  description: string | null;
};

type EditForm = {
  capacity: string;
  vip_price_cents: string;
  description: string;
  active: boolean;
};

export default function AdminVipPage() {
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [editing, setEditing] = useState<ZoneRow | null>(null);
  const [form, setForm] = useState<EditForm>({ capacity: "10", vip_price_cents: "0", description: "", active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase
      .from("club_zones")
      .select("id, name, type, floor, capacity, vip_price_cents, color_theme, active, description")
      .in("type", ["vip_room", "private_room"])
      .order("floor", { ascending: true })
      .order("vip_price_cents", { ascending: true });
    if (queryError) throw queryError;
    setZones((data ?? []) as ZoneRow[]);
  }

  useEffect(() => {
    let active = true;
    load().catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar zonas VIP.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function startEdit(zone: ZoneRow) {
    setEditing(zone);
    setForm({
      capacity: String(zone.capacity),
      vip_price_cents: String(zone.vip_price_cents),
      description: zone.description ?? "",
      active: zone.active
    });
  }

  async function saveZone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setError("");
    setMessage("");
    const capacity = Number(form.capacity);
    const vipPriceCents = Number(form.vip_price_cents);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError("La capacidad debe ser mayor que 0.");
      return;
    }
    if (!Number.isFinite(vipPriceCents) || vipPriceCents < 0) {
      setError("El precio VIP no puede ser negativo.");
      return;
    }
    if (editing.type === "private_room" && capacity > 10) {
      setError("Las salas privadas no pueden superar 10 personas.");
      return;
    }
    setSaving(true);
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase
        .from("club_zones")
        .update({
          capacity,
          vip_price_cents: vipPriceCents,
          description: form.description.trim() || null,
          active: form.active
        })
        .eq("id", editing.id);
      if (updateError) throw updateError;
      setMessage("Zona VIP actualizada.");
      setEditing(null);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la zona VIP.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="VIP y zonas" description="Gestiona salas privadas, capacidad, precios y disponibilidad." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}
      {editing ? (
        <Card>
          <SectionTitle title={`Editar ${editing.name}`} />
          <form onSubmit={saveZone} className="grid gap-3 md:grid-cols-2">
            <input type="number" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            <input type="number" className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.vip_price_cents} onChange={(event) => setForm({ ...form, vip_price_cents: event.target.value })} />
            <textarea className="min-h-24 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Zona activa</label>
            <div className="flex gap-3 md:justify-end">
              <AdminActionButton variant="ghost" onClick={() => setEditing(null)}>Cancelar</AdminActionButton>
              <button className="gold-focus min-h-12 rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black disabled:opacity-50" disabled={saving}>{saving ? "Guardando" : "Guardar cambios"}</button>
            </div>
          </form>
        </Card>
      ) : null}
      {!loading && !error && zones.length === 0 ? <AdminEmptyState title="Sin zonas VIP" description="No hay zonas privadas o VIP activas en club_zones." /> : null}
      {zones.length ? (
        <AdminDataTable columns={["Zona", "Tipo", "Planta", "Capacidad", "Precio", "Tema", "Estado", "Acciones"]}>
          {zones.map((zone) => (
            <tr key={zone.id} className="text-white">
              <td className="px-4 py-3"><div className="font-bold">{zone.name}</div><div className="text-xs text-[var(--muted)]">{zone.description}</div></td>
              <td className="px-4 py-3">{zone.type}{zone.type === "private_room" ? <div className="text-xs text-[var(--gold)]">limite 10</div> : null}</td>
              <td className="px-4 py-3">{zone.floor}</td>
              <td className="px-4 py-3">{zone.capacity}</td>
              <td className="px-4 py-3">{cents(zone.vip_price_cents)}</td>
              <td className="px-4 py-3">{zone.color_theme ?? "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={zone.active ? "active" : "inactive"} /></td>
              <td className="px-4 py-3"><AdminActionButton variant="ghost" onClick={() => startEdit(zone)}>Editar</AdminActionButton></td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
