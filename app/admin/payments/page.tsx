"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { requireAdmin, shortToken } from "@/lib/admin-actions";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  amount_total_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  paid_at: string | null;
  created_at: string;
  order_items?: Array<{
    item_type: string;
    quantity: number;
    unit_amount_cents: number;
    total_amount_cents: number | null;
  }>;
};

const filters = ["pending", "paid", "failed", "refunded"];

function money(value: number | null | undefined, currency: string | null | undefined) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: (currency || "EUR").toUpperCase()
  }).format((value ?? 0) / 100);
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState("paid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = await requireAdmin();
        const { data, error: queryError } = await supabase
          .from("orders")
          .select("*, order_items(item_type, quantity, unit_amount_cents, total_amount_cents)")
          .eq("status", filter)
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        if (active) setOrders((data ?? []) as OrderRow[]);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar pagos.");
      } finally {
        if (active) setLoading(false);
      }
    }
    setLoading(true);
    load();
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Pagos" description="Consulta ordenes y pagos de Stripe. Los reembolsos aun no estan implementados." />
      <div className="flex flex-wrap gap-2">{filters.map((item) => <AdminActionButton key={item} variant={filter === item ? "primary" : "ghost"} onClick={() => setFilter(item)}>{item}</AdminActionButton>)}</div>
      {loading ? <AdminLoadingState /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {!loading && !error && orders.length === 0 ? <AdminEmptyState title="Sin ordenes" description={`No hay ordenes con estado ${filter}.`} /> : null}
      {orders.length ? (
        <AdminDataTable columns={["Orden", "Cliente", "Estado", "Importe", "Items", "Stripe checkout", "Payment intent", "Fecha"]}>
          {orders.map((order) => (
            <tr key={order.id} className="text-white">
              <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
              <td className="px-4 py-3 text-xs">
                <div className="font-semibold text-white">{order.customer_email || "Sin email"}</div>
                <div className="font-mono text-[var(--muted)]">{shortToken(order.user_id)}</div>
              </td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-3">{money(order.amount_total_cents, order.currency)}</td>
              <td className="px-4 py-3 text-xs text-[var(--muted)]">
                {(order.order_items ?? []).length
                  ? order.order_items?.map((item) => `${item.quantity}x ${item.item_type} (${money(item.total_amount_cents ?? item.unit_amount_cents, order.currency)})`).join(", ")
                  : "Sin items"}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{shortToken(order.stripe_checkout_session_id)}</td>
              <td className="px-4 py-3 font-mono text-xs">{shortToken(order.stripe_payment_intent_id)}</td>
              <td className="px-4 py-3">
                <div>{new Date(order.created_at).toLocaleString("es-ES")}</div>
                {order.paid_at ? <div className="text-xs text-[var(--muted)]">Pagada: {new Date(order.paid_at).toLocaleString("es-ES")}</div> : null}
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
