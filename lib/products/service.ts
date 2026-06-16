import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductCategory } from "./types";

type ProductCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
  active: boolean | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number | string | null;
  price_cents: number | null;
  currency: string | null;
  image: string | null;
  image_url: string | null;
  category: string | null;
  category_id: string | null;
  stock_quantity: number | null;
  active: boolean;
  featured: boolean | null;
  tags: string[] | null;
  created_at?: string;
  product_categories?: ProductCategoryRow | ProductCategoryRow[] | null;
};

let cachedProducts: Product[] = [];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePrice(value: number | string | null | undefined) {
  if (value == null) return null;
  const price = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function normalizePriceCents(row: Partial<ProductRow>) {
  if (typeof row.price_cents === "number" && Number.isFinite(row.price_cents) && row.price_cents >= 0) {
    return Math.round(row.price_cents);
  }

  const price = normalizePrice(row.price);
  return price === null ? null : Math.round(price * 100);
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function fallbackSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapCategoryRow(row: Partial<ProductCategoryRow>): ProductCategory | null {
  const id = normalizeText(row.id);
  const name = normalizeText(row.name);
  const slug = normalizeText(row.slug);
  if (!id || !name || !slug) return null;

  return {
    id,
    name,
    slug,
    description: normalizeText(row.description) || null,
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    active: row.active !== false
  };
}

function mapProductRow(row: Partial<ProductRow>): Product | null {
  const id = normalizeText(row.id);
  const name = normalizeText(row.name);
  const description = normalizeText(row.description);
  const priceCents = normalizePriceCents(row);
  const category = firstRelation(row.product_categories);
  const categoryName = normalizeText(category?.name) || normalizeText(row.category) || "General";
  const categorySlug = normalizeText(category?.slug) || fallbackSlug(categoryName) || "general";

  if (!id || !name || !description || priceCents === null) {
    return null;
  }

  return {
    id,
    name,
    description,
    price: priceCents / 100,
    priceCents,
    currency: (normalizeText(row.currency) || "eur").toLowerCase(),
    image: normalizeText(row.image_url) || normalizeText(row.image) || undefined,
    category: categoryName,
    categoryId: normalizeText(row.category_id) || category?.id || null,
    categorySlug,
    categorySortOrder: typeof category?.sort_order === "number" ? category.sort_order : 0,
    featured: Boolean(row.featured),
    availability: Boolean(row.active),
    active: Boolean(row.active),
    stockQuantity: typeof row.stock_quantity === "number" ? row.stock_quantity : null,
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : []
  };
}

function sortProducts(products: Product[]) {
  return [...products].sort((left, right) => {
    if (Boolean(left.featured) !== Boolean(right.featured)) {
      return Number(right.featured) - Number(left.featured);
    }

    if ((left.categorySortOrder ?? 0) !== (right.categorySortOrder ?? 0)) {
      return (left.categorySortOrder ?? 0) - (right.categorySortOrder ?? 0);
    }

    if (left.priceCents !== right.priceCents) {
      return right.priceCents - left.priceCents;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

function sortCategories(categories: ProductCategory[]) {
  return [...categories].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name, "es");
  });
}

async function fetchProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      price_cents,
      currency,
      image,
      image_url,
      category,
      category_id,
      stock_quantity,
      active,
      featured,
      tags,
      created_at,
      product_categories(id, name, slug, description, sort_order, active)
    `);

  if (error) throw error;

  const products = (data ?? [])
    .map((row) => mapProductRow(row))
    .filter((product): product is Product => Boolean(product));

  const deduplicated = Array.from(new Map(products.map((product) => [product.id, product])).values());
  const sorted = sortProducts(deduplicated);
  cachedProducts = sorted;
  return sorted;
}

export async function getProductCategories(supabase: SupabaseClient): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, name, slug, description, sort_order, active")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return sortCategories(
    (data ?? [])
      .map((row) => mapCategoryRow(row))
      .filter((category): category is ProductCategory => Boolean(category))
  );
}

export async function getProductCatalog(supabase: SupabaseClient) {
  const [categories, products] = await Promise.all([
    getProductCategories(supabase),
    getActiveProducts(supabase)
  ]);

  const knownSlugs = new Set(categories.map((category) => category.slug));
  const derivedCategories = products
    .filter((product) => product.categorySlug && !knownSlugs.has(product.categorySlug))
    .map((product) => ({
      id: product.categoryId ?? product.categorySlug ?? product.category ?? product.id,
      name: product.category ?? "General",
      slug: product.categorySlug ?? "general",
      description: null,
      sortOrder: product.categorySortOrder ?? 999,
      active: true
    }));

  const mergedCategories = Array.from(
    new Map([...categories, ...derivedCategories].map((category) => [category.slug, category])).values()
  );

  return {
    categories: sortCategories(mergedCategories),
    products
  };
}

export async function getProducts(supabase: SupabaseClient) {
  return fetchProducts(supabase);
}

export async function getActiveProducts(supabase: SupabaseClient) {
  const products = await fetchProducts(supabase);
  return products.filter((product) => product.active);
}

export async function getProductsByCategory(supabase: SupabaseClient, categorySlug: string) {
  const products = await getActiveProducts(supabase);
  return products.filter((product) => product.categorySlug === categorySlug);
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
        price_cents: product.priceCents,
        currency: product.currency,
        image: product.image ?? null,
        image_url: product.image ?? null,
        category: product.category ?? "General",
        category_id: product.categoryId ?? null,
        stock_quantity: product.stockQuantity ?? null,
        active: product.active,
        featured: product.featured ?? false,
        tags: product.tags ?? []
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
