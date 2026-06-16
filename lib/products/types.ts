export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  featured?: boolean;
  availability?: boolean;
  active: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CheckoutSessionResult = {
  id: string;
  url: string;
  currency: string;
  totalCents: number;
  provider: "mock" | "stripe-ready";
  stripePublicKey: string | null;
};
