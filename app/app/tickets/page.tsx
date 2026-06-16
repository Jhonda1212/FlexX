"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Copy, Crown, MessageCircle, Ticket } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  getCheckoutOrderSummary,
  listUserPrivateRoomAccess,
  listUserTickets,
  type CheckoutOrderSummary,
  type PrivateRoomAccessView,
  type TicketView
} from "@/lib/flex-actions";

const CHECKOUT_POLL_INTERVAL_MS = 3000;
const CHECKOUT_MAX_POLLS = 20;

function ticketQrValue(ticket: TicketView) {
  return `FLEX:TICKET:${ticket.id}:${ticket.qrToken}`;
}

function vipQrValue(access: PrivateRoomAccessView) {
  return `FLEX:VIP:${access.id}:${access.qrToken}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function ticketTone(status: TicketView["status"]) {
  return status === "valid" ? "ok" : status === "used" ? "gold" : "danger";
}

function vipTone(access: PrivateRoomAccessView) {
  if (!access.active || ["inactive", "expired", "cancelled"].includes(access.status)) return "danger";
  if (["confirmed", "active"].includes(access.status)) return "ok";
  return "gold";
}

function vipStatusLabel(access: PrivateRoomAccessView) {
  if (!access.active) return "inactive";
  return access.status || "confirmed";
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [privateAccesses, setPrivateAccesses] = useState<PrivateRoomAccessView[]>([]);
  const [selected, setSelected] = useState<TicketView | null>(null);
  const [notice, setNotice] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutOrderSummary | null>(null);
  const [checkoutType, setCheckoutType] = useState<"ticket" | "vip" | null>(null);

  useEffect(() => {
    let active = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let pollCount = 0;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    const itemType = params.get("item_type");
    const initialCheckoutType = itemType === "vip" ? "vip" : itemType === "ticket" ? "ticket" : null;

    if (initialCheckoutType) setCheckoutType(initialCheckoutType);
    if (checkout === "cancelled") {
      setNotice(initialCheckoutType === "vip" ? "Reserva cancelada. Puedes intentarlo de nuevo." : "Checkout cancelado. No se ha confirmado ningun pago.");
    }

    async function loadData() {
      const checkoutSummaryPromise = checkout === "success" && sessionId
        ? getCheckoutOrderSummary(sessionId)
        : Promise.resolve(null);
      const [ticketData, accessData, summary] = await Promise.all([
        listUserTickets(),
        listUserPrivateRoomAccess(),
        checkoutSummaryPromise
      ]);

      if (!active) return false;

      setTickets(ticketData);
      setPrivateAccesses(accessData);
      setSelected((current) => ticketData.find((ticket) => ticket.id === current?.id) ?? ticketData[0] ?? null);
      setCheckoutSummary(summary);

      const resolvedCheckoutType = summary?.itemType === "vip_reservation"
        ? "vip"
        : summary?.itemType === "ticket"
          ? "ticket"
          : initialCheckoutType;
      if (resolvedCheckoutType) setCheckoutType(resolvedCheckoutType);

      const hasTicketFulfillment = ticketData.length > 0 || Boolean(summary?.hasTickets);
      const hasVipFulfillment = accessData.length > 0 || Boolean(summary?.hasPrivateRoomAccess);

      if (checkout === "success") {
        if (resolvedCheckoutType === "vip") {
          setNotice(
            hasVipFulfillment
              ? "Reserva VIP confirmada. Tu acceso privado ya esta activo."
              : "Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos."
          );
        } else {
          setNotice(
            hasTicketFulfillment
              ? "Pago confirmado. Tus entradas ya estan activas."
              : "Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos."
          );
        }
      }

      const shouldPollVip = checkout === "success" && resolvedCheckoutType === "vip" && !hasVipFulfillment;
      const shouldPollTicket = checkout === "success" && resolvedCheckoutType !== "vip" && !hasTicketFulfillment;
      return (shouldPollVip || shouldPollTicket) && pollCount < CHECKOUT_MAX_POLLS;
    }

    async function loadAndMaybePoll() {
      pollCount += 1;
      try {
        const shouldPoll = await loadData();
        if (active && shouldPoll) {
          pollTimer = setTimeout(loadAndMaybePoll, CHECKOUT_POLL_INTERVAL_MS);
        }
      } catch (ticketError) {
        if (active) setError(ticketError instanceof Error ? ticketError.message : "No se pudieron cargar tus accesos.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAndMaybePoll();

    return () => {
      active = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback("Codigo copiado.");
    } catch {
      setFeedback("No se pudo copiar automaticamente. Manten visible el QR.");
    }
  }

  function shareVip(access: PrivateRoomAccessView) {
    const code = vipQrValue(access);
    const dateLabel = formatDateTime(access.eventStartsAt ?? access.createdAt);
    const text = `Mi reserva FLEX esta confirmada. Codigo: ${code}. Sala: ${access.zoneName}. Fecha: ${dateLabel}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setFeedback("WhatsApp abierto con el mensaje preparado.");
  }

  const hasAnyAccess = tickets.length > 0 || privateAccesses.length > 0;
  const checkoutWaiting = checkoutSummary?.status === "pending" || (checkoutType === "vip" && privateAccesses.length === 0 && notice.includes("confirmando"));

  return (
    <div className="max-w-3xl space-y-5">
      <AppPageHeader
        eyebrow="Accesos"
        title="Mis entradas"
        description="Consulta tus accesos, codigos QR y entradas activas."
        className="lg:hidden"
      />

      {loading ? <Card><p className="text-[var(--muted)]">Cargando accesos...</p></Card> : null}
      {error ? <Card><div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div></Card> : null}
      {notice ? <Card><div className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3 text-sm text-[var(--gold-bright)]">{notice}</div></Card> : null}
      {feedback ? <Card><div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{feedback}</div></Card> : null}

      {!loading && !error && !hasAnyAccess && checkoutWaiting ? (
        <AppEmptyState
          icon={<Crown size={24} />}
          title="Confirmando pago"
          description="Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos."
          primaryAction={{ href: "/app/tickets", label: "Actualizar estado", icon: <Ticket size={16} /> }}
        />
      ) : null}

      {!loading && !error && !hasAnyAccess && !checkoutWaiting ? (
        <AppEmptyState
          icon={<Ticket size={24} />}
          title="Aun no tienes accesos"
          description="Cuando compres una entrada o reserves una sala VIP, tus codigos QR apareceran aqui."
          primaryAction={{ href: "/app", label: "Ver proximos eventos", icon: <CalendarDays size={16} /> }}
        />
      ) : null}

      {!loading && !error && privateAccesses.length > 0 ? (
        <Card>
          <SectionTitle title="Reservas VIP" />
          <div className="grid gap-4">
            {privateAccesses.map((access) => {
              const code = vipQrValue(access);
              const dateLabel = formatDateTime(access.eventStartsAt ?? access.createdAt);
              const capacity = access.zoneCapacity ?? access.maxGuests;

              return (
                <div key={access.id} className="rounded-lg border border-[var(--gold)]/20 bg-black/35 p-4">
                  <div className="grid gap-5 md:grid-cols-[208px_1fr]">
                    <div className="grid place-items-center rounded-lg bg-white p-4">
                      <QRCodeCanvas value={code} size={176} />
                    </div>
                    <div className="min-w-0">
                      <StatusPill tone={vipTone(access)}>{vipStatusLabel(access)}</StatusPill>
                      <h2 className="font-display mt-4 text-4xl text-white">Reserva VIP confirmada</h2>
                      <div className="mt-4 grid gap-2 text-sm text-white/72 sm:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Sala</div>
                          <div className="mt-1 font-semibold text-white">{access.zoneName}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Capacidad</div>
                          <div className="mt-1 font-semibold text-white">{access.maxGuests}/{capacity} invitados</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Fecha</div>
                          <div className="mt-1 font-semibold text-white">{dateLabel}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Zona</div>
                          <div className="mt-1 font-semibold text-white">{access.zoneFloor ? `Piso ${access.zoneFloor}` : access.zoneId.slice(0, 8)}</div>
                        </div>
                      </div>
                      {access.eventName ? <p className="mt-3 text-sm text-[var(--muted)]">{access.eventName}</p> : null}
                      <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Codigo de acceso</div>
                        <div className="mt-2 break-all font-mono text-xs text-white">{code}</div>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button className="w-full sm:w-auto" onClick={() => copyCode(code)}>
                          <Copy size={16} />
                          Copiar codigo
                        </Button>
                        <Button variant="ghost" className="w-full sm:w-auto" onClick={() => shareVip(access)}>
                          <MessageCircle size={16} />
                          Compartir por WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {!loading && !error && tickets.length > 0 ? (
        <Card>
          <SectionTitle title="Mis entradas QR" />
          {selected ? (
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="grid place-items-center rounded-lg bg-white p-5">
                <QRCodeCanvas value={ticketQrValue(selected)} size={180} />
              </div>
              <div>
                <StatusPill tone={ticketTone(selected.status)}>{selected.status}</StatusPill>
                <h2 className="font-display mt-4 text-5xl text-white">{selected.eventName}</h2>
                <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Codigo de acceso</div>
                  <div className="mt-2 break-all font-mono text-xs text-white">{ticketQrValue(selected)}</div>
                </div>
                <Button className="mt-6 w-full sm:w-auto" disabled={selected.status !== "valid"} onClick={() => setFeedback("QR listo para mostrar en puerta.")}>Mostrar en puerta</Button>
              </div>
            </div>
          ) : null}
          <div className="mt-6 grid gap-2">
            {tickets.map((ticket) => (
              <button key={ticket.id} className="gold-focus rounded-md border border-white/10 p-4 text-left hover:border-[var(--gold)]/50" onClick={() => setSelected(ticket)}>
                <div className="font-semibold text-white">{ticket.eventName}</div>
                <div className="text-sm text-[var(--muted)]">{ticket.status}</div>
              </button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
