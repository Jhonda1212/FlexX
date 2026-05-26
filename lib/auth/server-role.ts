import type { SupabaseClient, User } from "@supabase/supabase-js";

export type StaffRole = "guard" | "storage" | "dj" | "admin";

export type ServerRoleResult = {
  user: User | null;
  role: StaffRole | null;
  error: string | null;
};

export async function getServerUserAndRole(supabase: SupabaseClient): Promise<ServerRoleResult> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) return { user: null, role: null, error: userError.message };
    const user = userData.user ?? null;
    if (!user) return { user: null, role: null, error: null };

    const { data, error: roleError } = await supabase
      .from("staff_profiles")
      .select("role")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (roleError) return { user, role: null, error: roleError.message };
    return { user, role: (data?.role as StaffRole | undefined) ?? null, error: null };
  } catch (error) {
    return { user: null, role: null, error: error instanceof Error ? error.message : "No se pudo validar la sesion." };
  }
}

export function defaultRouteForRole(role: StaffRole | null) {
  if (role === "admin") return "/admin";
  if (role === "guard") return "/guard";
  if (role === "storage") return "/storage";
  if (role === "dj") return "/admin/queue";
  return "/app";
}

const privatePrefixes = ["/app"];
const adminPrefixes = ["/admin"];
const guardPrefixes = ["/guard"];
const storagePrefixes = ["/storage"];
const djAdminPrefixes = ["/admin/songs", "/admin/queue"];

export function matchesRoutePrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isProtectedRoute(pathname: string) {
  return (
    matchesRoutePrefix(pathname, privatePrefixes) ||
    matchesRoutePrefix(pathname, adminPrefixes) ||
    matchesRoutePrefix(pathname, guardPrefixes) ||
    matchesRoutePrefix(pathname, storagePrefixes)
  );
}

export function canRoleAccessPath(pathname: string, role: StaffRole | null) {
  if (matchesRoutePrefix(pathname, privatePrefixes)) return true;
  if (role === "admin") return true;
  if (matchesRoutePrefix(pathname, guardPrefixes)) return role === "guard";
  if (matchesRoutePrefix(pathname, storagePrefixes)) return role === "storage";
  if (matchesRoutePrefix(pathname, adminPrefixes)) {
    return role === "dj" && matchesRoutePrefix(pathname, djAdminPrefixes);
  }
  return true;
}
