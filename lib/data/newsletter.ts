"use client";

import { push, ref, set } from "firebase/database";
import { FIREBASE_READY, getDb } from "@/lib/firebase/client";

export async function subscribeToNewsletter(email: string): Promise<void> {
  const db = getDb();
  if (!FIREBASE_READY || !db) {
    throw new Error(
      "Newsletter storage is not connected yet. Add Firebase credentials to .env.local.",
    );
  }
  const entryRef = push(ref(db, "newsletter"));
  await set(entryRef, {
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    source: "website",
  });
}
