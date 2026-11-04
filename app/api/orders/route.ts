import type { NextRequest } from "next/server";
import { onlinePaymentsConfigured } from "@/lib/payments";
import {
  assertSameOrigin,
  HttpError,
  jsonError,
  rateLimit,
  requireUser,
} from "@/lib/server/auth";
import { createOrderForUser, normalizeItems } from "@/lib/server/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const token = await requireUser(request);
    rateLimit(`orders:${token.uid}`, 6, 60_000);

    const body = (await request.json()) as {
      items?: unknown;
      addressId?: string;
      paymentMethod?: string;
      notes?: string;
      couponCode?: string | null;
    };

    if (!body.addressId) throw new HttpError(400, "Choose a delivery address.");
    const paymentMethod = body.paymentMethod === "online" ? "online" : "cod";
    if (paymentMethod === "online" && !onlinePaymentsConfigured()) {
      throw new HttpError(
        501,
        "Online payment is not connected yet. Choose cash on delivery, or ask the restaurant to enable a payment provider.",
      );
    }

    const order = await createOrderForUser({
      token,
      items: normalizeItems(body.items),
      addressId: body.addressId,
      paymentMethod,
      notes: body.notes ?? "",
      couponCode: body.couponCode ?? null,
    });

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
