import type { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { isAdminDemoMode, requireAdminSession } from "@/lib/admin/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/server/auth";
import { mapOrder } from "@/lib/mappers";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/site";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdminSession();
    if (isAdminDemoMode()) {
      return Response.json(
        {
          demo: true,
          error:
            "Demo mode: Firebase Admin credentials are not configured, so this order change is applied to the local demo data only.",
        },
        { status: 503 },
      );
    }
    const { id } = await ctx.params;
    const body = (await request.json()) as {
      status?: string;
      paymentStatus?: string;
      adminNotes?: string;
    };

    const db = getAdminDb();
    const orderRef = db.ref(`orders/${id}`);
    const snapshot = await orderRef.get();
    if (!snapshot.exists()) throw new HttpError(404, "Order not found.");
    const current = (snapshot.val() ?? {}) as Record<string, unknown>;

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (body.status) {
      if (!ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
        throw new HttpError(400, "Unknown order status.");
      }
      if (body.status !== current.status) {
        const history = Array.isArray(current.statusHistory)
          ? (current.statusHistory as Record<string, unknown>[])
          : [];
        patch.status = body.status;
        patch.statusHistory = [
          ...history,
          { status: body.status, at: new Date().toISOString(), by: "admin" },
        ];
      }
    }

    if (body.paymentStatus) {
      if (!PAYMENT_STATUSES.includes(body.paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
        throw new HttpError(400, "Unknown payment status.");
      }
      patch.paymentStatus = body.paymentStatus;
    }

    if (typeof body.adminNotes === "string") {
      patch.adminNotes = body.adminNotes.slice(0, 1000);
    }

    await orderRef.update(patch);
    if (current.userId) {
      await db.ref(`customerOrders/${current.userId}/${id}`).update(patch);
    }

    const updated = (await orderRef.get()).val() ?? {};
    return Response.json({ order: mapOrder(id, updated as Record<string, unknown>) });
  } catch (error) {
    return jsonError(error);
  }
}
