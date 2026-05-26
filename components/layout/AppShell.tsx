"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { NavItem } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase";
import { getNavForRole, type AppRole } from "@/lib/navigation/role-nav";
import { FlexBadge } from "@/components/ui/FlexBadge";

export function AppShell({
  children,
  nav,
  staff = false,
  title = "FLEX",
  subtitle = "Acciones rápidas, lectura clara y control en directo.",
  routeHeaders = {},
  role = null
}: {
  children: ReactNode;
  nav: NavItem[];
  staff?: boolean;
  title?: string;
  subtitle?: string;
  routeHeaders?: Record<string, { title: string; subtitle: string }>;
  role?: AppRole | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [resolvedRole, setResolvedRole] = useState<AppRole | null>(role);
  const [roleLoading, setRoleLoading] = useState(staff && !role);
  const [roleError, setRoleError] = useState("");
  const effectiveRole = role ?? resolvedRole;
  const visibleNav = effectiveRole && effectiveRole !== "admin" ? getNavForRole(effectiveRole) : nav;
  const safeNav = visibleNav.length > 0 ? visibleNav : getNavForRole("user");
  const header = routeHeaders[pathname] ?? { title, subtitle };

  useEffect(() => {
    if (!staff || role) return;
    let active = true;

    async function loadRole() {
      try {
        const supabase = createBrowserSupabase();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = userData.user?.id;
        if (!userId) {
          if (active) setRoleError("Debes iniciar sesion para acceder a esta zona.");
          return;
        }

        const { data, error } = await supabase
          .from("staff_profiles")
          .select("role")
          .eq("user_id", userId)
          .eq("active", true)
          .maybeSingle();
        if (error) throw error;
        if (active) setResolvedRole((data?.role as AppRole | undefined) ?? null);
      } catch (error) {
        if (active) setRoleError(error instanceof Error ? error.message : "No se pudo validar tu rol.");
      } finally {
        if (active) setRoleLoading(false);
      }
    }

    loadRole();
    return () => {
      active = false;
    };
  }, [role, staff]);

  async function signOut() {
    try {
      await createBrowserSupabase().auth.signOut();
    } catch {
      window.localStorage.removeItem("flex_mock_role");
    }
    router.push("/login");
  }

  if (roleLoading) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 text-sm text-[var(--muted)]">
          Validando navegacion...
        </div>
      </main>
    );
  }

  if (staff && !effectiveRole) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Acceso por rol</p>
          <h1 className="font-display mt-3 text-4xl text-white">Rol no disponible</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">{roleError || "No hay un rol activo en staff_profiles para esta sesion."}</p>
          <button
            className="gold-focus mt-6 min-h-12 rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black"
            onClick={() => router.push("/app")}
          >
            Volver a app
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:grid lg:grid-cols-[260px_1fr] lg:pb-0">
      <aside className="hidden border-r border-white/10 bg-black/45 p-6 lg:flex lg:min-h-screen lg:flex-col">
        <Logo staff={staff} />
        <nav className="mt-12 space-y-2">
          {safeNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`gold-focus flex min-h-14 items-center gap-4 rounded-md px-4 text-sm font-semibold transition ${
                  active ? "gold-surface text-white" : "text-white/82 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={active ? "text-[var(--gold)]" : "text-white/80"} size={22} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-[var(--gold)]/25 bg-[var(--gold)]/8 p-4">
          {effectiveRole ? <div className="mb-3"><FlexBadge tone="gold">{effectiveRole}</FlexBadge></div> : null}
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">VIP Experience</div>
          <p className="mt-2 text-sm text-white/72">Accesos, salas privadas y turnos en una sola vista.</p>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="gold-focus rounded-md border border-white/10 p-3 lg:hidden"
              aria-label="Ir al inicio"
              onClick={() => router.push(safeNav[0]?.href ?? "/app")}
            >
              <Menu size={22} />
            </button>
            <div className="lg:hidden">
              <Logo staff={staff} />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-white">{header.title}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{header.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="gold-focus rounded-md border border-white/10 p-3"
              aria-label="Notificaciones"
              onClick={() => router.push(staff ? "/guard/alerts" : "/app/notifications")}
            >
              <Bell size={20} />
            </button>
            <button className="gold-focus hidden rounded-md border border-white/10 p-3 sm:inline-flex" aria-label="Salir" onClick={signOut}>
              <LogOut size={20} />
            </button>
          </div>
        </header>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/92 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {safeNav.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`gold-focus flex h-16 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-bold ${
                  active ? "text-[var(--gold)]" : "text-white/70"
                }`}
              >
                <Icon size={22} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
