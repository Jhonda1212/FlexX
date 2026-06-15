import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (typeof window !== "undefined") {
    throw new Error("Stripe server client cannot be used in the browser.");
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return webhookSecret;
}
