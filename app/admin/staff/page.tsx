"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { Card, SectionTitle } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin-actions";

type StaffRow = {
  id: string;
  user_id: string;
  role: string;
  display_name: string;
  active: boolean;
  created_at: string;
  profiles?: { full_name?: string } | null;
};

const roles = ["guard", "storage", "dj", "admin"];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [form, setForm] = useState({ user_id: "", role: "guard", display_name: "", active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase
      .from("staff_profiles")
      .select("id, user_id, role, display_name, active, created_at, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (queryError) throw queryError;
    setStaff((data ?? []) as StaffRow[]);
  }

  useEffect(() => {
    let active = true;
    load().catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudo cargar staff.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function saveStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.user_id.trim() || !form.display_name.trim()) {
      setError("user_id y display_name son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const supabase = await requireAdmin();
      const { error: upsertError } = await supabase.from("staff_profiles").upsert({
        user_id: form.user_id.trim(),
        role: form.role,
        display_name: form.display_name.trim(),
        active: form.active
      }, { onConflict: "user_id" });
      if (upsertError) throw upsertError;
      setForm({ user_id: "", role: "guard", display_name: "", active: true });
      setMessage("Staff guardado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar staff.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStaff(row: StaffRow, patch: Partial<StaffRow>) {
    setError("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("staff_profiles").update(patch).eq("id", row.id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar staff.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Staff" description="Asigna roles operativos. La busqueda por email requiere una funcion segura del servidor; por ahora se usa user_id." />
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}
      <Card>
        <SectionTitle title="Agregar o actualizar staff por user_id" />
        <form onSubmit={saveStaff} className="grid gap-3 md:grid-cols-4">
          <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white md:col-span-2" placeholder="user_id de profiles/auth.users" value={form.user_id} onChange={(event) => setForm({ ...form, user_id: event.target.value })} />
          <input className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" placeholder="Display name" value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} />
          <select className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select>
          <label className="flex items-center gap-3 text-sm font-bold text-white"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Activo</label>
          <button className="gold-focus min-h-12 rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black disabled:opacity-50 md:col-span-3" disabled={saving}>{saving ? "Guardando" : "Guardar staff"}</button>
        </form>
      </Card>
      {!loading && !error && staff.length === 0 ? <AdminEmptyState title="Sin staff" description="Agrega el primer usuario operativo por user_id." /> : null}
      {staff.length ? (
        <AdminDataTable columns={["Nombre", "User ID", "Rol", "Estado", "Creado", "Acciones"]}>
          {staff.map((row) => (
            <tr key={row.id} className="text-white">
              <td className="px-4 py-3"><input className="w-48 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white" value={row.display_name} onChange={(event) => setStaff((current) => current.map((item) => item.id === row.id ? { ...item, display_name: event.target.value } : item))} onBlur={() => updateStaff(row, { display_name: row.display_name })} /><div className="mt-1 text-xs text-[var(--muted)]">{row.profiles?.full_name}</div></td>
              <td className="px-4 py-3 font-mono text-xs">{row.user_id}</td>
              <td className="px-4 py-3"><select className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white" value={row.role} onChange={(event) => updateStaff(row, { role: event.target.value })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td>
              <td className="px-4 py-3"><StatusBadge status={row.active ? "active" : "inactive"} /></td>
              <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3"><AdminActionButton variant={row.active ? "danger" : "success"} onClick={() => updateStaff(row, { active: !row.active })}>{row.active ? "Desactivar" : "Activar"}</AdminActionButton></td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
