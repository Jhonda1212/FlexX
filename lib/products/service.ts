import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "./types";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image: string | null;
  category: string | null;
  active: boolean;
  featured: boolean | null;
  created_at?: string;
};

let cachedProducts: Product[] = [];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePrice(value: number | string) {
  const price = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function mapProductRow(row: Partial<ProductRow>): Product | null {
  const id = normalizeText(row.id);
  const name = normalizeText(row.name);
  const description = normalizeText(row.description);
  const price = row.price != null ? normalizePrice(row.price) : null;

  if (!id || !name || !description || price === null) {
    return null;
  }

  return {
    id,
    name,
    description,
    price,
    image: normalizeText(row.image),
    category: normalizeText(row.category) || "General",
    featured: Boolean(row.featured),
    availability: Boolean(row.active),
    active: Boolean(row.active)
  };
}

function sortProducts(products: Product[]) {
  return [...products].sort((left, right) => {
    if (Boolean(left.featured) !== Boolean(right.featured)) {
      return Number(right.featured) - Number(left.featured);
    }

    if (left.price !== right.price) {
      return right.price - left.price;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

async function fetchProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("products").select("id, name, description, price, image, category, active, featured, created_at");

  if (error) {
    console.warn("No se pudieron cargar los productos desde Supabase:", error.message);
    return [];
  }

  const products = (data ?? [])
    .map((row) => mapProductRow(row))
    .filter((product): product is Product => Boolean(product));

  const deduplicated = Array.from(new Map(products.map((product) => [product.id, product])).values());
  const sorted = sortProducts(deduplicated);
  cachedProducts = sorted;
  return sorted;
}

export async function getProducts(supabase: SupabaseClient) {
  return fetchProducts(supabase);
}

export async function getActiveProducts(supabase: SupabaseClient) {
  const products = await fetchProducts(supabase);
  return products.filter((product) => product.active);
}

export async function getProductsByCategory(supabase: SupabaseClient, category: string) {
  const products = await getActiveProducts(supabase);
  const normalizedCategory = normalizeCategory(category);
  return products.filter((product) => normalizeCategory(product.category ?? "") === normalizedCategory);
}

export async function getFeaturedProducts(supabase: SupabaseClient) {
  const products = await getActiveProducts(supabase);
  return products.filter((product) => product.featured);
}

export function syncCachedProducts(products: Product[]) {
  cachedProducts = sortProducts(
    products
      .map((product) => mapProductRow({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image ?? "",
        category: product.category ?? "General",
        active: product.active,
        featured: product.featured ?? false
      }))
      .filter((product): product is Product => Boolean(product))
  );
}

export function getCachedProductById(productId: string) {
  return cachedProducts.find((product) => product.id === productId) ?? null;
}

export function pruneItemsAgainstCachedProducts<T extends { product: Product; quantity: number }>(items: T[]) {
  const validIds = new Set(cachedProducts.map((product) => product.id));
  const byId = new Map<string, T>();

  for (const item of items) {
    const product = getCachedProductById(item.product.id);
    if (!product || !product.active || !validIds.has(product.id)) continue;

    const existing = byId.get(product.id);
    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    byId.set(product.id, {
      ...item,
      product
    });
  }

  return Array.from(byId.values());
}
