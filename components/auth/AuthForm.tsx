"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createBrowserSupabase } from "@/lib/supabase";
import { canRoleAccessPath, defaultRouteForRole, type StaffRole } from "@/lib/auth/server-role";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabase();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { data: { full_name: name } }
            });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const userId = result.data.user?.id;
      if (!userId) {
        setError("Login correcto, pero Supabase no devolvio una sesion activa. Revisa si el email requiere confirmacion.");
        return;
      }

      const { data: staffRole, error: roleError } = await supabase
        .from("staff_profiles")
        .select("role")
        .eq("user_id", userId)
        .eq("active", true)
        .maybeSingle();

      if (roleError) {
        setError(`Login correcto, pero no se pudo leer staff_profiles: ${roleError.message}`);
        return;
      }

      const role = (staffRole?.role as StaffRole | undefined) ?? null;
      const defaultRoute = defaultRouteForRole(role);
      const redirectTo = searchParams.get("redirectTo");
      const target = redirectTo && redirectTo.startsWith("/") && canRoleAccessPath(redirectTo, role)
        ? redirectTo
        : defaultRoute;

      router.refresh();
      router.push(target);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo completar el login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h1 className="font-display text-4xl text-white">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Acceso rapido a entradas, VIP y escenario.</p>
        </div>
        {mode === "register" ? (
          <label className="block">
            <span className="text-sm font-semibold text-white">Nombre</span>
            <input className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold text-white">Email</span>
          <input className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-white">Password</span>
          <input className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Procesando" : mode === "login" ? "Entrar" : "Registrarme"}</Button>
      </form>
    </Card>
  );
}
