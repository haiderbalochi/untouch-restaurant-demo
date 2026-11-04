"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { CartSummaryCard } from "@/components/cart/cart-drawer";
import { Button, EmptyState } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/quantity";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { useDemoMode } from "@/lib/demo/mode";
import { useSettings } from "@/lib/hooks";
import { FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import { cdnImage, money } from "@/lib/utils";

export function CartView() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, setQuantity, removeLine, hydrated } = useCart();
  const { data: settings } = useSettings();
  const { demo } = useDemoMode();

  const subtotal = lines.reduce(
    (sum, line) =>
      sum +
      (line.basePrice + line.variantDelta + line.addons.reduce((acc, addon) => acc + addon.price, 0)) *
        line.quantity,
    0,
  );
  const delivery = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_ABOVE ? 0 : settings.deliveryFee;

  if (!hydrated) {
    return <div className="container-x py-24 text-center text-sm text-cream/40">Loading your cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="Your cart is empty."
          description="Build an order from the menu — everything is made to order."
          action={
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              <ArrowLeft className="size-3.5" /> Browse the menu
            </Link>
          }
        />
      </div>
    );
  }

  function goToCheckout() {
    if (!user && !demo) {
      toast.error("Sign in to checkout — your cart is saved.");
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }
    router.push("/checkout");
  }

  return (
    <div className="container-x grid gap-10 pb-24 lg:grid-cols-[1.5fr_0.9fr] lg:gap-14">
      <div>
        <div className="flex items-center justify-between border-b border-cream/10 pb-5">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cream/40">
            {lines.length} {lines.length === 1 ? "line" : "lines"} in your order
          </p>
          <Link
            href="/menu"
            className="text-[0.66rem] uppercase tracking-[0.16em] text-cream/40 transition-colors hover:text-cream"
          >
            Continue shopping
          </Link>
        </div>

        <ul className="divide-y divide-cream/8">
          {lines.map((line) => {
            const unit =
              line.basePrice + line.variantDelta + line.addons.reduce((acc, addon) => acc + addon.price, 0);
            return (
              <li key={line.key} className="flex gap-5 py-6">
                <Link
                  href={`/menu/${line.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-ink-3 sm:size-28"
                >
                  {line.image ? (
                    <Image
                      src={cdnImage(line.image, 300)}
                      alt={line.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/menu/${line.slug}`}
                        className="font-display text-[1.2rem] text-cream/90 hover:text-cream"
                      >
                        {line.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] text-cream/35">
                        {line.variantName ? <span>{line.variantName}</span> : null}
                        {line.addons.map((addon) => (
                          <span key={addon.id}>+ {addon.name}</span>
                        ))}
                      </div>
                      <p className="mt-1 text-[0.72rem] text-cream/30">{money(unit)} each</p>
                    </div>
                    <p className="shrink-0 font-display text-lg tabular-nums text-cream">
                      {money(unit * line.quantity)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(next) => setQuantity(line.key, next)}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        removeLine(line.key);
                        toast.success(`${line.name} removed`);
                      }}
                      className="inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-cream/30 transition-colors hover:text-red-300"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummaryCard
          subtotal={subtotal}
          discount={0}
          delivery={delivery}
          total={subtotal + delivery}
        >
          <div className="mt-6 space-y-3">
            <Button className="w-full" size="md" onClick={goToCheckout}>
              {demo ? "Proceed to demo checkout" : user ? "Proceed to checkout" : "Sign in to checkout"}{" "}
              <ArrowRight className="size-4" />
            </Button>
            <div className="flex items-start gap-2.5 rounded-xl border border-cream/8 bg-cream/[0.02] p-3 text-[0.7rem] leading-relaxed text-cream/40">
              <Truck className="mt-0.5 size-3.5 shrink-0 text-ember-3/70" />
              {subtotal >= FREE_DELIVERY_ABOVE
                ? "Complimentary delivery applied."
                : `Spend ${money(FREE_DELIVERY_ABOVE - subtotal)} more for complimentary delivery.`}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[0.66rem] text-cream/30">
              {demo ? (
                <>
                  <ShieldCheck className="size-3.5" /> Demo cart · no payment is processed
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" /> Totals are verified again on the server
                </>
              )}
            </p>
          </div>
        </CartSummaryCard>
      </div>
    </div>
  );
}
