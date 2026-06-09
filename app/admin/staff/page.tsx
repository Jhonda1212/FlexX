"use client";

import { useEffect, useState } from "react";
import { Copy, Search, UserCheck, UserPlus } from "lucide-react";
import { AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { Card, SectionTitle } from "@/components/ui/Card";
import {
  createStaffUserFromAdmin,
  listAdminStaffProfiles,
  saveAdminStaffProfile,
  searchAuthUserByEmail,
  updateAdminStaffProfile,
  type AdminStaffRow,
  type StaffUserSearchResult
} from "./actions";

const roles = ["admin", "guard", "storage", "dj"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fieldClass = "gold-focus h-11 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white placeholder:text-white/35";
const labelClass = "grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white/72";
const primaryButtonClass = "gold-focus inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--gold)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-[var(--gold-bright)] disabled:opacity-50";
const secondaryButtonClass = "gold-focus inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:border-[var(--gold)]/45 hover:bg-[var(--gold)]/8 disabled:opacity-50";

function shortUuid(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminStaffRow[]>([]);
  const [createForm, setCreateForm] = useState({ email: "", password: "", display_name: "", role: "guard", active: true });
  const [assignForm, setAssignForm] = useState({ role: "guard", display_name: "", active: true });
  const [manualForm, setManualForm] = useState({ user_id: "", role: "guard", display_name: "", active: true });
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<StaffUserSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [savingFound, setSavingFound] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const rows = await listAdminStaffProfiles();
    setStaff(rows);
  }

  useEffect(() => {
    let active = true;
    load()
      .catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudo cargar staff."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function resetFeedback() {
    setError("");
    setMessage("");
  }

  async function createStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();

    if (!createForm.email.trim()) {
      setError("Email invalido.");
      return;
    }
    if (createForm.password.length < 6) {
      setError("La contrasena temporal debe tener al menos 6 caracteres.");
      return;
    }
    if (!createForm.display_name.trim()) {
      setError("Display name es obligatorio.");
      return;
    }

    setCreating(true);
    try {
      const result = await createStaffUserFromAdmin(createForm);
      setCreateForm({ email: "", password: "", display_name: "", role: "guard", active: true });
      setMessage(result.message);
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear staff.");
    } finally {
      setCreating(false);
    }
  }

  async function searchUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setFoundUser(null);
    setSearching(true);

    try {
      const user = await searchAuthUserByEmail(email);
      if (!user) {
        setMessage("No encontramos un usuario con ese email.");
        return;
      }

      setFoundUser(user);
      setAssignForm((current) => ({
        ...current,
        display_name: current.display_name || user.full_name || user.email.split("@")[0] || ""
      }));
      setMessage("Usuario encontrado.");
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "No se pudo buscar el usuario.");
    } finally {
      setSearching(false);
    }
  }

  async function saveFoundStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();

    if (!foundUser) {
      setError("Busca un usuario por email antes de guardar.");
      return;
    }
    if (!assignForm.display_name.trim()) {
      setError("Display name es obligatorio.");
      return;
    }

    setSavingFound(true);
    try {
      await saveAdminStaffProfile({
        user_id: foundUser.user_id,
        role: assignForm.role,
        display_name: assignForm.display_name,
        active: assignForm.active
      });
      setFoundUser(null);
      setEmail("");
      setAssignForm({ role: "guard", display_name: "", active: true });
      setMessage("Staff actualizado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar staff.");
    } finally {
      setSavingFound(false);
    }
  }

  async function saveManualStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    const userId = manualForm.user_id.trim();

    if (userId.includes("@")) {
      setError("Este campo requiere un UUID. Usa la busqueda por email o crea un usuario nuevo.");
      return;
    }
    if (!uuidPattern.test(userId)) {
      setError("UUID invalido. Usa busqueda por email.");
      return;
    }
    if (!manualForm.display_name.trim()) {
      setError("Display name es obligatorio.");
      return;
    }

    setSavingManual(true);
    try {
      await saveAdminStaffProfile(manualForm);
      setManualForm({ user_id: "", role: "guard", display_name: "", active: true });
      setMessage("Staff actualizado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar staff.");
    } finally {
      setSavingManual(false);
    }
  }

  async function updateStaff(row: AdminStaffRow, patch: Partial<AdminStaffRow>) {
    resetFeedback();
    try {
      await updateAdminStaffProfile(row.id, patch);
      setMessage("Staff actualizado.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar staff.");
    }
  }

  async function copyUserId(userId: string) {
    resetFeedback();
    try {
      await navigator.clipboard.writeText(userId);
      setMessage("User ID copiado.");
    } catch {
      setError("No se pudo copiar el User ID.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Staff"
        description="Crea usuarios staff o asigna roles operativos a usuarios existentes sin copiar UUID manualmente."
      />

      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <Card className="border-green-500/30 bg-green-500/10"><p className="text-green-200">{message}</p></Card> : null}

      <Card className="border-[var(--gold)]/22 bg-[linear-gradient(135deg,rgba(217,166,64,0.075),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <SectionTitle title="Crear usuario staff" action="Auth + profile + staff" />
        <form onSubmit={createStaff} className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(180px,0.85fr)_160px]">
          <label className={labelClass}>
            Email
            <input
              className={fieldClass}
              placeholder="staff@flex.local"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
            />
          </label>
          <label className={labelClass}>
            Contrasena temporal
            <input
              className={fieldClass}
              placeholder="Minimo 6 caracteres"
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
            />
          </label>
          <label className={labelClass}>
            Rol
            <select className={fieldClass} value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label className={`${labelClass} lg:col-span-2`}>
            Display name
            <input
              className={fieldClass}
              placeholder="Nombre operativo"
              value={createForm.display_name}
              onChange={(event) => setCreateForm({ ...createForm, display_name: event.target.value })}
            />
          </label>
          <label className="flex h-11 items-center gap-3 self-end rounded-md border border-white/10 bg-black/24 px-3 text-sm font-bold text-white/82">
            <input className="size-4 accent-[var(--gold)]" type="checkbox" checked={createForm.active} onChange={(event) => setCreateForm({ ...createForm, active: event.target.checked })} />
            <span>Activo</span>
          </label>
          <button
            className={`${primaryButtonClass} self-end`}
            disabled={creating}
          >
            <UserPlus size={18} />
            {creating ? "Creando" : "Crear staff"}
          </button>
        </form>
        <p className="mt-3 text-xs leading-5 text-white/48">
          La contrasena temporal solo se usa para crear el usuario en Auth. No se guarda en tablas publicas ni se muestra en la tabla.
        </p>
      </Card>

      <Card className="p-4 sm:p-5">
        <SectionTitle title="Buscar usuario existente" action="Asignar rol staff" />
        <form onSubmit={searchUser} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <input
              className={`${fieldClass} w-full`}
              placeholder="email exacto del usuario registrado"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="mt-2 text-xs text-white/45">Busca un usuario ya creado para asignarle o actualizarle un rol operativo.</p>
          </div>
          <button
            className={`${secondaryButtonClass} whitespace-nowrap px-3 tracking-[0.04em] md:w-auto`}
            disabled={searching}
          >
            <Search size={18} />
            {searching ? "Buscando" : "Buscar usuario"}
          </button>
        </form>

        {foundUser ? (
          <div className="mt-4 rounded-lg border border-[var(--gold)]/22 bg-[linear-gradient(135deg,rgba(217,166,64,0.075),rgba(0,0,0,0.18))] p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-md border border-[var(--gold)]/28 bg-black/35 text-[var(--gold)]">
                  <UserCheck size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Usuario encontrado</p>
                  <h2 className="mt-1 break-all text-base font-bold text-white">{foundUser.email}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{foundUser.full_name || "Sin nombre en profile"}</p>
                  <p className="mt-2 break-all font-mono text-[11px] text-white/50">{foundUser.user_id}</p>
                </div>
              </div>

              <form onSubmit={saveFoundStaff} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_130px]">
                <label className={`${labelClass} sm:col-span-2`}>
                  Display name
                  <input
                    className={fieldClass}
                    placeholder="Nombre operativo"
                    value={assignForm.display_name}
                    onChange={(event) => setAssignForm({ ...assignForm, display_name: event.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Rol
                  <select className={fieldClass} value={assignForm.role} onChange={(event) => setAssignForm({ ...assignForm, role: event.target.value })}>
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </label>
                <label className="flex h-11 items-center gap-3 self-end rounded-md border border-white/10 bg-black/24 px-3 text-sm font-bold text-white/82">
                  <input className="size-4 accent-[var(--gold)]" type="checkbox" checked={assignForm.active} onChange={(event) => setAssignForm({ ...assignForm, active: event.target.checked })} />
                  <span>Activo</span>
                </label>
                <button
                  className={`${primaryButtonClass} sm:col-span-2`}
                  disabled={savingFound}
                >
                  {savingFound ? "Guardando" : "Guardar staff"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </Card>

      <details className="group rounded-lg border border-white/10 bg-white/[0.018]">
        <summary className="gold-focus flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 py-3 text-sm font-bold text-white/82 transition hover:bg-white/[0.025]">
          <span>
            Modo avanzado
            <span className="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/42">UUID manual</span>
          </span>
          <span className="text-xs uppercase tracking-[0.12em] text-[var(--gold)] group-open:hidden">Abrir</span>
          <span className="hidden text-xs uppercase tracking-[0.12em] text-[var(--gold)] group-open:inline">Cerrar</span>
        </summary>
        <div className="border-t border-white/10 p-4">
          <p className="mb-3 text-xs leading-5 text-white/45">Usa este fallback solo si ya tienes el UUID real del usuario.</p>
          <form onSubmit={saveManualStaff} className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_130px]">
            <label className={labelClass}>
              UUID de usuario
              <input
                className={fieldClass}
                placeholder="00000000-0000-0000-0000-000000000000"
                value={manualForm.user_id}
                onChange={(event) => setManualForm({ ...manualForm, user_id: event.target.value })}
              />
            </label>
            <label className={labelClass}>
              Display name
              <input
                className={fieldClass}
                placeholder="Nombre operativo"
                value={manualForm.display_name}
                onChange={(event) => setManualForm({ ...manualForm, display_name: event.target.value })}
              />
            </label>
            <label className={labelClass}>
              Rol
              <select className={fieldClass} value={manualForm.role} onChange={(event) => setManualForm({ ...manualForm, role: event.target.value })}>
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-black/24 px-3 text-sm font-bold text-white/82">
              <input className="size-4 accent-[var(--gold)]" type="checkbox" checked={manualForm.active} onChange={(event) => setManualForm({ ...manualForm, active: event.target.checked })} />
              <span>Activo</span>
            </label>
            <button
              className={`${secondaryButtonClass} lg:col-span-2`}
              disabled={savingManual}
            >
              {savingManual ? "Guardando" : "Guardar por UUID"}
            </button>
          </form>
        </div>
      </details>

      {!loading && !error && staff.length === 0 ? <AdminEmptyState title="Sin staff" description="Crea un usuario staff, busca un usuario existente por email o usa el UUID manual como fallback." /> : null}

      {staff.length ? (
        <AdminDataTable columns={["Nombre", "User ID", "Rol", "Estado", "Creado", "Acciones"]}>
          {staff.map((row) => (
            <tr key={row.id} className="text-white">
              <td className="px-3 py-2.5">
                <div className="min-w-40">
                  <div className="font-semibold text-white">{row.display_name || row.profiles?.full_name || "Staff FLEX"}</div>
                  {row.profiles?.full_name && row.profiles.full_name !== row.display_name ? (
                    <div className="mt-0.5 text-xs text-[var(--muted)]">{row.profiles.full_name}</div>
                  ) : (
                    <div className="mt-0.5 font-mono text-[11px] text-white/42">{shortUuid(row.user_id)}</div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex min-w-44 items-center gap-2">
                  <span className="rounded-md border border-white/10 bg-black/24 px-2 py-1 font-mono text-[11px] text-white/72">{shortUuid(row.user_id)}</span>
                  <button
                    type="button"
                    className="gold-focus inline-flex h-7 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white/72 transition hover:border-[var(--gold)]/40 hover:text-white"
                    onClick={() => copyUserId(row.user_id)}
                    aria-label="Copiar User ID"
                  >
                    <Copy size={12} />
                    Copiar
                  </button>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <select className="h-9 rounded-md border border-white/10 bg-black/40 px-2.5 text-sm text-white" value={row.role} onChange={(event) => updateStaff(row, { role: event.target.value })}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </td>
              <td className="px-3 py-2.5 text-xs"><StatusBadge status={row.active ? "active" : "inactive"} /></td>
              <td className="px-3 py-2.5 text-xs text-white/68">{new Date(row.created_at).toLocaleString("es-ES")}</td>
              <td className="px-3 py-2.5">
                <button
                  type="button"
                  className={`gold-focus h-9 rounded-md border px-3 text-xs font-bold uppercase tracking-[0.08em] transition disabled:opacity-50 ${row.active ? "border-red-400/20 bg-red-500/8 text-red-100 hover:bg-red-500/14" : "border-green-400/20 bg-green-500/8 text-green-100 hover:bg-green-500/14"}`}
                  onClick={() => updateStaff(row, { active: !row.active })}
                >
                  {row.active ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
