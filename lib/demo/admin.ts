"use client";

import { useDemoStore } from "@/lib/demo/store";
import type { Banner, Category, Coupon, Product, RestaurantSettings } from "@/lib/types";

/**
 * Applies an admin dashboard mutation to the local demo store.
 *
 * Used only when Firebase Admin credentials are absent: the bridge API answers
 * `503` with `demo: true`, and the same intent is applied to the browser-local
 * sample data instead. Firebase is never touched.
 */
export function applyDemoWrite(
  path: string,
  op: "set" | "update" | "remove" | "push",
  data?: Record<string, unknown>,
) {
  const [root, id] = path.split("/");
  const store = useDemoStore.getState();
  const payload = data ?? {};

  if (root === "restaurantSettings") {
    store.saveSettings(payload as Partial<RestaurantSettings>);
    return;
  }

  if (root === "products") {
    if (op === "push" || !id) {
      return store.createProduct(payload as unknown as Parameters<typeof store.createProduct>[0]);
    }
    if (op === "remove") {
      store.removeProduct(id);
      return;
    }
    store.saveProduct(id, payload as Partial<Product>);
    return;
  }

  if (root === "categories") {
    if (op === "push" || !id) {
      return store.createCategory(payload as unknown as Parameters<typeof store.createCategory>[0]);
    }
    if (op === "remove") {
      store.removeCategory(id);
      return;
    }
    store.saveCategory(id, payload as Partial<Category>);
    return;
  }

  if (root === "banners") {
    if (op === "push" || !id) {
      return store.createBanner(payload as unknown as Parameters<typeof store.createBanner>[0]);
    }
    if (op === "remove") {
      store.removeBanner(id);
      return;
    }
    store.saveBanner(id, payload as Partial<Banner>);
    return;
  }

  if (root === "coupons") {
    if (op === "push" || !id) {
      return store.createCoupon(payload as unknown as Parameters<typeof store.createCoupon>[0]);
    }
    if (op === "remove") {
      store.removeCoupon(id);
      return;
    }
    store.saveCoupon(id, payload as Partial<Coupon>);
    return;
  }

  if (root === "reviews" && id) {
    if (op === "remove") {
      store.removeReview(id);
      return;
    }
    const status = payload.status;
    if (status === "approved" || status === "rejected" || status === "pending") {
      store.moderateReview(id, status);
    }
  }
}

export function demoCustomersSorted() {
  return [...useDemoStore.getState().customers].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
}

export function demoOrdersSorted() {
  return [...useDemoStore.getState().orders].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function demoCouponsSorted() {
  return [...useDemoStore.getState().coupons].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function demoBannersSorted() {
  return [...useDemoStore.getState().banners].sort((a, b) => a.order - b.order);
}
