"use client";

import { useBanners, useCategories, useProducts, useReviews, useSettings } from "@/lib/hooks";
import { Hero } from "@/components/home/hero";
import {
  CategoryIndex,
  FeaturedSignatures,
  PopularGrid,
  PromoBanner,
  SpecialsRail,
} from "@/components/home/collections";
import {
  AtmosphereGallery,
  CinematicBand,
  CtaBand,
  ManifestoMarquee,
  NewsletterSection,
  ReviewsSection,
  StorySection,
  WhyUntouch,
} from "@/components/home/sections";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { DEFAULT_SETTINGS } from "@/lib/data/catalog";

export function HomeView() {
  const { data: settings } = useSettings();
  const { data: products, loading, preview } = useProducts();
  const { data: categories } = useCategories();
  const { data: banners } = useBanners();
  const { data: reviews } = useReviews();

  const featured = products.filter((product) => product.featured).slice(0, 3);
  const specials = products
    .filter((product) => product.discountPrice && product.discountPrice < product.price)
    .slice(0, 8);
  const popular = [...products]
    .sort((a, b) => b.soldCount - a.soldCount || b.rating - a.rating)
    .slice(0, 8);
  const homeBanner = banners.find((banner) => banner.placement === "home" && banner.active) ?? null;
  const signature = featured[0] ?? popular[0] ?? products[0] ?? null;
  const resolvedSettings = settings ?? DEFAULT_SETTINGS;

  return (
    <>
      <Hero settings={resolvedSettings} signature={signature} />
      <ManifestoMarquee />

      {preview ? (
        <p className="border-b border-cream/8 bg-ink-2/60 py-2.5 text-center font-mono text-[0.58rem] uppercase tracking-[0.2em] text-cream/30">
          Demo showcase · sample menu, simulated checkout and tracking
        </p>
      ) : null}

      <FeaturedSignatures products={featured} loading={loading} />
      <CategoryIndex categories={categories} products={products} />
      <CinematicBand />
      <SpecialsRail products={specials} />
      {homeBanner ? <PromoBanner banner={homeBanner} /> : null}
      <StorySection
        title={resolvedSettings.content.storyTitle}
        body={resolvedSettings.content.storyBody}
      />
      <PopularGrid products={popular} />
      <WhyUntouch />
      <ReviewsSection reviews={reviews} />
      <AtmosphereGallery />
      <InstallPrompt variant="card" />
      <NewsletterSection />
      <CtaBand />
    </>
  );
}
