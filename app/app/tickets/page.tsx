"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { listUserTickets, type TicketView } from "@/lib/flex-actions";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [selected, setSelected] = useState<TicketView | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listUserTickets()
      .then((data) => {
        if (!active) return;
        setTickets(data);
        setSelected(data[0] ?? null);
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

  return (
    <div className="max-w-3xl">
      <Card>
        <SectionTitle title="Mis entradas QR" />
        {loading ? <p className="text-[var(--muted)]">Cargando entradas...</p> : null}
        {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        {!loading && !error && tickets.length === 0 ? <p className="text-[var(--muted)]">Todavia no tienes entradas asociadas.</p> : null}
        {selected ? <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="grid place-items-center rounded-lg bg-white p-5">
            <QRCodeCanvas value={selected.qrToken} size={180} />
          </div>
          <div>
            <StatusPill tone={tone}>{selected.status}</StatusPill>
            <h2 className="font-display mt-4 text-5xl text-white">{selected.eventName}</h2>
            <p className="mt-2 text-[var(--muted)]">Token: {selected.qrToken}</p>
            {message ? <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
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
      </Card>
    </div>
  );
}
