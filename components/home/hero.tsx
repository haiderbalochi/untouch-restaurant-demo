"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowRight, Clock, Star, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/primitives";
import { TextReveal } from "@/components/ui/motion";
import { IMAGERY, PLATES } from "@/lib/imagery";
import { FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import type { Product, RestaurantSettings } from "@/lib/types";
import { cdnImage, money, discountedPrice, isOpenNow } from "@/lib/utils";

export function Hero({
  settings,
  signature,
}: {
  settings: RestaurantSettings;
  signature: Product | null;
}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springX = useSpring(px, { stiffness: 40, damping: 18 });
  const springY = useSpring(py, { stiffness: 40, damping: 18 });
  const slowX = useTransform(springX, [-0.5, 0.5], [-22, 22]);
  const slowY = useTransform(springY, [-0.5, 0.5], [-16, 16]);
  const fastX = useTransform(springX, [-0.5, 0.5], [16, -16]);
  const fastY = useTransform(springY, [-0.5, 0.5], [12, -12]);

  const open = settings.isOpen && isOpenNow(settings.openTime, settings.closeTime, true);
  const price = signature ? discountedPrice(signature.price, signature.discountPrice) : 0;

  return (
    <section
      className="grain relative isolate overflow-hidden bg-ink"
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        px.set((event.clientX - rect.left) / rect.width - 0.5);
        py.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
    >
      {/* Full-bleed cinematic plate */}
      <motion.div
        className="absolute inset-0 z-0"
        style={reduce ? undefined : { x: slowX, y: slowY }}
      >
        <motion.div
          initial={reduce ? false : { scale: 1.14, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={IMAGERY.hero}
            alt="Charcoal-grilled short rib plated at the UNTOUCH pass"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_42%]"
          />
        </motion.div>
      </motion.div>

      {/* Lighting + legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-ink via-ink/88 to-ink/25 lg:via-ink/55 lg:to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ink via-ink/10 to-ink/75" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_18%_38%,rgba(196,85,31,0.22),transparent_58%)]" />

      {/* Oversized ghost word */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 top-16 z-[1] hidden select-none font-display text-[15rem] leading-[0.8] tracking-[-0.06em] text-cream/[0.045] xl:block"
      >
        UNTOUCH
      </span>

      <div className="container-x relative z-10 flex min-h-[calc(100svh-104px)] flex-col justify-end pb-12 pt-24 md:pb-16 lg:pt-28">
        <div className="grid items-end gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* Type block */}
          <div className="max-w-2xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span className="eyebrow flex items-center gap-2 text-ember-3">
                <span className="inline-block size-1.5 animate-[blink_2.4s_ease-in-out_infinite] rounded-full bg-ember-2" />
                {settings.content.heroKicker}
              </span>
              <span className="hidden h-3 w-px bg-cream/20 sm:block" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-cream/35">
                Est. 2016 · Charcoal only
              </span>
            </motion.div>

            <TextReveal
              as="h1"
              text={settings.content.heroTitle}
              delay={0.08}
              className="text-editorial mt-5 max-w-[19ch] text-[clamp(2.6rem,5.4vw,4.5rem)] leading-[0.92] text-cream drop-shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
            />

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-cream/60"
            >
              {settings.content.heroSubtitle}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <ButtonLink href="/menu" size="lg" className="min-w-[10.5rem]">
                Explore the menu
                <ArrowRight className="size-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
              </ButtonLink>
              <Link
                href="/menu?sort=popular"
                className="group inline-flex h-14 items-center gap-3 rounded-full border border-cream/25 px-7 text-[0.76rem] uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm transition-all duration-500 hover:border-cream/50 hover:bg-cream/8 hover:text-cream"
              >
                Order now
                <span className="grid size-6 place-items-center rounded-full bg-cream/10 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowDownRight className="size-3" />
                </span>
              </Link>
            </motion.div>

            <motion.dl
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.8 }}
              className="mt-9 grid max-w-lg grid-cols-3 gap-5 border-t border-cream/12 pt-6"
            >
              {[
                {
                  icon: Clock,
                  label: "Kitchen",
                  value: open ? `Open · till ${settings.closeTime}` : "Closed · pre-order",
                },
                { icon: Truck, label: "Delivery", value: "35–45 min" },
                { icon: Star, label: "Free delivery", value: `Above ${money(FREE_DELIVERY_ABOVE)}` },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-cream/35">
                    <stat.icon className="size-3" /> {stat.label}
                  </dt>
                  <dd className="mt-1.5 text-[0.8rem] text-cream/75">{stat.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Layered plates */}
          <div className="relative hidden lg:block">
            <motion.div
              style={reduce ? undefined : { x: fastX, y: fastY }}
              className="ml-auto w-full max-w-[23rem]"
            >
              {signature ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 36, rotate: 2.5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/menu/${signature.slug}`}
                    className="group block overflow-hidden rounded-[1.5rem] border border-cream/18 bg-ink/40 p-3 backdrop-blur-2xl transition-colors duration-500 hover:border-cream/35"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem]">
                      <Image
                        src={cdnImage(signature.images[0] ?? IMAGERY.fallbackDish, 720)}
                        alt={signature.name}
                        fill
                        sizes="360px"
                        className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-cream/85 backdrop-blur">
                        Most requested
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-4">
                      <div className="min-w-0">
                        <p className="eyebrow text-cream/30">Signature</p>
                        <p className="mt-1.5 truncate font-display text-lg leading-tight text-cream">
                          {signature.name}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-lg tabular-nums text-cream">{money(price)}</p>
                        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-cream/35">
                          {signature.prepTime} min
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : null}

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.55 }}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-cream/12 bg-ink/45 p-2.5 backdrop-blur-xl"
              >
                <div className="flex -space-x-4">
                  {PLATES.map((plate) => (
                    <span
                      key={plate.src}
                      className="relative size-12 overflow-hidden rounded-full border-2 border-ink/80 transition-transform duration-500 hover:z-10 hover:-translate-y-1"
                    >
                      <Image src={plate.src} alt={plate.label} fill sizes="48px" className="object-cover" />
                    </span>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="eyebrow text-cream/35">From the pass</p>
                  <p className="mt-1 truncate text-[0.76rem] text-cream/70">
                    Four plates, one fire
                  </p>
                </div>
                <ArrowDownRight className="ml-auto size-4 shrink-0 animate-[float_5s_ease-in-out_infinite] text-cream/30" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
