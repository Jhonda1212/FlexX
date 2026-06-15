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

type FulfillmentResult = {
  alreadyFulfilled: boolean;
  ticketsCreated: number;
  privateRoomAccessCreated: number;
};

const isDev = process.env.NODE_ENV !== "production";

function ok(payload: Record<string, unknown> = {}) {
  return NextResponse.json({ received: true, ...payload });
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function isUuid(value: string | null | undefined) {
  return Boolean(value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
}

function logWebhookDebug(message: string, data: Record<string, unknown> = {}) {
  if (!isDev) return;
  console.info("[stripe-webhook]", message, data);
}

function logWebhookError(message: string, error: unknown, data: Record<string, unknown> = {}) {
  if (!isDev) return;
  console.error("[stripe-webhook]", message, {
    ...data,
    error: error instanceof Error ? { name: error.name, message: error.message } : { message: String(error) }
  });
}

function eventMetadataOrderId(event: Stripe.Event) {
  const object = event.data.object as {
    metadata?: Stripe.Metadata | null;
    client_reference_id?: string | null;
  };

  return object.metadata?.order_id ?? object.client_reference_id ?? null;
}

async function getOrderByCheckoutSession(sessionId: string, metadataOrderId?: string | null) {
  const admin = createSupabaseAdminClient();
  const select = "id, user_id, status, amount_total_cents, currency, order_items(id, item_type, event_id, zone_id, quantity)";
  const { data, error } = await admin
    .from("orders")
    .select(select)
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as OrderWithItems;
  if (!isUuid(metadataOrderId)) return null;

  const { data: orderByMetadata, error: metadataError } = await admin
    .from("orders")
    .select(select)
    .eq("id", metadataOrderId)
    .maybeSingle();

  if (metadataError) throw metadataError;
  return orderByMetadata as OrderWithItems | null;
}

async function orderHasFulfillment(orderId: string) {
  const admin = createSupabaseAdminClient();
  const [{ data: tickets, error: ticketsError }, { data: accesses, error: accessError }] = await Promise.all([
    admin.from("tickets").select("id").eq("order_id", orderId).limit(1),
    admin.from("private_room_access").select("id").eq("order_id", orderId).limit(1)
  ]);

  if (ticketsError) throw ticketsError;
  if (accessError) throw accessError;
  return {
    tickets: tickets?.length ?? 0,
    privateRoomAccess: accesses?.length ?? 0,
    hasAny: Boolean(tickets?.length || accesses?.length)
  };
}

async function createFulfillment(order: OrderWithItems): Promise<FulfillmentResult> {
  const existingFulfillment = await orderHasFulfillment(order.id);
  if (existingFulfillment.hasAny) {
    return {
      alreadyFulfilled: true,
      ticketsCreated: 0,
      privateRoomAccessCreated: 0
    };
  }

  const admin = createSupabaseAdminClient();
  const result: FulfillmentResult = {
    alreadyFulfilled: false,
    ticketsCreated: 0,
    privateRoomAccessCreated: 0
  };

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
        const { data, error } = await admin.from("tickets").insert(tickets).select("id");
        if (error) throw error;
        result.ticketsCreated += data?.length ?? 0;
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
        const { data, error } = await admin.from("private_room_access").insert(accesses).select("id");
        if (error) throw error;
        result.privateRoomAccessCreated += data?.length ?? 0;
      }
    }
  }

  return result;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = createSupabaseAdminClient();
  const metadataOrderId = session.metadata?.order_id ?? session.client_reference_id ?? null;
  const order = await getOrderByCheckoutSession(session.id, metadataOrderId);
  if (!order) {
    logWebhookDebug("checkout.session.completed order not found", {
      event_type: "checkout.session.completed",
      order_id: metadataOrderId,
      session_id: session.id
    });
    return {
      orderId: metadataOrderId,
      orderPassedToPaid: false,
      fulfillment: null
    };
  }

  const sessionAmount = session.amount_total ?? 0;
  const sessionCurrency = session.currency?.toLowerCase() ?? "";
  if (sessionAmount !== order.amount_total_cents || sessionCurrency !== order.currency.toLowerCase()) {
    throw new Error(`Stripe amount mismatch for order ${order.id}`);
  }

  let orderPassedToPaid = false;

  if (order.status !== "paid") {
    const { data: paidOrder, error } = await admin
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: asString(session.payment_intent),
        stripe_customer_id: asString(session.customer),
        customer_email: session.customer_details?.email ?? session.customer_email ?? null
      })
      .eq("id", order.id)
      .neq("status", "paid")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    orderPassedToPaid = Boolean(paidOrder);
  }

  const fulfillment = await createFulfillment({ ...order, status: "paid" });

  logWebhookDebug("checkout.session.completed processed", {
    event_type: "checkout.session.completed",
    order_id: order.id,
    metadata_order_id: metadataOrderId,
    order_passed_to_paid: orderPassedToPaid,
    order_already_paid: order.status === "paid",
    fulfillment_already_exists: fulfillment.alreadyFulfilled,
    tickets_created: fulfillment.ticketsCreated,
    private_room_access_created: fulfillment.privateRoomAccessCreated
  });

  return {
    orderId: order.id,
    orderPassedToPaid,
    fulfillment
  };
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

  const metadataOrderId = eventMetadataOrderId(event);
  logWebhookDebug("event received", {
    event_type: event.type,
    order_id: metadataOrderId
  });

  try {
    let result: Record<string, unknown> = {};

    switch (event.type) {
      case "checkout.session.completed":
        result = { checkout: await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session) };
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
        logWebhookDebug("event ignored", {
          event_type: event.type,
          order_id: metadataOrderId,
          ignored: true
        });
        return ok({ ignored: true });
    }

    return ok(result);
  } catch (error) {
    logWebhookError("event processing failed", error, {
      event_type: event.type,
      order_id: metadataOrderId
    });
    const message = error instanceof Error ? error.message : "Stripe webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
