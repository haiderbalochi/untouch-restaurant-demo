import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminAuthConfigured,
  adminCookieOptions,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin/session";
import { assertSameOrigin, HttpError, jsonError, rateLimit } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local"
  ).toLowerCase();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    if (!adminAuthConfigured()) {
      throw new HttpError(
        503,
        "Admin sign-in is not configured. Set ADMIN_PANEL_PASSWORD and ADMIN_SESSION_SECRET.",
      );
    }

    const body = (await request.json().catch(() => ({}))) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    if (!password) throw new HttpError(400, "Enter the admin password.");
    if (password.length > 200) throw new HttpError(401, "That password is not correct.");

    if (!verifyAdminPassword(password)) {
      // Count only failures, so a legitimate sign-in is never throttled by earlier successes.
      rateLimit(`admin-login:${clientKey(request)}`, 5, 10 * 60_000);
      await sleep(300);
      throw new HttpError(401, "That password is not correct.");
    }

    const session = createAdminSession();
    const response = NextResponse.json({ ok: true, expiresAt: session.expiresAt });
    response.cookies.set(ADMIN_COOKIE, session.token, adminCookieOptions());
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
