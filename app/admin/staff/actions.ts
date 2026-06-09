"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { StaffRole } from "@/lib/auth/server-role";

type StaffFormInput = {
  user_id: string;
  role: string;
  display_name: string;
  active: boolean;
};

type CreateStaffUserInput = {
  email: string;
  password: string;
  display_name: string;
  role: string;
  active: boolean;
};

type StaffPatchInput = {
  role?: string;
  display_name?: string;
  active?: boolean;
};

export type AdminStaffRow = {
  id: string;
  user_id: string;
  role: string;
  display_name: string;
  active: boolean;
  created_at: string;
  profiles?: { full_name?: string } | null;
};

export type StaffUserSearchResult = {
  user_id: string;
  email: string;
  full_name: string | null;
};

const staffRoles: StaffRole[] = ["guard", "storage", "dj", "admin"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getServerEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublicKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return { supabaseUrl, supabasePublicKey };
}

async function createStaffActionSupabase() {
  const { supabaseUrl, supabasePublicKey } = getServerEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      }
    }
  });
}

function createServiceRoleSupabase() {
  const { supabaseUrl } = getServerEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function assertStaffRole(role: string): StaffRole {
  if (!staffRoles.includes(role as StaffRole)) {
    throw new Error("Rol operativo no valido.");
  }
  return role as StaffRole;
}

function assertUuid(value: string) {
  if (!uuidPattern.test(value)) {
    throw new Error("UUID invalido. Usa busqueda por email.");
  }
}

function normalizeEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    throw new Error("Email invalido.");
  }
  return normalizedEmail;
}

async function requireActiveAdmin() {
  const supabase = await createStaffActionSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);

  const userId = userData.user?.id;
  if (!userId) throw new Error("No tienes permisos para esta accion.");

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("role, active")
    .eq("user_id", userId)
    .eq("role", "admin")
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No tienes permisos para esta accion.");

  return { supabase, userId };
}

async function findAuthUserByEmail(adminSupabase: SupabaseClient, email: string): Promise<User | null> {
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertProfileAndStaff(
  adminSupabase: SupabaseClient,
  input: {
    userId: string;
    displayName: string;
    role: StaffRole;
    active: boolean;
  }
) {
  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    {
      id: input.userId,
      full_name: input.displayName
    },
    { onConflict: "id" }
  );
  if (profileError) throw new Error(profileError.message);

  const { error: staffError } = await adminSupabase.from("staff_profiles").upsert(
    {
      user_id: input.userId,
      role: input.role,
      display_name: input.displayName,
      active: input.active
    },
    { onConflict: "user_id" }
  );
  if (staffError) throw new Error(staffError.message);
}

export async function listAdminStaffProfiles() {
  const { supabase } = await requireActiveAdmin();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("id, user_id, role, display_name, active, created_at, profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminStaffRow[];
}

export async function searchAuthUserByEmail(email: string): Promise<StaffUserSearchResult | null> {
  const normalizedEmail = normalizeEmail(email);
  const { supabase } = await requireActiveAdmin();
  const adminSupabase = createServiceRoleSupabase();
  const user = await findAuthUserByEmail(adminSupabase, normalizedEmail);

  if (!user?.email) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);

  return {
    user_id: user.id,
    email: user.email,
    full_name: (profile?.full_name as string | null | undefined) ?? null
  };
}

export async function createStaffUserFromAdmin(input: CreateStaffUserInput) {
  await requireActiveAdmin();
  const adminSupabase = createServiceRoleSupabase();
  const email = normalizeEmail(input.email);
  const displayName = input.display_name.trim();
  const role = assertStaffRole(input.role);

  if (!displayName) {
    throw new Error("Display name es obligatorio.");
  }
  if (input.password.length < 6) {
    throw new Error("La contrasena temporal debe tener al menos 6 caracteres.");
  }

  const existingUser = await findAuthUserByEmail(adminSupabase, email);
  let userId = existingUser?.id ?? "";
  let created = false;

  if (!existingUser) {
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: displayName
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("No se pudo crear el usuario.");
    userId = data.user.id;
    created = true;
  }

  await upsertProfileAndStaff(adminSupabase, {
    userId,
    displayName,
    role,
    active: input.active
  });

  return {
    ok: true,
    user_id: userId,
    email,
    created,
    message: created
      ? "Usuario creado. Comparte la contrasena temporal de forma segura."
      : "El usuario ya existia; se actualizo su rol staff."
  };
}

export async function saveAdminStaffProfile(input: StaffFormInput) {
  const { supabase } = await requireActiveAdmin();
  const role = assertStaffRole(input.role);
  const userId = input.user_id.trim();
  const displayName = input.display_name.trim();

  if (!userId || !displayName) {
    throw new Error("user_id y display_name son obligatorios.");
  }
  assertUuid(userId);

  const { error } = await supabase.from("staff_profiles").upsert(
    {
      user_id: userId,
      role,
      display_name: displayName,
      active: input.active
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateAdminStaffProfile(id: string, patch: StaffPatchInput) {
  const { supabase } = await requireActiveAdmin();
  const update: StaffPatchInput = {};

  if (typeof patch.display_name === "string") update.display_name = patch.display_name.trim();
  if (typeof patch.role === "string") update.role = assertStaffRole(patch.role);
  if (typeof patch.active === "boolean") update.active = patch.active;

  if (Object.keys(update).length === 0) {
    throw new Error("No hay cambios para guardar.");
  }

  const { error } = await supabase.from("staff_profiles").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
