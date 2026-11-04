"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Flame,
  MessageSquarePlus,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/menu/product-card";
import { Badge, Button, Divider, EmptyState, Input, Skeleton, StarRating, Textarea } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/quantity";
import { useAuth } from "@/lib/auth-context";
import { submitReview } from "@/lib/data/user";
import { useDemoMode } from "@/lib/demo/mode";
import { useDemoStore } from "@/lib/demo/store";
import { useProducts, useReviews } from "@/lib/hooks";
import { unitPrice } from "@/lib/pricing";
import type { Addon, Product, Variant } from "@/lib/types";
import { useAddToCart } from "@/lib/use-add-to-cart";
import {
  cdnImage,
  cn,
  discountedPrice,
  money,
  percentOff,
  relativeTime,
  truncate,
} from "@/lib/utils";

export function ProductDetail({ slug }: { slug: string }) {
  const { data: allProducts, loading: catalogLoading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (catalogLoading) {
      setLoading(true);
      return;
    }
    // The shared catalogue already resolves live Firebase data or the demo menu.
    const resolved = allProducts.find((item) => item.slug === slug) ?? null;
    setProduct(resolved);
    setVariant(resolved?.variants[0] ?? null);
    setAddons([]);
    setQuantity(1);
    setActiveImage(0);
    setLoading(false);
  }, [slug, allProducts, catalogLoading]);

  const unit = product ? unitPrice(product, variant, addons) : 0;
  const base = product ? discountedPrice(product.price, product.discountPrice) : 0;
  const discount = product ? percentOff(product.price, product.discountPrice) : 0;
  const related = useMemo(
    () =>
      product
        ? allProducts
            .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
            .slice(0, 4)
        : [],
    [allProducts, product],
  );

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="container-x py-28">
        <EmptyState
          title="This dish has left the pass."
          description="It may be sold out or no longer on the menu. The rest of the kitchen is still open."
          action={
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
            >
              <ArrowLeft className="size-3.5" /> Back to menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="container-x pb-6 pt-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-cream/40 transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-3.5" /> The menu
          <span className="text-cream/20">/</span>
          <span className="text-cream/60">{product.categoryName || "Dish"}</span>
        </Link>
      </div>

      <section className="container-x grid gap-12 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-ink-3 sm:aspect-[5/5]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {product.images[activeImage] ? (
                  <Image
                    src={cdnImage(product.images[activeImage], 1200)}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {product.badge ? <Badge tone="warm">{product.badge}</Badge> : null}
              {discount > 0 ? <Badge tone="light">−{discount}% today</Badge> : null}
            </div>
          </div>

          {product.images.length > 1 ? (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                    activeImage === index
                      ? "border-ember/70 opacity-100"
                      : "border-cream/10 opacity-60 hover:opacity-100",
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image src={cdnImage(image, 200)} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Purchase panel */}
        <div className="lg:py-4">
          <p className="eyebrow text-ember-3">{product.categoryName}</p>
          <h1 className="text-editorial mt-4 text-[clamp(2.4rem,4.8vw,3.8rem)] text-cream">
            {product.name}
          </h1>
          {product.tagline ? (
            <p className="mt-3 font-display text-xl italic text-cream/45">{product.tagline}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            {product.rating > 0 ? (
              <span className="flex items-center gap-2">
                <StarRating value={product.rating} size={13} />
                <span className="text-[0.72rem] text-cream/40">
                  {product.rating.toFixed(1)} · {product.reviewCount} reviews
                </span>
              </span>
            ) : null}
            <span className="flex items-center gap-1.5 text-[0.72rem] text-cream/40">
              <Clock className="size-3.5" /> {product.prepTime} min prep
            </span>
            <span className="flex items-center gap-1.5 text-[0.72rem] text-cream/40">
              <Flame className="size-3.5" /> {product.soldCount}+ served
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl tabular-nums text-cream">{money(unit)}</span>
            {discount > 0 ? (
              <span className="pb-1 text-sm text-cream/30 line-through tabular-nums">
                {money(product.price + (variant?.priceDelta ?? 0) + addons.reduce((s, a) => s + a.price, 0))}
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-[0.92rem] leading-relaxed text-cream/50">{product.description}</p>

          {product.variants.length > 0 ? (
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow text-cream/40">Choose a size</p>
                <span className="text-[0.66rem] text-cream/25">Required</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((option) => {
                  const active = variant?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVariant(option)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2.5 text-[0.78rem] transition-all duration-300",
                        active
                          ? "border-ember/60 bg-ember/12 text-cream"
                          : "border-cream/14 text-cream/55 hover:border-cream/30",
                      )}
                      aria-pressed={active}
                    >
                      {active ? <Check className="size-3.5 text-ember-3" /> : null}
                      {option.name}
                      {option.priceDelta !== 0 ? (
                        <span className="text-cream/35">
                          {option.priceDelta > 0 ? "+" : "−"}
                          {money(Math.abs(option.priceDelta))}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.addons.length > 0 ? (
            <div className="mt-8">
              <p className="eyebrow text-cream/40">Make it yours</p>
              <div className="mt-3 divide-y divide-cream/8 rounded-xl border border-cream/10">
                {product.addons.map((addon) => {
                  const checked = addons.some((item) => item.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/[0.03]"
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded border transition-colors",
                          checked ? "border-ember bg-ember text-cream" : "border-cream/25",
                        )}
                      >
                        {checked ? <Check className="size-3" /> : null}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          setAddons((current) =>
                            checked
                              ? current.filter((item) => item.id !== addon.id)
                              : [...current, addon],
                          )
                        }
                      />
                      <span className="flex-1 text-[0.85rem] text-cream/70">{addon.name}</span>
                      <span className="text-[0.8rem] tabular-nums text-cream/45">
                        +{money(addon.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.ingredients.length > 0 ? (
            <div className="mt-8">
              <p className="eyebrow text-cream/40">What's inside</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full border border-cream/10 px-3 py-1 text-[0.7rem] text-cream/45"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              className="self-start sm:self-auto"
            />
            <AddToCartButton
              product={product}
              quantity={quantity}
              variant={variant}
              addons={addons}
              unit={unit}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-cream/10 pt-5 text-[0.72rem] text-cream/40">
            <span className="flex items-center gap-2">
              <ChefHat className="size-4 text-ember-3/70" /> Made to order
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-ember-3/70" /> 35–45 min delivery
            </span>
            {product.calories ? (
              <span className="flex items-center gap-2">
                <Flame className="size-4 text-ember-3/70" /> {product.calories} kcal
              </span>
            ) : null}
            <span className="flex items-center gap-2">
              <Star className="size-4 text-ember-3/70" /> Chef's selection
            </span>
          </div>
        </div>
      </section>

      <ProductReviews product={product} />

      {related.length > 0 ? (
        <section className="container-x border-t border-cream/8 py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-ember-3">Same fire</p>
              <h2 className="mt-3 font-display text-3xl text-cream">You may also like</h2>
            </div>
            <Link
              href="/menu"
              className="text-[0.68rem] uppercase tracking-[0.16em] text-cream/40 hover:text-cream"
            >
              All dishes
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} layout="compact" />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function AddToCartButton({
  product,
  quantity,
  variant,
  addons,
  unit,
}: {
  product: Product;
  quantity: number;
  variant: Variant | null;
  addons: Addon[];
  unit: number;
}) {
  const addToCart = useAddToCart();
  return (
    <Button
      size="lg"
      className="flex-1"
      onClick={() => addToCart(product, quantity, variant, addons)}
    >
      Add to cart — {money(unit * quantity)}
      <Plus className="size-4" />
    </Button>
  );
}

function ProductReviews({ product }: { product: Product }) {
  const { data: reviews, loading } = useReviews();
  const { user, profile } = useAuth();
  const { demo } = useDemoMode();
  const addDemoReview = useDemoStore((state) => state.addReview);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const productReviews = reviews.filter((review) => review.productId === product.id);
  const average =
    productReviews.length > 0
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      : product.rating;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user && !demo) {
      toast.error("Sign in to write a review.");
      return;
    }
    if (comment.trim().length < 8) {
      toast.error("Tell us a little more — at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (demo) {
        addDemoReview({
          productId: product.id,
          productName: product.name,
          userId: user?.uid ?? "demo_guest",
          userName: profile?.displayName || user?.displayName || "Demo guest",
          rating,
          comment: comment.trim(),
        });
        setComment("");
        toast.success("Demo review submitted — approve it in the admin panel.");
        return;
      }
      if (!user) return;
      await submitReview({
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: profile?.displayName || user.displayName || "Guest",
        rating,
        comment: comment.trim(),
      });
      setComment("");
      toast.success("Thank you — your review is with the maître d' for approval.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-cream/8 bg-ink-2 py-20">
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-ember-3">Guest notes</p>
          <h2 className="mt-4 font-display text-[2.2rem] leading-tight text-cream">
            {productReviews.length > 0 ? "What guests said" : "Be the first to write one"}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <StarRating value={average} size={16} />
            <span className="text-sm text-cream/45">
              {average.toFixed(1)} / 5 · {productReviews.length} approved
            </span>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-cream/10 p-5">
            <p className="eyebrow text-cream/35">
              {user ? "Your review" : demo ? "Leave a demo review" : "Sign in to review"}
            </p>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index + 1)}
                  aria-label={`${index + 1} star${index === 0 ? "" : "s"}`}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-5 transition-colors",
                      index < rating ? "fill-saffron text-saffron" : "text-cream/20",
                    )}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How was the plate? Be honest — we read every note."
              maxLength={500}
              className="min-h-24"
            />
            <Button type="submit" size="sm" loading={busy} disabled={!user && !demo}>
              <MessageSquarePlus className="size-3.5" /> Submit for approval
            </Button>
            {!user && !demo ? (
              <p className="text-[0.7rem] text-cream/35">
                Reviews are tied to a verified account and moderated before publishing.
              </p>
            ) : null}
            {demo ? (
              <p className="text-[0.7rem] text-cream/35">
                Demo mode: your review is stored in this browser and waits for approval in the
                demo dashboard.
              </p>
            ) : null}
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </>
          ) : productReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cream/12 p-8 text-center">
              <p className="font-display text-xl text-cream/70">No notes on this dish yet.</p>
              <p className="mt-2 text-sm text-cream/35">
                Approved reviews appear here — alongside the dish itself.
              </p>
            </div>
          ) : (
            productReviews.map((review) => (
              <figure
                key={review.id}
                className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cream/80">{review.userName}</p>
                    <p className="text-[0.64rem] uppercase tracking-[0.14em] text-cream/25">
                      {relativeTime(review.createdAt)}
                    </p>
                  </div>
                  <StarRating value={review.rating} size={12} />
                </div>
                <blockquote className="mt-4 text-[0.9rem] leading-relaxed text-cream/55">
                  {review.comment}
                </blockquote>
              </figure>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container-x grid gap-12 py-12 lg:grid-cols-2">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <div className="space-y-5 lg:py-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-56 rounded-full" />
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  );
}
