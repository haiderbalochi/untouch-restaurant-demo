"use client";

import type { CartLine, Order } from "@/lib/types";

/** Rebuilds cart lines from a past order. Prices are always re-resolved server-side. */
export function orderToCartLines(order: Order): CartLine[] {
  return order.items.map((item, index) => {
    const addons = item.addons.map((addon, addonIndex) => ({
      id: `${item.productId}-addon-${index}-${addonIndex}`,
      name: addon.name,
      price: addon.price,
    }));
    return {
      key: `${item.productId}::reorder::${index}`,
      productId: item.productId,
      slug: item.slug || item.productId,
      name: item.name,
      image: item.image,
      basePrice: item.unitPrice - addons.reduce((sum, addon) => sum + addon.price, 0),
      quantity: item.quantity,
      variantId: null,
      variantName: item.variantName,
      variantDelta: 0,
      addons,
    } satisfies CartLine;
  });
}
