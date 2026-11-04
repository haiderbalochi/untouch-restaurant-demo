"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEMO_BANNERS,
  DEMO_CATEGORIES,
  DEMO_COUPONS,
  DEMO_CUSTOMERS,
  DEMO_ORDERS,
  DEMO_PRODUCTS,
  DEMO_REVIEWS,
  DEMO_SETTINGS,
} from "@/lib/demo/seed";
import type {
  Banner,
  Category,
  Coupon,
  Order,
  OrderAddress,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  RestaurantSettings,
  Review,
  UserProfile,
} from "@/lib/types";
import { makeId, makeOrderNumber } from "@/lib/utils";

/**
 * Portfolio demo store.
 *
 * All demo mutations (products, categories, promotions, reviews and orders) are
 * kept in this browser only, under the namespaced key `untouch.demo.v1`.
 * Nothing here ever talks to Firebase; the live Realtime Database remains the
 * single real database and always wins when it contains data.
 */
export const DEMO_STORAGE_KEY = "untouch.demo.v1";

export type DemoProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "reviewCount" | "soldCount"
>;
export type DemoCategoryInput = Omit<Category, "id">;
export type DemoBannerInput = Omit<Banner, "id">;
export type DemoCouponInput = Omit<Coupon, "id" | "usedCount" | "createdAt">;

export interface DemoOrderInput {
  customer: { name: string; email: string; phone: string };
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  notes: string;
}

interface DemoData {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  reviews: Review[];
  coupons: Coupon[];
  orders: Order[];
  customers: UserProfile[];
  settings: RestaurantSettings;
}

interface DemoActions {
  createProduct: (input: DemoProductInput) => string;
  saveProduct: (id: string, patch: Partial<DemoProductInput>) => void;
  removeProduct: (id: string) => void;

  createCategory: (input: DemoCategoryInput) => string;
  saveCategory: (id: string, patch: Partial<DemoCategoryInput>) => void;
  removeCategory: (id: string) => void;

  createBanner: (input: DemoBannerInput) => string;
  saveBanner: (id: string, patch: Partial<DemoBannerInput>) => void;
  removeBanner: (id: string) => void;

  createCoupon: (input: DemoCouponInput) => string;
  saveCoupon: (id: string, patch: Partial<DemoCouponInput>) => void;
  removeCoupon: (id: string) => void;

  addReview: (input: Omit<Review, "id" | "createdAt" | "status">) => string;
  moderateReview: (id: string, status: Review["status"]) => void;
  removeReview: (id: string) => void;

  placeOrder: (input: DemoOrderInput) => Order;
  updateOrder: (
    id: string,
    patch: { status?: OrderStatus; paymentStatus?: Order["paymentStatus"]; adminNotes?: string },
  ) => Order | null;

  saveSettings: (patch: Partial<RestaurantSettings>) => void;
  resetDemoData: () => void;
}

export type DemoStore = DemoData & DemoActions;

const seed: DemoData = {
  products: DEMO_PRODUCTS.map((product) => ({ ...product })),
  categories: DEMO_CATEGORIES.map((category) => ({ ...category })),
  banners: DEMO_BANNERS.map((banner) => ({ ...banner })),
  reviews: DEMO_REVIEWS.map((review) => ({ ...review })),
  coupons: DEMO_COUPONS.map((coupon) => ({ ...coupon })),
  orders: DEMO_ORDERS.map((order) => ({ ...order })),
  customers: DEMO_CUSTOMERS.map((customer) => ({ ...customer })),
  settings: {
    ...DEMO_SETTINGS,
    socials: { ...DEMO_SETTINGS.socials },
    content: { ...DEMO_SETTINGS.content },
  },
};

