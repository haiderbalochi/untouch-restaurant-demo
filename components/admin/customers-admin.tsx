"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { EmptyState, Input, Skeleton, StatusPill } from "@/components/ui/primitives";
import { subscribeAllOrders, subscribeCustomers } from "@/lib/data/admin";
import type { Order, UserProfile } from "@/lib/types";
import { SITE } from "@/lib/site";
import { formatDate, initials, money } from "@/lib/utils";

export function CustomersAdmin() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubCustomers = subscribeCustomers((list) => {
      setCustomers(list);
      setLoading(false);
    });
    const unsubOrders = subscribeAllOrders(setOrders);
    return () => {
      unsubCustomers();
      unsubOrders();
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      `${customer.displayName} ${customer.email} ${customer.phone}`.toLowerCase().includes(term),
    );
  }, [customers, search]);

  const statsFor = (uid: string) => {
    const own = orders.filter((order) => order.userId === uid && order.status !== "cancelled");
    return {
      count: own.length,
      spend: own.reduce((sum, order) => sum + order.total, 0),
      orders: own,
    };
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.82rem] text-cream/40">{customers.length} registered customers</p>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-cream/30" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers…"
            aria-label="Search customers"
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
            title="No customers yet."
            description="Accounts appear here as soon as someone signs up on the storefront."
          />
        ) : (
          <table className="w-full min-w-[600px] text-left">
            <thead className="border-b border-cream/10 bg-cream/[0.025]">
              <tr className="text-[0.62rem] uppercase tracking-[0.14em] text-cream/35">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="hidden px-3 py-3 font-normal sm:table-cell">Phone</th>
                <th className="px-3 py-3 font-normal">Orders</th>
                <th className="px-3 py-3 text-right font-normal">Lifetime value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/8">
              {filtered.map((customer) => {
                const stats = statsFor(customer.uid);
                return (
                  <tr
                    key={customer.uid}
                    onClick={() => setSelected(customer)}
                    className="cursor-pointer transition-colors hover:bg-cream/[0.03]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-full bg-ember/18 font-mono text-[0.58rem] text-ember-3">
                          {initials(customer.displayName || customer.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[0.82rem] text-cream/85">
                            {customer.displayName || "Unnamed guest"}
                          </p>
                          <p className="truncate text-[0.66rem] text-cream/30">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3.5 text-[0.76rem] text-cream/45 sm:table-cell">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-3 py-3.5 text-[0.78rem] text-cream/60">{stats.count}</td>
                    <td className="px-3 py-3.5 text-right text-[0.78rem] tabular-nums text-cream/70">
                      {money(stats.spend)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.displayName || "Customer"}
        description={selected?.email}
        size="lg"
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cream/10 p-4">
                <p className="eyebrow text-cream/30">Lifetime value</p>
                <p className="mt-2 font-display text-2xl text-cream">
                  {money(statsFor(selected.uid).spend)}
                </p>
              </div>
              <div className="rounded-xl border border-cream/10 p-4">
                <p className="eyebrow text-cream/30">Orders</p>
                <p className="mt-2 font-display text-2xl text-cream">
                  {statsFor(selected.uid).count}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-cream/10 p-4 text-[0.78rem] text-cream/50">
              <p>Phone · {selected.phone || "not provided"}</p>
              <p className="mt-1">
                Joined · {selected.createdAt ? formatDate(selected.createdAt) : "—"}
              </p>
              <p className="mt-1">UID · {selected.uid}</p>
            </div>

            <div>
              <p className="eyebrow text-cream/35">Order history</p>
              <ul className="mt-3 divide-y divide-cream/8">
                {statsFor(selected.uid).orders.slice(0, 6).map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link
                      href={`${SITE.adminPath}/orders?order=${order.id}`}
                      className="text-[0.8rem] text-cream/75 hover:text-cream"
                    >
                      {order.orderNumber}
                    </Link>
                    <StatusPill status={order.status} />
                    <span className="text-[0.76rem] tabular-nums text-cream/45">
                      {money(order.total)}
                    </span>
                  </li>
                ))}
                {statsFor(selected.uid).orders.length === 0 ? (
                  <li className="py-4 text-[0.78rem] text-cream/30">No orders yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
