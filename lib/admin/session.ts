import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_READY } from "@/lib/firebase/admin";
import { HttpError } from "@/lib/server/auth";

/**
 * Password-based admin sessions.
 *
 * There is no Firebase custom-claim bootstrap any more: the owner signs in with
 * ADMIN_PANEL_PASSWORD and receives an HMAC-signed, HttpOnly cookie. The
 * password and the signing secret never reach the browser.
 */

export const ADMIN_COOKIE = "untouch_admin";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

/** Reads the configured admin password. Server-only; never imported by client code. */
function adminPassword() {
  return process.env.ADMIN_PANEL_PASSWORD ?? "";
}

function signingSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

/** True when both the password and a usable signing secret are configured. */
export function adminAuthConfigured() {
  return adminPassword().length > 0 && signingSecret().length >= 16;
}

/**
 * Privileged Firebase Admin (service account) is optional. When it is missing the
 * dashboard runs in demo mode: read paths show what is publicly readable and every
 * write is refused instead of being reported as saved.
 */
export function isAdminDemoMode() {
  return !ADMIN_READY;
}

export function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function sign(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

type SessionPayload = { exp: number; jti: string };

function verify(token: string | undefined | null): SessionPayload | null {
  if (!token || !adminAuthConfigured()) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSession(now = Date.now()) {
  const exp = Math.floor(now / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const body = Buffer.from(
    JSON.stringify({ exp, jti: randomBytes(9).toString("base64url") } satisfies SessionPayload),
  ).toString("base64url");
  return { token: `${body}.${sign(body)}`, expiresAt: exp * 1000 };
}

/** Reads the current admin session from the request cookie jar (server components and route handlers). */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verify(jar.get(ADMIN_COOKIE)?.value);
}

/** Throws HttpError(401) when the caller has no valid admin session. */
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) throw new HttpError(401, "Admin session expired. Sign in again.");
  return session;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

/** Constant-time password check that also works when the env value is unset. */
export function verifyAdminPassword(candidate: string) {
  const configured = adminPassword();
  if (!configured) return false;
  return safeEqual(candidate, configured);
}
