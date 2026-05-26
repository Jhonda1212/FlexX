"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Music, Sparkles } from "lucide-react";
import { FlexBadge } from "@/components/ui/FlexBadge";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { submitSongRequest } from "@/lib/flex-actions";

const tips = [
  "Escribe artista y título con claridad.",
  "Añade género para ayudar al DJ.",
  "Usa la dedicatoria solo si suma a la noche."
];

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
      setError("Completa cancion, artista y genero.");
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
      setMessage("Tu cancion fue enviada a la lista.");
    } else {
      setError(result.error ?? "No se pudo enviar la cancion.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <FlexCard className="overflow-hidden border-[var(--gold)]/20 p-0">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(217,166,64,0.13),rgba(8,8,8,0.96)_54%,rgba(76,18,18,0.16))] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Tu próxima canción en FLEX</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Pide tu canción</h1>
              <p className="mt-1 text-sm text-white/70">Envia tu tema al DJ y acompaña la noche con tu selección.</p>
            </div>
            <div className="grid size-14 shrink-0 place-items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]">
              <Music size={26} />
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_230px]">
          <section className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Solicitud musical</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Completa los datos básicos para que el equipo pueda revisar tu pedido.</p>
              </div>
              <FlexBadge tone={message ? "success" : "gold"}>{message ? "Enviado" : "Pendiente"}</FlexBadge>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-white/80">
                  Canción
                  <input
                    className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/35"
                    placeholder="Nombre del tema"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-white/80">
                  Artista
                  <input
                    className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/35"
                    placeholder="Artista o banda"
                    value={artist}
                    onChange={(event) => setArtist(event.target.value)}
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Género
                <input
                  className="gold-focus rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/35"
                  placeholder="Jazz, soul, funk..."
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Dedicatoria opcional
                <textarea
                  className="gold-focus min-h-28 rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white transition placeholder:text-white/36 hover:border-[var(--gold)]/35"
                  placeholder="Un mensaje breve para acompañar el pedido"
                  value={dedication}
                  onChange={(event) => setDedication(event.target.value)}
                />
              </label>

              {message ? <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
              {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

              <FlexButton disabled={loading} loading={loading}>
                <Music size={20} /> Enviar canción
              </FlexButton>
            </form>
          </section>

          <section className="border-t border-white/10 bg-black/20 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Estado</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]">
                  {message ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-white">{message ? "Pedido enviado" : "Listo para enviar"}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {message ? "Tu canción queda pendiente de revisión por el equipo." : "El pedido aparecerá para revisión cuando lo envíes."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </FlexCard>

      <aside className="xl:sticky xl:top-8 xl:self-start">
        <FlexCard className="border-white/10 bg-white/[0.025]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Cómo funciona</p>
              <h2 className="mt-1 text-xl font-bold text-white">Consejos rápidos</h2>
            </div>
            <Sparkles className="text-[var(--gold)]" size={22} />
          </div>

          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={tip} className="flex gap-3 text-sm leading-6 text-white/75">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-xs font-bold text-[var(--gold)]">{index + 1}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-[var(--muted)]">
            El DJ puede priorizar la energía de la sala, el momento de la sesión y la disponibilidad del tema.
          </p>
        </FlexCard>
      </aside>
    </div>
  );
}
