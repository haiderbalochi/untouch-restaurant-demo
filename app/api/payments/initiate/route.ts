import type { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPaymentAdapter, onlinePaymentsConfigured, providerLabel } from "@/lib/payments";
import { assertSameOrigin, HttpError, jsonError, requireUser } from "@/lib/server/auth";

export const runtime = "nodejs";

/**
 * Starts an online payment. Deliberately fails closed: an order is never marked
 * paid here, and no provider credentials exist yet.
 */
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const token = await requireUser(request);
    const body = (await request.json().catch(() => ({}))) as { orderId?: string };
    if (!body.orderId) throw new HttpError(400, "Order reference is required.");

    const snapshot = await getAdminDb().ref(`orders/${body.orderId}`).get();
    if (!snapshot.exists()) throw new HttpError(404, "Order not found.");
    const order = (snapshot.val() ?? {}) as Record<string, unknown>;
    if (order.userId !== token.uid) throw new HttpError(403, "That order is not yours.");
    if (order.paymentStatus === "paid") {
      throw new HttpError(409, "This order is already paid.");
    }
    if (order.paymentMethod !== "online") {
      throw new HttpError(400, "This order is set to cash on delivery.");
    }

    if (!onlinePaymentsConfigured()) {
      throw new HttpError(
        503,
        "Online payments are not connected. A Pakistani payment provider (JazzCash / Easypaisa / Safepay) must be configured on the server before online payment can be offered.",
      );
    }

    const adapter = getPaymentAdapter();
    if (!adapter) throw new HttpError(503, "No payment provider is configured.");

    const result = await adapter.initiate({
      orderId: body.orderId,
      orderNumber: String(order.orderNumber ?? ""),
      amount: Number(order.total ?? 0),
      customerEmail: token.email ?? "",
      customerPhone: String((order.customer as { phone?: string })?.phone ?? ""),
    });

    if (!result.configured || !result.redirectUrl) {
      throw new HttpError(
        503,
        `${providerLabel(adapter.key)} is not fully configured: ${result.reason ?? "missing credentials"}.`,
      );
    }

    return Response.json({ redirectUrl: result.redirectUrl, reference: result.reference });
  } catch (error) {
    return jsonError(error);
  }
}
