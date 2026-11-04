"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Addon, CartLine, Product, Variant } from "@/lib/types";
import { effectivePrice } from "@/lib/pricing";
import { makeId } from "@/lib/utils";

function lineKey(productId: string, variantId: string | null, addons: Addon[]) {
  const addonKey = addons
    .map((addon) => addon.id)
    .sort()
    .join("_");
  return `${productId}::${variantId ?? "base"}::${addonKey}`;
}

interface CartState {
  lines: CartLine[];
  drawerOpen: boolean;
  promptOpen: boolean;
  pendingLine: CartLine | null;
  hydrated: boolean;

  addLine: (product: Product, quantity: number, variant: Variant | null, addons: Addon[]) => void;
  addRaw: (line: CartLine) => void;
  replaceLines: (lines: CartLine[]) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setPromptOpen: (open: boolean) => void;
  stashPending: (line: CartLine) => void;
  takePending: () => CartLine | null;
  setHydrated: () => void;
}

export function buildCartLine(
  product: Product,
  quantity: number,
  variant: Variant | null,
  addons: Addon[],
): CartLine {
  return {
    key: lineKey(product.id, variant?.id ?? null, addons),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? "",
    basePrice: effectivePrice(product),
    quantity: Math.max(1, Math.min(20, quantity)),
    variantId: variant?.id ?? null,
    variantName: variant?.name ?? null,
    variantDelta: variant?.priceDelta ?? 0,
    addons,
  };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      drawerOpen: false,
      promptOpen: false,
      pendingLine: null,
      hydrated: false,

      addLine: (product, quantity, variant, addons) => {
        const line = buildCartLine(product, quantity, variant, addons);
        const existing = get().lines.find((item) => item.key === line.key);
        if (existing) {
          set({
            lines: get().lines.map((item) =>
              item.key === line.key
                ? { ...item, quantity: Math.min(20, item.quantity + line.quantity) }
                : item,
            ),
          });
        } else {
          set({ lines: [...get().lines, line] });
        }
      },

      addRaw: (line) => {
        const existing = get().lines.find((item) => item.key === line.key);
        if (existing) {
          set({
            lines: get().lines.map((item) =>
              item.key === line.key
                ? { ...item, quantity: Math.min(20, item.quantity + line.quantity) }
                : item,
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line }] });
        }
      },

      replaceLines: (lines) => set({ lines }),

      removeLine: (key) => set({ lines: get().lines.filter((item) => item.key !== key) }),

      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((item) => item.key !== key) });
          return;
        }
        set({
          lines: get().lines.map((item) =>
            item.key === key ? { ...item, quantity: Math.min(20, Math.round(quantity)) } : item,
          ),
        });
      },

      clear: () => set({ lines: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      setPromptOpen: (open) => set({ promptOpen: open }),
      stashPending: (line) => set({ pendingLine: line, promptOpen: true }),
      takePending: () => {
        const pending = get().pendingLine;
        if (pending) set({ pendingLine: null });
        return pending;
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "untouch.cart.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function makePendingKey() {
  return makeId("pending");
}
