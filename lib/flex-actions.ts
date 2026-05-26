"use client";

import { createBrowserSupabase } from "./supabase";
import {
  ensureDemoTickets,
  addMockQueue,
  addMockSong,
  addMockStorage,
  listMockStorage,
  markMockStorageDelivered,
  type MockStorageItem,
  type MockTicket,
  validateMockTicket
} from "./mock-store";

export function mocksEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";
}

async function getSupabaseUserId() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return { supabase, userId: data.user?.id ?? null };
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(date).toUpperCase();
}

export type FlexEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  ticketPriceCents: number;
  dateLabel: string;
};

export type VipRoom = {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  colorTheme: string | null;
  description: string | null;
  vipPriceCents: number;
};

export type TicketView = {
  id: string;
  eventName: string;
  qrToken: string;
  status: "valid" | "used" | "expired" | "cancelled";
  createdAt: string;
};

export type StorageView = {
  id: string;
  storageNumber: string;
  itemDescription: string;
  status: "active" | "delivered" | "lost";
  qrToken: string;
  createdAt: string;
};

export type AccessLogView = {
  id: string;
  result: string;
  reason: string | null;
  createdAt: string;
  accessType: string;
  context: string;
  person: string;
};

function mapTicketStatus(status: string): TicketView["status"] {
  if (status === "active") return "valid";
  if (status === "used" || status === "expired" || status === "cancelled") return status;
  return "cancelled";
}

export async function listPublishedEvents(): Promise<FlexEvent[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, starts_at, ends_at, capacity, ticket_price_cents")
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  if (error) {
    if (mocksEnabled()) return [];
    throw error;
  }

  return (data ?? []).map((event) => ({
    id: event.id as string,
    title: event.title as string,
    description: event.description as string | null,
    startsAt: event.starts_at as string,
    endsAt: event.ends_at as string | null,
    capacity: event.capacity as number,
    ticketPriceCents: event.ticket_price_cents as number,
    dateLabel: formatDateLabel(event.starts_at as string)
  }));
}

export async function listVipRooms(): Promise<VipRoom[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("club_zones")
    .select("id, name, capacity, floor, color_theme, description, vip_price_cents")
    .in("type", ["vip_room", "private_room"])
    .eq("active", true)
    .order("vip_price_cents", { ascending: true });

  if (error) {
    if (mocksEnabled()) return [];
    throw error;
  }

  return (data ?? []).map((room) => ({
    id: room.id as string,
    name: room.name as string,
    capacity: room.capacity as number,
    floor: room.floor as number,
    colorTheme: room.color_theme as string | null,
    description: room.description as string | null,
    vipPriceCents: room.vip_price_cents as number
  }));
}

export async function listUserTickets(): Promise<TicketView[]> {
  if (mocksEnabled()) {
    return ensureDemoTickets().map((ticket: MockTicket) => ({
      id: ticket.id,
      eventName: ticket.eventName,
      qrToken: ticket.qrToken,
      status: ticket.status === "valid" ? "valid" : ticket.status,
      createdAt: ticket.createdAt
    }));
  }

  const { supabase, userId } = await getSupabaseUserId();
  if (!userId) throw new Error("Debes iniciar sesion para ver tus entradas.");

  const { data, error } = await supabase
    .from("tickets")
    .select("id, qr_token, status, created_at, events(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((ticket) => {
    const eventData = ticket.events as { title?: string } | null;
    return {
      id: ticket.id as string,
      eventName: eventData?.title ?? "Entrada FLEX",
      qrToken: ticket.qr_token as string,
      status: mapTicketStatus(ticket.status as string),
      createdAt: ticket.created_at as string
    };
  });
}

export async function listActiveStorageItems(): Promise<StorageView[]> {
  if (mocksEnabled()) {
    return listMockStorage().map((item: MockStorageItem) => ({
      id: item.id,
      storageNumber: item.storageNumber,
      itemDescription: `${item.itemType} - ${item.description}`,
      status: item.status === "stored" ? "active" : "delivered",
      qrToken: item.qrToken,
      createdAt: item.createdAt
    }));
  }

  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("storage_items")
    .select("id, storage_number, item_description, status, qr_token, created_at")
    .in("status", ["active", "delivered"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id as string,
    storageNumber: item.storage_number as string,
    itemDescription: item.item_description as string,
    status: item.status as StorageView["status"],
    qrToken: item.qr_token as string,
    createdAt: item.created_at as string
  }));
}

export async function markStorageDelivered(id: string) {
  if (mocksEnabled()) {
    return markMockStorageDelivered(id).map((item: MockStorageItem) => ({
      id: item.id,
      storageNumber: item.storageNumber,
      itemDescription: `${item.itemType} - ${item.description}`,
      status: item.status === "stored" ? "active" as const : "delivered" as const,
      qrToken: item.qrToken,
      createdAt: item.createdAt
    }));
  }

  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("storage_items")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "active");

  if (error) throw error;
  return listActiveStorageItems();
}

