"use client";

import {
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";
import { FIREBASE_READY, getDb } from "@/lib/firebase/client";
import type { Address, Order, UserProfile } from "@/lib/types";
import { mapAddress, mapOrder, mapProfile } from "@/lib/mappers";

export { mapAddress, mapOrder, mapProfile };
import { safeNumber } from "@/lib/utils";

function warn(error: unknown) {
  if (process.env.NODE_ENV !== "production") console.warn("[untouch:user]", error);
}

function requireDb() {
  const db = getDb();
  if (!FIREBASE_READY || !db) {
    throw new Error(
      "Firebase is not configured. Add your Firebase web credentials to .env.local to enable accounts.",
    );
  }
  return db;
}

function toArray<T>(
  value: Record<string, unknown> | null,
  mapper: (id: string, raw: Record<string, unknown>) => T,
): T[] {
  if (!value) return [];
  return Object.entries(value).map(([id, raw]) => mapper(id, (raw ?? {}) as Record<string, unknown>));
}

export function subscribeProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const db = getDb();
  if (!FIREBASE_READY || !db) {
    onData(null);
    return () => {};
  }
  return onValue(
    ref(db, `users/${uid}`),
    (snapshot) => {
      onData(snapshot.exists() ? mapProfile(uid, (snapshot.val() ?? {}) as Record<string, unknown>) : null);
    },
    (error) => {
      warn(error);
      onError?.(error.message);
    },
  );
}

export async function ensureProfile(input: {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}): Promise<void> {
  const db = requireDb();
  const profileRef = ref(db, `users/${input.uid}`);
  const snapshot = await get(profileRef);
  if (snapshot.exists()) {
    await update(profileRef, {
      email: input.email,
      displayName: input.displayName || snapshot.val().displayName || "",
      photoURL: input.photoURL || snapshot.val().photoURL || "",
    });
    return;
  }
  await set(profileRef, {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    photoURL: input.photoURL,
    phone: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationPrefs: { orderUpdates: true, offers: true },
  });
}

export async function updateProfileFields(
  uid: string,
  patch: Partial<Pick<UserProfile, "displayName" | "phone" | "photoURL" | "notificationPrefs">>,
): Promise<void> {
  const db = requireDb();
  await update(ref(db, `users/${uid}`), { ...patch, updatedAt: new Date().toISOString() });
}

export function subscribeAddresses(
  uid: string,
  onData: (addresses: Address[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const db = getDb();
  if (!FIREBASE_READY || !db) {
    onData([]);
    return () => {};
  }
  return onValue(
    ref(db, `addresses/${uid}`),
    (snapshot) => {
      const addresses = toArray(snapshot.val() as Record<string, unknown> | null, (id, raw) => ({
        ...mapAddress(id, raw),
        userId: uid,
      })).sort(
        (a, b) => Number(b.isDefault) - Number(a.isDefault) || a.label.localeCompare(b.label),
      );
      onData(addresses);
    },
    (error) => {
      warn(error);
      onData([]);
      onError?.(error.message);
    },
  );
}

export type AddressInput = Omit<Address, "id" | "userId" | "createdAt">;

export async function createAddress(uid: string, input: AddressInput): Promise<string> {
  const db = requireDb();
  if (input.isDefault) await clearDefaultAddress(uid);
  const addressRef = push(ref(db, `addresses/${uid}`));
  const id = addressRef.key as string;
  await set(addressRef, { ...input, userId: uid, createdAt: new Date().toISOString() });
  return id;
}

export async function saveAddress(uid: string, id: string, input: AddressInput): Promise<void> {
  const db = requireDb();
  if (input.isDefault) await clearDefaultAddress(uid, id);
  await update(ref(db, `addresses/${uid}/${id}`), { ...input, userId: uid });
}

export async function deleteAddress(uid: string, id: string): Promise<void> {
  const db = requireDb();
  await remove(ref(db, `addresses/${uid}/${id}`));
}

async function clearDefaultAddress(uid: string, exceptId?: string): Promise<void> {
  const db = requireDb();
  const snapshot = await get(ref(db, `addresses/${uid}`));
  const updates: Record<string, boolean> = {};
  snapshot.forEach((child) => {
    if (child.val()?.isDefault && child.key !== exceptId) {
      updates[`addresses/${uid}/${child.key}/isDefault`] = false;
    }
    return false;
  });
  if (Object.keys(updates).length) await update(ref(db), updates);
}

export async function makeDefaultAddress(uid: string, id: string): Promise<void> {
  const db = requireDb();
  await clearDefaultAddress(uid, id);
  await update(ref(db, `addresses/${uid}/${id}`), { isDefault: true, userId: uid });
}

/** Orders are read from the customer mirror written by the server at checkout. */
export function subscribeUserOrders(
  uid: string,
  onData: (orders: Order[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const db = getDb();
  if (!FIREBASE_READY || !db) {
    onData([]);
    return () => {};
  }
  return onValue(
    ref(db, `customerOrders/${uid}`),
    (snapshot) => {
      const orders = toArray(snapshot.val() as Record<string, unknown> | null, mapOrder).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      );
      onData(orders);
    },
    (error) => {
      warn(error);
      onData([]);
      onError?.(error.message);
    },
  );
}

export function subscribeOrderByNumber(
  orderNumber: string,
  uid: string,
  onData: (order: Order | null) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const db = getDb();
  if (!FIREBASE_READY || !db) {
    onData(null);
    return () => {};
  }
  return onValue(
    ref(db, `customerOrders/${uid}`),
    (snapshot) => {
      const orders = toArray(snapshot.val() as Record<string, unknown> | null, mapOrder);
      onData(orders.find((order) => order.orderNumber === orderNumber) ?? null);
    },
    (error) => {
      warn(error);
      onData(null);
      onError?.(error.message);
    },
  );
}

export async function submitReview(input: {
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const db = requireDb();
  const reviewRef = push(ref(db, "reviews"));
  await set(reviewRef, {
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

