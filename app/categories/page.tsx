import type { Metadata } from "next";
import { CategoriesView } from "@/components/menu/categories-view";
import { EyebrowHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore UNTOUCH by category — charcoal BBQ, burgers, wood-fired pizza, pasta, chicken, fries, drinks and desserts.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <>
      <EyebrowHero
        eyebrow="Browse by appetite"
        title={
          <>
            Categories
          </>
        }
        description="Ten corners of the kitchen. Pick a direction and we'll bring the fire."
        meta="Live categories"
      />
      <div className="pt-10">
        <CategoriesView />
      </div>
    </>
  );
}
