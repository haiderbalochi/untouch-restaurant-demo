"use client";

import type { Banner, Category, Coupon, Order, Product, RestaurantSettings, Review, UserProfile } from "@/lib/types";
import { DEFAULT_SETTINGS, mapBanner } from "@/lib/data/catalog";
import { mapOrder, mapProfile } from "@/lib/data/user";
import { applyDemoWrite, demoBannersSorted, demoCouponsSorted, demoCustomersSorted, demoOrdersSorted } from "@/lib/demo/admin";
import { useDemoModeStore } from "@/lib/demo/mode";
import { useDemoStore } from "@/lib/demo/store";

/**
 * Admin data access.
 *
 * Every call goes through /api/admin/data, which requires the password-based
 * admin session cookie. The browser never talks to protected Realtime Database
 * nodes directly, so database rules can stay closed to unprivileged writes.
 *
 * When Firebase Admin credentials are absent the dashboard runs as an
 * interactive portfolio demo: the same commits are applied to the browser-local
 * sample data (localStorage) and reported as saved *here only* — never to Firebase.
 */

type Unsubscribe = () => void;

let demoProbe: Promise<boolean> | null = null;

/** One cheap session probe per page load decides whether commits are demo-local. */
function demoMode(): Promise<boolean> {
  if (!demoProbe) {
    demoProbe = fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { demo?: boolean; authenticated?: boolean }) => {
        if (!payload.authenticated) {
          handleSessionLoss(401);
          return false;
        }
        const demo = Boolean(payload.demo);
        if (demo) useDemoModeStore.getState().setServerDemo(true);
        return demo;
      })
      .catch(() => false);
  }
  return demoProbe;
}

function toArray<T>(
  value: Record<string, unknown> | null,
  mapper: (id: string, raw: Record<string, unknown>) => T,
): T[] {
  if (!value) return [];
  return Object.entries(value).map(([id, raw]) => mapper(id, (raw ?? {}) as Record<string, unknown>));
}

function handleSessionLoss(status: number) {
  if (status === 401 && typeof window !== "undefined") {
    const next = encodeURIComponent(window.location.pathname);
    window.location.assign(`/unnothingadmin/login?next=${next}`);
    return true;
  }
  return false;
}

async function write(
  path: string,
  op: "set" | "update" | "remove" | "push",
  data?: Record<string, unknown>,
): Promise<{ ok?: boolean; id?: string }> {
  if (await demoMode()) {
    const mode = useDemoModeStore.getState();
    const isCatalogPath = /^(products|categories|banners|coupons|reviews|restaurantSettings)(\/|$)/.test(path);
    if (isCatalogPath && mode.liveCatalog) {
      throw new Error(
        "Demo mode cannot edit live Firebase catalogue records. Configure the Firebase Admin service account to enable live dashboard writes.",
      );
    }
    const result = applyDemoWrite(path, op, data);
    return { ok: true, id: typeof result === "string" ? result : undefined };
  }

  const response = await fetch("/api/admin/data", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path, op, data }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    id?: string;
    error?: string;
    demo?: boolean;
  };

  if (response.status === 503 && payload.demo) {
    useDemoModeStore.getState().setServerDemo(true);
    demoProbe = Promise.resolve(true);
    const result = applyDemoWrite(path, op, data);
    return { ok: true, id: typeof result === "string" ? result : undefined };
  }

  if (!response.ok) {
    handleSessionLoss(response.status);
    throw new Error(payload.error ?? "Could not save the change.");
  }
  return payload;
}

