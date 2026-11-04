import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { HttpError } from "@/lib/server/auth";
import { couponDiscount, deliveryFeeFor, effectivePrice } from "@/lib/pricing";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type {
  Address,
  Coupon,
  Order,
  OrderItem,
  OrderRequestItem,
  OrderStatus,
  PaymentMethod,
  Product,
  Quote,
  RestaurantSettings,
  StatusEvent,
} from "@/lib/types";

function toIso(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

function mapProductNode(id: string, raw: Record<string, unknown>): Product {
  return {
    id,
    slug: String(raw.slug ?? id),
    name: String(raw.name ?? ""),
    tagline: String(raw.tagline ?? ""),
    description: String(raw.description ?? ""),
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    price: Number(raw.price ?? 0),
    discountPrice: raw.discountPrice == null ? null : Number(raw.discountPrice),
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
          priceDelta: Number(variant.priceDelta ?? 0),
        }))
      : [],
    addons: Array.isArray(raw.addons)
      ? (raw.addons as Record<string, unknown>[]).map((addon) => ({
          id: String(addon.id ?? ""),
          name: String(addon.name ?? ""),
          price: Number(addon.price ?? 0),
        }))
      : [],
    prepTime: Number(raw.prepTime ?? 25),
    calories: raw.calories == null ? null : Number(raw.calories),
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.reviewCount ?? 0),
    soldCount: Number(raw.soldCount ?? 0),
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
  };
}

export async function loadSettings(): Promise<RestaurantSettings> {
  const snapshot = await getAdminDb().ref("restaurantSettings").get();
  const raw = (snapshot.val() ?? {}) as Partial<RestaurantSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    socials: { ...DEFAULT_SETTINGS.socials, ...(raw.socials ?? {}) },
    content: { ...DEFAULT_SETTINGS.content, ...(raw.content ?? {}) },
  };
}

export function normalizeItems(items: unknown): OrderRequestItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Your cart is empty.");
  }
  if (items.length > 40) throw new HttpError(400, "That is more lines than one order can hold.");
  return items.map((item) => {
    const raw = item as Record<string, unknown>;
    const productId = String(raw.productId ?? "");
    const quantity = Number(raw.quantity ?? 0);
    if (!productId) throw new HttpError(400, "An item is missing its product reference.");
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      throw new HttpError(400, "Quantities must be between 1 and 20.");
    }
    return {
      productId,
      quantity: Math.round(quantity),
      variantId: raw.variantId ? String(raw.variantId) : null,
      addonIds: Array.isArray(raw.addonIds) ? raw.addonIds.map(String) : [],
    };
  });
}

async function loadCoupon(code?: string | null): Promise<Coupon | null> {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const snapshot = await getAdminDb()
    .ref("coupons")
    .orderByChild("code")
    .equalTo(normalized)
    .get();

  let couponId: string | null = null;
  let raw: Record<string, unknown> | null = null;
  snapshot.forEach((child) => {
    couponId = child.key;
    raw = child.val() as Record<string, unknown>;
    return true;
  });

  if (!couponId || !raw) throw new HttpError(400, "That coupon code is not valid.");
  const data = raw as Record<string, unknown>;

  const coupon: Coupon = {
    id: couponId,
    code: String(data.code ?? normalized),
    type: data.type === "fixed" ? "fixed" : "percent",
    value: Number(data.value ?? 0),
    minOrder: Number(data.minOrder ?? 0),
    expiresAt: data.expiresAt ? String(data.expiresAt) : null,
    active: data.active !== false,
    usageLimit: data.usageLimit == null ? null : Number(data.usageLimit),
    usedCount: Number(data.usedCount ?? 0),
    createdAt: toIso(data.createdAt),
  };

  if (!coupon.active) throw new HttpError(400, "That coupon is no longer active.");
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw new HttpError(400, "That coupon has expired.");
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new HttpError(400, "That coupon has reached its usage limit.");
  }
  return coupon;
}

export interface PricedOrder {
  quote: Quote;
  items: OrderItem[];
  coupon: Coupon | null;
  products: Product[];
}

