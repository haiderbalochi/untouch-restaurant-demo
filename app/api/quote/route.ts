import type { NextRequest } from "next/server";
import { assertSameOrigin, jsonError, requireUser } from "@/lib/server/auth";
import { normalizeItems, priceOrder } from "@/lib/server/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await requireUser(request);
    const body = (await request.json()) as { items?: unknown; couponCode?: string | null };
    const items = normalizeItems(body.items);
    const { quote } = await priceOrder(items, body.couponCode ?? null);
    return Response.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}
