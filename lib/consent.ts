"use client";

/**
 * Consent state for UNTOUCH.
 *
 * Preferences live in localStorage — not in a traditional HTTP cookie. The
 * record carries a policy version plus a status and timestamp so UNTOUCH can
 * ask again whenever the policy changes. Optional analytics must never start
 * until `hasConsent("analytics")` is true.
 */

import {
  CONSENT_CHANGED_EVENT,
  CONSENT_POLICY_DATE,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  OPEN_CONSENT_EVENT,
} from "@/lib/consent-config";

export {
  CONSENT_CHANGED_EVENT,
  CONSENT_POLICY_DATE,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  OPEN_CONSENT_EVENT,
};

export type ConsentStatus = "all" | "essential" | "custom";
export type OptionalCategory = "analytics" | "marketing";

export interface ConsentState {
  version: number;
  status: ConsentStatus;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export interface ConsentSelection {
  analytics: boolean;
  marketing: boolean;
}

export const DEFAULT_CONSENT: Omit<ConsentState, "decidedAt"> = {
  version: CONSENT_VERSION,
  status: "essential",
  essential: true,
  analytics: false,
  marketing: false,
};

export function deriveConsentStatus(analytics: boolean, marketing: boolean): ConsentStatus {
  if (analytics && marketing) return "all";
  if (!analytics && !marketing) return "essential";
  return "custom";
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (!parsed || typeof parsed.version !== "number") return null;
    const analytics = Boolean(parsed.analytics);
    const marketing = Boolean(parsed.marketing);
    return {
      version: parsed.version,
      status:
        parsed.status === "all" || parsed.status === "essential" || parsed.status === "custom"
          ? parsed.status
          : deriveConsentStatus(analytics, marketing),
      essential: true,
      analytics,
      marketing,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** A stored record only counts when it matches the current policy version. */
export function hasCurrentConsent(state: ConsentState | null): state is ConsentState {
  return Boolean(state && state.version === CONSENT_VERSION);
}

export function saveConsent(categories: ConsentSelection): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    status: deriveConsentStatus(categories.analytics, categories.marketing),
    essential: true,
    analytics: categories.analytics,
    marketing: categories.marketing,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage can be unavailable (private mode) — consent simply is not persisted */
  }
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: state }));
  return state;
}

export function hasConsent(category: OptionalCategory): boolean {
  const state = readConsent();
  if (!hasCurrentConsent(state)) return false;
  return Boolean(state[category]);
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

/** Utility used by the policy page and settings footnote. */
export function formatConsentDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
