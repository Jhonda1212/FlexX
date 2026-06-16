import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";

type OrderItem = {
  id: string;
  item_type: "ticket" | "vip_reservation";
  event_id: string | null;
  zone_id: string | null;
  ticket_tier_id: string | null;
  quantity: number;
};

type OrderWithItems = {
  id: string;
  user_id: string;
  status: string;
  amount_total_cents: number;
  currency: string;
  metadata: Record<string, unknown> | null;
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

function serializeWebhookError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const record = error as Error & {
      cause?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
      status?: unknown;
    };

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: record.code ?? null,
      details: record.details ?? null,
      hint: record.hint ?? null,
      status: record.status ?? null,
      cause: record.cause ? serializeWebhookError(record.cause) : null
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      message: typeof record.message === "string" ? record.message : safeJsonStringify(record),
      details: record.details ?? null,
      hint: record.hint ?? null,
      code: record.code ?? null,
      status: record.status ?? null,
      keys: Object.keys(record),
      json: safeJsonStringify(record)
    };
  }

  return { message: String(error) };
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function logWebhookError(message: string, error: unknown, data: Record<string, unknown> = {}) {
  console.error("[stripe-webhook]", message, {
    ...data,
    error: serializeWebhookError(error)
  });
}

function webhookEnvStatus() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY),
    STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    expected_service_role_env: "SUPABASE_SERVICE_ROLE_KEY"
  };
}

function eventMetadataOrderId(event: Stripe.Event) {
  const object = event.data.object as {
    metadata?: Stripe.Metadata | null;
    client_reference_id?: string | null;
  };

  return object.metadata?.order_id ?? object.client_reference_id ?? null;
}

function isSchemaCacheColumnError(error: unknown, columnName: string) {
  const serialized = serializeWebhookError(error);
  const message = String(serialized.message ?? "");
  const code = String(serialized.code ?? "");
  return code === "PGRST204" && message.includes(columnName);
}

function normalizeOrder(data: unknown): OrderWithItems {
  const order = data as OrderWithItems;
  return {
    ...order,
    metadata: order.metadata ?? null,
    order_items: (order.order_items ?? []).map((item) => ({
      ...item,
      ticket_tier_id: item.ticket_tier_id ?? null
    }))
  };
}

