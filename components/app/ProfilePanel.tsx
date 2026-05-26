"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CreditCard, LockKeyhole, UserRound } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { FlexSkeleton } from "@/components/ui/FlexSkeleton";
import { createBrowserSupabase } from "@/lib/supabase";
import type { AppRole } from "@/lib/navigation/role-nav";

type Profile = {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
};

type Tab = "personal" | "payment" | "security" | "notifications";

const tabs: Array<{ id: Tab; label: string; icon: typeof UserRound }> = [
  { id: "personal", label: "Datos personales", icon: UserRound },
  { id: "payment", label: "Pago", icon: CreditCard },
  { id: "security", label: "Seguridad", icon: LockKeyhole },
  { id: "notifications", label: "Notificaciones", icon: Bell }
];

const roleLabels: Record<AppRole, string> = {
  user: "Cliente",
  admin: "Admin",
  guard: "Guard",
  storage: "Storage",
  dj: "DJ"
};

const notificationOptions = [
  "Estado de pedidos",
  "Entradas y reservas",
  "Salas VIP",
  "Promociones",
  "Newsletter"
];

function initialsFor(name: string, email: string) {
  const source = name.trim() || email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "F";
}

function Switch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onChange}
      className={`gold-focus relative h-7 w-12 rounded-full border transition ${
        enabled ? "border-[var(--gold)] bg-[var(--gold)]/30" : "border-white/10 bg-white/[0.06]"
      }`}
    >
      <span className={`absolute top-1 size-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
    </button>
  );
}

export function ProfilePanel() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationOptions.map((option) => [option, true]))
  );
  const [notificationStatus, setNotificationStatus] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [savingNotifications, setSavingNotifications] = useState(false);

  const initials = useMemo(() => initialsFor(fullName, email), [email, fullName]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const supabase = createBrowserSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const user = authData.user;
        if (!user) throw new Error("Debes iniciar sesion para ver tu perfil.");

        const { data: profileData, error: profileErrorResult } = await supabase
          .from("profiles")
          .select("full_name, phone, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (profileErrorResult) throw profileErrorResult;

        const { data: staffData, error: staffError } = await supabase
          .from("staff_profiles")
          .select("role")
          .eq("user_id", user.id)
          .eq("active", true)
          .maybeSingle();
        if (staffError) throw staffError;

        if (!active) return;
        const profile = profileData as Profile | null;
        const metadata = user.user_metadata ?? {};
        const savedPrefs = metadata.flex_notification_preferences as Record<string, boolean> | undefined;

        setUserId(user.id);
        setEmail(user.email ?? "");
        setFullName(profile?.full_name || (metadata.full_name as string | undefined) || "");
        setPhone(profile?.phone ?? "");
        setBirthDate((metadata.birth_date as string | undefined) ?? "");
        if (savedPrefs) setNotificationPrefs((current) => ({ ...current, ...savedPrefs }));
        setRole((staffData?.role as AppRole | undefined) ?? "user");
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "No se pudo cargar tu perfil.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile() {
    setProfileStatus("");
    setProfileError("");
    setSavingProfile(true);

    try {
      if (!userId) throw new Error("No se pudo identificar la sesion actual.");
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq("id", userId);

      if (error) throw error;
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          birth_date: birthDate || null
        }
      });
      if (metadataError) throw metadataError;
      setProfileStatus("Cambios guardados");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveNotifications() {
    setNotificationStatus("");
    setNotificationError("");
    setSavingNotifications(true);

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.updateUser({
        data: {
          flex_notification_preferences: notificationPrefs
        }
      });
      if (error) throw error;
      setNotificationStatus("Preferencias guardadas");
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSavingNotifications(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <FlexSkeleton className="h-36 rounded-2xl" />
        <FlexSkeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <FlexCard tone="danger">
          <h1 className="font-display text-4xl text-white">Mi perfil</h1>
          <p className="mt-3 text-sm text-red-100">{loadError}</p>
        </FlexCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="lg:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Cuenta FLEX</p>
        <h1 className="font-display mt-2 text-5xl text-white">Mi perfil</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Gestiona tu cuenta, seguridad y preferencias.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025)),radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_36%)] p-5 shadow-xl shadow-black/25 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-full border border-[var(--gold)]/40 bg-black/70 text-xl font-bold text-[var(--gold)] sm:size-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display truncate text-3xl leading-none text-white sm:text-4xl">{fullName || "Cliente FLEX"}</h2>
                <FlexBadge tone="gold">{roleLabels[role]}</FlexBadge>
              </div>
              <p className="mt-2 break-all text-sm text-white/68">{email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span className="text-white/62">Entradas: <strong className="text-white">0</strong></span>
            <span className="text-white/62">Turno: <strong className="text-white">Sin turno</strong></span>
            <span className="text-white/62">Reservas: <strong className="text-white">0</strong></span>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`gold-focus flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition ${
                  active
                    ? "border-[var(--gold)]/45 bg-[var(--gold)]/18 text-white shadow-lg shadow-[var(--gold)]/5"
                    : "border-white/10 bg-white/[0.025] text-white/70 hover:border-white/20 hover:bg-white/[0.055]"
                }`}
              >
                <Icon size={18} className={active ? "text-[var(--gold)]" : "text-white/65"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="min-w-0">
          {activeTab === "personal" ? (
            <FlexCard className="rounded-2xl border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Cuenta personal</p>
                <h2 className="font-display mt-2 text-3xl text-white sm:text-4xl">Datos personales</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Manten tus datos listos para entradas, reservas y avisos.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/82">Nombre completo</span>
                  <input className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3.5 text-white outline-none transition focus:border-[var(--gold)]/55" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/82">Telefono</span>
                  <input className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3.5 text-white outline-none transition focus:border-[var(--gold)]/55" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/82">Email</span>
                  <input className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-white/68 outline-none" value={email} readOnly />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/82">Fecha de nacimiento</span>
                  <input className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3.5 text-white outline-none transition focus:border-[var(--gold)]/55" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
                </label>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <FlexButton loading={savingProfile} onClick={saveProfile} className="rounded-full">
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </FlexButton>
                {profileStatus ? <span className="text-sm text-green-300">{profileStatus}</span> : null}
                {profileError ? <span className="text-sm text-red-200">{profileError}</span> : null}
              </div>
            </FlexCard>
          ) : null}

          {activeTab === "payment" ? (
            <FlexCard className="rounded-2xl p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Pago</p>
              <h2 className="font-display mt-2 text-3xl text-white sm:text-4xl">Metodos y compras</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <CreditCard className="text-[var(--gold)]" size={28} />
                  <h3 className="mt-4 font-bold text-white">Metodos de pago</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Los metodos de pago estaran disponibles proximamente.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <h3 className="font-bold text-white">Historial de compras</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Tus compras apareceran aqui cuando Stripe este conectado.</p>
                </div>
              </div>
            </FlexCard>
          ) : null}

          {activeTab === "security" ? (
            <FlexCard className="rounded-2xl p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Seguridad</p>
              <h2 className="font-display mt-2 text-3xl text-white sm:text-4xl">Acceso y sesiones</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <LockKeyhole className="text-[var(--gold)]" size={28} />
                  <h3 className="mt-4 font-bold text-white">Cambiar contrasena</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Gestion avanzada de seguridad proximamente.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <h3 className="font-bold text-white">Cerrar sesiones</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">El cierre remoto de sesiones estara disponible proximamente.</p>
                </div>
              </div>
            </FlexCard>
          ) : null}

          {activeTab === "notifications" ? (
            <FlexCard className="rounded-2xl p-5 sm:p-6">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Avisos</p>
                <h2 className="font-display mt-2 text-3xl text-white sm:text-4xl">Notificaciones</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Elige que avisos quieres priorizar durante la noche.</p>
              </div>
              <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                {notificationOptions.map((option) => (
                  <div key={option} className="flex items-center justify-between gap-4 p-4">
                    <span className="font-semibold text-white">{option}</span>
                    <Switch
                      enabled={notificationPrefs[option]}
                      onChange={() => setNotificationPrefs((current) => ({ ...current, [option]: !current[option] }))}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <FlexButton loading={savingNotifications} onClick={saveNotifications} className="rounded-full">
                  {savingNotifications ? "Guardando..." : "Guardar preferencias"}
                </FlexButton>
                {notificationStatus ? <span className="text-sm text-green-300">{notificationStatus}</span> : null}
                {notificationError ? <span className="text-sm text-red-200">{notificationError}</span> : null}
              </div>
            </FlexCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
