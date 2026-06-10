"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const associatedTables = [
  { table: "tickets", label: "entradas" },
  { table: "order_items", label: "ordenes" },
  { table: "private_room_access", label: "accesos VIP" },
  { table: "song_requests", label: "pedidos de canciones" },
  { table: "live_session_queue", label: "cola de escenario" },
  { table: "daily_feed_posts", label: "publicaciones del feed" }
] as const;

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

async function createEventActionSupabase() {
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

async function requireActiveAdmin() {
  const supabase = await createEventActionSupabase();
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

  return supabase;
}

export async function deleteAdminEvent(eventId: string) {
  const id = eventId.trim();
  if (!uuidPattern.test(id)) {
    throw new Error("Evento invalido.");
  }

  const supabase = await requireActiveAdmin();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (eventError) throw new Error(eventError.message);
  if (!event) throw new Error("El evento ya no existe.");

  const associated = [];
  for (const relation of associatedTables) {
    const { count, error } = await supabase
      .from(relation.table)
      .select("id", { count: "exact", head: true })
      .eq("event_id", id);

    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) associated.push(relation.label);
  }

  if (associated.length > 0) {
    throw new Error("No se puede eliminar este evento porque tiene registros asociados. Despublicalo como alternativa.");
  }

  const { error: deleteError } = await supabase.from("events").delete().eq("id", id);

  if (deleteError) {
    if (deleteError.code === "23503") {
      throw new Error("No se puede eliminar este evento porque tiene registros asociados. Despublicalo como alternativa.");
    }
    throw new Error(deleteError.message);
  }

  return { ok: true };
}
