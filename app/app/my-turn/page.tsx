"use client";

import { useState } from "react";
import { Clock3, Mic2 } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { joinLiveQueue } from "@/lib/flex-actions";

const steps = [
  "Te apuntas.",
  "El staff revisa la lista.",
  "Te avisamos cuando estes cerca.",
  "Subes al escenario."
];

const fieldClass =
  "gold-focus rounded-md border border-white/10 bg-black/40 px-3.5 py-3 text-white transition-colors placeholder:text-white/36 hover:border-[var(--gold)]/35";

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
    <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
      <FlexCard className="overflow-hidden border-[var(--gold)]/20 p-0">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(217,166,64,0.12),rgba(8,8,8,0.96)_54%,rgba(72,18,18,0.16))] px-5 py-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Mi turno en vivo</p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Mi turno en vivo</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
            Apuntate para cantar, tocar o subir al escenario esta noche.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-white/60">Estado actual</p>
                <h2 className="mt-3 text-2xl font-bold text-white">{hasTurn ? "Turno activo" : "Sin turno activo"}</h2>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold)]">
                <Mic2 size={22} />
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-[var(--gold)]/20 bg-[var(--gold)]/[0.07] p-4">
              <div className="text-5xl font-bold leading-none text-[var(--gold)]">{hasTurn ? `#${position}` : "--"}</div>
              <div className="mt-3 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <Clock3 size={15} />
                  {hasTurn ? "20 - 30 min" : "Pendiente"}
                </div>
                <div className="mt-1">{hasTurn ? "En revision" : "Disponible para apuntarte"}</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              {hasTurn
                ? "Tu sitio esta confirmado. Mantente atento a los avisos del staff cuando tu turno este cerca."
                : "Aun no estas en la lista. Cuando te unas, veremos tu posicion aqui."}
            </p>

            <div className="mt-5">
              <FlexBadge tone={hasTurn ? "success" : "gold"}>{hasTurn ? "En cola" : "Lista abierta"}</FlexBadge>
            </div>
          </section>

          <section className="p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">Unirme a la lista</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Completa tus datos para unirte a la lista del escenario.
              </p>
            </div>

            <form onSubmit={submit} className="grid gap-3.5">
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Nombre artistico
                <input
                  className={fieldClass}
                  placeholder="Tu nombre en escena"
                  value={performerName}
                  onChange={(event) => setPerformerName(event.target.value)}
                />
              </label>

              <div className="grid gap-3.5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-white/80">
                  Tipo de participacion
                  <select
                    className={fieldClass}
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
                    className={fieldClass}
                    placeholder={type === "instrumento" ? "Instrumento requerido" : "Instrumento, si aplica"}
                    value={instrument}
                    onChange={(event) => setInstrument(event.target.value)}
                  />
                </label>
              </div>

              {message ? <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
              {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

              <p className="text-xs leading-5 text-white/45">
                El orden puede cambiar segun la dinamica de la noche y las decisiones del equipo.
              </p>

              <FlexButton className="w-full" disabled={loading} loading={loading}>
                Unirme a la lista
              </FlexButton>
            </form>
          </section>
        </div>
      </FlexCard>

      <aside className="2xl:sticky 2xl:top-8 2xl:self-start">
        <FlexCard className="border-white/10 bg-white/[0.025]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Guia rapida</p>
              <h2 className="mt-1 text-xl font-bold text-white">Como funciona</h2>
            </div>
            <Mic2 className="text-[var(--gold)]" size={22} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/75">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-xs font-bold text-[var(--gold)]">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-[var(--muted)]">
            Te avisaremos cuando estes cerca para que puedas prepararte antes de subir al escenario.
          </p>
        </FlexCard>
      </aside>
    </div>
  );
}
