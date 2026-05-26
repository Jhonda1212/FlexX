"use client";

import { useState } from "react";
import { Clock3, Mic2 } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { joinLiveQueue } from "@/lib/flex-actions";

const steps = [
  "Te apuntas a la lista.",
  "El staff revisa la cola.",
  "Te avisamos cuando estés cerca.",
  "Subes al escenario."
];

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

  const hasTurn = position !== null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <FlexCard className="overflow-hidden border-[var(--gold)]/20 p-0">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(217,166,64,0.12),rgba(8,8,8,0.96)_52%,rgba(72,18,18,0.16))] px-5 py-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Mi turno en vivo</p>
          <p className="mt-1 text-sm text-white/70">Apúntate para cantar, tocar o subir al escenario esta noche.</p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
          <section className="border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-white/60">Estado actual</p>
                <h1 className="mt-3 text-2xl font-bold text-white">{hasTurn ? "Turno activo" : "Sin turno activo"}</h1>
              </div>
              <div className="grid size-14 shrink-0 place-items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]">
                <Mic2 size={26} />
              </div>
            </div>

            <div className="mt-6 flex items-end gap-4">
              <div className="text-6xl font-bold leading-none text-[var(--gold)]">{hasTurn ? `#${position}` : "--"}</div>
              <div className="pb-1 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <Clock3 size={15} />
                  {hasTurn ? "20 - 30 min" : "Pendiente"}
                </div>
                <div className="mt-1">{hasTurn ? "En revisión" : "Disponible para apuntarte"}</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              {hasTurn
                ? "Tu sitio está confirmado. Mantente atento a los avisos del staff cuando tu turno esté cerca."
                : "Completa tus datos y el staff te incorporará a la lista de escenario."}
            </p>

            <div className="mt-5">
              <FlexBadge tone={hasTurn ? "success" : "gold"}>{hasTurn ? "En cola" : "Lista abierta"}</FlexBadge>
            </div>
          </section>

          <section className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">Únete a la lista</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Usaremos estos datos para preparar tu participación.</p>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Nombre artístico
                <input
                  className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/35"
                  placeholder="Tu nombre en escena"
                  value={performerName}
                  onChange={(event) => setPerformerName(event.target.value)}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-white/80">
                  Tipo de participación
                  <select
                    className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition hover:border-[var(--gold)]/35"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                  >
                    <option value="cantar">Cantar</option>
                    <option value="instrumento">Instrumento</option>
                    <option value="banda">Banda</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-white/80">
                  Instrumento opcional
                  <input
                    className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/35"
                    placeholder={type === "instrumento" ? "Instrumento requerido" : "Instrumento, si aplica"}
                    value={instrument}
                    onChange={(event) => setInstrument(event.target.value)}
                  />
                </label>
              </div>

              {message ? <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
              {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

              <FlexButton className="w-full" disabled={loading} loading={loading}>
                Unirme a la lista
              </FlexButton>
            </form>
          </section>
        </div>
      </FlexCard>

      <aside className="xl:sticky xl:top-8 xl:self-start">
        <FlexCard className="border-white/10 bg-white/[0.025]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Guía rápida</p>
              <h2 className="mt-1 text-xl font-bold text-white">Cómo funciona</h2>
            </div>
            <Mic2 className="text-[var(--gold)]" size={22} />
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-3 text-sm leading-6 text-white/75">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-xs font-bold text-[var(--gold)]">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-[var(--muted)]">
            El orden puede ajustarse por criterio del staff, disponibilidad técnica o dinámica de la sesión.
          </p>
        </FlexCard>
      </aside>
    </div>
  );
}
