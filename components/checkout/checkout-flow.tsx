"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Check,
  ChevronLeft,
  CreditCard,
  Loader2,
  MapPin,
  Plus,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { AddressForm } from "@/components/account/address-form";
import { CartSummaryCard } from "@/components/cart/cart-drawer";
import { DemoCheckout } from "@/components/checkout/demo-checkout";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Badge, Button, EmptyState, Field, Input } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { postJson } from "@/lib/api";
import { subscribeAddresses } from "@/lib/data/user";
import { useDemoMode } from "@/lib/demo/mode";
import { useProducts } from "@/lib/hooks";
import type { Address, Order, Quote } from "@/lib/types";
import { cn, money } from "@/lib/utils";

const STEPS = ["Address", "Payment", "Review"];

export function CheckoutFlow() {
  const router = useRouter();
  const { demo } = useDemoMode();
  // Subscribing keeps the shared catalog-empty signal accurate on direct visits.
  useProducts();
  const { user, loading: authLoading, configured } = useAuth();
  const { lines, clear } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(
    () =>
      lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        variantId: line.variantId,
        addonIds: line.addons.map((addon) => addon.id),
      })),
    [lines],
  );

  useEffect(() => {
    if (!user) return;
    return subscribeAddresses(user.uid, (list) => {
      setAddresses(list);
      setAddressId((current) => current ?? list.find((item) => item.isDefault)?.id ?? list[0]?.id ?? null);
    });
  }, [user]);

  useEffect(() => {
    if (!user || items.length === 0) return;
    let active = true;
    setQuoting(true);
    postJson<{ quote: Quote }>("/api/quote", { items, couponCode: coupon })
      .then((payload) => {
        if (active) setQuote(payload.quote);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not price your order.");
      })
      .finally(() => active && setQuoting(false));
    return () => {
      active = false;
    };
  }, [user, items, coupon]);

  const selectedAddress = addresses.find((address) => address.id === addressId) ?? null;
  const totals = quote ?? {
    subtotal: lines.reduce(
      (sum, line) =>
        sum +
        (line.basePrice + line.variantDelta + line.addons.reduce((acc, a) => acc + a.price, 0)) *
          line.quantity,
      0,
    ),
    discount: 0,
    deliveryFee: 0,
    total: 0,
    coupon: null,
    issues: [],
    minOrder: 0,
    freeAbove: 0,
  };

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    try {
      const payload = await postJson<{ quote: Quote }>("/api/quote", {
        items,
        couponCode: couponInput.trim(),
      });
      setQuote(payload.quote);
      setCoupon(couponInput.trim().toUpperCase());
      toast.success(`Coupon applied — ${money(payload.quote.discount)} off`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That coupon could not be applied.");
    }
  }

  async function placeOrder() {
    if (!addressId) {
      toast.error("Choose a delivery address first.");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const payload = await postJson<{ order: Order }>("/api/orders", {
        items,
        addressId,
        paymentMethod,
        notes,
        couponCode: coupon,
      });
      clear();
      toast.success("Order placed — the kitchen has it.");
      router.push(`/order/${payload.order.orderNumber}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not place your order.";
      setError(message);
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  }

  if (demo) return <DemoCheckout />;

  if (authLoading) {
    return (
      <div className="container-x flex items-center justify-center py-28">
        <Loader2 className="size-6 animate-spin text-cream/40" />
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

  if (!user) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="Sign in to check out."
          description="Your cart is preserved. Sign in to select an address and place the order."
          action={
            <Link
              href={`/login?next=${encodeURIComponent("/checkout")}`}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              Sign in <ChevronLeft className="size-3.5 rotate-180" />
            </Link>
          }
        />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="Nothing to check out."
          description="Your cart is empty — start with a signature."
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
      <div>
        <ol className="flex items-center gap-2 border-b border-cream/10 pb-6">
          {STEPS.map((label, index) => {
            const state = index === step ? "current" : index < step ? "done" : "upcoming";
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => index <= step && setStep(index)}
                  disabled={index > step}
                  className={cn(
                    "flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                    state === "current" && "text-cream",
                    state === "done" && "text-ember-3",
                    state === "upcoming" && "text-cream/25",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border font-mono text-[0.6rem]",
                      state === "current" && "border-ember bg-ember/20 text-cream",
                      state === "done" && "border-ember/40 bg-ember/10 text-ember-3",
                      state === "upcoming" && "border-cream/15",
                    )}
                  >
                    {state === "done" ? <Check className="size-3" /> : index + 1}
                  </span>
                  {label}
                </button>
                {index < STEPS.length - 1 ? <span className="h-px flex-1 bg-cream/10" /> : null}
              </li>
            );
          })}
        </ol>

        {step === 0 ? (
          <section className="pt-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-cream">Where should we deliver?</h2>
              <Button variant="ghost" size="sm" onClick={() => setAddressOpen(true)}>
                <Plus className="size-3.5" /> Add address
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-cream/15 p-8 text-center">
                  <MapPin className="mx-auto size-5 text-cream/30" />
                  <p className="mt-3 text-sm text-cream/55">No saved addresses yet.</p>
                  <Button size="sm" className="mt-4" onClick={() => setAddressOpen(true)}>
                    Add your first address
                  </Button>
                </div>
              ) : (
                addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setAddressId(address.id)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300",
                      addressId === address.id
                        ? "border-ember/55 bg-ember/[0.07]"
                        : "border-cream/12 hover:border-cream/25",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        addressId === address.id ? "border-ember bg-ember text-cream" : "border-cream/25",
                      )}
                    >
                      {addressId === address.id ? <Check className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.82rem] text-cream/85">{address.label}</span>
                        {address.isDefault ? <Badge tone="warm">Default</Badge> : null}
                      </span>
                      <span className="mt-1 block text-[0.78rem] leading-relaxed text-cream/45">
                        {address.fullName} · {address.phone}
                        <br />
                        {[address.house, address.street, address.area, address.city]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                      {address.instructions ? (
                        <span className="mt-1 block text-[0.7rem] text-cream/30">
                          “{address.instructions}”
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                size="sm"
                disabled={!addressId}
                onClick={() => setStep(1)}
              >
                Continue to payment
              </Button>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="pt-7">
            <h2 className="font-display text-2xl text-cream">How would you like to pay?</h2>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={cn(
                  "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all",
                  paymentMethod === "cod"
                    ? "border-ember/55 bg-ember/[0.07]"
                    : "border-cream/12 hover:border-cream/25",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream/8 text-cream/70">
                  <Banknote className="size-5" />
                </span>
                <span>
                  <span className="flex items-center gap-2 text-[0.88rem] text-cream/85">
                    Cash on delivery
                    {paymentMethod === "cod" ? <Check className="size-3.5 text-ember-3" /> : null}
                  </span>
                  <span className="mt-1 block text-[0.76rem] leading-relaxed text-cream/40">
                    Pay the rider when your order arrives. Payment is marked unpaid until then.
                  </span>
                </span>
              </button>

              <div className="flex w-full items-start gap-4 rounded-2xl border border-cream/10 bg-cream/[0.015] p-5 opacity-70">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream/5 text-cream/40">
                  <CreditCard className="size-5" />
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-2 text-[0.88rem] text-cream/70">
                    Card / wallet
                    <Badge tone="neutral">Not connected</Badge>
                  </span>
                  <span className="mt-1 block text-[0.76rem] leading-relaxed text-cream/40">
                    JazzCash, Easypaisa and card payments can be enabled by connecting a Pakistani
                    payment provider. Until then, online payment is intentionally unavailable and no
                    order is ever marked paid without a verified provider callback.
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Field
                label="Delivery instructions"
                htmlFor="checkout-notes"
                hint="Optional — landmarks, gate codes, or a note for the kitchen."
              >
                <Input
                  id="checkout-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Leave at the reception desk…"
                  maxLength={300}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                <ChevronLeft className="size-3.5" /> Back
              </Button>
              <Button size="sm" onClick={() => setStep(2)}>
                Review order
              </Button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="pt-7">
            <h2 className="font-display text-2xl text-cream">Review & place</h2>

            <div className="mt-5 rounded-2xl border border-cream/10">
              <div className="border-b border-cream/8 p-5">
                <p className="eyebrow text-cream/35">Delivering to</p>
                <p className="mt-2 text-[0.86rem] text-cream/75">
                  {selectedAddress?.fullName} · {selectedAddress?.phone}
                </p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-cream/40">
                  {selectedAddress
                    ? [selectedAddress.house, selectedAddress.street, selectedAddress.area, selectedAddress.city]
                        .filter(Boolean)
                        .join(", ")
                    : "No address selected"}
                </p>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="mt-2 text-[0.66rem] uppercase tracking-[0.14em] text-ember-3/80 hover:text-ember-3"
                >
                  Change
                </button>
              </div>
              <div className="border-b border-cream/8 p-5">
                <p className="eyebrow text-cream/35">Payment</p>
                <p className="mt-2 text-[0.86rem] text-cream/75">
                  {paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}
                </p>
              </div>
              <ul className="divide-y divide-cream/8">
                {lines.map((line) => {
                  const unit =
                    line.basePrice +
                    line.variantDelta +
                    line.addons.reduce((acc, addon) => acc + addon.price, 0);
                  return (
                    <li key={line.key} className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <p className="text-[0.82rem] text-cream/80">
                          {line.quantity} × {line.name}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] text-cream/35">
                          {[line.variantName, ...line.addons.map((addon) => addon.name)]
                            .filter(Boolean)
                            .join(" · ") || "As served"}
                        </p>
                      </div>
                      <p className="text-[0.82rem] tabular-nums text-cream/70">
                        {money(unit * line.quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {notes ? (
              <p className="mt-4 rounded-xl border border-cream/8 bg-cream/[0.02] p-4 text-[0.76rem] text-cream/45">
                <span className="eyebrow mr-2 text-cream/30">Note</span>
                {notes}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-[0.78rem] text-red-200">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ChevronLeft className="size-3.5" /> Back
              </Button>
              <Button size="md" loading={placing} onClick={placeOrder}>
                Place order · {money(totals.total)}
              </Button>
            </div>
            <p className="mt-3 text-right text-[0.66rem] text-cream/25">
              Prices and availability are verified on our servers before acceptance.
            </p>
          </section>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummaryCard
          subtotal={totals.subtotal}
          discount={totals.discount}
          delivery={totals.deliveryFee}
          total={totals.total}
          couponCode={coupon}
        >
          <div className="mt-5 space-y-3">
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-10 flex-1 rounded-full uppercase"
              />
              <Button variant="outline" size="sm" onClick={applyCoupon} disabled={quoting}>
                <Tag className="size-3.5" /> Apply
              </Button>
            </div>
            {quoting ? <p className="text-[0.66rem] text-cream/30">Re-pricing…</p> : null}
            {totals.issues.length ? (
              <ul className="space-y-1 rounded-lg border border-saffron/25 bg-saffron/5 p-3 text-[0.7rem] text-saffron/90">
                {totals.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </CartSummaryCard>
      </div>

      <AddressForm
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSaved={(id) => setAddressId(id)}
      />
    </div>
  );
}
