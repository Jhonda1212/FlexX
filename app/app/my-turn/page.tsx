"use client";

import { useState } from "react";
import { Mic2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { joinLiveQueue } from "@/lib/flex-actions";

export default function MyTurnPage() {
  const [performerName, setPerformerName] = useState("");
  const [type, setType] = useState("cantar");
  const [instrument, setInstrument] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!performerName.trim()) {
      setError("Indica tu nombre artistico.");
      return;
    }
    if (type === "instrumento" && !instrument.trim()) {
      setError("Indica el instrumento.");
      return;
    }
    setLoading(true);
    const result = await joinLiveQueue({ performerName, type, instrument });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo guardar tu turno.");
      return;
    }
    setPosition(result.position);
    setMessage(`Estas en la posicion #${result.position}.`);
  }

  return (
    <Card className="max-w-2xl">
      <SectionTitle title="Mi turno" />
      <div className="flex items-center gap-6">
        <div className="grid size-24 place-items-center rounded-full border-4 border-[var(--gold)]"><Mic2 size={38} /></div>
        <div>
          <div className="text-6xl font-bold text-[var(--gold)]">#{position ?? "-"}</div>
          <p className="mt-2 text-[var(--muted)]">Tiempo estimado: 20 - 30 min</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Nombre artistico" value={performerName} onChange={(event) => setPerformerName(event.target.value)} />
        <select className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="cantar">Cantar</option>
          <option value="instrumento">Instrumento</option>
          <option value="banda">Banda</option>
        </select>
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder={type === "instrumento" ? "Instrumento requerido" : "Instrumento opcional"} value={instrument} onChange={(event) => setInstrument(event.target.value)} />
        {message ? <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
        {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        <Button className="w-full" disabled={loading}>{loading ? "Guardando" : "Unirme a la lista"}</Button>
      </form>
    </Card>
  );
}
