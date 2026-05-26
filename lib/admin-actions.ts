"use client";

import { createBrowserSupabase } from "./supabase";

export type AdminAccess = { ok: true; userId: string } | { ok: false; error: string };

export async function verifyAdminAccess(): Promise<AdminAccess> {
  const supabase = createBrowserSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { ok: false, error: userError.message };
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: "Debes iniciar sesion con un usuario admin real." };

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("role, active")
    .eq("user_id", userId)
    .eq("role", "admin")
    .eq("active", true)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Acceso denegado. Tu usuario no tiene rol admin activo en staff_profiles." };
  return { ok: true, userId };
}

export async function requireAdmin() {
  const access = await verifyAdminAccess();
  if (!access.ok) throw new Error(access.error);
  return createBrowserSupabase();
}

export function cents(value: number | null | undefined) {
  return `${((value ?? 0) / 100).toFixed(2)} EUR`;
}

export function shortToken(value: string | null | undefined) {
  if (!value) return "-";
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function isoInputValue(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export function fromDateTimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null;
}
