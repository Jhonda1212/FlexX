import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createRouteSupabase } from "@/lib/supabase/route";
import { getStripe } from "@/lib/stripe/server";

type CheckoutRequest = {
  item_type?: string;
  event_id?: string;
  zone_id?: string;
  ticket_tier_id?: string;
  quantity?: number;
};

type CheckoutProduct = {
  orderItemType: "ticket" | "vip_reservation";
  name: string;
  description: string | null;
  eventId: string | null;
  zoneId: string | null;
  ticketTierId: string | null;
  unitAmountCents: number;
  currency: string;
};

const isDev = process.env.NODE_ENV !== "production";

type CheckoutDebugData = Record<string, unknown>;

function logCheckoutDebug(message: string, data?: CheckoutDebugData) {
  if (!isDev) return;
  console.info("[checkout]", message, data ?? {});
}

function logCheckoutError(message: string, error: unknown, data?: CheckoutDebugData) {
  if (!isDev) return;
  console.error("[checkout]", message, {
    ...data,
    error: serializeError(error)
  });
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  if (typeof error === "object" && error !== null) {
    return error;
  }
  return { message: String(error) };
}

function safePayload(body: CheckoutRequest) {
  return {
    item_type: body.item_type ?? null,
    event_id: body.event_id ?? null,
    zone_id: body.zone_id ?? null,
    ticket_tier_id: body.ticket_tier_id ?? null,
    quantity: body.quantity ?? null
  };
}

function safeUser(user: { id?: string; email?: string | null } | null | undefined) {
  if (!user?.id) return null;
  return {
    id_prefix: user.id.slice(0, 8),
    has_email: Boolean(user.email)
  };
}

function safeProduct(product: CheckoutProduct) {
  return {
    orderItemType: product.orderItemType,
    eventId: product.eventId,
    zoneId: product.zoneId,
    ticketTierId: product.ticketTierId,
    unitAmountCents: product.unitAmountCents,
    currency: product.currency
  };
}

function devJsonError(message: string, step: string, error: unknown, status = 500) {
  if (!isDev) return jsonError(message, status);

  const serialized = serializeError(error);
  const details = typeof serialized === "object" && "message" in serialized
    ? String(serialized.message)
    : "Unknown checkout error";

  return NextResponse.json(
    {
      error: "Checkout failed",
      step,
      details
    },
    { status }
  );
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function appUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
}

function normalizeQuantity(value: unknown) {
  const quantity = typeof value === "number" ? value : Number(value ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error("Cantidad invalida.");
  }
  return quantity;
}

async function resolveTicketProduct(admin: ReturnType<typeof createSupabaseAdminClient>, body: CheckoutRequest): Promise<CheckoutProduct> {
  if (!body.event_id || !body.ticket_tier_id) {
    throw new Error("Selecciona un evento y tipo de entrada validos.");
  }

  logCheckoutDebug("ticket input", {
    event_id: body.event_id,
    ticket_tier_id: body.ticket_tier_id
  });

  const { data: event, error: eventError } = await admin
    .from("events")
    .select("id, title, is_published, starts_at, zone_name")
    .eq("id", body.event_id)
    .maybeSingle();

  logCheckoutDebug("events lookup result", {
    event_id: body.event_id,
    has_event: Boolean(event),
    event_error: eventError?.message ?? null,
    is_published: event?.is_published ?? null
  });

  if (eventError) throw eventError;
  if (!event || !event.is_published) {
    throw new Error("El evento no esta disponible para compra.");
  }

  const { data: tier, error: tierError } = await admin
    .from("event_ticket_tiers")
    .select("id, event_id, name, description, price_cents, currency, active, zone_name")
    .eq("id", body.ticket_tier_id)
    .eq("event_id", body.event_id)
    .maybeSingle();

  logCheckoutDebug("event_ticket_tiers lookup result", {
    event_id: body.event_id,
    ticket_tier_id: body.ticket_tier_id,
    has_tier: Boolean(tier),
    tier_error: tierError?.message ?? null,
    active: tier?.active ?? null,
    price_cents: tier?.price_cents ?? null,
    currency: tier?.currency ?? null
  });

  if (tierError) throw tierError;
  if (!tier || !tier.active) {
    throw new Error("El tipo de entrada no esta disponible.");
  }
  if (tier.price_cents <= 0) {
    throw new Error("El precio de esta entrada no esta configurado.");
  }

  return {
    orderItemType: "ticket",
    name: `${event.title} - ${tier.name}`,
    description: tier.zone_name || event.zone_name || null,
    eventId: event.id,
    zoneId: null,
    ticketTierId: tier.id,
    unitAmountCents: tier.price_cents,
    currency: (tier.currency || "EUR").toLowerCase()
  };
}

