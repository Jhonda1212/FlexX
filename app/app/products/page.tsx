"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { FlexButton } from "@/components/ui/FlexButton";
import { FlexCard } from "@/components/ui/FlexCard";
import { calculateCartTotals, useProductCartStore } from "@/lib/products/cart-store";
import { getProductCatalog } from "@/lib/products/service";
import type { Product, ProductCategory } from "@/lib/products/types";
import { createBrowserSupabase } from "@/lib/supabase";

type CategoryOption = {
  key: string;
  label: string;
};

const allCategoryOption: CategoryOption = { key: "all", label: "Todo" };

function formatPrice(price: number, currency = "eur") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(price);
}

function formatCents(cents: number, currency = "eur") {
  return formatPrice(cents / 100, currency);
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

function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onAdd
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (nextQuantity: number) => void;
  onAdd: (product: Product, quantity: number) => void;
}) {
  const outOfStock = product.stockQuantity === 0;

  return (
    <FlexCard className="flex h-full flex-col border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top,rgba(217,166,64,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(0,0,0,0.3))]">
        {product.image ? (
          <img alt={product.name} className="aspect-[4/3] h-auto w-full object-cover" src={product.image} />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center p-4">
            <div className="grid place-items-center gap-3 text-center">
              <div className="grid size-14 place-items-center rounded-full border border-[var(--gold)]/25 bg-black/35 text-[var(--gold)]">
                <Tag size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Imagen reservada</p>
                <p className="mt-1 text-xs text-white/45">Placeholder para contenido futuro</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--gold)]">{product.category ?? "General"}</p>
            {product.featured ? (
              <span className="rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--gold-bright)]">
                Recomendado
              </span>
            ) : null}
            {outOfStock ? (
              <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red-200">
                Sin stock
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">{product.name}</h2>
        </div>
        <strong className="whitespace-nowrap text-[var(--gold-bright)]">{formatPrice(product.price, product.currency)}</strong>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/66">{product.description}</p>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-white/45">Cantidad</span>
          <div className="flex items-center gap-2">
            <button
              className="grid size-9 place-items-center rounded-md border border-white/10 text-white transition hover:border-[var(--gold)]/35 hover:text-[var(--gold-bright)]"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              type="button"
              aria-label={`Restar unidades de ${product.name}`}
              disabled={outOfStock}
            >
              <Minus size={14} />
            </button>
            <span className="min-w-8 text-center text-sm font-bold text-white">{quantity}</span>
            <button
              className="grid size-9 place-items-center rounded-md border border-white/10 text-white transition hover:border-[var(--gold)]/35 hover:text-[var(--gold-bright)]"
              onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
              type="button"
              aria-label={`Sumar unidades de ${product.name}`}
              disabled={outOfStock}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <FlexButton className="mt-4 w-full" onClick={() => onAdd(product, quantity)} type="button" disabled={outOfStock}>
          {outOfStock ? "No disponible" : <>Agregar x{quantity} <ArrowRight size={18} /></>}
        </FlexButton>
      </div>
    </FlexCard>
  );
}

function CartDrawer({
  open,
  onClose,
  children
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        className={`absolute inset-0 bg-black/65 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
        aria-label="Cerrar carrito"
      />

      <aside
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-none flex-col border-l border-white/10 bg-[var(--panel)] shadow-[0_20px_80px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out sm:max-w-md xl:max-w-lg ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </aside>
    </div>
  );
}

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const checkoutHandledRef = useRef(false);

  const items = useProductCartStore((state) => state.items);
  const addProduct = useProductCartStore((state) => state.addProduct);
  const increment = useProductCartStore((state) => state.increment);
  const decrement = useProductCartStore((state) => state.decrement);
  const removeProduct = useProductCartStore((state) => state.removeProduct);
  const clearCart = useProductCartStore((state) => state.clearCart);

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [allCategoryOption, ...categories.map((category) => ({ key: category.slug, label: category.name }))],
    [categories]
  );
  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const cartCurrency = items[0]?.product.currency ?? products[0]?.currency ?? "eur";
  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, Product[]>();
    for (const option of categoryOptions) {
      grouped.set(option.key, []);
    }

    for (const product of products) {
      const categoryKey = product.categorySlug ?? "uncategorized";
      const bucket = grouped.get(categoryKey) ?? [];
      bucket.push(product);
      grouped.set(categoryKey, bucket);
    }

    for (const [key, list] of grouped.entries()) {
      grouped.set(key, sortProducts(list));
    }

    return grouped;
  }, [categoryOptions, products]);

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return sortProducts(products);
    }

    return productsByCategory.get(selectedCategory) ?? [];
  }, [products, productsByCategory, selectedCategory]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") return;
    if (categoryOptions.some((option) => option.key === selectedCategory)) return;
    setSelectedCategory("all");
  }, [categoryOptions, selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError("");

      try {
        const supabase = createBrowserSupabase();
        const catalog = await getProductCatalog(supabase);
        if (!cancelled) {
          setCategories(catalog.categories);
          setProducts(catalog.products);
          if (catalog.products.length > 0) {
            const validIds = new Set(catalog.products.map((product) => product.id));
            useProductCartStore.setState((state) => ({
              items: state.items.filter((item) => validIds.has(item.product.id) && item.product.active)
            }));
          }
        }
      } catch (error) {
        if (!cancelled) {
          setProductsError(error instanceof Error ? error.message : "No se pudieron cargar los productos.");
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted || checkoutHandledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const total = params.get("total");

    if (checkout === "success") {
      checkoutHandledRef.current = true;
      clearCart();
      setCheckoutMessage(`Checkout preparado. Total ${total ? formatCents(Number(total), cartCurrency) : "pendiente"}.`);
      window.history.replaceState({}, "", "/app/products");
    }

    if (checkout === "cancelled") {
      checkoutHandledRef.current = true;
      setCheckoutMessage("Checkout cancelado.");
      window.history.replaceState({}, "", "/app/products");
    }
  }, [cartCurrency, clearCart, mounted]);

  function quantityFor(productId: string) {
    return productQuantities[productId] ?? 1;
  }

  function updateQuantity(productId: string, nextQuantity: number) {
    setProductQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, Math.min(10, nextQuantity))
    }));
  }

  async function startCheckout() {
    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: items })
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "No se pudo preparar el checkout.");
      }
      window.location.assign(data.url as string);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No se pudo preparar el checkout.");
      setCheckoutLoading(false);
    }
  }

  const checkoutCount = totals.totalQuantity;

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-5 pb-28">
        <AppPageHeader eyebrow="Productos" title="Productos" description="Catalogo de barra, reservas y cachimbas." />

        {productsError ? (
          <FlexCard tone="danger" className="p-4">
            <p className="text-sm text-red-100">{productsError}</p>
          </FlexCard>
        ) : null}

        {productsLoading ? (
          <FlexCard className="p-4">
            <p className="text-sm text-white/70">Cargando productos...</p>
          </FlexCard>
        ) : null}

        {checkoutMessage ? (
          <FlexCard className="border-green-500/20 bg-green-500/10 p-4" tone="success">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-green-50">{checkoutMessage}</p>
              <button
                className="gold-focus rounded-full border border-green-400/30 p-2 text-green-100 transition hover:bg-green-500/10"
                onClick={() => setCheckoutMessage("")}
                type="button"
                aria-label="Cerrar mensaje"
              >
                <X size={16} />
              </button>
            </div>
          </FlexCard>
        ) : null}

        {checkoutError ? (
          <FlexCard tone="danger" className="p-4">
            <p className="text-sm text-red-100">{checkoutError}</p>
          </FlexCard>
        ) : null}

        <div className="space-y-4">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              {categoryOptions.map((option) => {
                const count = option.key === "all" ? products.length : (productsByCategory.get(option.key)?.length ?? 0);
                const active = selectedCategory === option.key;
                return (
                  <button
                    key={option.key}
                    className={`gold-focus inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] ${
                      active
                        ? "border-[var(--gold)]/60 bg-[var(--gold)] text-black"
                        : "border-white/10 bg-white/[0.025] text-white/66 hover:border-[var(--gold)]/30 hover:bg-[var(--gold)]/7 hover:text-white"
                    }`}
                    onClick={() => setSelectedCategory(option.key)}
                    type="button"
                  >
                    {option.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        active ? "bg-black/12 text-black/85" : "bg-white/[0.06] text-white/55"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantityFor(product.id)}
              onQuantityChange={(nextQuantity) => updateQuantity(product.id, nextQuantity)}
              onAdd={(selectedProduct, quantity) => {
                addProduct(selectedProduct, quantity);
              }}
            />
          ))}
        </section>

        {!productsLoading && !productsError && products.length === 0 ? (
          <FlexCard className="border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <ShoppingBag className="mx-auto text-white/35" size={30} />
            <h2 className="mt-4 text-lg font-bold text-white">No hay productos activos</h2>
            <p className="mt-2 text-sm text-white/60">Cuando el catalogo tenga productos activos, apareceran aqui.</p>
          </FlexCard>
        ) : null}

        {!productsLoading && !productsError && products.length > 0 && visibleProducts.length === 0 ? (
          <FlexCard className="border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <Tag className="mx-auto text-white/35" size={30} />
            <h2 className="mt-4 text-lg font-bold text-white">Sin productos en esta categoria</h2>
            <p className="mt-2 text-sm text-white/60">Selecciona otra categoria o vuelve a Todo.</p>
          </FlexCard>
        ) : null}
      </div>

      <button
        className="gold-focus fixed bottom-20 right-4 z-40 inline-flex min-h-14 items-center gap-3 rounded-full border border-[var(--gold)]/45 bg-[rgba(10,10,10,0.82)] px-4 py-3 text-white shadow-[0_18px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)]/70 hover:bg-[rgba(16,16,16,0.92)] hover:shadow-[0_22px_54px_rgba(0,0,0,0.58)] active:translate-y-0 active:scale-[0.98] focus-visible:border-[var(--gold)]/80 focus-visible:ring-2 focus-visible:ring-[var(--gold)]/30 sm:right-6 sm:bottom-6"
        onClick={() => setCartOpen(true)}
        type="button"
      >
        <span className="relative grid size-10 place-items-center rounded-full border border-[var(--gold)]/18 bg-[var(--gold)]/12 text-[var(--gold-bright)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <ShoppingBag size={19} />
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border border-black/35 bg-[var(--gold)] px-1 text-[10px] font-bold text-black shadow-[0_2px_8px_rgba(0,0,0,0.24)]">
            {checkoutCount}
          </span>
        </span>
        <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/12 px-3 py-1 text-xs font-bold text-[var(--gold-bright)]">
          {formatCents(totals.subtotalCents, cartCurrency)}
        </span>
      </button>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Carrito</p>
              <p className="mt-1 text-sm text-white/60">Subtotal {formatCents(totals.subtotalCents, cartCurrency)}</p>
            </div>
            <button
              className="gold-focus rounded-full border border-white/10 p-2 text-white transition hover:border-[var(--gold)]/35 hover:text-[var(--gold-bright)]"
              onClick={() => setCartOpen(false)}
              type="button"
              aria-label="Cerrar carrito"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {items.length === 0 ? (
              <div className="grid min-h-full place-items-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <div>
                  <ShoppingBag className="mx-auto text-white/35" size={28} />
                  <p className="mt-3 text-sm font-semibold text-white">Carrito vacio</p>
                  <p className="mt-1 text-sm text-white/55">Agrega productos para empezar.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-white">{item.product.name}</div>
                        <div className="mt-1 text-sm text-white/58">
                          {item.quantity} x {formatPrice(item.product.price, item.product.currency)}
                        </div>
                      </div>
                      <strong className="whitespace-nowrap text-[var(--gold-bright)]">
                        {formatCents(item.product.priceCents * item.quantity, item.product.currency)}
                      </strong>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="grid size-9 place-items-center rounded-md border border-white/10 text-white transition hover:border-[var(--gold)]/35 hover:text-[var(--gold-bright)]"
                        onClick={() => decrement(item.product.id)}
                        type="button"
                        aria-label={`Restar una unidad de ${item.product.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        className="grid size-9 place-items-center rounded-md border border-white/10 text-white transition hover:border-[var(--gold)]/35 hover:text-[var(--gold-bright)]"
                        onClick={() => increment(item.product.id)}
                        type="button"
                        aria-label={`Sumar una unidad de ${item.product.name}`}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 text-xs font-bold uppercase tracking-[0.08em] text-red-100 transition hover:bg-red-500/20"
                        onClick={() => removeProduct(item.product.id)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4 sm:p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Subtotal</span>
                <strong className="text-white">{formatCents(totals.subtotalCents, cartCurrency)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Total</span>
                <strong className="text-[var(--gold-bright)]">{formatCents(totals.totalCents, cartCurrency)}</strong>
              </div>
            </div>

            <FlexButton
              className="mt-4 w-full"
              loading={checkoutLoading}
              disabled={items.length === 0}
              onClick={startCheckout}
              type="button"
            >
              Continuar
            </FlexButton>
            <button
              className="gold-focus mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:border-[var(--gold)]/35 hover:bg-[var(--gold)]/8 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={items.length === 0}
              onClick={() => clearCart()}
              type="button"
            >
              Vaciar <Trash2 size={16} />
            </button>
          </div>
        </div>
      </CartDrawer>
    </>
  );
}
