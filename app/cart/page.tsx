import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { EyebrowHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your UNTOUCH order before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <EyebrowHero
        eyebrow="Almost there"
        title="Your cart"
        description="Adjust quantities, then head to checkout. Totals are confirmed before your order is placed."
        meta="Saved on this device"
      />
      <div className="pt-12">
        <CartView />
      </div>
    </>
  );
}
