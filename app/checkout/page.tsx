import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { EyebrowHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for your UNTOUCH order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <EyebrowHero
        eyebrow="Three quiet steps"
        title="Checkout"
        description="Address, payment, review. Your order summary is confirmed before you place it."
        meta="Prices in PKR"
      />
      <div className="pt-10">
        <CheckoutFlow />
      </div>
    </>
  );
}
