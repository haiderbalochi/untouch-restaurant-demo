"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import { StarRating } from "@/components/ui/primitives";
import { useAddToCart } from "@/lib/use-add-to-cart";
import type { Product } from "@/lib/types";
import { cn, cdnImage, discountedPrice, money, percentOff, truncate } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
  layout = "default",
  priority = false,
}: {
  product: Product;
  index?: number;
  layout?: "default" | "tall" | "compact";
  priority?: boolean;
}) {
  const addToCart = useAddToCart();
  const reduce = useReducedMotion();
  const price = discountedPrice(product.price, product.discountPrice);
  const discount = percentOff(product.price, product.discountPrice);
  const hasChoices = product.variants.length > 0 || product.addons.length > 0;
  const image = product.images[0] ?? "";
  const hoverImage = product.images[1] ?? image;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <Link
        href={`/menu/${product.slug}`}
        className="relative block overflow-hidden rounded-[1.35rem] bg-ink-3"
        aria-label={`View ${product.name}`}
      >
        <div
          className={cn(
            "relative w-full",
            layout === "tall" ? "aspect-[3/4]" : layout === "compact" ? "aspect-square" : "aspect-[4/5]",
          )}
        >
          {image ? (
            <>
              <Image
                src={cdnImage(image, 720)}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
                className="object-cover transition-all duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055] group-hover:opacity-0"
              />
              <Image
                src={cdnImage(hoverImage, 720)}
                alt=""
                fill
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
                className="scale-105 object-cover opacity-0 transition-all duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
                aria-hidden
              />
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-3 to-ink-4 text-xs text-cream/25">
              No image
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent opacity-80" />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {product.badge ? (
                <span className="rounded-full bg-ink/65 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-cream/85 backdrop-blur-md">
                  {product.badge}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-full bg-ember px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-cream">
                  −{discount}%
                </span>
              ) : null}
            </div>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-2.5 py-1 text-[0.62rem] text-cream/70 backdrop-blur-md">
              <Clock className="size-3" /> {product.prepTime} min
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.preventDefault();
                if (hasChoices) return;
                addToCart(product, 1, null, []);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (!hasChoices) addToCart(product, 1, null, []);
                }
              }}
              aria-label={hasChoices ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
              className={cn(
                "grid size-10 translate-y-1.5 place-items-center rounded-full bg-cream text-ink opacity-0 shadow-lift transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 hover:bg-ember hover:text-cream focus-visible:translate-y-0 focus-visible:opacity-100",
                hasChoices && "bg-cream/90",
              )}
            >
              <Plus className="size-4" strokeWidth={2.2} />
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[1.15rem] leading-snug text-cream/92 transition-colors group-hover:text-cream">
            <Link href={`/menu/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 truncate text-[0.76rem] text-cream/40">
            {product.categoryName || product.tagline || truncate(product.description, 48)}
          </p>
          {product.rating > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={product.rating} size={11} />
              <span className="text-[0.66rem] text-cream/30">({product.reviewCount})</span>
            </div>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-[1.1rem] tabular-nums text-cream">{money(price)}</p>
          {discount > 0 ? (
            <p className="text-[0.7rem] tabular-nums text-cream/30 line-through">{money(product.price)}</p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton({ layout = "default" }: { layout?: "default" | "tall" | "compact" }) {
  return (
    <div className="animate-pulse">
      <div
        className={cn(
          "w-full rounded-[1.35rem] bg-cream/[0.05]",
          layout === "tall" ? "aspect-[3/4]" : layout === "compact" ? "aspect-square" : "aspect-[4/5]",
        )}
      />
      <div className="mt-4 flex justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-cream/[0.06]" />
          <div className="h-3 w-20 rounded bg-cream/[0.04]" />
        </div>
        <div className="h-4 w-14 rounded bg-cream/[0.06]" />
      </div>
    </div>
  );
}