/** Resolves cart lines against the live catalogue. Client prices are never used. */
export async function priceOrder(
  requestItems: OrderRequestItem[],
  couponCode?: string | null,
): Promise<PricedOrder> {
  const db = getAdminDb();
  const ids = [...new Set(requestItems.map((item) => item.productId))];
  const snapshots = await Promise.all(ids.map((id) => db.ref(`products/${id}`).get()));

  const catalog = new Map<string, Product>();
  snapshots.forEach((snapshot, index) => {
    if (snapshot.exists()) {
      catalog.set(ids[index], mapProductNode(ids[index], (snapshot.val() ?? {}) as Record<string, unknown>));
    }
  });

  const settings = await loadSettings();
  const coupon = await loadCoupon(couponCode);
  const issues: string[] = [];
  const items: OrderItem[] = [];
  let subtotal = 0;

  for (const requestItem of requestItems) {
    const product = catalog.get(requestItem.productId);
    if (!product) {
      issues.push("A product in your cart is no longer available and was removed.");
      continue;
    }
    if (!product.available) {
      issues.push(`${product.name} is sold out right now.`);
      continue;
    }
    const variant = requestItem.variantId
      ? product.variants.find((item) => item.id === requestItem.variantId) ?? null
      : null;
    if (requestItem.variantId && !variant) {
      throw new HttpError(400, `The selected size for ${product.name} is unavailable.`);
    }
    const addons = requestItem.addonIds.map((id) => {
      const addon = product.addons.find((item) => item.id === id);
      if (!addon) throw new HttpError(400, `An add-on for ${product.name} is unavailable.`);
      return addon;
    });

    const base = effectivePrice(product);
    const unitPrice =
      base + (variant?.priceDelta ?? 0) + addons.reduce((sum, addon) => sum + addon.price, 0);
    const lineTotal = unitPrice * requestItem.quantity;
    subtotal += lineTotal;
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      unitPrice,
      quantity: requestItem.quantity,
      variantName: variant?.name ?? null,
      addons: addons.map((addon) => ({ name: addon.name, price: addon.price })),
      lineTotal,
    });
  }

  if (items.length === 0) {
    throw new HttpError(400, issues[0] ?? "None of these dishes are available right now.");
  }

  const discount = couponDiscount(coupon, subtotal);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = deliveryFeeFor(afterDiscount, settings.deliveryFee);

  if (subtotal < settings.minOrder) {
    throw new HttpError(400, `Minimum order is Rs ${settings.minOrder.toLocaleString("en-PK")}.`);
  }

  return {
    quote: {
      subtotal,
      discount,
      deliveryFee: shipping,
      total: afterDiscount + shipping,
      coupon: coupon ? { code: coupon.code, type: coupon.type, value: coupon.value } : null,
      issues,
      minOrder: settings.minOrder,
      freeAbove: 0,
    },
    items,
    coupon,
    products: [...catalog.values()],
  };
}

export function makeOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `UT-${stamp}-${random}`;
}

export async function loadAddressForUser(addressId: string, uid: string): Promise<Address> {
  const snapshot = await getAdminDb().ref(`addresses/${uid}/${addressId}`).get();
  if (!snapshot.exists()) throw new HttpError(404, "That delivery address could not be found.");
  const raw = (snapshot.val() ?? {}) as Record<string, unknown>;
  if (raw.userId && String(raw.userId) !== uid) {
    throw new HttpError(403, "That address does not belong to your account.");
  }
  return {
    id: addressId,
    userId: uid,
    label: String(raw.label ?? "Home"),
    fullName: String(raw.fullName ?? ""),
    phone: String(raw.phone ?? ""),
    house: String(raw.house ?? ""),
    street: String(raw.street ?? ""),
    area: String(raw.area ?? ""),
    city: String(raw.city ?? ""),
    postalCode: String(raw.postalCode ?? ""),
    instructions: String(raw.instructions ?? ""),
    isDefault: Boolean(raw.isDefault),
    createdAt: toIso(raw.createdAt),
  };
}

export async function createOrderForUser(input: {
  token: DecodedIdToken;
  items: OrderRequestItem[];
  addressId: string;
  paymentMethod: PaymentMethod;
  notes: string;
  couponCode: string | null;
}): Promise<Order> {
  const { token, items: requestItems, addressId, paymentMethod, notes, couponCode } = input;
  const db = getAdminDb();
  const settings = await loadSettings();

  if (!settings.isOpen) {
    throw new HttpError(400, "The kitchen is currently closed. Please order when we reopen.");
  }

  const address = await loadAddressForUser(addressId, token.uid);
  const { quote, items, coupon } = await priceOrder(requestItems, couponCode);

  const orderNumber = makeOrderNumber();
  const now = new Date().toISOString();
  const history: StatusEvent[] = [{ status: "pending", at: now, by: "customer" }];

  const orderRef = db.ref("orders").push();
  const orderId = orderRef.key as string;

  const order: Omit<Order, "id"> = {
    orderNumber,
    userId: token.uid,
    customer: {
      name: address.fullName,
      email: token.email ?? "",
      phone: address.phone,
    },
    items,
    subtotal: quote.subtotal,
    discount: quote.discount,
    deliveryFee: quote.deliveryFee,
    total: quote.total,
    couponCode: coupon?.code ?? null,
    address: {
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      house: address.house,
      street: address.street,
      area: address.area,
      city: address.city,
      postalCode: address.postalCode,
      instructions: address.instructions,
    },
    paymentMethod,
    paymentStatus: "unpaid",
    paymentProvider: null,
    paymentReference: null,
    status: "pending" as OrderStatus,
    notes: String(notes ?? "").slice(0, 500),
    adminNotes: "",
    statusHistory: history,
    createdAt: now,
    updatedAt: now,
  };

  // Full record for staff + customer-visible mirror, written atomically by the server.
  await db.ref().update({
    [`orders/${orderId}`]: order,
    [`customerOrders/${token.uid}/${orderId}`]: order,
  });

  // Non-critical counters: dish popularity and coupon usage.
  await Promise.all([
    coupon
      ? db
          .ref(`coupons/${coupon.id}/usedCount`)
          .transaction((current) => (typeof current === "number" ? current : 0) + 1)
      : Promise.resolve(),
    ...items.map((item) =>
      db
        .ref(`products/${item.productId}/soldCount`)
        .transaction((current) => (typeof current === "number" ? current : 0) + item.quantity),
    ),
  ]).catch((error) => console.error("[orders] side effects failed", error));

  return { id: orderId, ...order };
}
