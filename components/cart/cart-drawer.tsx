"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/overlay";
import { Button, ButtonLink } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/quantity";
import { useCart } from "@/lib/cart-store";
import { useSettings } from "@/lib/hooks";
import { FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import { cn, money } from "@/lib/utils";

export function CartDrawer() {
  const { lines, drawerOpen, closeDrawer, setQuantity, removeLine } = useCart();
  const { data: settings } = useSettings();

  const subtotal = lines.reduce(
    (sum, line) =>
      sum +
      (line.basePrice + line.variantDelta + line.addons.reduce((acc, addon) => acc + addon.price, 0)) *
        line.quantity,
    0,
  );
  const remainingForFree = Math.max(0, FREE_DELIVERY_ABOVE - subtotal);
  const delivery = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_ABOVE ? 0 : settings.deliveryFee;

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      title={`Your order${lines.length ? ` · ${lines.length} ${lines.length === 1 ? "dish" : "dishes"}` : ""}`}
      footer={
        lines.length ? (
          <div className="space-y-4">
            {remainingForFree > 0 ? (
              <div className="rounded-xl border border-cream/10 bg-cream/[0.03] px-3 py-2.5">
                <p className="text-[0.72rem] text-cream/50">
                  Add <span className="text-ember-3">{money(remainingForFree)}</span> more for
                  complimentary delivery.
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ember to-saffron transition-all duration-700"
                    style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_ABOVE) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[0.72rem] text-emerald-300/80">
                Complimentary delivery unlocked.
              </p>
            )}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-cream/55">
                <span>Subtotal</span>
                <span className="tabular-nums text-cream/80">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-cream/55">
                <span>Delivery</span>
                <span className="tabular-nums text-cream/80">
                  {delivery === 0 ? "Complimentary" : money(delivery)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="eyebrow text-cream/40">Total</span>
                <span className="font-display text-2xl text-cream tabular-nums">
                  {money(subtotal + delivery)}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <ButtonLink href="/checkout" onClick={closeDrawer} size="md" className="w-full">
                Checkout <ArrowRight className="size-4" />
              </ButtonLink>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="text-center text-[0.7rem] uppercase tracking-[0.18em] text-cream/45 transition-colors hover:text-cream"
              >
                View full cart
              </Link>
            </div>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
          <div className="grid size-16 place-items-center rounded-full border border-cream/12 bg-cream/[0.03] text-cream/35">
            <ShoppingBag className="size-6" />
          </div>
          <p className="mt-6 font-display text-2xl text-cream/85">Nothing here yet.</p>
          <p className="mt-2 max-w-[16rem] text-sm text-cream/40">
            Your order is waiting to be written. Start with something slow-fired.
          </p>
          <ButtonLink href="/menu" onClick={closeDrawer} size="sm" variant="outline" className="mt-7">
            Explore the menu
          </ButtonLink>
        </div>
      ) : (
        <ul className="space-y-5">
          {lines.map((line) => {
            const unit = line.basePrice + line.variantDelta + line.addons.reduce((acc, addon) => acc + addon.price, 0);
            return (
              <li key={line.key} className="flex gap-4">
                <Link
                  href={`/menu/${line.slug}`}
                  onClick={closeDrawer}
                  className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-3"
                >
                  {line.image ? (
                    <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-[1.05rem] text-cream/90">{line.name}</p>
                      {line.variantName ? (
                        <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.12em] text-cream/40">
                          {line.variantName}
                        </p>
                      ) : null}
                      {line.addons.length ? (
                        <p className="mt-0.5 truncate text-xs text-cream/35">
                          + {line.addons.map((addon) => addon.name).join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeLine(line.key);
                        toast.success(`${line.name} removed`);
                      }}
                      className="shrink-0 rounded-full p-1.5 text-cream/30 transition-colors hover:text-red-300"
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(next) => setQuantity(line.key, next)}
                      size="sm"
                    />
                    <span className={cn("text-sm tabular-nums text-cream/75")}>
                      {money(unit * line.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}

export function CartSummaryCard({
  subtotal,
  discount,
  delivery,
  total,
  couponCode,
  children,
}: {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  couponCode?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-cream/[0.025] p-6">
      <p className="eyebrow text-cream/35">Order summary</p>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-cream/50">Subtotal</dt>
          <dd className="tabular-nums text-cream/85">{money(subtotal)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between">
            <dt className="text-cream/50">
              Discount{couponCode ? <span className="ml-1 text-ember-3">({couponCode})</span> : null}
            </dt>
            <dd className="tabular-nums text-emerald-300">−{money(discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-cream/50">Delivery</dt>
          <dd className="tabular-nums text-cream/85">
            {delivery === 0 ? "Complimentary" : money(delivery)}
          </dd>
        </div>
        <div className="my-3 hairline" />
        <div className="flex items-baseline justify-between">
          <dt className="eyebrow text-cream/45">Total payable</dt>
          <dd className="font-display text-[1.7rem] tabular-nums text-cream">{money(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}

export function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <div className="py-24 text-center">
      <ShoppingBag className="mx-auto size-8 text-cream/25" />
      <p className="mt-6 font-display text-3xl text-cream/90">Your cart is empty.</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-cream/45">
        Browse the menu and build something worth waiting for.
      </p>
      {onBrowse ? (
        <Button onClick={onBrowse} className="mt-7" size="sm">
          Back to menu
        </Button>
      ) : (
        <ButtonLink href="/menu" className="mt-7" size="sm">
          Explore the menu
        </ButtonLink>
      )}
    </div>
  );
}
