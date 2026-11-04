/**
 * Consent policy constants shared by server-rendered policy pages and the
 * client-side consent store. Kept free of "use client" so server components can
 * read real values during rendering.
 */
export const CONSENT_VERSION = 2;
export const CONSENT_POLICY_DATE = "2026-11-02";
export const CONSENT_STORAGE_KEY = "untouch.consent.v1";
export const OPEN_CONSENT_EVENT = "untouch:open-cookie-settings";
export const CONSENT_CHANGED_EVENT = "untouch:consent-changed";