function cloneSeed(): DemoData {
  return {
    products: seed.products.map((product) => ({ ...product })),
    categories: seed.categories.map((category) => ({ ...category })),
    banners: seed.banners.map((banner) => ({ ...banner })),
    reviews: seed.reviews.map((review) => ({ ...review })),
    coupons: seed.coupons.map((coupon) => ({ ...coupon })),
    orders: seed.orders.map((order) => ({ ...order })),
    customers: seed.customers.map((customer) => ({ ...customer })),
    settings: {
      ...seed.settings,
      socials: { ...seed.settings.socials },
      content: { ...seed.settings.content },
    },
  };
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...cloneSeed(),

      createProduct: (input) => {
        const now = new Date().toISOString();
        const id = makeId("demo_prod");
        const product: Product = {
          ...input,
          id,
          reviewCount: 0,
          soldCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ products: [product, ...state.products] }));
        return id;
      },

      saveProduct: (id, patch) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...patch, id, updatedAt: new Date().toISOString() }
              : product,
          ),
        }));
      },

      removeProduct: (id) => {
        set((state) => ({ products: state.products.filter((product) => product.id !== id) }));
      },

      createCategory: (input) => {
        const id = makeId("demo_cat");
        set((state) => ({ categories: [...state.categories, { ...input, id }] }));
        return id;
      },

      saveCategory: (id, patch) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...patch, id } : category,
          ),
        }));
      },

      removeCategory: (id) => {
        set((state) => ({ categories: state.categories.filter((category) => category.id !== id) }));
      },

      createBanner: (input) => {
        const id = makeId("demo_banner");
        set((state) => ({ banners: [...state.banners, { ...input, id }] }));
        return id;
      },

      saveBanner: (id, patch) => {
        set((state) => ({
          banners: state.banners.map((banner) =>
            banner.id === id ? { ...banner, ...patch, id } : banner,
          ),
        }));
      },

      removeBanner: (id) => {
        set((state) => ({ banners: state.banners.filter((banner) => banner.id !== id) }));
      },

      createCoupon: (input) => {
        const id = makeId("demo_coupon");
        set((state) => ({
          coupons: [
            ...state.coupons,
            {
              ...input,
              code: input.code.toUpperCase(),
              id,
              usedCount: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      saveCoupon: (id, patch) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id
              ? { ...coupon, ...patch, code: (patch.code ?? coupon.code).toUpperCase(), id }
              : coupon,
          ),
        }));
      },

      removeCoupon: (id) => {
        set((state) => ({ coupons: state.coupons.filter((coupon) => coupon.id !== id) }));
      },

      addReview: (input) => {
        const id = makeId("demo_review");
        set((state) => ({
          reviews: [
            {
              ...input,
              id,
              status: "pending",
              createdAt: new Date().toISOString(),
            },
            ...state.reviews,
          ],
        }));
        return id;
      },

      moderateReview: (id, status) => {
        set((state) => ({
          reviews: state.reviews.map((review) => (review.id === id ? { ...review, status } : review)),
        }));
      },

      removeReview: (id) => {
        set((state) => ({ reviews: state.reviews.filter((review) => review.id !== id) }));
      },

      placeOrder: (input) => {
        const now = new Date().toISOString();
        const order: Order = {
          id: makeId("demo_order"),
          orderNumber: makeOrderNumber(),
          userId: "demo_guest",
          customer: input.customer,
          items: input.items,
          subtotal: input.subtotal,
          discount: input.discount,
          deliveryFee: input.deliveryFee,
          total: input.total,
          couponCode: input.couponCode,
          address: input.address,
          paymentMethod: input.paymentMethod,
          paymentStatus: "unpaid",
          paymentProvider: null,
          paymentReference: null,
          status: "pending",
          notes: input.notes,
          adminNotes: "",
          statusHistory: [{ status: "pending", at: now, by: "customer" }],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          orders: [order, ...state.orders],
          coupons: order.couponCode
            ? state.coupons.map((coupon) =>
                coupon.code === order.couponCode
                  ? { ...coupon, usedCount: coupon.usedCount + 1 }
                  : coupon,
              )
            : state.coupons,
        }));

        return order;
      },

      updateOrder: (id, patch) => {
        const current = get().orders.find((order) => order.id === id);
        if (!current) return null;

        const now = new Date().toISOString();
        const history =
          patch.status && patch.status !== current.status
            ? [...current.statusHistory, { status: patch.status, at: now, by: "admin" as const }]
            : current.statusHistory;

        const updated: Order = {
          ...current,
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.paymentStatus ? { paymentStatus: patch.paymentStatus } : {}),
          ...(typeof patch.adminNotes === "string" ? { adminNotes: patch.adminNotes } : {}),
          statusHistory: history,
          updatedAt: now,
        };

        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? updated : order)),
        }));
        return updated;
      },

      saveSettings: (patch) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
            socials: { ...state.settings.socials, ...(patch.socials ?? {}) },
            content: { ...state.settings.content, ...(patch.content ?? {}) },
          },
        }));
      },

      resetDemoData: () => set(cloneSeed()),
    }),
    {
      name: DEMO_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        banners: state.banners,
        reviews: state.reviews,
        coupons: state.coupons,
        orders: state.orders,
        customers: state.customers,
        settings: state.settings,
      }),
    },
  ),
);

/** Rehydrates the persisted demo data on the client (avoids SSR mismatches). */
export function hydrateDemoStore() {
  void useDemoStore.persist.rehydrate();
}

export function demoProductById(id: string) {
  return useDemoStore.getState().products.find((product) => product.id === id) ?? null;
}

export function demoProductBySlug(slug: string) {
  return useDemoStore.getState().products.find((product) => product.slug === slug) ?? null;
}

export function demoOrderByNumber(orderNumber: string) {
  return useDemoStore.getState().orders.find((order) => order.orderNumber === orderNumber) ?? null;
}

export function demoApprovedReviews(productId?: string) {
  return useDemoStore
    .getState()
    .reviews.filter(
      (review) =>
        review.status === "approved" && (productId ? review.productId === productId : true),
    );
}
