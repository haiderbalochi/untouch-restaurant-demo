"use client";

import { useEffect, useRef } from "react";
import { get, ref, set } from "firebase/database";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { FIREBASE_READY, getDb } from "@/lib/firebase/client";
import type { CartLine } from "@/lib/types";

/**
 * Mirrors the shopping cart to Firebase Realtime Database at /carts/{uid}
 * for signed-in customers, so a cart survives devices. Guests keep the
 * local persistent cart and it is merged in on sign-in.
 */
export function CartSync() {
  const { user } = useAuth();
  const { lines, replaceLines, hydrated } = useCart();
  const loadedFor = useRef<string | null>(null);
  const lastWritten = useRef<string>("");

  useEffect(() => {
    const db = getDb();
    if (!user || !hydrated || !FIREBASE_READY || !db) return;
    if (loadedFor.current === user.uid) return;

    let cancelled = false;
    const cartRef = ref(db, `carts/${user.uid}`);

    get(cartRef)
      .then((snapshot) => {
        if (cancelled) return;
        const remote = (snapshot.val()?.lines ?? []) as CartLine[];
        const merged = new Map<string, CartLine>();
        remote.forEach((line) => merged.set(line.key, line));
        // Local (guest) lines win when the same line exists remotely.
        useCart.getState().lines.forEach((line) => merged.set(line.key, line));
        const nextLines = [...merged.values()];
        replaceLines(nextLines);
        lastWritten.current = JSON.stringify(nextLines);
        loadedFor.current = user.uid;
      })
      .catch(() => {
        // Rules/network problem: keep the local cart, try writing later.
        loadedFor.current = user.uid;
        lastWritten.current = "";
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  useEffect(() => {
    const db = getDb();
    if (!user || !FIREBASE_READY || !db) return;
    if (loadedFor.current !== user.uid) return;

    const payload = JSON.stringify(lines);
    if (payload === lastWritten.current) return;

    const timer = setTimeout(() => {
      set(ref(db, `carts/${user.uid}`), {
        lines,
        updatedAt: new Date().toISOString(),
      })
        .then(() => {
          lastWritten.current = payload;
        })
        .catch(() => {
          /* non-fatal: local cart remains authoritative for this session */
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [lines, user]);

  useEffect(() => {
    if (!user) {
      loadedFor.current = null;
      lastWritten.current = "";
    }
  }, [user]);

  return null;
}
