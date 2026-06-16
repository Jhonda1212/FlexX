import type { CartItem } from "./types";
import { createRouteSupabase } from "@/lib/supabase/route";
import { getProducts } from "./service";

export const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;

function appOrigin(requestUrl: string) {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(requestUrl).origin;
}

function normalizeQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    throw new Error("Cantidad invalida.");
  }
  return quantity;
}

function normalizeCart(cart: CartItem[], productMap: Map<string, { price: number; priceCents: number; active: boolean; name: string; stockQuantity?: number | null }>) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("El carrito esta vacio.");
  }

  const uniqueItems = new Map<string, CartItem>();

  for (const entry of cart) {
    if (!entry?.product?.id) {
      continue;
    }

    const quantity = normalizeQuantity(entry.quantity);
    const existing = uniqueItems.get(entry.product.id);
    if (existing) {
      existing.quantity += quantity;
      continue;
    }

    uniqueItems.set(entry.product.id, {
      product: entry.product,
      quantity
    });
  }

  const normalizedItems = Array.from(uniqueItems.values()).flatMap((entry) => {
    const product = productMap.get(entry.product.id);
    if (!product || !product.active) {
      return [];
    }

    const quantity = normalizeQuantity(entry.quantity);
    if (typeof product.stockQuantity === "number" && product.stockQuantity < quantity) {
      throw new Error(`Stock insuficiente para ${product.name}.`);
    }

    const unitAmountCents = product.priceCents;

    return [{
      product: { ...entry.product, name: product.name, price: product.price, priceCents: product.priceCents, active: product.active },
      quantity,
      unitAmountCents,
      totalAmountCents: unitAmountCents * quantity
    }];
  });

  if (normalizedItems.length === 0) {
    throw new Error("El carrito no tiene productos disponibles.");
  }

  return normalizedItems;
}

export async function createCheckoutSession(cart: CartItem[], requestUrl: string) {
  const supabase = await createRouteSupabase();
  const products = await getProducts(supabase);
  const productMap = new Map(products.map((product) => [product.id, product]));
  const normalizedItems = normalizeCart(cart, productMap);
  const totalCents = normalizedItems.reduce((total, item) => total + item.totalAmountCents, 0);
  const sessionId = `prod_${crypto.randomUUID()}`;
  const origin = appOrigin(requestUrl);
  const successUrl = new URL("/app/products", origin);
  successUrl.searchParams.set("checkout", "success");
  successUrl.searchParams.set("session_id", sessionId);
  successUrl.searchParams.set("total", String(totalCents));
  successUrl.searchParams.set("items", String(normalizedItems.reduce((total, item) => total + item.quantity, 0)));

  return {
    id: sessionId,
    url: successUrl.toString(),
    currency: "eur",
    totalCents,
    provider: stripePublicKey ? "stripe-ready" : "mock",
    stripePublicKey
  };
}
