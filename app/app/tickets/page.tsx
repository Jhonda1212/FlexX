"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Crown, Ticket, UserRound } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { getCheckoutOrderSummary, listUserTickets, type CheckoutOrderSummary, type TicketView } from "@/lib/flex-actions";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [selected, setSelected] = useState<TicketView | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutOrderSummary | null>(null);
  const [checkoutType, setCheckoutType] = useState<"ticket" | "vip" | null>(null);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    const itemType = params.get("item_type");

    if (checkout === "success") {
      if (itemType === "vip") {
        setCheckoutType("vip");
        setMessage("Reserva VIP recibida. Estamos esperando la confirmacion segura del webhook para activar el acceso privado.");
      } else {
        setMessage("Pago recibido por Stripe. Estamos esperando la confirmacion segura del webhook para activar tu entrada.");
      }
    }
    if (checkout === "cancelled") {
      setMessage("Checkout cancelado. No se ha confirmado ningun pago.");
    }

    const checkoutSummaryPromise = checkout === "success" && sessionId
      ? getCheckoutOrderSummary(sessionId)
      : Promise.resolve(null);

    Promise.all([listUserTickets(), checkoutSummaryPromise])
      .then(([data, summary]) => {
        if (!active) return;
        setTickets(data);
        setSelected(data[0] ?? null);
        setCheckoutSummary(summary);

        if (summary?.itemType === "vip_reservation") {
          setCheckoutType("vip");
          setMessage(
            summary.hasPrivateRoomAccess
              ? "Reserva VIP confirmada. Tu acceso privado ya esta activo."
              : "Reserva VIP recibida. Estamos esperando la confirmacion segura del webhook para activar el acceso privado."
          );
        }
        if (summary?.itemType === "ticket") {
          setCheckoutType("ticket");
        }
      })
      .catch((ticketError) => {
        if (active) setError(ticketError instanceof Error ? ticketError.message : "No se pudieron cargar tus entradas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const tone = selected?.status === "valid" ? "ok" : selected?.status === "used" ? "gold" : "danger";
  const vipCheckoutWithoutTickets = checkoutType === "vip" && tickets.length === 0;

  return (
    <div className="max-w-3xl space-y-5">
      <AppPageHeader
        eyebrow="Accesos"
        title="Mis entradas"
        description="Consulta tus accesos, codigos QR y entradas activas."
        className="lg:hidden"
      />

      {loading ? <Card><p className="text-[var(--muted)]">Cargando entradas...</p></Card> : null}
      {error ? <Card><div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div></Card> : null}
      {message ? <Card><div className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3 text-sm text-[var(--gold-bright)]">{message}</div></Card> : null}
      {!loading && !error && vipCheckoutWithoutTickets ? (
        <AppEmptyState
          icon={<Crown size={24} />}
          title="Reserva VIP recibida"
          description={
            checkoutSummary?.hasPrivateRoomAccess
              ? "Tu acceso privado ya esta activo. Puedes gestionarlo desde VIP o revisar tu perfil."
              : "Tu pago fue recibido. Si el acceso privado tarda unos segundos, vuelve a VIP o revisa tu perfil en un momento."
          }
          primaryAction={{ href: "/app/vip", label: "Ver VIP", icon: <Crown size={16} /> }}
          secondaryAction={{ href: "/app/profile", label: "Ver perfil", icon: <UserRound size={16} />, variant: "ghost" }}
        />
      ) : null}
      {!loading && !error && tickets.length === 0 && !vipCheckoutWithoutTickets ? (
        <AppEmptyState
          icon={<Ticket size={24} />}
          title="Aun no tienes entradas"
          description="Cuando compres o reserves un evento, tus codigos QR apareceran aqui."
          primaryAction={{ href: "/app", label: "Ver proximos eventos", icon: <CalendarDays size={16} /> }}
        />
      ) : null}

      {!loading && !error && tickets.length > 0 ? <Card>
        <SectionTitle title="Mis entradas QR" />
        {selected ? <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="grid place-items-center rounded-lg bg-white p-5">
            <QRCodeCanvas value={selected.qrToken} size={180} />
          </div>
          <div>
            <StatusPill tone={tone}>{selected.status}</StatusPill>
            <h2 className="font-display mt-4 text-5xl text-white">{selected.eventName}</h2>
            <p className="mt-2 text-[var(--muted)]">Token: {selected.qrToken}</p>
            <Button className="mt-6 w-full sm:w-auto" disabled={selected.status !== "valid"} onClick={() => setMessage("QR listo para mostrar en puerta.")}>Mostrar en puerta</Button>
          </div>
        </div> : null}
        <div className="mt-6 grid gap-2">
          {tickets.map((ticket) => (
            <button key={ticket.id} className="gold-focus rounded-md border border-white/10 p-4 text-left hover:border-[var(--gold)]/50" onClick={() => setSelected(ticket)}>
              <div className="font-semibold text-white">{ticket.eventName}</div>
              <div className="text-sm text-[var(--muted)]">{ticket.status}</div>
            </button>
          ))}
        </div>
      </Card> : null}
    </div>
  );
}
