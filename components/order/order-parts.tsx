"use client";

import Image from "next/image";
import { Check, ChefHat, CircleDot, Truck, X } from "lucide-react";
import { cn, formatDateTime, money } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/site";
import type { Order } from "@/lib/types";

const FLOW = ORDER_STATUSES.filter((status) => status !== "cancelled");
const ICONS = [CircleDot, Check, ChefHat, Check, Truck, Check];

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-500/8 p-5">
        <X className="size-5 text-red-300" />
        <div>
          <p className="text-sm text-red-200">This order was cancelled.</p>
          <p className="mt-0.5 text-[0.72rem] text-red-200/60">
            If this looks wrong, contact the restaurant and quote {order.orderNumber}.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(order.status);

  return (
    <ol className="relative space-y-0">
      {FLOW.map((status, index) => {
        const done = index <= currentIndex;
        const active = index === currentIndex;
        const Icon = ICONS[index] ?? CircleDot;
        const event = [...order.statusHistory].reverse().find((item) => item.status === status);
        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
            {index < FLOW.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px",
                  done && index < currentIndex ? "bg-ember/60" : "bg-cream/10",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border transition-colors",
                active
                  ? "border-ember bg-ember text-cream"
                  : done
                    ? "border-ember/40 bg-ember/12 text-ember-3"
                    : "border-cream/15 text-cream/25",
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-[0.85rem]",
                  active ? "text-cream" : done ? "text-cream/70" : "text-cream/30",
                )}
              >
                {ORDER_STATUS_LABEL[status]}
              </p>
              {event ? (
                <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-cream/25">
                  {formatDateTime(event.at)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItemsList({ order }: { order: Order }) {
  return (
    <ul className="divide-y divide-cream/8">
      {order.items.map((item, index) => (
        <li key={`${item.productId}-${index}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-3">
            {item.image ? (
              <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.86rem] text-cream/80">
              {item.quantity} × {item.name}
            </p>
            <p className="mt-0.5 text-[0.68rem] text-cream/35">
              {[item.variantName, ...item.addons.map((addon) => addon.name)]
                .filter(Boolean)
                .join(" · ") || "As served"}
            </p>
          </div>
          <p className="text-[0.82rem] tabular-nums text-cream/65">{money(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="space-y-2 text-[0.82rem]">
      <div className="flex justify-between text-cream/45">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{money(order.subtotal)}</dd>
      </div>
      {order.discount > 0 ? (
        <div className="flex justify-between text-emerald-300/80">
          <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
          <dd className="tabular-nums">−{money(order.discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between text-cream/45">
        <dt>Delivery</dt>
        <dd className="tabular-nums">
          {order.deliveryFee === 0 ? "Complimentary" : money(order.deliveryFee)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-cream/10 pt-3">
        <dt className="eyebrow text-cream/40">Total</dt>
        <dd className="font-display text-xl tabular-nums text-cream">{money(order.total)}</dd>
      </div>
    </dl>
  );
}
