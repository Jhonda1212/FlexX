export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceCents: number;
  currency: string;
  image?: string;
  category?: string;
  categoryId?: string | null;
  categorySlug?: string;
  categorySortOrder?: number;
  featured?: boolean;
  availability?: boolean;
  active: boolean;
  stockQuantity?: number | null;
  tags?: string[];
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
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
