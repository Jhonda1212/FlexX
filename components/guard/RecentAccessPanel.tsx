"use client";

import { useEffect, useState } from "react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { listRecentAccessLogs, type AccessLogView } from "@/lib/flex-actions";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function resultClass(result: string) {
  if (result === "valid") return "text-green-200";
  if (result === "used" || result === "expired" || result === "invalid") return "text-red-200";
  return "text-[var(--gold)]";
}

export function RecentAccessPanel({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<AccessLogView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    listRecentAccessLogs()
      .then((items) => {
        if (active) setLogs(items);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar accesos recientes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <Card>
      <SectionTitle title="Ultimos accesos" />
      {loading ? <p className="text-sm text-[var(--muted)]">Cargando accesos...</p> : null}
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
      {!loading && !error && logs.length === 0 ? <p className="text-sm text-[var(--muted)]">Todavia no hay accesos registrados.</p> : null}
      <div className="space-y-4">
        {logs.map((item) => (
          <div key={item.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-white">{item.person}</div>
              <div className="text-xs text-[var(--muted)]">{formatTime(item.createdAt)}</div>
            </div>
            <div className="mt-1 text-sm text-[var(--muted)]">{item.accessType} - {item.context}</div>
            <div className={`mt-2 text-xs font-bold uppercase tracking-[0.16em] ${resultClass(item.result)}`}>
              {item.result} {item.reason ? `- ${item.reason}` : ""}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
