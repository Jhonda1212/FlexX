import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";

type OrderItem = {
  id: string;
  item_type: "ticket" | "vip_reservation";
  event_id: string | null;
  zone_id: string | null;
  quantity: number;
};

type OrderWithItems = {
  id: string;
  user_id: string;
  status: string;
  amount_total_cents: number;
  currency: string;
  order_items: OrderItem[];
};

function ok(received = true) {
  return NextResponse.json({ received });
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

async function getOrderByCheckoutSession(sessionId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("id, user_id, status, amount_total_cents, currency, order_items(id, item_type, event_id, zone_id, quantity)")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderWithItems | null;
}

async function orderHasFulfillment(orderId: string) {
  const admin = createSupabaseAdminClient();
  const [{ data: tickets, error: ticketsError }, { data: accesses, error: accessError }] = await Promise.all([
    admin.from("tickets").select("id").eq("order_id", orderId).limit(1),
    admin.from("private_room_access").select("id").eq("order_id", orderId).limit(1)
  ]);

  if (ticketsError) throw ticketsError;
  if (accessError) throw accessError;
  return Boolean(tickets?.length || accesses?.length);
}

async function createFulfillment(order: OrderWithItems) {
  if (await orderHasFulfillment(order.id)) return;

  const admin = createSupabaseAdminClient();

  for (const item of order.order_items ?? []) {
    if (item.item_type === "ticket") {
      if (!item.event_id) continue;
      const tickets = Array.from({ length: item.quantity }, () => ({
        user_id: order.user_id,
        event_id: item.event_id,
        zone_id: item.zone_id,
        order_id: order.id,
        status: "active"
      }));

      if (tickets.length) {
        const { error } = await admin.from("tickets").insert(tickets);
        if (error) throw error;
      }
      continue;
    }

    if (item.item_type === "vip_reservation") {
      if (!item.zone_id) continue;
      const { data: zone, error: zoneError } = await admin
        .from("club_zones")
        .select("capacity")
        .eq("id", item.zone_id)
        .maybeSingle();

      if (zoneError) throw zoneError;

      const accesses = Array.from({ length: item.quantity }, () => ({
        user_id: order.user_id,
        event_id: item.event_id,
        zone_id: item.zone_id,
        order_id: order.id,
        active: true,
        max_guests: Math.min(Number(zone?.capacity ?? 10), 10)
      }));

      if (accesses.length) {
        const { error } = await admin.from("private_room_access").insert(accesses);
        if (error) throw error;
      }
    }
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = createSupabaseAdminClient();
  const order = await getOrderByCheckoutSession(session.id);
  if (!order) return;

  const sessionAmount = session.amount_total ?? 0;
  const sessionCurrency = session.currency?.toLowerCase() ?? "";
  if (sessionAmount !== order.amount_total_cents || sessionCurrency !== order.currency.toLowerCase()) {
    throw new Error(`Stripe amount mismatch for order ${order.id}`);
  }

  if (order.status === "paid") return;

  const { error } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: asString(session.payment_intent),
      stripe_customer_id: asString(session.customer),
      customer_email: session.customer_details?.email ?? session.customer_email ?? null
    })
    .eq("id", order.id);

  if (error) throw error;
  await createFulfillment({ ...order, status: "paid" });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "failed" })
    .eq("stripe_checkout_session_id", session.id)
    .eq("status", "pending");

  if (error) throw error;
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "failed" })
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .neq("status", "paid");

  if (error) throw error;
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = asString(charge.payment_intent);
  if (!paymentIntentId) return;

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (error) throw error;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        break;
    }

    return ok();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