async function getOrderByCheckoutSession(sessionId: string, metadataOrderId?: string | null) {
  const admin = createSupabaseAdminClient();
  const select = "id, user_id, status, amount_total_cents, currency, metadata, order_items(id, item_type, event_id, zone_id, ticket_tier_id, quantity)";
  const fallbackSelect = "id, user_id, status, amount_total_cents, currency, metadata, order_items(id, item_type, event_id, zone_id, quantity)";
  logWebhookDebug("checkout lookup by session", {
    session_id: sessionId,
    metadata_order_id: metadataOrderId
  });

  const sessionLookup = await admin
    .from("orders")
    .select(select)
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  let data: unknown = sessionLookup.data;
  let error = sessionLookup.error;

  if (error && isSchemaCacheColumnError(error, "ticket_tier_id")) {
    logWebhookDebug("checkout lookup retry without ticket_tier_id", {
      session_id: sessionId,
      reason: serializeWebhookError(error)
    });

    const fallback = await admin
      .from("orders")
      .select(fallbackSelect)
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  logWebhookDebug("checkout lookup by session result", {
    session_id: sessionId,
    has_order: Boolean(data),
    error: error ? serializeWebhookError(error) : null
  });

  if (error) throw error;
  if (data) return normalizeOrder(data);
  if (!isUuid(metadataOrderId)) return null;

  logWebhookDebug("checkout lookup by metadata order", {
    order_id: metadataOrderId
  });

  const metadataLookup = await admin
    .from("orders")
    .select(select)
    .eq("id", metadataOrderId)
    .maybeSingle();
  let orderByMetadata: unknown = metadataLookup.data;
  let metadataError = metadataLookup.error;

  if (metadataError && isSchemaCacheColumnError(metadataError, "ticket_tier_id")) {
    logWebhookDebug("checkout metadata lookup retry without ticket_tier_id", {
      order_id: metadataOrderId,
      reason: serializeWebhookError(metadataError)
    });

    const fallback = await admin
      .from("orders")
      .select(fallbackSelect)
      .eq("id", metadataOrderId)
      .maybeSingle();
    orderByMetadata = fallback.data;
    metadataError = fallback.error;
  }

  logWebhookDebug("checkout lookup by metadata order result", {
    order_id: metadataOrderId,
    has_order: Boolean(orderByMetadata),
    error: metadataError ? serializeWebhookError(metadataError) : null
  });

  if (metadataError) throw metadataError;
  return orderByMetadata ? normalizeOrder(orderByMetadata) : null;
}

async function orderHasFulfillment(orderId: string) {
  const admin = createSupabaseAdminClient();
  logWebhookDebug("checking fulfillment", { order_id: orderId });

  const [{ data: tickets, error: ticketsError }, { data: accesses, error: accessError }] = await Promise.all([
    admin.from("tickets").select("id").eq("order_id", orderId).limit(1),
    admin.from("private_room_access").select("id").eq("order_id", orderId).limit(1)
  ]);

  logWebhookDebug("fulfillment check result", {
    order_id: orderId,
    tickets_count: tickets?.length ?? 0,
    private_room_access_count: accesses?.length ?? 0,
    tickets_error: ticketsError ? serializeWebhookError(ticketsError) : null,
    private_room_access_error: accessError ? serializeWebhookError(accessError) : null
  });

  if (ticketsError) throw ticketsError;
  if (accessError) throw accessError;
  return {
    tickets: tickets?.length ?? 0,
    privateRoomAccess: accesses?.length ?? 0,
    hasAny: Boolean(tickets?.length || accesses?.length)
  };
}

function metadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function createFulfillment(order: OrderWithItems, sessionMetadata?: Stripe.Metadata | null): Promise<FulfillmentResult> {
  logWebhookDebug("checkout fulfillment start", {
    order_id: order.id,
    user_id: order.user_id,
    order_status: order.status,
    order_items_count: order.order_items?.length ?? 0,
    metadata_zone_id: metadataString(order.metadata, "zone_id"),
    stripe_metadata_zone_id: sessionMetadata?.zone_id ?? null
  });

  const existingFulfillment = await orderHasFulfillment(order.id);
  if (existingFulfillment.hasAny) {
    logWebhookDebug("checkout fulfillment already exists", {
      order_id: order.id,
      tickets_count: existingFulfillment.tickets,
      private_room_access_count: existingFulfillment.privateRoomAccess
    });

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
    logWebhookDebug("checkout fulfillment item", {
      order_id: order.id,
      order_item_id: item.id,
      item_type: item.item_type,
      event_id: item.event_id,
      zone_id: item.zone_id,
      ticket_tier_id: item.ticket_tier_id,
      quantity: item.quantity
    });

    if (item.item_type === "ticket") {
      if (!item.event_id) continue;
      const tickets = Array.from({ length: item.quantity }, () => ({
        user_id: order.user_id,
        event_id: item.event_id,
        zone_id: item.zone_id,
        ticket_tier_id: item.ticket_tier_id,
        order_id: order.id,
        status: "active"
      }));

      if (tickets.length) {
        logWebhookDebug("inserting tickets", {
          order_id: order.id,
          table: "tickets",
          count: tickets.length,
          event_id: item.event_id,
          ticket_tier_id: item.ticket_tier_id
        });

        const { data, error } = await admin.from("tickets").insert(tickets).select("id");
        logWebhookDebug("tickets insert result", {
          order_id: order.id,
          inserted_count: data?.length ?? 0,
          error: error ? serializeWebhookError(error) : null
        });
        if (error) throw error;
        result.ticketsCreated += data?.length ?? 0;
      }
      continue;
    }

    if (item.item_type === "vip_reservation") {
      const zoneId = item.zone_id ?? metadataString(order.metadata, "zone_id") ?? sessionMetadata?.zone_id ?? null;

      if (!zoneId) {
        logWebhookError("VIP fulfillment missing zone_id for order", new Error("VIP fulfillment missing zone_id for order"), {
          order_id: order.id,
          user_id: order.user_id,
          order_items: order.order_items.map((orderItem) => ({
            id: orderItem.id,
            item_type: orderItem.item_type,
            event_id: orderItem.event_id,
            zone_id: orderItem.zone_id,
            ticket_tier_id: orderItem.ticket_tier_id,
            quantity: orderItem.quantity
          })),
          order_metadata: order.metadata ?? null,
          stripe_metadata: sessionMetadata ?? null
        });
        throw new Error(`VIP fulfillment missing zone_id for order ${order.id}`);
      }

      logWebhookDebug("loading vip zone", {
        order_id: order.id,
        zone_id: zoneId
      });

      const { data: zone, error: zoneError } = await admin
        .from("club_zones")
        .select("capacity")
        .eq("id", zoneId)
        .maybeSingle();

      logWebhookDebug("vip zone lookup result", {
        order_id: order.id,
        zone_id: zoneId,
        has_zone: Boolean(zone),
        capacity: zone?.capacity ?? null,
        error: zoneError ? serializeWebhookError(zoneError) : null
      });

      if (zoneError) throw zoneError;
      if (!zone) throw new Error(`VIP fulfillment zone not found for order ${order.id}`);

      const accesses = Array.from({ length: item.quantity }, () => ({
        user_id: order.user_id,
        event_id: item.event_id,
        zone_id: zoneId,
        order_id: order.id,
        active: true,
        status: "confirmed",
        max_guests: Math.min(Number(zone?.capacity ?? 10), 10)
      }));

      if (accesses.length) {
        logWebhookDebug("inserting private room access", {
          order_id: order.id,
          table: "private_room_access",
          count: accesses.length,
          user_id: order.user_id,
          zone_id: zoneId
        });
        logWebhookDebug("private room access payload", {
          order_id: order.id,
          payload: accesses
        });

        let { data, error } = await admin.from("private_room_access").insert(accesses).select("id");
        if (error && isSchemaCacheColumnError(error, "status")) {
          logWebhookDebug("private room access insert retry without status", {
            order_id: order.id,
            reason: serializeWebhookError(error)
          });

          const fallbackAccesses = accesses.map(({ status: _status, ...access }) => access);
          const fallback = await admin.from("private_room_access").insert(fallbackAccesses).select("id");
          data = fallback.data;
          error = fallback.error;
        }
        logWebhookDebug("private room access insert result", {
          order_id: order.id,
          inserted_count: data?.length ?? 0,
          error: error ? serializeWebhookError(error) : null
        });
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
  logWebhookDebug("checkout.session.completed start", {
    session_id: session.id,
    metadata_order_id: metadataOrderId,
    client_reference_id: session.client_reference_id ?? null,
    metadata: session.metadata ?? null,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null
  });

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
  logWebhookDebug("checkout.session.completed order loaded", {
    order_id: order.id,
    user_id: order.user_id,
    status: order.status,
    amount_total_cents: order.amount_total_cents,
    currency: order.currency,
    order_items_count: order.order_items?.length ?? 0
  });

  if (sessionAmount !== order.amount_total_cents || sessionCurrency !== order.currency.toLowerCase()) {
    throw new Error(`Stripe amount mismatch for order ${order.id}`);
  }

  let orderPassedToPaid = false;

  if (order.status !== "paid") {
    logWebhookDebug("updating order as paid", {
      order_id: order.id,
      stripe_checkout_session_id: session.id,
      has_payment_intent: Boolean(session.payment_intent),
      has_customer: Boolean(session.customer),
      has_customer_email: Boolean(session.customer_details?.email ?? session.customer_email)
    });

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

    logWebhookDebug("order paid update result", {
      order_id: order.id,
      updated: Boolean(paidOrder),
      error: error ? serializeWebhookError(error) : null
    });

    if (error) throw error;
    orderPassedToPaid = Boolean(paidOrder);
  }

  let fulfillment: FulfillmentResult;
  try {
    fulfillment = await createFulfillment({ ...order, status: "paid" }, session.metadata);
  } catch (fulfillmentError) {
    logWebhookError("checkout fulfillment failed", fulfillmentError, {
      event_type: "checkout.session.completed",
      order_id: order.id,
      user_id: order.user_id,
      order_items_count: order.order_items?.length ?? 0
    });
    throw fulfillmentError;
  }

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
  logWebhookDebug("webhook env check", webhookEnvStatus());

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
      order_id: metadataOrderId,
      env: webhookEnvStatus()
    });
    const message = error instanceof Error ? error.message : "Stripe webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
