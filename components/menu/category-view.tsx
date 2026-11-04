"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/menu/product-card";
import { EmptyState } from "@/components/ui/primitives";
import { useCategories, useProducts } from "@/lib/hooks";
import { cdnImage } from "@/lib/utils";

export function CategoryView({ slug }: { slug: string }) {
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: products, loading: productsLoading } = useProducts();
  const category = categories.find((item) => item.slug === slug);
  const items = products.filter((product) => product.categoryId === category?.id);
  const loading = categoriesLoading || productsLoading;

  if (!loading && !category) {
    return (
      <div className="container-x py-24">
        <EmptyState
          title="Category not found."
          description="It may have been renamed or hidden by the kitchen."
          action={
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              <ArrowLeft className="size-3.5" /> All categories
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-cream/8">
        {category?.image ? (
          <div className="absolute inset-0">
            <Image
              src={cdnImage(category.image, 1800)}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          </div>
        ) : null}
        <div className="container-x relative py-16 md:py-24">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-cream/40 transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3.5" /> Categories
          </Link>
          <h1 className="text-editorial mt-6 text-[clamp(2.6rem,5.6vw,4.6rem)] text-cream">
            {category?.name ?? "…"}
          </h1>
          <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-cream/50">
            {category?.description || "Freshly prepared, delivered untouched."}
          </p>
          <p className="mt-6 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cream/30">
            {loading ? "Loading" : `${items.length} ${items.length === 1 ? "dish" : "dishes"}`}
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} layout="compact" />
              ))
            : items.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} layout="compact" />
              ))}
        </div>

        {!loading && items.length === 0 ? (
          <EmptyState
            title="Nothing plated here yet."
            description="This category is live but has no available dishes right now."
            action={
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
              >
                Browse everything <ArrowRight className="size-3.5" />
              </Link>
            }
          />
        ) : null}
      </section>
    </>
  );
}
