"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createBrowserSupabase } from "@/lib/supabase";
import { mocksEnabled } from "@/lib/flex-actions";
import { getMockRole, setMockRole } from "@/lib/mock-store";

const labels: Record<string, string> = {
  user: "Usuario",
  guard: "Guardia",
  storage: "Storage",
  admin: "Admin"
};

export function RoleGate({ role, children }: { role: "user" | "guard" | "storage" | "admin"; children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (mocksEnabled()) {
        setCurrentRole(getMockRole() ?? "user");
        setLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabase();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = userData.user?.id;
        if (!userId) {
          if (active) {
            setCurrentRole(null);
            setError("Debes iniciar sesion para acceder a esta zona.");
          }
          return;
        }
        if (role === "user") {
          if (active) setCurrentRole("user");
          return;
        }

        const { data, error: staffError } = await supabase
          .from("staff_profiles")
          .select("role, active")
          .eq("user_id", userId)
          .eq("active", true)
          .maybeSingle();
        if (staffError) throw staffError;
        if (active) setCurrentRole((data?.role as string | undefined) ?? "user");
      } catch (roleError) {
        if (active) setError(roleError instanceof Error ? roleError.message : "No se pudo validar tu rol.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRole();
    return () => {
      active = false;
    };
  }, [role]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-md text-center">
          <p className="text-sm text-[var(--muted)]">Validando acceso...</p>
        </Card>
      </main>
    );
  }
  if (currentRole === role || currentRole === "admin") return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Acceso por rol</p>
        <h1 className="font-display mt-3 text-4xl text-white">Panel {labels[role]}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {error || `Rol activo: ${labels[currentRole ?? ""] ?? currentRole}. Necesitas rol ${labels[role]} activo en staff_profiles.`}
        </p>
        {mocksEnabled() ? (
          <Button
            className="mt-6 w-full"
            onClick={() => {
              setMockRole(role);
              setCurrentRole(role);
            }}
          >
            Usar rol {labels[role]}
          </Button>
        ) : (
          <Link className="gold-focus mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black" href="/login">
            Ir a login
          </Link>
        )}
      </Card>
    </main>
  );
}
