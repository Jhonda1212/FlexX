"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { listActiveStorageItems, markStorageDelivered, type StorageView } from "@/lib/flex-actions";

export default function ActiveStoragePage() {
  const [items, setItems] = useState<StorageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listActiveStorageItems()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((storageError) => {
        if (active) setError(storageError instanceof Error ? storageError.message : "No se pudieron cargar las prendas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function deliver(id: string) {
    setError("");
    setSavingId(id);
    try {
      setItems(await markStorageDelivered(id));
    } catch (deliverError) {
      setError(deliverError instanceof Error ? deliverError.message : "No se pudo marcar la prenda como entregada.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="max-w-4xl">
      <SectionTitle title="Entregas activas" />
      {loading ? <Card><p className="text-[var(--muted)]">Cargando prendas...</p></Card> : null}
      {error ? <Card><p className="text-red-200">{error}</p></Card> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {!loading && !error && items.length === 0 ? <Card><p className="text-[var(--muted)]">Aun no hay prendas activas.</p></Card> : null}
        {items.map((item) => (
          <Card key={item.id}>
            <div className="text-2xl font-bold text-[var(--gold)]">{item.storageNumber}</div>
            <div className="mt-3 text-white">{item.itemDescription}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.status}</div>
            <Button variant="success" className="mt-5 w-full" disabled={item.status !== "active" || savingId === item.id} onClick={() => deliver(item.id)}>
              {item.status === "delivered" ? "Entregada" : savingId === item.id ? "Guardando" : "Marcar entregada"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
