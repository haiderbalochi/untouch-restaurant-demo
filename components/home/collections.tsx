"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/menu/product-card";
import { ButtonLink, SectionHeading } from "@/components/ui/primitives";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import type { Banner, Category, Product } from "@/lib/types";
import { cdnImage, discountedPrice, money, percentOff, sortCategories } from "@/lib/utils";

export function FeaturedSignatures({
  products,
  loading,
}: {
  products: Product[];
  loading?: boolean;
}) {
  if (!loading && products.length === 0) return null;
  const [first, ...rest] = products;

  return (
    <section className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="The signatures"
          title={
            <>
              Dishes people
              <br />
              <span className="italic text-cream/45">travel for.</span>
            </>
          }
          description="Six plates define this kitchen. Each one is built by hand, to order, and never held under a lamp."
          action={
            <ButtonLink href="/menu" variant="outline" size="sm">
              Full menu <ArrowUpRight className="size-3.5" />
            </ButtonLink>
          }
        />

        <div className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-12">
          {loading ? (
            <>
              <div className="md:col-span-7">
                <ProductCardSkeleton layout="tall" />
              </div>
              <div className="grid gap-8 md:col-span-5">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            </>
          ) : (
            <>
              {first ? (
                <div className="md:col-span-7">
                  <ProductCard product={first} layout="tall" priority index={0} />
                </div>
              ) : null}
              <div className="grid gap-8 md:col-span-5">
                {rest.slice(0, 2).map((product, index) => (
                  <ProductCard key={product.id} product={product} layout="compact" index={index + 1} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function CategoryIndex({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [active, setActive] = useState(0);
  const sorted = sortCategories(categories);
  if (!sorted.length) return null;
  const preview = sorted[Math.min(active, sorted.length - 1)];

  return (
    <section className="relative overflow-hidden border-y border-cream/8 bg-ink-2 py-24 md:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="By category"
              title={
                <>
                  Find your
                  <br />
                  <span className="italic text-cream/45">appetite.</span>
                </>
              }
              className="mb-10"
            />

            <ul className="border-t border-cream/10">
              {sorted.map((category, index) => {
                const count = products.filter((product) => product.categoryId === category.id).length;
                return (
                  <li key={category.id} className="border-b border-cream/10">
                    <Link
                      href={`/categories/${category.slug}`}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className="group flex items-center gap-4 py-5 transition-colors"
                    >
                      <span className="w-7 font-mono text-[0.6rem] text-cream/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[1.6rem] leading-tight text-cream/70 transition-colors duration-300 group-hover:text-cream">
                          {category.name}
                        </span>
                        <span className="mt-1 block truncate text-[0.76rem] text-cream/30">
                          {category.description || `${count} dishes`}
                        </span>
                      </span>
                      <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cream/25 sm:block">
                        {count} {count === 1 ? "dish" : "dishes"}
                      </span>
                      <span className="grid size-9 place-items-center rounded-full border border-cream/12 text-cream/40 transition-all duration-500 group-hover:border-ember/40 group-hover:text-ember-3">
                        <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative hidden lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-ink-3">
                {preview.image ? (
                  <Image
                    key={preview.id}
                    src={cdnImage(preview.image, 900)}
                    alt={preview.name}
                    fill
                    sizes="40vw"
                    className="animate-[fadeIn_0.7s_ease] object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <div className="absolute inset-x-6 bottom-6">
                  <p className="eyebrow text-ember-3">Selected</p>
                  <p className="mt-2 font-display text-3xl text-cream">{preview.name}</p>
                  <Link
                    href={`/categories/${preview.slug}`}
                    className="mt-4 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em] text-cream/60 transition-colors hover:text-cream"
                  >
                    Explore category <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SpecialsRail({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="relative py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Today only"
          title={
            <>
              Cut price.
              <br />
              <span className="italic text-cream/45">Not corners.</span>
            </>
          }
          action={
            <ButtonLink href="/menu?filter=specials" variant="ghost" size="sm">
              All specials <ArrowRight className="size-3.5" />
            </ButtonLink>
          }
        />
      </div>

      <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-10 xl:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product, index) => {
          const discount = percentOff(product.price, product.discountPrice);
          return (
            <div key={product.id} className="w-[74vw] shrink-0 snap-start sm:w-[46vw] lg:w-[24rem]">
              <div className="group relative overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.025] transition-colors hover:border-cream/20">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={cdnImage(product.images[0] ?? "", 800)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 74vw, 24rem"
                    className="object-cover transition-transform duration-[1.1s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  {discount > 0 ? (
                    <span className="absolute right-3 top-3 rounded-full bg-ember px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-cream">
                      Save {discount}%
                    </span>
                  ) : null}
                  <span className="absolute bottom-3 left-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-cream/60">
                    {String(index + 1).padStart(2, "0")} — {product.categoryName}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[1.2rem] text-cream/90">
                      <Link href={`/menu/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="mt-1 line-clamp-1 text-[0.76rem] text-cream/35">
                      {product.tagline || product.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-[1.05rem] text-cream tabular-nums">
                      {money(discountedPrice(product.price, product.discountPrice))}
                    </p>
                    {discount > 0 ? (
                      <p className="text-[0.68rem] text-cream/30 line-through tabular-nums">
                        {money(product.price)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PopularGrid({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="relative py-16 md:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Crowd favourites"
          title={
            <>
              Ordered again
              <br />
              <span className="italic text-cream/45">and again.</span>
            </>
          }
          action={
            <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cream/30">
              <Sparkles className="size-3.5 text-ember-3/70" /> Live popularity
            </span>
          }
        />
        <StaggerGroup className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={index} layout="compact" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

export function PromoBanner({ banner }: { banner: Banner }) {
  return (
    <section className="relative py-6">
      <div className="container-x">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-cream/10">
            <div className="absolute inset-0">
              <Image
                src={cdnImage(banner.image, 1800)}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/70 to-ink/20" />
            </div>
            <div className="relative max-w-xl px-7 py-16 sm:px-12 md:py-24">
              <p className="eyebrow text-ember-3">Limited release</p>
              <h2 className="text-editorial mt-4 text-[clamp(2rem,4vw,3.2rem)] text-cream">
                {banner.title}
              </h2>
              <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-cream/55">
                {banner.subtitle}
              </p>
              <ButtonLink href={banner.ctaHref} size="sm" className="mt-8">
                {banner.ctaLabel} <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
