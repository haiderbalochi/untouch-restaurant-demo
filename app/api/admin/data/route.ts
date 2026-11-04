import type { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { isAdminDemoMode, requireAdminSession } from "@/lib/admin/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only these roots may be reached through the admin bridge. */
const ROOTS = new Set([
  "products",
  "categories",
  "banners",
  "coupons",
  "restaurantSettings",
  "orders",
  "users",
  "reviews",
]);

function parsePath(raw: string | null) {
  const path = (raw ?? "").replace(/^\/+|\/+$/g, "");
  if (!path) throw new HttpError(400, "A database path is required.");
  const segments = path.split("/");
  if (segments.length > 2) throw new HttpError(400, "That database path is not allowed.");
  const [root, id] = segments;
  if (!ROOTS.has(root)) throw new HttpError(403, "That database path is not allowed.");
  if (id && !/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new HttpError(400, "Invalid record id.");
  return segments.join("/");
}

const DEMO_MESSAGE =
  "Demo mode: Firebase Admin credentials are not configured, so this change was not saved. Add FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY to enable real dashboard writes.";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const path = parsePath(new URL(request.url).searchParams.get("path"));
    if (isAdminDemoMode()) {
      return Response.json(
        { demo: true, data: null },
        { headers: { "cache-control": "no-store" } },
      );
    }
    const snapshot = await getAdminDb().ref(path).get();
    return Response.json(
      { demo: false, data: snapshot.val() ?? null },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await requireAdminSession();
    if (isAdminDemoMode()) {
      return Response.json({ demo: true, error: DEMO_MESSAGE }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
      op?: string;
      data?: Record<string, unknown>;
    };
    const path = parsePath(body.path ?? null);
    const op = body.op ?? "";
    const data = body.data;

    if (!["set", "update", "remove", "push"].includes(op)) {
      throw new HttpError(400, "Unknown write operation.");
    }
    if (op !== "remove") {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new HttpError(400, "Write payload must be an object.");
      }
      if (JSON.stringify(data).length > 200_000) {
        throw new HttpError(413, "That record is too large to save.");
      }
    }

    const payload = data as Record<string, unknown>;
    const db = getAdminDb();
    const target = db.ref(path);

    if (op === "remove") {
      await target.remove();
      return Response.json({ ok: true });
    }
    if (op === "update") {
      await target.update(payload);
      return Response.json({ ok: true });
    }
    if (op === "set") {
      await target.set(payload);
      return Response.json({ ok: true });
    }

    const child = target.push();
    await child.set({ ...payload, id: child.key });
    return Response.json({ ok: true, id: child.key });
  } catch (error) {
    return jsonError(error);
  }
}