export async function submitSongRequest(input: {
  title: string;
  artist: string;
  genre: string;
  dedication?: string;
}) {
  if (mocksEnabled()) {
    addMockSong(input);
    return { ok: true, source: "mock" as const };
  }

  const { supabase, userId } = await getSupabaseUserId();
  if (!userId) return { ok: false, source: "supabase" as const, error: "Debes iniciar sesion para pedir una cancion." };

  try {
    const { error } = await supabase.from("song_requests").insert({
      user_id: userId,
      title: input.title,
      artist: input.artist,
      dedication: input.dedication ? `${input.genre} - ${input.dedication}` : input.genre
    });
    if (!error) return { ok: true, source: "supabase" as const };
    return { ok: false, source: "supabase" as const, error: error.message };
  } catch (error) {
    return { ok: false, source: "supabase" as const, error: error instanceof Error ? error.message : "No se pudo enviar la cancion." };
  }
}

export async function joinLiveQueue(input: {
  performerName: string;
  type: string;
  instrument?: string;
}) {
  if (mocksEnabled()) {
    const item = addMockQueue(input);
    return { ok: true, source: "mock" as const, position: item.position };
  }

  const { supabase, userId } = await getSupabaseUserId();
  if (!userId) return { ok: false, source: "supabase" as const, position: 0, error: "Debes iniciar sesion para unirte a la cola." };

  try {
    const { count } = await supabase
      .from("live_session_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting");
    const position = (count ?? 0) + 1;
    const { error } = await supabase.from("live_session_queue").insert({
      user_id: userId,
      performer_name: input.performerName,
      instrument: input.type === "instrumento" ? input.instrument : input.type,
      position
    });
    if (!error) return { ok: true, source: "supabase" as const, position };
    return { ok: false, source: "supabase" as const, position: 0, error: error.message };
  } catch (error) {
    return { ok: false, source: "supabase" as const, position: 0, error: error instanceof Error ? error.message : "No se pudo guardar tu turno." };
  }
}

export async function createStorageItem(input: {
  ticketNumber: string;
  itemType: string;
  description: string;
  storageNumber: string;
}) {
  if (mocksEnabled()) {
    const item = addMockStorage(input);
    return { ok: true, source: "mock" as const, qrToken: item.qrToken };
  }

  const { supabase, userId } = await getSupabaseUserId();
  if (!userId) return { ok: false, source: "supabase" as const, qrToken: "", error: "Debes iniciar sesion para registrar storage." };

  try {
    const { error, data } = await supabase
      .from("storage_items")
      .insert({
        user_id: userId,
        storage_number: input.storageNumber,
        item_description: `${input.ticketNumber} - ${input.itemType} - ${input.description}`,
        status: "active"
      })
      .select("id, qr_token")
      .single();
    if (!error) return { ok: true, source: "supabase" as const, qrToken: data.qr_token as string };
    return { ok: false, source: "supabase" as const, qrToken: "", error: error.message };
  } catch (error) {
    return { ok: false, source: "supabase" as const, qrToken: "", error: error instanceof Error ? error.message : "No se pudo guardar la prenda." };
  }
}

export async function validateQrToken(token: string) {
  if (mocksEnabled()) {
    const result = validateMockTicket(token);
    return { status: result.result, message: result.message, source: "mock" as const };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .rpc("validate_qr_token", { input_token: token })
      .single();
    if (error) throw error;
    const result = data as { status: string; message: string };
    return { status: result.status, message: result.message, source: "supabase" as const };
  } catch (error) {
    throw error instanceof Error ? error : new Error("No se pudo validar el QR.");
  }
}

export async function listRecentAccessLogs(limit = 8): Promise<AccessLogView[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("access_logs")
    .select(`
      id,
      result,
      reason,
      created_at,
      tickets(events(title), profiles(full_name)),
      private_room_access(club_zones(name), profiles(full_name)),
      storage_items(storage_number, item_description, profiles(full_name))
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((log) => {
    const item = log as any;
    const ticket = item.tickets as { events?: { title?: string | null } | null; profiles?: { full_name?: string | null } | null } | null;
    const privateAccess = item.private_room_access as { club_zones?: { name?: string | null } | null; profiles?: { full_name?: string | null } | null } | null;
    const storage = item.storage_items as { storage_number?: string | null; item_description?: string | null; profiles?: { full_name?: string | null } | null } | null;

    if (ticket) {
      return {
        id: item.id as string,
        result: item.result as string,
        reason: item.reason as string | null,
        createdAt: item.created_at as string,
        accessType: "Entrada",
        context: ticket.events?.title ?? "Evento FLEX",
        person: ticket.profiles?.full_name || "Usuario"
      };
    }

    if (privateAccess) {
      return {
        id: item.id as string,
        result: item.result as string,
        reason: item.reason as string | null,
        createdAt: item.created_at as string,
        accessType: "VIP",
        context: privateAccess.club_zones?.name ?? "Sala privada",
        person: privateAccess.profiles?.full_name || "Usuario"
      };
    }

    if (storage) {
      return {
        id: item.id as string,
        result: item.result as string,
        reason: item.reason as string | null,
        createdAt: item.created_at as string,
        accessType: "Storage",
        context: `${storage.storage_number ?? "Storage"} - ${storage.item_description ?? "Prenda"}`,
        person: storage.profiles?.full_name || "Usuario"
      };
    }

    return {
      id: item.id as string,
      result: item.result as string,
      reason: item.reason as string | null,
      createdAt: item.created_at as string,
      accessType: "QR",
      context: "Sin referencia",
      person: "Desconocido"
    };
  });
}
