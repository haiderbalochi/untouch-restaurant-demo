"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Banknote, Check, CreditCard, MapPin, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import { CartSummaryCard } from "@/components/cart/cart-drawer";
import { Badge, Button, EmptyState, Field, Input, Textarea } from "@/components/ui/primitives";
import { useCart } from "@/lib/cart-store";
import { useDemoStore } from "@/lib/demo/store";
import { couponDiscount, deliveryFeeFor, FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import type { Coupon, OrderAddress, OrderItem } from "@/lib/types";
import { money } from "@/lib/utils";

/**
 * Demo checkout.
 *
 * Uses the browser-local sample cart and writes the order to the demo store.
 * No payment is processed, no provider is contacted, and nothing is written to
 * Firebase Realtime Database.
 */
export function DemoCheckout() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const settings = useDemoStore((state) => state.settings);
  const coupons = useDemoStore((state) => state.coupons);
  const placeOrder = useDemoStore((state) => state.placeOrder);

  const [fullName, setFullName] = useState("Ayesha Khan");
  const [email, setEmail] = useState("ayesha.khan@example.com");
  const [phone, setPhone] = useState("+92 300 1234567");
  const [house, setHouse] = useState("House 14-C");
  const [street, setStreet] = useState("Khayaban-e-Shahbaz");
  const [area, setArea] = useState("DHA Phase VI");
  const [city, setCity] = useState("Karachi");
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [placing, setPlacing] = useState(false);

  const items: OrderItem[] = useMemo(
    () =>
      lines.map((line) => {
        const unitPrice =
          line.basePrice +
          line.variantDelta +
          line.addons.reduce((sum, addon) => sum + addon.price, 0);
        return {
          productId: line.productId,
          slug: line.slug,
          name: line.name,
          image: line.image,
          unitPrice,
          quantity: line.quantity,
          variantName: line.variantName,
          addons: line.addons.map((addon) => ({ name: addon.name, price: addon.price })),
          lineTotal: unitPrice * line.quantity,
        };
      }),
    [lines],
  );

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = couponDiscount(coupon, subtotal);
  const deliveryFee = deliveryFeeFor(subtotal - discount, settings.deliveryFee);
  const total = subtotal - discount + deliveryFee;
  const belowMinimum = subtotal > 0 && subtotal < settings.minOrder;

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const match = coupons.find((entry) => entry.code.toUpperCase() === code);
    if (!match) return toast.error("That demo coupon does not exist.");
    if (!match.active) return toast.error("That coupon is switched off.");
    if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) {
      return toast.error("That coupon has expired.");
    }
    if (match.usageLimit != null && match.usedCount >= match.usageLimit) {
      return toast.error("That coupon has reached its usage limit.");
    }
    if (subtotal < match.minOrder) {
      return toast.error(`This coupon needs an order of at least ${money(match.minOrder)}.`);
    }
    setCoupon(match);
    toast.success(`${match.code} applied — ${money(couponDiscount(match, subtotal))} off`);
  }

  function placeDemoOrder(event: React.FormEvent) {
    event.preventDefault();
    if (lines.length === 0) return;
    if (!fullName.trim() || !phone.trim() || !house.trim() || !area.trim() || !city.trim()) {
      return toast.error("Fill in your name, phone and delivery address.");
    }
    if (belowMinimum) {
      return toast.error(`Minimum demo order is ${money(settings.minOrder)}.`);
    }

    const address: OrderAddress = {
      label: "Home",
      fullName: fullName.trim(),
      phone: phone.trim(),
      house: house.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      postalCode: "",
      instructions: notes.trim(),
    };

    setPlacing(true);
    try {
      const order = placeOrder({
        customer: {
          name: fullName.trim(),
          email: email.trim() || "guest@untouch.demo",
          phone: phone.trim(),
        },
        address,
        items,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode: coupon?.code ?? null,
        paymentMethod: "cod",
        notes: notes.trim(),
      });
      clear();
      toast.success(`Demo order ${order.orderNumber} placed — nothing was charged.`);
      router.push(`/order/${encodeURIComponent(order.orderNumber)}`);
    } catch {
      toast.error("The demo order could not be placed. Try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="Nothing to check out."
          description="Your cart is empty — start with a signature from the demo menu."
          action={
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              Browse the menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-x grid gap-10 pb-24 lg:grid-cols-[1.45fr_0.9fr] lg:gap-14">
      <form onSubmit={placeDemoOrder}>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-[0.74rem] text-amber-100/80">
          <Badge tone="warm">Demo checkout</Badge>
          <p>
            This is a portfolio demonstration. No payment is processed and the order is saved in this
            browser only — nothing is written to Firebase.
          </p>
        </div>

        <section className="pt-7">
          <h2 className="font-display text-2xl text-cream">Where should we deliver?</h2>
          <p className="mt-1 text-[0.78rem] text-cream/40">
            Sample address details — use anything you like.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="demo-name">
              <Input
                id="demo-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ayesha Khan"
                autoComplete="name"
                required
              />
            </Field>
            <Field label="Phone" htmlFor="demo-phone">
              <Input
                id="demo-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+92 300 1234567"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </Field>
            <Field label="Email" htmlFor="demo-email" hint="Optional, for the demo receipt.">
              <Input
                id="demo-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field label="House / apartment" htmlFor="demo-house">
              <Input
                id="demo-house"
                value={house}
                onChange={(event) => setHouse(event.target.value)}
                placeholder="House 14-C"
                required
              />
            </Field>
            <Field label="Street" htmlFor="demo-street">
              <Input
                id="demo-street"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder="Khayaban-e-Shahbaz"
              />
            </Field>
            <Field label="Area" htmlFor="demo-area">
              <Input
                id="demo-area"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="DHA Phase VI"
                required
              />
            </Field>
            <Field label="City" htmlFor="demo-city">
              <Input
                id="demo-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Delivery instructions" htmlFor="demo-notes" hint="Optional.">
              <Textarea
                id="demo-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ring the bell twice, the gate sticks."
                maxLength={300}
                className="min-h-20"
              />
            </Field>
          </div>
        </section>

        <section className="mt-8 border-t border-cream/10 pt-7">
          <h2 className="font-display text-2xl text-cream">Payment</h2>
          <div className="mt-4 flex items-start gap-4 rounded-2xl border border-ember/55 bg-ember/[0.07] p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream/8 text-cream/70">
              <Banknote className="size-5" />
            </span>
            <span>
              <span className="flex items-center gap-2 text-[0.88rem] text-cream/85">
                Cash on delivery <Check className="size-3.5 text-ember-3" />
              </span>
              <span className="mt-1 block text-[0.76rem] leading-relaxed text-cream/45">
                Simulated only — no money changes hands. The demo order is marked “unpaid”.
              </span>
            </span>
          </div>

          <div className="mt-3 flex items-start gap-4 rounded-2xl border border-cream/10 bg-cream/[0.015] p-5 opacity-70">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream/5 text-cream/40">
              <CreditCard className="size-5" />
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-2 text-[0.88rem] text-cream/70">
                Card / wallet <Badge tone="neutral">Not connected</Badge>
              </span>
              <span className="mt-1 block text-[0.76rem] leading-relaxed text-cream/40">
                No payment provider is connected to this demonstration, so no card is ever charged.
              </span>
            </span>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-6">
          <p className="flex items-center gap-2 text-[0.7rem] text-cream/30">
            <MapPin className="size-3.5" /> Saved to this browser · not sent to Firebase
          </p>
          <Button type="submit" size="md" loading={placing} disabled={belowMinimum}>
            Place demo order · {money(total)}
          </Button>
        </div>
        {belowMinimum ? (
          <p className="mt-3 text-right text-[0.72rem] text-saffron/80">
            Minimum demo order is {money(settings.minOrder)}.
          </p>
        ) : null}
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummaryCard
          subtotal={subtotal}
          discount={discount}
          delivery={deliveryFee}
          total={total}
          couponCode={coupon?.code ?? null}
        >
          <div className="mt-5 space-y-3">
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                placeholder="Demo coupon"
                aria-label="Demo coupon code"
                className="h-10 flex-1 rounded-full uppercase"
              />
              <Button type="button" variant="outline" size="sm" onClick={applyCoupon}>
                <Tag className="size-3.5" /> Apply
              </Button>
            </div>
            {coupon ? (
              <p className="flex items-center justify-between rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[0.7rem] text-emerald-200/80">
                <span>{coupon.code} applied</span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-emerald-200/50 hover:text-emerald-200"
                >
                  Remove
                </button>
              </p>
            ) : (
              <p className="text-[0.66rem] leading-relaxed text-cream/30">
                Try <span className="text-cream/55">UNTOUCH10</span>,{" "}
                <span className="text-cream/55">FIRE500</span> or{" "}
                <span className="text-cream/55">WELCOME15</span>.
              </p>
            )}
            <p className="flex items-center gap-1.5 text-[0.66rem] text-cream/30">
              <ShieldCheck className="size-3.5" /> Totals calculated locally for the demo
            </p>
            <p className="text-[0.66rem] text-cream/25">
              Complimentary delivery above {money(FREE_DELIVERY_ABOVE)}.
            </p>
          </div>
        </CartSummaryCard>
      </div>
    </div>
  );
}
