import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { EyebrowHero } from "@/components/layout/page-hero";
import { ProductCardSkeleton } from "@/components/menu/product-card";

export const metadata: Metadata = {
  title: "The menu",
  description:
    "Browse the full UNTOUCH menu — charcoal BBQ, wood-fired pizza, hand-pressed burgers, pasta, desserts and drinks. Ordered in a few taps, delivered untouched.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "The UNTOUCH menu",
    description: "Slow-fired signatures, wood-fired pizza and charcoal BBQ — delivered across Karachi.",
  },
};

export default function MenuPage() {
  return (
    <>
      <EyebrowHero
        eyebrow="Kitchen · open daily"
        title={
          <>
            The full
            <br />
            <span className="italic text-cream/45">menu.</span>
          </>
        }
        description="Everything is made to order. Prices in PKR, taxes included, delivery calculated at checkout."
        meta="Search · filter · sort"
      />
      <Suspense
        fallback={
          <div className="container-x grid grid-cols-2 gap-x-5 gap-y-10 py-10 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} layout="compact" />
            ))}
          </div>
        }
      >
        <MenuBrowser />
      </Suspense>
    </>
  );
}
