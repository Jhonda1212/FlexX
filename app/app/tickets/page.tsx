"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Copy, Crown, MessageCircle, RefreshCw, Ticket, UserRound } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  getCheckoutOrderSummary,
  listUserTickets,
  listUserVipAccesses,
  type CheckoutOrderSummary,
  type TicketView,
  type VipAccessView
} from "@/lib/flex-actions";

type AccessItem =
  | { kind: "ticket"; ticket: TicketView }
  | { kind: "vip"; access: VipAccessView };

function accessId(item: AccessItem) {
  return item.kind === "ticket" ? `ticket-${item.ticket.id}` : `vip-${item.access.id}`;
}

function accessTitle(item: AccessItem) {
  return item.kind === "ticket" ? item.ticket.eventName : item.access.roomName;
}

function accessSubtitle(item: AccessItem) {
  if (item.kind === "ticket") return item.ticket.tierName ?? "Entrada FLEX";
  return item.access.eventName ?? `Acceso privado hasta ${item.access.maxGuests} invitados`;
}

function accessStatus(item: AccessItem) {
  return item.kind === "ticket" ? item.ticket.status : item.access.status;
}

function accessQrValue(item: AccessItem) {
  if (item.kind === "ticket") return `FLEX:TICKET:${item.ticket.id}:${item.ticket.qrToken}`;
  return `FLEX:VIP:${item.access.id}:${item.access.qrToken}`;
}

function accessToken(item: AccessItem) {
  return item.kind === "ticket" ? item.ticket.qrToken : item.access.qrToken;
}

