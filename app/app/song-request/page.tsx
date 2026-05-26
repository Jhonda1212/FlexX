"use client";

import { useState } from "react";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { submitSongRequest } from "@/lib/flex-actions";

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
    <Card className="max-w-2xl">
      <SectionTitle title="Pedir cancion" />
      <form onSubmit={submit} className="grid gap-4">
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Cancion" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Artista" value={artist} onChange={(event) => setArtist(event.target.value)} />
        <input className="rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Genero" value={genre} onChange={(event) => setGenre(event.target.value)} />
        <textarea className="min-h-28 rounded-md border border-white/10 bg-black/40 px-4 py-4 text-white" placeholder="Dedicatoria opcional" value={dedication} onChange={(event) => setDedication(event.target.value)} />
        {message ? <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">{message}</div> : null}
        {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        <Button disabled={loading}><Music size={20} /> {loading ? "Enviando" : "Enviar"}</Button>
      </form>
    </Card>
  );
}
