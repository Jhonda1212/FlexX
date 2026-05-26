"use client";

export type MockSongRequest = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  dedication?: string;
  createdAt: string;
};

export type MockQueueEntry = {
  id: string;
  performerName: string;
  type: string;
  instrument?: string;
  position: number;
  createdAt: string;
};

export type MockStorageItem = {
  id: string;
  ticketNumber: string;
  itemType: string;
  description: string;
  storageNumber: string;
  status: "stored" | "delivered";
  qrToken: string;
  createdAt: string;
};

export type MockTicket = {
  id: string;
  eventName: string;
  qrToken: string;
  status: "valid" | "used" | "expired" | "cancelled";
  createdAt: string;
};

export type MockAccessLog = {
  id: string;
  token: string;
  result: "valid" | "used" | "expired" | "invalid" | "cancelled";
  message: string;
  createdAt: string;
};

const keys = {
  songs: "flex_mock_song_requests",
  queue: "flex_mock_live_queue",
  storage: "flex_mock_storage_items",
  tickets: "flex_mock_tickets",
  logs: "flex_mock_access_logs",
  role: "flex_mock_role"
};

function readList<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function writeList<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function ensureDemoTickets() {
  const tickets = readList<MockTicket>(keys.tickets);
  if (tickets.length > 0) return tickets;
  const seeded: MockTicket[] = [
    {
      id: id("ticket"),
      eventName: "Jazz Nights",
      qrToken: "FLEX-DEMO-VALID",
      status: "valid",
      createdAt: new Date().toISOString()
    },
    {
      id: id("ticket"),
      eventName: "Soul & Blues",
      qrToken: "FLEX-DEMO-USED",
      status: "used",
      createdAt: new Date().toISOString()
    }
  ];
  writeList(keys.tickets, seeded);
  return seeded;
}

export function addMockSong(input: Omit<MockSongRequest, "id" | "createdAt">) {
  const songs = readList<MockSongRequest>(keys.songs);
  const item = { ...input, id: id("song"), createdAt: new Date().toISOString() };
  writeList(keys.songs, [item, ...songs]);
  return item;
}

export function addMockQueue(input: Omit<MockQueueEntry, "id" | "position" | "createdAt">) {
  const queue = readList<MockQueueEntry>(keys.queue);
  const item = { ...input, id: id("queue"), position: queue.length + 1, createdAt: new Date().toISOString() };
  writeList(keys.queue, [...queue, item]);
  return item;
}

export function addMockStorage(input: Omit<MockStorageItem, "id" | "status" | "qrToken" | "createdAt">) {
  const items = readList<MockStorageItem>(keys.storage);
  const item = {
    ...input,
    id: id("storage"),
    status: "stored" as const,
    qrToken: `FLEX-STORAGE-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString()
  };
  writeList(keys.storage, [item, ...items]);
  return item;
}

export function listMockStorage() {
  return readList<MockStorageItem>(keys.storage);
}

export function markMockStorageDelivered(idValue: string) {
  const items = readList<MockStorageItem>(keys.storage);
  const next = items.map((item) => (item.id === idValue ? { ...item, status: "delivered" as const } : item));
  writeList(keys.storage, next);
  return next;
}

export function validateMockTicket(token: string) {
  const tickets = ensureDemoTickets();
  const ticket = tickets.find((item) => item.qrToken === token);
  let result: MockAccessLog["result"] = "invalid";
  let message = "QR invalido";

  if (ticket) {
    result = ticket.status;
    message =
      ticket.status === "valid"
        ? "Acceso valido"
        : ticket.status === "used"
          ? "QR ya usado"
          : ticket.status === "expired"
            ? "QR expirado"
            : "QR cancelado";

    if (ticket.status === "valid") {
      ticket.status = "used";
      writeList(keys.tickets, [...tickets]);
    }
  }

  const logs = readList<MockAccessLog>(keys.logs);
  const log = { id: id("log"), token, result, message, createdAt: new Date().toISOString() };
  writeList(keys.logs, [log, ...logs]);
  return { result, message, ticket };
}

export function getMockRole() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(keys.role);
}

export function setMockRole(role: string) {
  window.localStorage.setItem(keys.role, role);
}
