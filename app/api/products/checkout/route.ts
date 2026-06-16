import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/products/checkout";
import type { CartItem } from "@/lib/products/types";

type ProductsCheckoutRequest = {
  cart?: CartItem[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductsCheckoutRequest;
    const session = await createCheckoutSession(body.cart ?? [], request.url);
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo preparar el checkout de productos."
      },
      { status: 400 }
    );
  }
}
