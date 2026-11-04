"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Banknote,
  ChefHat,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Skeleton, StatusPill } from "@/components/ui/primitives";
import { subscribeAllOrders, subscribeCustomers } from "@/lib/data/admin";
import { useProducts } from "@/lib/hooks";
import { SITE } from "@/lib/site";
import type { Order, UserProfile } from "@/lib/types";
import { formatDateTime, money } from "@/lib/utils";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function AdminOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: products, loading: productsLoading } = useProducts({ includeUnavailable: true });

  useEffect(() => {
    const unsubOrders = subscribeAllOrders((list) => {
      setOrders(list);
      setLoading(false);
    });
    const unsubCustomers = subscribeCustomers((list) => setCustomers(list));
    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  const stats = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    const active = orders.filter((order) => order.status !== "cancelled");
    const todays = active.filter((order) => new Date(order.createdAt).getTime() >= today);
    const revenue = active.reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter((order) =>
      ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(order.status),
    ).length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const average = active.length ? Math.round(revenue / active.length) : 0;
    return {
      total: orders.length,
      today: todays.length,
      revenue,
      todayRevenue: todays.reduce((sum, order) => sum + order.total, 0),
      pending,
      delivered,
      average,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = startOfDay(new Date());
      date.setDate(date.getDate() - (6 - index));
      return {
        label: date.toLocaleDateString("en-PK", { weekday: "short" }),
        key: date.getTime(),
        revenue: 0,
        orders: 0,
      };
    });
    orders
      .filter((order) => order.status !== "cancelled")
      .forEach((order) => {
        const created = startOfDay(new Date(order.createdAt)).getTime();
        const bucket = days.find((day) => day.key === created);
        if (bucket) {
          bucket.revenue += order.total;
          bucket.orders += 1;
        }
      });
    return days;
  }, [orders]);

  const popular = useMemo(() => {
    const counts = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders
      .filter((order) => order.status !== "cancelled")
      .forEach((order) =>
        order.items.forEach((item) => {
          const current = counts.get(item.productId) ?? {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
          current.quantity += item.quantity;
          current.revenue += item.lineTotal;
          counts.set(item.productId, current);
        }),
      );
    const fromOrders = [...counts.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    if (fromOrders.length) return fromOrders;
    return products
      .slice()
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        quantity: product.soldCount,
        revenue: product.soldCount * product.price,
      }));
  }, [orders, products]);

  if (loading || productsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Revenue", value: money(stats.revenue), meta: `${money(stats.todayRevenue)} today`, icon: Banknote },
    { label: "Orders", value: String(stats.total), meta: `${stats.today} today`, icon: ShoppingBag },
    { label: "In progress", value: String(stats.pending), meta: "being prepared or en route", icon: ChefHat },
    { label: "Delivered", value: String(stats.delivered), meta: `${money(stats.average)} avg. order`, icon: TrendingUp },
    { label: "Customers", value: String(customers.length), meta: "registered accounts", icon: Users },
    { label: "Products", value: String(products.length), meta: `${products.filter((p) => p.available).length} available`, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-cream/10 bg-cream/[0.025] p-5 transition-colors hover:border-cream/20"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cream/35">
                {card.label}
              </p>
              <card.icon className="size-4 text-ember-3/70" />
            </div>
            <p className="mt-3 font-display text-[1.8rem] leading-none text-cream tabular-nums">
              {card.value}
            </p>
            <p className="mt-2 text-[0.7rem] text-cream/30">{card.meta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cream/35">
                Last 7 days
              </p>
              <p className="mt-1 font-display text-lg text-cream/90">Revenue pulse</p>
            </div>
            <span className="rounded-full bg-cream/5 px-3 py-1 text-[0.66rem] text-cream/40">
              {chartData.reduce((sum, day) => sum + day.orders, 0)} orders
            </span>
          </div>
          <div className="mt-6 h-56 w-full">
            {orders.length === 0 ? (
              <div className="grid h-full place-items-center rounded-xl border border-dashed border-cream/10 text-[0.78rem] text-cream/30">
                No orders yet — the chart fills in as orders arrive.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -18, right: 6, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c4551f" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#c4551f" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(242,236,225,0.07)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(242,236,225,0.35)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(242,236,225,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#14120f",
                      border: "1px solid rgba(242,236,225,0.12)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "#f2ece1",
                    }}
                    formatter={(value, name) => {
                      const numeric = Number(value ?? 0);
                      return name === "revenue"
                        ? [money(Number.isFinite(numeric) ? numeric : 0), "Revenue"]
                        : [String(value ?? ""), "Orders"];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#e0703a"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cream/35">
            Best sellers
          </p>
          <ul className="mt-4 space-y-3">
            {popular.length === 0 ? (
              <li className="rounded-xl border border-dashed border-cream/10 p-6 text-center text-[0.78rem] text-cream/30">
                No sales data yet.
              </li>
            ) : (
              popular.map((item, index) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span className="w-4 font-mono text-[0.6rem] text-cream/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8rem] text-cream/75">{item.name}</p>
                    <p className="text-[0.64rem] text-cream/25">{item.quantity} served</p>
                  </div>
                  <p className="text-[0.72rem] tabular-nums text-cream/40">{money(item.revenue)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-cream/10 bg-cream/[0.02]">
        <div className="flex items-center justify-between border-b border-cream/8 px-5 py-4">
          <p className="font-display text-lg text-cream/90">Recent orders</p>
          <Link
            href={`${SITE.adminPath}/orders`}
            className="inline-flex items-center gap-1 text-[0.66rem] uppercase tracking-[0.14em] text-ember-3/80 hover:text-ember-3"
          >
            All orders <ArrowUpRight className="size-3" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-[0.82rem] text-cream/30">
            No orders yet. Share the menu link and the first one will land here in real time.
          </p>
        ) : (
          <ul className="divide-y divide-cream/8">
            {orders.slice(0, 6).map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`${SITE.adminPath}/orders?order=${order.id}`}
                    className="text-[0.84rem] text-cream/85 hover:text-cream"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[0.66rem] text-cream/30">
                    <Clock className="size-3" /> {formatDateTime(order.createdAt)} ·{" "}
                    {order.customer.name}
                  </p>
                </div>
                <StatusPill status={order.status} />
                <p className="w-20 text-right text-[0.8rem] tabular-nums text-cream/70">
                  {money(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
