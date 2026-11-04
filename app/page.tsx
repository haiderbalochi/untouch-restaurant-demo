import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.name,
  servesCuisine: ["Pakistani", "Barbecue", "Italian", "American"],
  priceRange: "PKR 500 – 4,000",
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.city,
    addressCountry: "PK",
  },
  description: SITE.description,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  acceptsReservations: true,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeView />
    </>
  );
}