function accessDate(item: AccessItem) {
  const value = item.kind === "ticket" ? item.ticket.startsAt : item.access.startsAt;
  if (!value) return null;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusTone(status: string) {
  if (status === "valid" || status === "confirmed" || status === "active") return "ok";
  if (status === "used" || status === "pending") return "gold";
  return "danger";
}

function checkoutMessage(summary: CheckoutOrderSummary | null, checkoutType: "ticket" | "vip" | null) {
  if (!summary) {
    return checkoutType === "vip"
      ? "Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos."
      : "Estamos confirmando tu pago con Stripe para activar tus entradas.";
  }

  if (summary.status === "paid" && (summary.hasTickets || summary.hasPrivateRoomAccess)) {
    return summary.itemType === "vip_reservation"
      ? "Reserva VIP confirmada. Tu acceso privado ya esta activo."
      : "Pago confirmado. Tus entradas ya estan activas.";
  }

  if (summary.status === "failed") return "El pago no se confirmo. Puedes intentarlo nuevamente.";
  if (summary.status === "refunded") return "Este pago figura como reembolsado.";
  return "Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos.";
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [vipAccesses, setVipAccesses] = useState<VipAccessView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutOrderSummary | null>(null);
  const [checkoutType, setCheckoutType] = useState<"ticket" | "vip" | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const accessItems = useMemo<AccessItem[]>(
    () => [
      ...vipAccesses.map((access) => ({ kind: "vip" as const, access })),
      ...tickets.map((ticket) => ({ kind: "ticket" as const, ticket }))
    ],
    [tickets, vipAccesses]
  );
  const selected = accessItems.find((item) => accessId(item) === selectedId) ?? accessItems[0] ?? null;
  const hasFulfillment = Boolean(checkoutSummary?.hasTickets || checkoutSummary?.hasPrivateRoomAccess);
  const shouldPoll = Boolean(sessionId && checkoutSummary?.status !== "failed" && checkoutSummary?.status !== "refunded" && !hasFulfillment);

  const loadAccesses = useCallback(async (checkoutSessionId?: string | null, silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const summaryPromise = checkoutSessionId ? getCheckoutOrderSummary(checkoutSessionId) : Promise.resolve(null);
      const [ticketData, vipData, summary] = await Promise.all([
        listUserTickets(),
        listUserVipAccesses(),
        summaryPromise
      ]);

      setTickets(ticketData);
      setVipAccesses(vipData);
      setCheckoutSummary(summary);
      setSelectedId((current) => {
        const nextItems: AccessItem[] = [
          ...vipData.map((access) => ({ kind: "vip" as const, access })),
          ...ticketData.map((ticket) => ({ kind: "ticket" as const, ticket }))
        ];
        if (current && nextItems.some((item) => accessId(item) === current)) return current;
        return nextItems[0] ? accessId(nextItems[0]) : null;
      });

      if (checkoutSessionId) {
        setMessage(checkoutMessage(summary, checkoutType));
      }
    } catch (ticketError) {
      setError(ticketError instanceof Error ? ticketError.message : "No se pudieron cargar tus accesos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkoutType]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const urlSessionId = params.get("session_id");
    const itemType = params.get("item_type");
    const initialCheckoutType = itemType === "vip" ? "vip" : itemType === "ticket" ? "ticket" : null;

    setCheckoutType(initialCheckoutType);
    setSessionId(checkout === "success" ? urlSessionId : null);

    if (checkout === "success") {
      setMessage(
        initialCheckoutType === "vip"
          ? "Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos."
          : "Estamos confirmando tu pago con Stripe para activar tus entradas."
      );
    }
    if (checkout === "cancelled" || checkout === "cancel") {
      setMessage("Checkout cancelado. No se ha confirmado ningun pago.");
    }

    loadAccesses(checkout === "success" ? urlSessionId : null);
  }, [loadAccesses]);

  useEffect(() => {
    if (!shouldPoll || !sessionId) {
      setPolling(false);
      return;
    }

    setPolling(true);
    let attempts = 0;
    const maxAttempts = 12;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      loadAccesses(sessionId, true);
      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
        setPolling(false);
      }
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
      setPolling(false);
    };
  }, [loadAccesses, sessionId, shouldPoll]);

  async function copyCode(item: AccessItem) {
    await navigator.clipboard.writeText(accessToken(item));
    setMessage("Codigo copiado.");
  }

  function shareWhatsapp(item: AccessItem) {
    const code = accessToken(item);
    const title = accessTitle(item);
    const date = accessDate(item) ?? "fecha FLEX";
    const text = item.kind === "vip"
      ? `Mi reserva FLEX esta confirmada. Codigo: ${code}. Sala: ${title}. Fecha: ${date}.`
      : `Mi entrada FLEX esta confirmada. Codigo: ${code}. Evento: ${title}. Fecha: ${date}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-4xl space-y-5">
      <AppPageHeader
        eyebrow="Accesos"
        title="Mis entradas"
        description="Consulta tus accesos, codigos QR y entradas activas."
        className="lg:hidden"
      />

      {loading ? <Card><p className="text-[var(--muted)]">Cargando accesos...</p></Card> : null}
      {error ? <Card><div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div></Card> : null}
      {message ? (
        <Card>
          <div className="flex flex-col gap-3 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3 text-sm text-[var(--gold-bright)] sm:flex-row sm:items-center sm:justify-between">
            <span>{message}</span>
            {sessionId ? (
              <Button variant="ghost" className="min-h-10 px-3" disabled={refreshing} onClick={() => loadAccesses(sessionId, true)}>
                <RefreshCw size={16} /> {refreshing || polling ? "Actualizando" : "Actualizar estado"}
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {!loading && !error && accessItems.length === 0 ? (
        <AppEmptyState
          icon={checkoutType === "vip" ? <Crown size={24} /> : <Ticket size={24} />}
          title={sessionId ? "Confirmando pago" : "Aun no tienes accesos"}
          description={
            sessionId
              ? "Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos."
              : "Cuando compres entradas o reserves una sala VIP, tus codigos QR apareceran aqui."
          }
          primaryAction={{ href: "/app", label: "Ver proximos eventos", icon: <CalendarDays size={16} /> }}
          secondaryAction={{ href: "/app/profile", label: "Ver perfil", icon: <UserRound size={16} />, variant: "ghost" }}
        />
      ) : null}

      {!loading && !error && accessItems.length > 0 ? (
        <Card>
          <SectionTitle title="Mis accesos QR" />
          {selected ? (
            <div className="grid gap-6 md:grid-cols-[230px_1fr]">
              <div className="grid place-items-center rounded-lg bg-white p-5">
                <QRCodeCanvas value={accessQrValue(selected)} size={184} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={statusTone(accessStatus(selected))}>{accessStatus(selected)}</StatusPill>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/70">
                    {selected.kind === "vip" ? "VIP" : "Entrada"}
                  </span>
                </div>
                <h2 className="font-display mt-4 text-4xl text-white sm:text-5xl">{accessTitle(selected)}</h2>
                <p className="mt-2 text-[var(--muted)]">{accessSubtitle(selected)}</p>
                {accessDate(selected) ? <p className="mt-2 text-sm text-white/70">Fecha: {accessDate(selected)}</p> : null}
                <p className="mt-3 break-all font-mono text-xs text-[var(--muted)]">Codigo: {accessToken(selected)}</p>
                {selected.kind === "vip" ? (
                  <p className="mt-3 text-sm text-green-200">Reserva VIP confirmada. Tu acceso privado ya esta activo.</p>
                ) : null}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button className="w-full sm:w-auto" onClick={() => copyCode(selected)}>
                    <Copy size={16} /> Copiar codigo
                  </Button>
                  <Button variant="ghost" className="w-full sm:w-auto" onClick={() => shareWhatsapp(selected)}>
                    <MessageCircle size={16} /> Compartir por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-2">
            {accessItems.map((item) => (
              <button
                key={accessId(item)}
                className="gold-focus rounded-md border border-white/10 p-4 text-left hover:border-[var(--gold)]/50"
                onClick={() => setSelectedId(accessId(item))}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{accessTitle(item)}</div>
                    <div className="text-sm text-[var(--muted)]">{accessSubtitle(item)}</div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
                    {item.kind === "vip" ? "VIP" : "Entrada"}
                  </span>
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">{accessStatus(item)}</div>
              </button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
