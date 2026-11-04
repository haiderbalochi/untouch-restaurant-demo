"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock, MapPin, Phone, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { OrderItemsList, OrderTimeline, OrderTotals } from "@/components/order/order-parts";
import { Badge, Button, EmptyState, Skeleton, StatusPill } from "@/components/ui/primitives";
import { SetupNotice } from "@/components/layout/setup-notice";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { subscribeOrderByNumber } from "@/lib/data/user";
import { useDemoMode } from "@/lib/demo/mode";
import { useDemoStore } from "@/lib/demo/store";
import { orderToCartLines } from "@/lib/reorder";
import { ORDER_STATUS_LABEL } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDateTime, money } from "@/lib/utils";

const DEMO_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export function OrderTracker({ orderNumber }: { orderNumber: string }) {
  const { user, loading: authLoading, configured } = useAuth();
  const { addRaw, openDrawer } = useCart();
  const { demo } = useDemoMode();
  const demoOrder = useDemoStore(
    (state) => state.orders.find((entry) => entry.orderNumber === orderNumber) ?? null,
  );
  const updateDemoOrder = useDemoStore((state) => state.updateOrder);
  const [liveOrder, setLiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeOrderByNumber(orderNumber, user.uid, (next) => {
      setLiveOrder(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, orderNumber, demo]);

  const order = demo ? demoOrder : liveOrder;
  const demoPending = demo && !useDemoStore.persist.hasHydrated();

  if (authLoading || (loading && !demo) || demoPending) {
    return (
      <div className="container-x space-y-4 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="container-x py-20">
        <SetupNotice />
      </div>
    );
  }

  if (!user && !demo) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="Sign in to view this order."
          description="Orders are private to the account that placed them."
          action={
            <Link
              href={`/login?next=${encodeURIComponent(`/order/${orderNumber}`)}`}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="Order not found."
          description={
            demo
              ? `Demo orders live in the browser that placed them. We couldn't find ${orderNumber} here — place a demo order to see tracking in action.`
              : `We couldn't find ${orderNumber} on your account. Check the confirmation email or your order history.`
          }
          action={
            <Link
              href={demo ? "/menu" : "/account/orders"}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              {demo ? "Browse the demo menu" : "My orders"}
            </Link>
          }
        />
      </div>
    );
  }

  const demoFlowIndex = DEMO_FLOW.indexOf(order.status);
  const nextDemoStatus =
    demoFlowIndex >= 0 && demoFlowIndex < DEMO_FLOW.length - 1
      ? DEMO_FLOW[demoFlowIndex + 1]
      : null;

  function advanceDemoStatus() {
    if (!order || !nextDemoStatus) return;
    updateDemoOrder(order.id, { status: nextDemoStatus });
    toast.success(`Simulated status · ${ORDER_STATUS_LABEL[nextDemoStatus]}`);
  }

  function reorder() {
    if (!order) return;
    orderToCartLines(order).forEach((line) => addRaw(line));
    toast.success("Added to your cart — review quantities before checkout.");
    openDrawer();
  }

  return (
    <>
      {demo ? (
        <div className="container-x pt-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-[0.74rem] leading-relaxed text-amber-100/80">
            <Badge tone="warm">Demo order</Badge>
            <p className="flex-1">
              Statuses below are simulated for this portfolio demo. No payment is processed and
              nothing is written to Firebase.
            </p>
            {nextDemoStatus ? (
              <button
                type="button"
                onClick={advanceDemoStatus}
                className="rounded-full border border-amber-200/30 px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.14em] text-amber-100/90 transition-colors hover:bg-amber-200/10"
              >
                Simulate next step
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="container-x grid gap-10 pb-24 pt-10 lg:grid-cols-[1.35fr_0.9fr] lg:gap-14">
      <div>
        <div className="rounded-[1.5rem] border border-cream/12 bg-gradient-to-br from-ember/12 via-cream/[0.03] to-transparent p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-cream/40">Order</p>
              <h1 className="mt-2 font-display text-3xl text-cream">{order.orderNumber}</h1>
              <p className="mt-1.5 text-[0.76rem] text-cream/40">
                Placed {formatDateTime(order.createdAt)} · {order.items.length} lines
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusPill status={order.status} />
              <StatusPill status={order.paymentStatus} />
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 text-[0.8rem] text-cream/55">
            <Clock className="size-4 text-ember-3/80" />
            {order.status === "delivered"
              ? "Delivered — thank you for ordering."
              : order.status === "cancelled"
                ? "This order will not be delivered."
                : demo
                  ? "Simulated tracking — use “Simulate next step” above to walk through the statuses."
                  : "Estimated delivery 35–45 minutes from confirmation. This page updates live."}
          </p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-cream/10 p-6">
            <p className="eyebrow text-cream/35">
              {demo ? "Simulated tracking" : "Tracking"}
            </p>
            <div className="mt-5">
              <OrderTimeline order={order} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-cream/10 p-6">
              <p className="eyebrow flex items-center gap-2 text-cream/35">
                <MapPin className="size-3.5" /> Delivering to
              </p>
              <p className="mt-3 text-[0.84rem] text-cream/75">
                {order.address.fullName} · {order.address.phone}
              </p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-cream/40">
                {[order.address.house, order.address.street, order.address.area, order.address.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.address.instructions ? (
                <p className="mt-2 text-[0.72rem] text-cream/30">“{order.address.instructions}”</p>
              ) : null}
              {order.notes ? (
                <p className="mt-3 rounded-lg bg-cream/[0.04] p-3 text-[0.72rem] text-cream/45">
                  {order.notes}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-cream/10 p-6">
              <p className="eyebrow flex items-center gap-2 text-cream/35">
                <ShieldCheck className="size-3.5" /> Payment
              </p>
              <p className="mt-3 text-[0.84rem] text-cream/75">
                {order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}
              </p>
              <p className="mt-1 text-[0.74rem] text-cream/40">
                {demo
                  ? "Demo only — no payment is collected and no card is charged."
                  : order.paymentStatus === "paid"
                    ? "Payment verified."
                    : order.paymentMethod === "cod"
                      ? `Please keep ${money(order.total)} ready for the rider.`
                      : "Awaiting verified provider confirmation."}
              </p>
              {order.paymentReference ? (
                <p className="mt-2 font-mono text-[0.64rem] text-cream/30">
                  Ref · {order.paymentReference}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-cream/10 p-6">
          <p className="eyebrow text-cream/35">Your order</p>
          <div className="mt-5">
            <OrderItemsList order={order} />
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-cream/10 bg-cream/[0.025] p-6">
          <p className="eyebrow text-cream/35">Bill</p>
          <div className="mt-5">
            <OrderTotals order={order} />
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="secondary" className="w-full" size="md" onClick={reorder}>
            <RotateCcw className="size-4" /> Reorder these dishes
          </Button>
          <Link
            href={demo ? "/menu" : "/account/orders"}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-cream/18 text-[0.72rem] uppercase tracking-[0.16em] text-cream/70 transition-colors hover:bg-cream/6"
          >
            {demo ? "Browse the menu" : "All my orders"} <ArrowRight className="size-3.5" />
          </Link>
          <a
            href={`tel:${order.address.phone.replace(/\s/g, "")}`}
            className="flex h-11 items-center justify-center gap-2 rounded-full text-[0.7rem] uppercase tracking-[0.16em] text-cream/35 transition-colors hover:text-cream"
          >
            <Phone className="size-3.5" /> Call about this order
          </a>
        </div>

        <Badge tone="neutral" className="w-full justify-center py-2.5">
          {demo ? "Demo tracking · simulated statuses" : "Live status · refreshes automatically"}
        </Badge>
      </div>
      </div>
    </>
  );
}
