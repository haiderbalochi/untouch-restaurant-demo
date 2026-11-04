"use client";

import type { Analytics } from "firebase/analytics";
import { hasConsent } from "@/lib/consent";
import { getFirebaseApp } from "./client";

/**
 * Firebase Analytics is loaded lazily and ONLY after the customer grants
 * analytics consent. Nothing is imported, initialized or sent beforehand.
 *
 * Revoking consent disables collection, updates Google consent mode and clears
 * analytics cookies already stored in the browser.
 */
let analytics: Analytics | null = null;
let starting: Promise<boolean> | null = null;

export function analyticsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);
}

function clearAnalyticsCookies() {
  try {
    const names = document.cookie
      .split(";")
      .map((part) => part.split("=")[0]?.trim())
      .filter((name): name is string => Boolean(name));
    const analyticsNames = names.filter(
      (name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid",
    );
    for (const name of analyticsNames) {
      const host = window.location.hostname;
      const paths = ["/"];
      const domains = [undefined, host, `.${host}`];
      for (const path of paths) {
        for (const domain of domains) {
          document.cookie = `${name}=; Max-Age=0; path=${path}${
            domain ? `; domain=${domain}` : ""
          }; SameSite=Lax`;
        }
      }
    }
  } catch {
    /* cookie access can be restricted; consent is still enforced by the SDK */
  }
}

async function applyConsentMode(enabled: boolean, marketing: boolean) {
  try {
    const { setConsent } = await import("firebase/analytics");
    setConsent({
      analytics_storage: enabled ? "granted" : "denied",
      ad_storage: enabled && marketing ? "granted" : "denied",
      ad_user_data: enabled && marketing ? "granted" : "denied",
      ad_personalization: enabled && marketing ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted",
    });
  } catch {
    /* older SDK/browser — collection is still controlled below */
  }
}

async function enableAnalytics(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!analyticsConfigured()) return false;
  // Defence in depth: never initialize without an explicit, current consent record.
  if (!hasConsent("analytics")) return false;

  const marketing = hasConsent("marketing");
  await applyConsentMode(true, marketing);

  if (analytics) {
    const { setAnalyticsCollectionEnabled } = await import("firebase/analytics");
    setAnalyticsCollectionEnabled(analytics, true);
    return true;
  }

  const app = getFirebaseApp();
  if (!app) return false;

  try {
    const { getAnalytics, isSupported, setAnalyticsCollectionEnabled } = await import(
      "firebase/analytics"
    );
    if (!(await isSupported())) return false;
    analytics = getAnalytics(app);
    setAnalyticsCollectionEnabled(analytics, true);
    return true;
  } catch {
    analytics = null;
    return false;
  }
}

export async function disableAnalytics(): Promise<void> {
  if (typeof window === "undefined" || !analytics) return;
  try {
    const { setAnalyticsCollectionEnabled } = await import("firebase/analytics");
    setAnalyticsCollectionEnabled(analytics, false);
    await applyConsentMode(false, false);
    clearAnalyticsCookies();
  } catch {
    /* analytics is optional; a failed revoke must not break the storefront */
  }
}

/**
 * Reconcile the live Firebase Analytics state with the persisted preference.
 * Called on first load and whenever consent changes, so revoked tracking stops
 * immediately instead of continuing in the background.
 */
export async function syncAnalyticsConsent(): Promise<boolean> {
  if (!hasConsent("analytics")) {
    await disableAnalytics();
    return false;
  }
  if (starting) return starting;
  starting = enableAnalytics().finally(() => {
    starting = null;
  });
  return starting;
}

/** Backwards-compatible alias used by older call sites. */
export function initAnalyticsIfConsented(): Promise<boolean> {
  return syncAnalyticsConsent();
}