function subscribe<T>(
  path: string,
  apply: (value: Record<string, unknown> | null) => void,
  onError?: (message: string) => void,
  intervalMs = 15_000,
): Unsubscribe {
  let cancelled = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  async function load() {
    try {
      const response = await fetch(`/api/admin/data?path=${encodeURIComponent(path)}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: Record<string, unknown> | null;
        error?: string;
        demo?: boolean;
      };
      if (cancelled) return;
      if (!response.ok) {
        if (!handleSessionLoss(response.status)) {
          onError?.(payload.error ?? "Could not load admin data.");
        }
        return;
      }
      if (payload.demo) {
        useDemoModeStore.getState().setServerDemo(true);
        demoProbe = Promise.resolve(true);
      }
      apply(payload.data ?? null);
    } catch (error) {
      if (cancelled) return;
      console.warn("[untouch:admin]", error);
      onError?.("Could not reach the admin data service.");
    }
  }

  void load();
  if (intervalMs > 0) timer = setInterval(load, intervalMs);

  return () => {
    cancelled = true;
    if (timer) clearInterval(timer);
  };
}

/** Chooses the browser-local demo store or the live admin bridge. */
function adminSubscription<T>(
  demoRead: () => T,
  liveSubscribe: (apply: (value: T) => void, onError?: (message: string) => void) => Unsubscribe,
  onData: (data: T) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  let unsubscribe: Unsubscribe = () => {};
  let cancelled = false;

  demoMode()
    .then((demo) => {
      if (cancelled) return;
      if (demo) {
        const emit = () => onData(demoRead());
        emit();
        unsubscribe = useDemoStore.subscribe(() => emit());
        return;
      }
      unsubscribe = liveSubscribe(onData, onError);
    })
    .catch(() => onError?.("Could not load admin data."));

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "reviewCount" | "soldCount">;
export type CategoryInput = Omit<Category, "id">;
export type CouponInput = Omit<Coupon, "id" | "usedCount" | "createdAt">;
export type BannerInput = Omit<Banner, "id">;

export async function createProduct(input: ProductInput): Promise<string> {
  const now = new Date().toISOString();
  const result = await write("products", "push", {
    ...input,
    reviewCount: 0,
    soldCount: 0,
    createdAt: now,
    updatedAt: now,
  } as unknown as Record<string, unknown>);
  return result.id as string;
}

export async function saveProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await write(`products/${id}`, "update", { ...input, updatedAt: new Date().toISOString() });
}

export async function removeProduct(id: string): Promise<void> {
  await write(`products/${id}`, "remove");
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const result = await write("categories", "push", input as unknown as Record<string, unknown>);
  return result.id as string;
}

export async function saveCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  await write(`categories/${id}`, "update", input);
}

export async function removeCategory(id: string): Promise<void> {
  await write(`categories/${id}`, "remove");
}

export async function createCoupon(input: CouponInput): Promise<string> {
  const result = await write("coupons", "push", {
    ...input,
    code: input.code.toUpperCase(),
    usedCount: 0,
    createdAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
  return result.id as string;
}

export async function saveCoupon(id: string, input: Partial<CouponInput>): Promise<void> {
  const payload = input.code ? { ...input, code: input.code.toUpperCase() } : input;
  await write(`coupons/${id}`, "update", payload);
}

export async function removeCoupon(id: string): Promise<void> {
  await write(`coupons/${id}`, "remove");
}

export async function createBanner(input: BannerInput): Promise<string> {
  const result = await write("banners", "push", input as unknown as Record<string, unknown>);
  return result.id as string;
}

export async function saveBanner(id: string, input: Partial<BannerInput>): Promise<void> {
  await write(`banners/${id}`, "update", input);
}

export async function removeBanner(id: string): Promise<void> {
  await write(`banners/${id}`, "remove");
}

export async function saveSettings(input: Partial<RestaurantSettings>): Promise<void> {
  await write("restaurantSettings", "update", input as unknown as Record<string, unknown>);
}

export async function moderateReview(id: string, status: Review["status"]): Promise<void> {
  await write(`reviews/${id}`, "update", { status, moderatedAt: new Date().toISOString() });
}

export async function removeReview(id: string): Promise<void> {
  await write(`reviews/${id}`, "remove");
}

export async function updateOrderAdmin(
  orderId: string,
  patch: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"]; adminNotes?: string },
): Promise<Order> {
  if (await demoMode()) {
    const updated = useDemoStore.getState().updateOrder(orderId, patch);
    if (!updated) throw new Error("That demo order no longer exists. Reload the dashboard.");
    return updated;
  }

  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    order?: Order;
    error?: string;
    demo?: boolean;
  };

  if (response.status === 503 && payload.demo) {
    useDemoModeStore.getState().setServerDemo(true);
    demoProbe = Promise.resolve(true);
    const updated = useDemoStore.getState().updateOrder(orderId, patch);
    if (!updated) throw new Error("That demo order no longer exists.");
    return updated;
  }

  if (!response.ok || !payload.order) {
    handleSessionLoss(response.status);
    throw new Error(payload.error ?? "Could not update the order.");
  }
  return payload.order;
}

export function subscribeAllOrders(
  onData: (orders: Order[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  return adminSubscription(
    demoOrdersSorted,
    (apply, fail) =>
      subscribe(
        "orders",
        (value) =>
          apply(
            toArray(value, mapOrder).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
          ),
        fail,
      ),
    onData,
    onError,
  );
}

export function subscribeCustomers(
  onData: (customers: UserProfile[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  return adminSubscription(
    demoCustomersSorted,
    (apply, fail) => subscribe("users", (value) => apply(toArray(value, mapProfile)), fail),
    onData,
    onError,
  );
}

export function subscribeAllCoupons(
  onData: (coupons: Coupon[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  return adminSubscription(
    demoCouponsSorted,
    (apply, fail) =>
      subscribe(
        "coupons",
        (value) => {
          const coupons = toArray(value, (id, raw) => ({
            id,
            code: String(raw.code ?? ""),
            type: raw.type === "fixed" ? ("fixed" as const) : ("percent" as const),
            value: Number(raw.value ?? 0),
            minOrder: Number(raw.minOrder ?? 0),
            expiresAt: raw.expiresAt ? String(raw.expiresAt) : null,
            active: raw.active !== false,
            usageLimit: raw.usageLimit == null ? null : Number(raw.usageLimit),
            usedCount: Number(raw.usedCount ?? 0),
            createdAt: String(raw.createdAt ?? ""),
          }));
          apply(coupons.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
        },
        fail,
      ),
    onData,
    onError,
  );
}

export function subscribeAllBanners(
  onData: (banners: Banner[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  return adminSubscription(
    demoBannersSorted,
    (apply, fail) =>
      subscribe("banners", (value) => apply(toArray(value, mapBanner).sort((a, b) => a.order - b.order)), fail),
    onData,
    onError,
  );
}

export function subscribeSettingsAdmin(
  onData: (settings: RestaurantSettings) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  return adminSubscription(
    () => useDemoStore.getState().settings,
    (apply, fail) =>
      subscribe(
        "restaurantSettings",
        (value) => {
          const raw = (value ?? {}) as Partial<RestaurantSettings>;
          apply({
            ...DEFAULT_SETTINGS,
            ...raw,
            socials: { ...DEFAULT_SETTINGS.socials, ...(raw.socials ?? {}) },
            content: { ...DEFAULT_SETTINGS.content, ...(raw.content ?? {}) },
          });
        },
        fail,
      ),
    onData,
    onError,
  );
}
