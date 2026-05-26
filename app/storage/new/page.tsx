"use client";

import { useState } from "react";
import { Shirt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { createStorageItem } from "@/lib/flex-actions";

export default function NewStorageItemPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [itemType, setItemType] = useState("");
  const [description, setDescription] = useState("");
  const [storageNumber, setStorageNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!ticketNumber.trim() || !itemType.trim() || !description.trim() || !storageNumber.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    const result = await createStorageItem({ ticketNumber, itemType, description, storageNumber });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo guardar la prenda.");
      return;
    }
    setMessage(`Prenda guardada. QR: ${result.qrToken}`);
    setTicketNumber("");
    setItemType("");
    setDescription("");
    setStorageNumber("");
  }

  return (
    <Card className="max-w-2xl">
      <SectionTitle title="Registrar prenda" />
      <form onSubmit={submit} className="grid gap-4">
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Numero de ticket" value={ticketNumber} onChange={(event) => setTicketNumber(event.target.value)} />
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Tipo de prenda" value={itemType} onChange={(event) => setItemType(event.target.value)} />
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Descripcion" value={description} onChange={(event) => setDescription(event.target.value)} />
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Numero storage" value={storageNumber} onChange={(event) => setStorageNumber(event.target.value)} />
        {message ? <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
        {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        <Button disabled={loading}><Shirt size={20} /> {loading ? "Guardando" : "Guardar y generar QR"}</Button>
      </form>
    </Card>
  );
}
