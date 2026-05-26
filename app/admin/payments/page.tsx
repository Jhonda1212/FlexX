"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminDataTable, AdminEmptyState, AdminErrorState, AdminLoadingState, AdminPageHeader, StatusBadge } from "@/components/admin/AdminComponents";
import { cents, requireAdmin, shortToken } from "@/lib/admin-actions";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  amount_total_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  order_items?: Array<{
    item_type: string;
    quantity: number;
    unit_amount_cents: number;
  }>;
};

const filters = ["pending", "paid", "failed", "refunded"];

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
          .select("*, order_items(item_type, quantity, unit_amount_cents)")
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
        <AdminDataTable columns={["Orden", "Usuario", "Estado", "Importe", "Items", "Stripe checkout", "Payment intent", "Creada"]}>
          {orders.map((order) => (
            <tr key={order.id} className="text-white">
              <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
              <td className="px-4 py-3 font-mono text-xs">{order.user_id}</td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-3">{cents(order.amount_total_cents)} {order.currency.toUpperCase()}</td>
              <td className="px-4 py-3 text-xs text-[var(--muted)]">
                {(order.order_items ?? []).length
                  ? order.order_items?.map((item) => `${item.quantity}x ${item.item_type} (${cents(item.unit_amount_cents)})`).join(", ")
                  : "Sin items"}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{shortToken(order.stripe_checkout_session_id)}</td>
              <td className="px-4 py-3 font-mono text-xs">{shortToken(order.stripe_payment_intent_id)}</td>
              <td className="px-4 py-3">{new Date(order.created_at).toLocaleString("es-ES")}</td>
            </tr>
          ))}
        </AdminDataTable>
      ) : null}
    </div>
  );
}
