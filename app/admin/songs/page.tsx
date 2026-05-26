"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { requireAdmin } from "@/lib/admin-actions";

type SongRow = {
  id: string;
  title: string;
  artist: string | null;
  dedication: string | null;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name?: string } | null;
};

const filters = ["pending", "approved", "playing", "played", "rejected"];

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(status = filter) {
    const supabase = await requireAdmin();
    const { data, error: queryError } = await supabase
      .from("song_requests")
      .select("id, title, artist, dedication, status, created_at, user_id, profiles(full_name)")
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (queryError) throw queryError;
    setSongs((data ?? []) as SongRow[]);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    load(filter).catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar canciones.")).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filter]);

  async function setStatus(id: string, status: string) {
    setError("");
    try {
      const supabase = await requireAdmin();
      const { error: updateError } = await supabase.from("song_requests").update({ status }).eq("id", id);
      if (updateError) throw updateError;
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo actualizar la cancion.");
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Canciones" description="Aprueba, reproduce o rechaza canciones pedidas por usuarios." />
      <div className="flex flex-wrap gap-2">{filters.map((item) => <AdminActionButton key={item} variant={filter === item ? "primary" : "ghost"} onClick={() => setFilter(item)}>{item}</AdminActionButton>)}</div>
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {!loading && !error && songs.length === 0 ? <AdminEmptyState title="Sin canciones" description={`No hay canciones con estado ${filter}.`} /> : null}
      {songs.length ? (
        <AdminDataTable columns={["Cancion", "Usuario", "Estado", "Fecha", "Acciones"]}>
          {songs.map((song) => (
            <tr key={song.id} className="text-white">
              <td className="px-4 py-3"><div className="font-bold">{song.title}</div><div className="text-xs text-[var(--muted)]">{song.artist ?? "Sin artista"} {song.dedication ? `- ${song.dedication}` : ""}</div></td>
              <td className="px-4 py-3">{song.profiles?.full_name || song.user_id}</td>
              <td className="px-4 py-3"><StatusBadge status={song.status} /></td>
              <td className="px-4 py-3">{new Date(song.created_at).toLocaleString("es-ES")}</td>
              <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                <AdminActionButton variant="success" onClick={() => setStatus(song.id, "approved")}>Aprobar</AdminActionButton>
                <AdminActionButton variant="ghost" onClick={() => setStatus(song.id, "playing")}>Sonando</AdminActionButton>
                <AdminActionButton variant="ghost" onClick={() => setStatus(song.id, "played")}>Reproducida</AdminActionButton>
                <AdminActionButton variant="danger" onClick={() => setStatus(song.id, "rejected")}>Rechazar</AdminActionButton>
              </div></td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
