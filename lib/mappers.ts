import type { Address, Order, UserProfile } from "@/lib/types";
import { safeNumber } from "@/lib/utils";

/**
 * Pure Realtime Database → domain mappers.
 * Kept free of "use client" so both the browser and route handlers can use them.
 */

export function mapProfile(uid: string, raw: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: String(raw.email ?? ""),
    displayName: String(raw.displayName ?? ""),
    photoURL: String(raw.photoURL ?? ""),
    phone: String(raw.phone ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    notificationPrefs: {
      orderUpdates: raw.notificationPrefs
        ? (raw.notificationPrefs as Record<string, boolean>).orderUpdates !== false
        : true,
      offers: raw.notificationPrefs
        ? (raw.notificationPrefs as Record<string, boolean>).offers !== false
        : true,
    },
  };
}

export function mapAddress(id: string, raw: Record<string, unknown>): Address {
  return {
    id,
    userId: String(raw.userId ?? ""),
    label: String(raw.label ?? "Home"),
    fullName: String(raw.fullName ?? ""),
    phone: String(raw.phone ?? ""),
    house: String(raw.house ?? ""),
    street: String(raw.street ?? ""),
    area: String(raw.area ?? ""),
    city: String(raw.city ?? "Karachi"),
    postalCode: String(raw.postalCode ?? ""),
    instructions: String(raw.instructions ?? ""),
    isDefault: Boolean(raw.isDefault),
    createdAt: String(raw.createdAt ?? ""),
  };
}

export function mapOrder(id: string, raw: Record<string, unknown>): Order {
  return {
    id,
    orderNumber: String(raw.orderNumber ?? id),
    userId: String(raw.userId ?? ""),
    customer: (raw.customer as Order["customer"]) ?? { name: "", email: "", phone: "" },
    items: Array.isArray(raw.items) ? (raw.items as Order["items"]) : [],
    subtotal: safeNumber(raw.subtotal),
    discount: safeNumber(raw.discount),
    deliveryFee: safeNumber(raw.deliveryFee),
    total: safeNumber(raw.total),
    couponCode: raw.couponCode ? String(raw.couponCode) : null,
    address: (raw.address as Order["address"]) ?? {
      label: "",
      fullName: "",
      phone: "",
      house: "",
      street: "",
      area: "",
      city: "",
      postalCode: "",
      instructions: "",
    },
    paymentMethod: raw.paymentMethod === "online" ? "online" : "cod",
    paymentStatus:
      raw.paymentStatus === "paid" ||
      raw.paymentStatus === "refunded" ||
      raw.paymentStatus === "failed"
        ? raw.paymentStatus
        : "unpaid",
    paymentProvider: raw.paymentProvider ? String(raw.paymentProvider) : null,
    paymentReference: raw.paymentReference ? String(raw.paymentReference) : null,
    status: (raw.status as Order["status"]) ?? "pending",
    notes: String(raw.notes ?? ""),
    adminNotes: String(raw.adminNotes ?? ""),
    statusHistory: Array.isArray(raw.statusHistory)
      ? (raw.statusHistory as Order["statusHistory"])
      : [],
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}
