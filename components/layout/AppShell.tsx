"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import type { NavItem } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase";
import { getNavForRole, type AppRole } from "@/lib/navigation/role-nav";
import { FlexBadge } from "@/components/ui/FlexBadge";

const iconButtonClass =
  "gold-focus cursor-pointer rounded-md border border-white/10 bg-white/[0.02] p-3 text-white/82 transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out hover:border-[var(--gold)]/45 hover:bg-[var(--gold)]/8 hover:text-white active:scale-[0.98]";

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
  const visibleNav = useMemo(
    () => effectiveRole && effectiveRole !== "admin" ? getNavForRole(effectiveRole) : nav,
    [effectiveRole, nav]
  );
  const safeNav = useMemo(
    () => visibleNav.length > 0 ? visibleNav : getNavForRole("user"),
    [visibleNav]
  );
  const header = useMemo(
    () => routeHeaders[pathname] ?? { title, subtitle },
    [pathname, routeHeaders, title, subtitle]
  );

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
            className="gold-focus mt-6 min-h-12 cursor-pointer rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-[var(--gold-bright)] hover:shadow-[0_10px_24px_rgba(217,166,64,0.14)] active:scale-[0.99]"
            onClick={() => router.push("/app")}
          >
            Volver a app
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen min-w-0 pb-24 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:pb-0 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-white/10 bg-black/45 p-5 lg:flex lg:min-h-screen lg:flex-col xl:p-6">
        <Logo staff={staff} />
        <nav className="mt-12 space-y-2">
          {safeNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`gold-focus group relative flex min-h-14 cursor-pointer items-center gap-4 rounded-md border px-4 text-sm font-semibold transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out active:scale-[0.99] ${
                  active
                    ? "border-[var(--gold)]/35 bg-[linear-gradient(135deg,rgba(217,166,64,0.18),rgba(255,255,255,0.035))] text-white shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
                    : "border-transparent text-white/78 hover:border-[var(--gold)]/22 hover:bg-[var(--gold)]/8 hover:text-white"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-r-full bg-[var(--gold)] transition-opacity duration-200 ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-55"
                  }`}
                />
                <Icon className={`transition-colors duration-200 ${active ? "text-[var(--gold)]" : "text-white/64 group-hover:text-[var(--gold)]"}`} size={22} />
                <span className="transition-colors duration-200">{item.label}</span>
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

      <main className="min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-6 lg:py-8 xl:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className={`${iconButtonClass} lg:hidden`}
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
              className={iconButtonClass}
              aria-label="Notificaciones"
              onClick={() => router.push(staff ? "/guard/alerts" : "/app/notifications")}
            >
              <Bell size={20} />
            </button>
            <button className={`${iconButtonClass} hidden sm:inline-flex`} aria-label="Salir" onClick={signOut}>
              <LogOut size={20} />
            </button>
          </div>
        </header>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/94 px-2 py-2 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {safeNav.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`gold-focus flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border text-[11px] font-bold transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.98] ${
                  active
                    ? "border-[var(--gold)]/25 bg-[var(--gold)]/12 text-[var(--gold)]"
                    : "border-transparent text-white/68 hover:border-[var(--gold)]/20 hover:bg-[var(--gold)]/8 hover:text-white"
                }`}
              >
                <Icon className="transition-colors duration-200" size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