async function resolveVipProduct(admin: ReturnType<typeof createSupabaseAdminClient>, body: CheckoutRequest): Promise<CheckoutProduct> {
  if (!body.zone_id) {
    throw new Error("Selecciona una sala VIP valida.");
  }

  logCheckoutDebug("vip input", {
    zone_id: body.zone_id,
    event_id: body.event_id ?? null
  });

  const { data: zone, error: zoneError } = await admin
    .from("club_zones")
    .select("id, name, type, active, vip_price_cents, capacity")
    .eq("id", body.zone_id)
    .maybeSingle();

  logCheckoutDebug("club_zones lookup result", {
    zone_id: body.zone_id,
    has_zone: Boolean(zone),
    zone_error: zoneError?.message ?? null,
    zone_type: zone?.type ?? null,
    active: zone?.active ?? null,
    vip_price_cents: zone?.vip_price_cents ?? null,
    capacity: zone?.capacity ?? null
  });

  if (zoneError) throw zoneError;
  if (!zone || !zone.active || !["vip_room", "private_room"].includes(zone.type)) {
    throw new Error("La sala VIP no esta disponible.");
  }
  if (zone.vip_price_cents <= 0) {
    throw new Error("El precio de esta sala VIP no esta configurado.");
  }

  return {
    orderItemType: "vip_reservation",
    name: `Reserva VIP - ${zone.name}`,
    description: `Acceso privado hasta ${zone.capacity} personas`,
    eventId: body.event_id ?? null,
    zoneId: zone.id,
    ticketTierId: null,
    unitAmountCents: zone.vip_price_cents,
    currency: "eur"
  };
}

export async function POST(request: Request) {
  let step = "start";

  try {
    step = "env-check";
    logCheckoutDebug("environment check", {
      has_STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
      has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      has_NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    });

    step = "parse-payload";
    const body = (await request.json()) as CheckoutRequest;
    logCheckoutDebug("payload received", safePayload(body));

    step = "validate-payload";
    const quantity = normalizeQuantity(body.quantity);
    const itemType = body.item_type;

    if (itemType !== "ticket" && itemType !== "vip") {
      return jsonError("Tipo de compra invalido.");
    }
    if (itemType === "vip" && quantity !== 1) {
      return jsonError("Las reservas VIP se compran de una en una.");
    }

    step = "auth";
    const supabase = await createRouteSupabase();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    logCheckoutDebug("auth result", {
      has_user: Boolean(userData.user),
      user: safeUser(userData.user),
      auth_error: userError?.message ?? null
    });
    if (userError) throw userError;
    const user = userData.user;
    if (!user) {
      return jsonError("Debes iniciar sesion para comprar.", 401);
    }

    step = "create-admin-client";
    const admin = createSupabaseAdminClient();
    step = itemType === "ticket" ? "resolve-ticket-product" : "resolve-vip-product";
    const product = itemType === "ticket"
      ? await resolveTicketProduct(admin, body)
      : await resolveVipProduct(admin, body);
    logCheckoutDebug("product resolved", safeProduct(product));

    const totalAmountCents = product.unitAmountCents * quantity;
    const currency = product.currency.toLowerCase();

    step = "create-order";
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        amount_total_cents: totalAmountCents,
        currency,
        customer_email: user.email ?? null,
        metadata: {
          checkout_item_type: itemType
        }
      })
      .select("id")
      .single();

    logCheckoutDebug("orders insert result", {
      has_order: Boolean(order),
      order_id: order?.id ?? null,
      order_error: orderError?.message ?? null,
      amount_total_cents: totalAmountCents,
      currency
    });

    if (orderError) throw orderError;

    step = "create-order-item";
    const { error: itemError } = await admin
      .from("order_items")
      .insert({
        order_id: order.id,
        item_type: product.orderItemType,
        event_id: product.eventId,
        zone_id: product.zoneId,
        ticket_tier_id: product.ticketTierId,
        quantity,
        unit_amount_cents: product.unitAmountCents,
        total_amount_cents: totalAmountCents
      });

    logCheckoutDebug("order_items insert result", {
      order_id: order.id,
      item_error: itemError?.message ?? null,
      item_type: product.orderItemType
    });

    if (itemError) throw itemError;

    step = "create-stripe-client";
    const stripe = getStripe();
    const baseUrl = appUrl(request);
    step = "stripe.checkout.sessions.create";
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: order.id,
        customer_email: user.email ?? undefined,
        line_items: [
          {
            quantity,
            price_data: {
              currency,
              unit_amount: product.unitAmountCents,
              product_data: {
                name: product.name,
                description: product.description ?? undefined
              }
            }
          }
        ],
        metadata: {
          order_id: order.id,
          user_id: user.id,
          item_type: itemType
        },
        success_url: `${baseUrl}/app/tickets?checkout=success&item_type=${itemType}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/app/tickets?checkout=cancelled`
      });
      logCheckoutDebug("stripe checkout session created", {
        order_id: order.id,
        session_id: session.id,
        has_url: Boolean(session.url),
        payment_status: session.payment_status
      });
    } catch (stripeError) {
      logCheckoutError("stripe.checkout.sessions.create failed", stripeError, {
        order_id: order.id,
        item_type: itemType,
        amount_total_cents: totalAmountCents,
        currency
      });
      throw stripeError;
    }

    step = "update-order-checkout-session";
    const { error: checkoutError } = await admin
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null
      })
      .eq("id", order.id);

    logCheckoutDebug("orders checkout update result", {
      order_id: order.id,
      session_id: session.id,
      checkout_error: checkoutError?.message ?? null
    });

    if (checkoutError) throw checkoutError;
    step = "validate-stripe-url";
    if (!session.url) throw new Error("Stripe no devolvio una URL de Checkout.");

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logCheckoutError("request failed", error, { step });

    const message = error instanceof Error ? error.message : "No se pudo crear Checkout.";
    const publicMessage = message.includes("STRIPE_SECRET_KEY")
      ? "Stripe no esta configurado en este entorno."
      : message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "Supabase service role no esta configurado en este entorno."
        : "No se pudo crear Checkout.";

    return devJsonError(publicMessage, step, error, 500);
  }
}
