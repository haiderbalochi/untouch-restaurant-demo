"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { buildCartLine, useCart } from "@/lib/cart-store";
import { useDemoMode } from "@/lib/demo/mode";
import type { Addon, Product, Variant } from "@/lib/types";

/**
 * Single entry point for adding to the cart.
 *
 * In the portfolio demo (no live catalogue / no Admin credentials) guests can
 * build a cart freely. On a live deployment guests are prompted to authenticate
 * and their exact selection is preserved until they do.
 */
export function useAddToCart() {
  const { user } = useAuth();
  const { demo } = useDemoMode();
  const { addLine, stashPending, openDrawer } = useCart();

  return useCallback(
    (product: Product, quantity = 1, variant: Variant | null = null, addons: Addon[] = []) => {
      if (!user && !demo) {
        stashPending(buildCartLine(product, quantity, variant, addons));
        return false;
      }
      addLine(product, quantity, variant, addons);
      openDrawer();
      toast.success(`${product.name} added to your cart`);
      return true;
    },
    [user, demo, addLine, stashPending, openDrawer],
  );
}
