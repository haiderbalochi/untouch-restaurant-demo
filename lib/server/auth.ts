import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { ADMIN_READY, getAdminAuth } from "@/lib/firebase/admin";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected server error";
  console.error("[api]", error);
  return Response.json({ error: message }, { status: 500 });
}

async function verify(request: NextRequest): Promise<DecodedIdToken> {
  if (!ADMIN_READY) {
    throw new HttpError(
      503,
      "Server authentication is not configured. Add Firebase Admin credentials to .env.local.",
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "Sign in to continue.");
  try {
    return await getAdminAuth().verifyIdToken(token, true);
  } catch {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }
}

export async function requireUser(request: NextRequest): Promise<DecodedIdToken> {
  return verify(request);
}

export async function requireAdmin(request: NextRequest): Promise<DecodedIdToken> {
  const token = await verify(request);
  if (token.admin !== true) {
    throw new HttpError(403, "You do not have permission to perform this action.");
  }
  return token;
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function assertSameOrigin(request: NextRequest) {
  if (!isSameOrigin(request)) {
    throw new HttpError(403, "Cross-origin request blocked.");
  }
}

/** Minimal in-memory rate limiter — per-instance, adequate for auth/write abuse damping. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new HttpError(429, "Too many attempts. Please wait a moment and try again.");
  }
}
