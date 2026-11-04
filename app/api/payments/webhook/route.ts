import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { jsonError } from "@/lib/server/auth";

export const runtime = "nodejs";

function verifySignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = header.replace(/^sha256=/, "").trim();
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Provider callback. Orders move to paid only after an HMAC-verified payload.
 * Without PAYMENT_WEBHOOK_SECRET this endpoint refuses every request (503).
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) {
      return Response.json({ error: "Payment webhooks are not configured." }, { status: 503 });
    }

    const rawBody = await request.text();
    const signature =
      request.headers.get("x-payment-signature") ?? request.headers.get("x-signature");
    if (!verifySignature(rawBody, signature, secret)) {
      return Response.json({ error: "Invalid signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      orderId?: string;
      reference?: string;
      status?: string;
    };
    if (!payload.orderId || !payload.status) {
      return Response.json({ error: "Malformed payload." }, { status: 400 });
    }

    const paid = payload.status === "paid" || payload.status === "success";
    const failed = payload.status === "failed" || payload.status === "cancelled";

    const db = getAdminDb();
    const orderRef = db.ref(`orders/${payload.orderId}`);
    const snapshot = await orderRef.get();
    if (!snapshot.exists()) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }
    const order = (snapshot.val() ?? {}) as Record<string, unknown>;

    const patch = {
      paymentStatus: paid ? "paid" : failed ? "failed" : "unpaid",
      paymentReference: payload.reference ?? null,
      updatedAt: new Date().toISOString(),
    };

    await orderRef.update(patch);
    if (order.userId) {
      await db.ref(`customerOrders/${order.userId}/${payload.orderId}`).update(patch);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
