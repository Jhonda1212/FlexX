"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Product } from "./types";

const MAX_QUANTITY = 99;

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  addProduct: (product: Product, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
};

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  const rounded = Math.floor(quantity);
  if (rounded < 1) return 1;
  return Math.min(MAX_QUANTITY, rounded);
}

function mergeProduct(items: CartItem[], product: Product, quantity: number) {
  const currentQuantity = normalizeQuantity(quantity);
  const index = items.findIndex((item) => item.product.id === product.id);

  if (index >= 0) {
    return items.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, quantity: item.quantity + currentQuantity }
        : item
    ));
  }

  return [...items, { product, quantity: currentQuantity }];
}

function sanitizeItems(items: CartItem[]) {
  const byId = new Map<string, CartItem>();

  for (const item of items) {
    const quantity = normalizeQuantity(item.quantity);
    const product = item.product;
    const existing = byId.get(product.id);
    if (existing) {
      existing.quantity = normalizeQuantity(existing.quantity + quantity);
      continue;
    }

    byId.set(product.id, { product, quantity });
  }

  return Array.from(byId.values());
}

export const useProductCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      addProduct: (product, quantity = 1) => {
        if (!product.active) return;
        set((state) => ({ items: mergeProduct(state.items, product, quantity) }));
      },
      increment: (productId) => {
        set((state) => ({
          items: state.items.map((item) => (
            item.product.id === productId
              ? { ...item, quantity: normalizeQuantity(item.quantity + 1) }
              : item
          ))
        }));
      },
      decrement: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) => (
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ))
            .filter((item) => item.quantity > 0)
        }));
      },
      removeProduct: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));
      },
      clearCart: () => set({ items: [] })
    }),
    {
      name: "flex_product_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          useProductCartStore.setState({
            items: sanitizeItems(state.items),
            hydrated: true
          });
          return;
        }
        useProductCartStore.setState({ hydrated: true });
      }
    }
  )
);

export function calculateCartTotals(items: CartItem[]) {
  const sanitizedItems = items
    .filter((item) => item.product.active)
    .map((item) => ({
      ...item,
      quantity: normalizeQuantity(item.quantity)
    }));
  const subtotalCents = sanitizedItems.reduce((total, item) => {
    const unitCents = typeof item.product.priceCents === "number"
      ? item.product.priceCents
      : Math.round(item.product.price * 100);
    return total + unitCents * item.quantity;
  }, 0);
  const totalQuantity = sanitizedItems.reduce((total, item) => total + item.quantity, 0);

  return {
    subtotalCents,
    totalQuantity,
    totalCents: subtotalCents
  };
}
