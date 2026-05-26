"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ShareVipPage({ params }: { params: { roomId: string } }) {
  const [guestCount, setGuestCount] = useState(0);
  const [message, setMessage] = useState("");
  const url = `https://flex.app/vip/${params.roomId}/guest?token=demo_private_room_token`;
  const full = guestCount >= 10;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Enlace copiado.");
    } catch {
      setMessage("No se pudo copiar automaticamente. Usa el QR visible.");
    }
  }

  async function shareLink() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Acceso VIP FLEX", url });
        setMessage("Acceso compartido.");
        return;
      }
    } catch {
      setMessage("No se pudo abrir el menu de compartir.");
      return;
    }
    await copyLink();
  }

  return (
    <Card className="max-w-2xl">
      <SectionTitle title="Compartir sala VIP" />
      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <div className="rounded-lg bg-white p-5"><QRCodeCanvas value={url} size={180} /></div>
        <div>
          <h2 className="font-display text-4xl text-white">Acceso privado</h2>
          <p className="mt-2 text-[var(--muted)]">Limite: {guestCount}/10 invitados.</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[var(--gold)] transition-all" style={{ width: `${guestCount * 10}%` }} />
          </div>
          {message ? <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
          <div className="mt-6 grid gap-3">
            <Button className="w-full" disabled={full} onClick={copyLink}>{full ? "Sala llena" : "Copiar enlace"}</Button>
            <Button variant="ghost" className="w-full" disabled={full} onClick={shareLink}>Compartir QR</Button>
            <Button variant="ghost" className="w-full" disabled={full} onClick={() => setGuestCount((count) => Math.min(10, count + 1))}>Simular invitado</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
