"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Lightbulb, ListChecks, Music, Send, Sparkles } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { submitSongRequest } from "@/lib/flex-actions";

const steps = [
  "Envías tu canción.",
  "El DJ revisa la solicitud.",
  "Se prioriza según el ambiente de la noche.",
  "Si es aprobada, puede sonar durante la sesión."
];

const fieldClass =
  "gold-focus rounded-md border border-white/10 bg-black/45 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/40 focus:bg-black/60";

export default function SongRequestPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [dedication, setDedication] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!title.trim() || !artist.trim() || !genre.trim()) {
      setError("Completa canción, artista y género.");
      return;
    }

    setLoading(true);
    const result = await submitSongRequest({ title, artist, genre, dedication });
    setLoading(false);

    if (result.ok) {
      setTitle("");
      setArtist("");
      setGenre("");
      setDedication("");
      setMessage("Solicitud enviada");
    } else {
      setError(result.error ?? "No se pudo enviar la canción.");
    }
  }

  const feedback = loading
    ? { label: "Enviando...", tone: "gold" as const, icon: Sparkles }
    : message
      ? { label: "Solicitud enviada", tone: "success" as const, icon: CheckCircle2 }
      : error
        ? { label: "Error al enviar", tone: "danger" as const, icon: AlertCircle }
        : { label: "Lista para enviar", tone: "gold" as const, icon: Music };
  const FeedbackIcon = feedback.icon;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[var(--gold)]/20 bg-[linear-gradient(135deg,rgba(217,166,64,0.12),rgba(8,8,8,0.94)_52%,rgba(76,18,18,0.18))] p-5 lg:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">FLEX Sounds</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Pide tu canción</h1>
        <p className="mt-2 text-sm leading-6 text-white/72">Envía el tema que quieres escuchar esta noche.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <FlexCard className="overflow-hidden border-[var(--gold)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(217,166,64,0.10),rgba(8,8,8,0.92)_56%,rgba(76,18,18,0.15))] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Solicitud musical</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Solicitud musical</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  Completa los datos para que el DJ revise tu pedido.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-3 py-2">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]">
                  <FeedbackIcon size={18} />
                </div>
                <FlexBadge tone={feedback.tone}>{feedback.label}</FlexBadge>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-5 p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-white/82">
                Canción
                <input
                  className={fieldClass}
                  placeholder="Nombre del tema"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-white/82">
                Artista
                <input
                  className={fieldClass}
                  placeholder="Artista o banda"
                  value={artist}
                  onChange={(event) => setArtist(event.target.value)}
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-white/82">
              Género
              <input
                className={fieldClass}
                placeholder="Jazz, soul, funk..."
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-white/82">
              Dedicatoria opcional
              <textarea
                className={`${fieldClass} min-h-32 resize-none leading-6`}
                placeholder="Un mensaje breve para acompañar el pedido"
                value={dedication}
                onChange={(event) => setDedication(event.target.value)}
              />
            </label>

            <div className="min-h-12">
              {loading ? (
                <div className="rounded-md border border-[var(--gold)]/25 bg-[var(--gold)]/10 p-3 text-sm font-semibold text-[var(--gold-bright)]">
                  Enviando...
                </div>
              ) : null}
              {message ? (
                <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
                  <span className="font-bold">Solicitud enviada</span>
                  <span className="mt-1 block text-green-100/78">El DJ revisará tu pedido durante la sesión.</span>
                </div>
              ) : null}
              {error ? (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  <span className="font-bold">Error al enviar</span>
                  <span className="mt-1 block text-red-100/78">{error}</span>
                </div>
              ) : null}
            </div>

            <FlexButton className="w-full sm:w-auto" disabled={loading} loading={loading}>
              {loading ? "Enviando..." : <><Send size={19} /> Enviar solicitud</>}
            </FlexButton>
          </form>
        </FlexCard>

        <aside className="grid gap-5 xl:sticky xl:top-8 xl:self-start">
          <FlexCard className="border-white/10 bg-white/[0.025]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Guía rápida</p>
                <h2 className="mt-1 text-xl font-bold text-white">Cómo funciona</h2>
              </div>
              <ListChecks className="text-[var(--gold)]" size={23} />
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-3 text-sm leading-6 text-white/76">
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/12 text-xs font-bold text-[var(--gold)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </FlexCard>

          <FlexCard className="border-[var(--gold)]/20 bg-[linear-gradient(135deg,rgba(217,166,64,0.10),rgba(76,18,18,0.12),rgba(255,255,255,0.02))]">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]">
                <Lightbulb size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Consejo FLEX</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Escribe bien el nombre de la canción y el artista para que el DJ la encuentre más rápido.
                </p>
              </div>
            </div>
          </FlexCard>
        </aside>
      </div>
    </div>
  );
}
