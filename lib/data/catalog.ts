"use client";

import {
  equalTo,
  get,
  onValue,
  orderByChild,
  query,
  ref,
  type DataSnapshot,
  type Query,
  type Unsubscribe,
} from "firebase/database";
import { FIREBASE_READY, getDb } from "@/lib/firebase/client";
import { CONFIG_MESSAGE, DEFAULT_SETTINGS } from "@/lib/defaults";
import type { Banner, Category, Product, RestaurantSettings, Review } from "@/lib/types";
import { safeNumber } from "@/lib/utils";

export { CONFIG_MESSAGE, DEFAULT_SETTINGS };
type Listener<T> = (data: T) => void;
type ErrorListener = (message: string) => void;

function warn(error: unknown) {
  if (process.env.NODE_ENV !== "production") console.warn("[untouch:data]", error);
}

/** Converts an RTDB snapshot of children into a typed array. */
function toList<T>(
  snapshot: DataSnapshot,
  mapper: (id: string, raw: Record<string, unknown>) => T,
): T[] {
  const items: T[] = [];
  snapshot.forEach((child) => {
    items.push(mapper(child.key as string, (child.val() ?? {}) as Record<string, unknown>));
    return false;
  });
  return items;
}

export function mapProduct(id: string, raw: Record<string, unknown>): Product {
  return {
    id,
    slug: String(raw.slug ?? id),
    name: String(raw.name ?? "Untitled dish"),
    tagline: String(raw.tagline ?? ""),
    description: String(raw.description ?? ""),
    images: Array.isArray(raw.images) ? (raw.images as string[]).filter(Boolean) : [],
    price: safeNumber(raw.price),
    discountPrice: raw.discountPrice == null ? null : safeNumber(raw.discountPrice),
    categoryId: String(raw.categoryId ?? ""),
    categoryName: String(raw.categoryName ?? ""),
    ingredients: Array.isArray(raw.ingredients) ? (raw.ingredients as string[]) : [],
    available: raw.available !== false,
    featured: Boolean(raw.featured),
    popular: Boolean(raw.popular),
    badge: raw.badge ? String(raw.badge) : null,
    variants: Array.isArray(raw.variants)
      ? (raw.variants as Record<string, unknown>[]).map((variant) => ({
          id: String(variant.id ?? ""),
          name: String(variant.name ?? ""),
          priceDelta: safeNumber(variant.priceDelta),
        }))
      : [],
    addons: Array.isArray(raw.addons)
      ? (raw.addons as Record<string, unknown>[]).map((addon) => ({
          id: String(addon.id ?? ""),
          name: String(addon.name ?? ""),
          price: safeNumber(addon.price),
        }))
      : [],
    prepTime: safeNumber(raw.prepTime, 25),
    calories: raw.calories == null ? null : safeNumber(raw.calories),
    rating: safeNumber(raw.rating, 0),
    reviewCount: safeNumber(raw.reviewCount),
    soldCount: safeNumber(raw.soldCount),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

export function mapCategory(id: string, raw: Record<string, unknown>): Category {
  return {
    id,
    slug: String(raw.slug ?? id),
    name: String(raw.name ?? "Untitled"),
    description: String(raw.description ?? ""),
    image: String(raw.image ?? ""),
    order: safeNumber(raw.order),
    active: raw.active !== false,
  };
}

export function mapBanner(id: string, raw: Record<string, unknown>): Banner {
  return {
    id,
    title: String(raw.title ?? ""),
    subtitle: String(raw.subtitle ?? ""),
    image: String(raw.image ?? ""),
    ctaLabel: String(raw.ctaLabel ?? "Explore"),
    ctaHref: String(raw.ctaHref ?? "/menu"),
    placement: raw.placement === "menu" ? "menu" : "home",
    active: raw.active !== false,
    order: safeNumber(raw.order),
  };
}

export function mapReview(id: string, raw: Record<string, unknown>): Review {
  return {
    id,
    productId: String(raw.productId ?? ""),
    productName: String(raw.productName ?? ""),
    userId: String(raw.userId ?? ""),
    userName: String(raw.userName ?? "Guest"),
    rating: safeNumber(raw.rating, 5),
    comment: String(raw.comment ?? ""),
    status: raw.status === "approved" || raw.status === "rejected" ? raw.status : "pending",
    createdAt: String(raw.createdAt ?? ""),
  };
}

function subscribeNode<T>(
  path: string,
  mapper: (id: string, raw: Record<string, unknown>) => T,
  onData: Listener<T[]>,
  onError: ErrorListener | undefined,
  target?: Query,
): Unsubscribe {
  if (!FIREBASE_READY) {
    onData([]);
    onError?.(CONFIG_MESSAGE);
    return () => {};
  }
  const db = getDb();
  if (!db) {
    onData([]);
    onError?.(CONFIG_MESSAGE);
    return () => {};
  }
  return onValue(
    target ?? ref(db, path),
    (snapshot) => onData(toList(snapshot, mapper)),
    (error) => {
      warn(error);
      onData([]);
      onError?.(error.message);
    },
  );
}

/** Published catalogue only by default; admins pass `true` to see everything. */
export function subscribeProducts(
  onData: Listener<Product[]>,
  onError?: ErrorListener,
  includeUnavailable = false,
): Unsubscribe {
  if (includeUnavailable) return subscribeNode("products", mapProduct, onData, onError);
  if (!FIREBASE_READY) return subscribeNode("products", mapProduct, onData, onError);
  const db = getDb();
  if (!db) return subscribeNode("products", mapProduct, onData, onError);
  return subscribeNode(
    "products",
    mapProduct,
    onData,
    onError,
    query(ref(db, "products"), orderByChild("available"), equalTo(true)),
  );
}

export function subscribeCategories(
  onData: Listener<Category[]>,
  onError?: ErrorListener,
  includeInactive = false,
): Unsubscribe {
  if (includeInactive) return subscribeNode("categories", mapCategory, onData, onError);
  if (!FIREBASE_READY) return subscribeNode("categories", mapCategory, onData, onError);
  const db = getDb();
  if (!db) return subscribeNode("categories", mapCategory, onData, onError);
  return subscribeNode(
    "categories",
    mapCategory,
    onData,
    onError,
    query(ref(db, "categories"), orderByChild("active"), equalTo(true)),
  );
}

export function subscribeBanners(
  onData: Listener<Banner[]>,
  onError?: ErrorListener,
  includeInactive = false,
): Unsubscribe {
  if (includeInactive) return subscribeNode("banners", mapBanner, onData, onError);
  if (!FIREBASE_READY) return subscribeNode("banners", mapBanner, onData, onError);
  const db = getDb();
  if (!db) return subscribeNode("banners", mapBanner, onData, onError);
  return subscribeNode(
    "banners",
    mapBanner,
    onData,
    onError,
    query(ref(db, "banners"), orderByChild("active"), equalTo(true)),
  );
}

export function subscribeReviews(
  onData: Listener<Review[]>,
  onError?: ErrorListener,
  includeAll = false,
): Unsubscribe {
  if (includeAll) return subscribeNode("reviews", mapReview, onData, onError);
  if (!FIREBASE_READY) return subscribeNode("reviews", mapReview, onData, onError);
  const db = getDb();
  if (!db) return subscribeNode("reviews", mapReview, onData, onError);
  return subscribeNode(
    "reviews",
    mapReview,
    onData,
    onError,
    query(ref(db, "reviews"), orderByChild("status"), equalTo("approved")),
  );
}

export function subscribeSettings(
  onData: Listener<RestaurantSettings>,
  onError?: ErrorListener,
): Unsubscribe {
  if (!FIREBASE_READY) {
    onData(DEFAULT_SETTINGS);
    return () => {};
  }
  const db = getDb();
  if (!db) {
    onData(DEFAULT_SETTINGS);
    return () => {};
  }
  return onValue(
    ref(db, "restaurantSettings"),
    (snapshot) => {
      const raw = (snapshot.val() ?? {}) as Partial<RestaurantSettings>;
      onData({
        ...DEFAULT_SETTINGS,
        ...raw,
        socials: { ...DEFAULT_SETTINGS.socials, ...(raw.socials ?? {}) },
        content: { ...DEFAULT_SETTINGS.content, ...(raw.content ?? {}) },
      });
    },
    (error) => {
      warn(error);
      onData(DEFAULT_SETTINGS);
      onError?.(error.message);
    },
  );
}

export async function fetchSettings(): Promise<RestaurantSettings> {
  if (!FIREBASE_READY) return DEFAULT_SETTINGS;
  const db = getDb();
  if (!db) return DEFAULT_SETTINGS;
  try {
    const snapshot = await get(ref(db, "restaurantSettings"));
    const raw = (snapshot.val() ?? {}) as Partial<RestaurantSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...raw,
      socials: { ...DEFAULT_SETTINGS.socials, ...(raw.socials ?? {}) },
      content: { ...DEFAULT_SETTINGS.content, ...(raw.content ?? {}) },
    };
  } catch (error) {
    warn(error);
    return DEFAULT_SETTINGS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!FIREBASE_READY) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const snapshot = await get(
      query(ref(db, "products"), orderByChild("available"), equalTo(true)),
    );
    return toList(snapshot, mapProduct).find((product) => product.slug === slug) ?? null;
  } catch (error) {
    warn(error);
    return null;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!FIREBASE_READY) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const snapshot = await get(ref(db, `products/${id}`));
    return snapshot.exists()
      ? mapProduct(id, (snapshot.val() ?? {}) as Record<string, unknown>)
      : null;
  } catch (error) {
    warn(error);
    return null;
  }
}

export function sortProducts<T extends { name: string }>(products: T[]) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortCategories<T extends { name: string; order?: number }>(categories: T[]) {
  return [...categories].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
  );
}
