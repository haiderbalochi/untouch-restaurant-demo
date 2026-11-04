"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/overlay";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Select,
  Skeleton,
  StatusPill,
  Textarea,
} from "@/components/ui/primitives";
import { OrderItemsList, OrderTotals } from "@/components/order/order-parts";
import { subscribeAllOrders, updateOrderAdmin } from "@/lib/data/admin";
import { useDemoMode } from "@/lib/demo/mode";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_STATUSES } from "@/lib/site";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";
import { cn, formatDateTime, money } from "@/lib/utils";

export function OrdersAdmin() {
  const params = useSearchParams();
  const { demo } = useDemoMode();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>("pending");
  const [draftPayment, setDraftPayment] = useState<PaymentStatus>("unpaid");
  const [draftNotes, setDraftNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAllOrders((list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const target = params.get("order");
    if (!target || orders.length === 0) return;
    const match = orders.find((order) => order.id === target);
    if (match) openOrder(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, orders.length]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!term) return true;
      return [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        order.customer.email,
        order.address.area,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [orders, status, search]);

  function openOrder(order: Order) {
    setSelected(order);
    setDraftStatus(order.status);
    setDraftPayment(order.paymentStatus);
    setDraftNotes(order.adminNotes ?? "");
  }

  async function save(patch?: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    adminNotes?: string;
  }) {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateOrderAdmin(
        selected.id,
        patch ?? { status: draftStatus, paymentStatus: draftPayment, adminNotes: draftNotes },
      );
      setSelected(updated);
      setDraftStatus(updated.status);
      setDraftPayment(updated.paymentStatus);
      setDraftNotes(updated.adminNotes ?? "");
      toast.success(`Order ${updated.orderNumber} updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the order.");
    } finally {
      setSaving(false);
    }
  }

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => map.set(order.status, (map.get(order.status) ?? 0) + 1));
    return map;
  }, [orders]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {["all", ...ORDER_STATUSES].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[0.7rem] transition-colors",
                status === value
                  ? "bg-cream text-ink"
                  : "text-cream/45 hover:bg-cream/8 hover:text-cream",
              )}
            >
              {value === "all" ? "All" : ORDER_STATUS_LABEL[value as OrderStatus]}
              <span className="ml-1.5 text-[0.6rem] opacity-50">
                {value === "all" ? orders.length : counts.get(value) ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-cream/30" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order, name, phone…"
            aria-label="Search orders"
            className="h-10 rounded-full pl-9 text-[0.82rem]"
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-cream/10">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            className="border-0"
            title="No orders here."
            description="Orders appear the moment a customer checks out — live, with no refresh."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-cream/10 bg-cream/[0.025]">
                <tr className="text-[0.62rem] uppercase tracking-[0.14em] text-cream/35">
                  <th className="px-5 py-3 font-normal">Order</th>
                  <th className="px-3 py-3 font-normal">Customer</th>
                  <th className="px-3 py-3 font-normal">Total</th>
                  <th className="px-3 py-3 font-normal">Payment</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 text-right font-normal">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/8">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrder(order)}
                    className="cursor-pointer transition-colors hover:bg-cream/[0.03]"
                  >
                    <td className="px-5 py-3.5 text-[0.8rem] text-cream/85">{order.orderNumber}</td>
                    <td className="px-3 py-3.5">
                      <p className="text-[0.8rem] text-cream/75">{order.customer.name}</p>
                      <p className="text-[0.64rem] text-cream/30">{order.customer.phone}</p>
                    </td>
                    <td className="px-3 py-3.5 text-[0.8rem] tabular-nums text-cream/75">
                      {money(order.total)}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusPill status={order.paymentStatus} />
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusPill status={order.status} />
                    </td>
                    <td className="px-3 py-3.5 text-right text-[0.7rem] text-cream/35">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.orderNumber : "Order"}
        description={selected ? `Placed ${formatDateTime(selected.createdAt)}` : undefined}
        size="xl"
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {demo ? <Badge tone="warm">Demo order</Badge> : null}
              <StatusPill status={selected.status} />
              <StatusPill status={selected.paymentStatus} />
              <span className="rounded-full bg-cream/8 px-3 py-1 text-[0.66rem] text-cream/50">
                {selected.paymentMethod === "cod" ? "Cash on delivery" : "Online"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-cream/10 p-4">
                <p className="eyebrow flex items-center gap-2 text-cream/35">
                  <MapPin className="size-3.5" /> Delivery
                </p>
                <p className="mt-2 text-[0.82rem] text-cream/80">{selected.address.fullName}</p>
                <p className="mt-1 text-[0.76rem] leading-relaxed text-cream/40">
                  {[selected.address.house, selected.address.street, selected.address.area, selected.address.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <a
                  href={`tel:${selected.customer.phone}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-[0.72rem] text-ember-3/80 hover:text-ember-3"
                >
                  <Phone className="size-3" /> {selected.customer.phone}
                </a>
                {selected.address.instructions ? (
                  <p className="mt-2 text-[0.7rem] text-cream/30">“{selected.address.instructions}”</p>
                ) : null}
              </div>

              <div className="rounded-xl border border-cream/10 p-4">
                <p className="eyebrow text-cream/35">Customer</p>
                <p className="mt-2 text-[0.82rem] text-cream/80">{selected.customer.name}</p>
                <p className="mt-0.5 text-[0.72rem] text-cream/35">{selected.customer.email}</p>
                <p className="mt-2 text-[0.66rem] text-cream/25">UID {selected.userId.slice(0, 12)}…</p>
                {selected.notes ? (
                  <p className="mt-3 rounded-lg bg-cream/5 p-2.5 text-[0.72rem] text-cream/50">
                    Customer note: {selected.notes}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-cream/10 p-4">
              <p className="eyebrow text-cream/35">Items</p>
              <div className="mt-3">
                <OrderItemsList order={selected} />
              </div>
              <div className="mt-4 border-t border-cream/8 pt-4">
                <OrderTotals order={selected} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Order status" htmlFor="order-status">
                <Select
                  id="order-status"
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value as OrderStatus)}
                >
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value} className="bg-ink">
                      {ORDER_STATUS_LABEL[value]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Payment status" htmlFor="order-payment">
                <Select
                  id="order-payment"
                  value={draftPayment}
                  onChange={(event) => setDraftPayment(event.target.value as PaymentStatus)}
                >
                  {PAYMENT_STATUSES.map((value) => (
                    <option key={value} value={value} className="bg-ink capitalize">
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Internal notes" htmlFor="order-notes" hint="Only staff can see this.">
              <Textarea
                id="order-notes"
                value={draftNotes}
                onChange={(event) => setDraftNotes(event.target.value)}
                className="min-h-20"
                maxLength={1000}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-2 border-t border-cream/10 pt-4">
              <Button size="sm" variant="outline" onClick={() => save({ status: "confirmed" })} disabled={saving}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => save({ status: "preparing" })} disabled={saving}>
                Preparing
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => save({ status: "out_for_delivery" })}
                disabled={saving}
              >
                Dispatch
              </Button>
              <Button size="sm" variant="outline" onClick={() => save({ status: "delivered" })} disabled={saving}>
                Delivered
              </Button>
              <Button size="sm" variant="danger" onClick={() => save({ status: "cancelled" })} disabled={saving}>
                Reject
              </Button>
              <Button size="sm" className="ml-auto" loading={saving} onClick={() => save()}>
                Save changes
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
