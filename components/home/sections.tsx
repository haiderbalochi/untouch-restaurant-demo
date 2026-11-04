"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Flame, Leaf, Timer, Quote } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, ButtonLink, Input, SectionHeading, StarRating } from "@/components/ui/primitives";
import { Marquee, Parallax, Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { Seal } from "@/components/brand/logo";
import { subscribeToNewsletter } from "@/lib/data/newsletter";
import { ATMOSPHERE, IMAGERY } from "@/lib/imagery";
import type { Review } from "@/lib/types";
import { cdnImage, formatDate, initials } from "@/lib/utils";

export function ManifestoMarquee() {
  const words = ["Slow fire", "Hand rolled", "No shortcuts", "Charcoal only", "Ground daily", "Karachi"];
  return (
    <section className="relative z-[3] border-y border-ink/10 bg-cream py-5 text-ink">
      <Marquee
        speed={38}
        items={words.map((word) => (
          <span
            key={word}
            className="flex items-center gap-10 font-display text-[clamp(1.3rem,2.6vw,2.1rem)] italic tracking-tight text-ink/80"
          >
            {word}
          </span>
        ))}
      />
    </section>
  );
}

const pillars = [
  {
    icon: Flame,
    title: "Charcoal, never gas",
    body: "Every cut and every skewer meets live coal. It is slower, messier and infinitely better — so we never changed it.",
  },
  {
    icon: Timer,
    title: "Twenty-hour marinades",
    body: "Yoghurt, green chilli and raw papaya, worked by hand and left to rest overnight. Tenderness you can't rush.",
  },
  {
    icon: Leaf,
    title: "Milled this week",
    body: "Spice is ground in small batches each morning. The difference between a good dish and ours is measured in days, not grams.",
  },
  {
    icon: Check,
    title: "Plated to travel",
    body: "Packing is engineered per dish — vented for crunch, insulated for heat, sauced separately so nothing arrives tired.",
  },
];

export function WhyUntouch() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 size-[560px] rounded-full bg-ember/8 blur-[140px]"
      />
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Why UNTOUCH"
              title={
                <>
                  Obsession,
                  <br />
                  <span className="italic text-cream/45">not garnish.</span>
                </>
              }
              description="Four rules we wrote on the kitchen wall in 2016. They still decide everything that leaves the pass."
            />
            <ButtonLink href="/about" variant="outline" size="sm" className="mt-8">
              Read our story <ArrowUpRight className="size-3.5" />
            </ButtonLink>
          </div>

          <StaggerGroup className="divide-y divide-cream/10 border-y border-cream/10">
            {pillars.map((pillar, index) => (
              <StaggerItem key={pillar.title}>
                <div className="group flex gap-6 py-8 transition-colors duration-500 md:gap-10">
                  <span className="font-mono text-[0.62rem] text-cream/25">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <pillar.icon className="size-4 text-ember-3/80" />
                      <h3 className="font-display text-[1.45rem] leading-tight text-cream/95">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 max-w-lg text-[0.88rem] leading-relaxed text-cream/45">
                      {pillar.body}
                    </p>
                  </div>
                  <span className="hidden self-center text-cream/20 transition-all duration-500 group-hover:translate-x-1 group-hover:text-ember-3 md:block">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

export function StorySection({ title, body }: { title: string; body: string }) {
  return (
    <section className="relative overflow-hidden bg-cream-2 py-24 text-ink md:py-32">
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream-3">
              <Parallax distance={34} className="absolute inset-0">
                <div className="relative h-[112%] w-full">
                  <Image
                    src={cdnImage(IMAGERY.story, 1200)}
                    alt="Service at the UNTOUCH counter"
                    fill
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-cover"
                  />
                </div>
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-8 -right-4 flex items-center gap-4 rounded-2xl border border-clay/15 bg-cream-2/95 px-5 py-4 shadow-lift backdrop-blur-md sm:-right-8">
              <Seal className="size-12 text-clay/70" />
              <div>
                <p className="font-display text-2xl leading-none text-ink">10 yrs</p>
                <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink/45">
                  of slow fire
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <p className="eyebrow flex items-center gap-3 text-ember">
              <span className="inline-block h-px w-8 bg-current" /> The house
            </p>
            <h2 className="text-editorial mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)] text-ink">
              {title}
            </h2>
            <div className="mt-6 space-y-5 text-[0.95rem] leading-relaxed text-ink/60">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.8] first-letter:text-ember">
                {body}
              </p>
              <p>
                Six seats became a dining room, then a delivery kitchen built around the same
                tandoor. What travelled was never the food alone — it was the patience.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/about" variant="dark" size="sm">
                Full story
              </ButtonLink>
              <Link
                href="/menu"
                className="group inline-flex items-center gap-2 text-[0.74rem] uppercase tracking-[0.16em] text-ink/55 hover:text-ink"
              >
                Taste it <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const shown = reviews.slice(0, 3);
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section id="reviews" className="relative overflow-hidden py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Guest book"
          title={
            <>
              Said at the table,
              <br />
              <span className="italic text-cream/45">not in the brochure.</span>
            </>
          }
          action={
            <div className="flex items-center gap-4">
              <StarRating value={average} size={16} />
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cream/40">
                {average.toFixed(1)} · {reviews.length} reviews
              </span>
            </div>
          }
        />

        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {shown.map((review) => (
            <StaggerItem key={review.id} className="h-full">
              <figure className="flex h-full flex-col justify-between rounded-2xl border border-cream/10 bg-cream/[0.025] p-7 transition-colors duration-500 hover:border-cream/20">
                <div>
                  <Quote className="size-5 text-ember-3/60" />
                  <blockquote className="mt-5 font-display text-[1.15rem] leading-relaxed text-cream/80">
                    “{review.comment}”
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-cream/10 pt-5">
                  <span className="grid size-9 place-items-center rounded-full bg-ember/20 font-mono text-[0.62rem] text-ember-3">
                    {initials(review.userName)}
                  </span>
                  <div>
                    <p className="text-[0.82rem] text-cream/80">{review.userName}</p>
                    <p className="text-[0.66rem] text-cream/30">
                      {review.productName} · {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <StarRating value={review.rating} size={11} className="ml-auto" />
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      await subscribeToNewsletter(email);
      setStatus("done");
      setEmail("");
      toast.success("You're on the list. Watch your inbox.");
    } catch (error) {
      setStatus("idle");
      toast.error(error instanceof Error ? error.message : "Could not subscribe right now.");
    }
  }

  return (
    <section className="relative overflow-hidden border-y border-cream/8 bg-ink-2 py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/50 to-transparent"
      />
      <div className="container-x relative">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow text-ember-3">The Sunday letter</p>
            <h2 className="text-editorial mt-4 text-[clamp(2.2rem,4.6vw,3.8rem)] text-cream">
              Stay hungry.
              <br />
              <span className="italic text-cream/40">We'll do the writing.</span>
            </h2>
          </div>
          <div>
            <p className="text-[0.9rem] leading-relaxed text-cream/45">
              One note each Sunday: what's new at the pass, a recipe worth stealing, and first access
              to limited tables. No noise.
            </p>
            <form onSubmit={submit} className="mt-6 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1 rounded-full bg-cream/[0.04] px-5"
                required
              />
              <Button
                type="submit"
                size="md"
                loading={status === "loading"}
                className="shrink-0"
              >
                {status === "done" ? (
                  <>
                    <Check className="size-4" /> Subscribed
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
            <p className="mt-3 text-[0.66rem] text-cream/25">
              By subscribing you agree to occasional emails from UNTOUCH. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CinematicBand() {
  return (
    <section className="relative isolate overflow-hidden">
      <Parallax distance={70} className="absolute inset-0">
        <div className="relative h-[116%] w-full">
          <Image
            src={IMAGERY.fire}
            alt="Charcoal-grilled ribs resting at the pass"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </Parallax>
      <div className="absolute inset-0 bg-ink/62" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(196,85,31,0.24),transparent_60%)]" />

      <div className="container-x relative flex min-h-[74vh] flex-col justify-between py-16 md:py-20">
        <div className="flex items-center justify-between gap-6">
          <span className="eyebrow text-cream/45">Chapter 02</span>
          <span className="eyebrow hidden text-cream/35 sm:block">Charcoal · Smoke · Rest</span>
        </div>

        <div className="max-w-4xl py-16">
          <p className="eyebrow flex items-center gap-3 text-ember-3">
            <span className="inline-block h-px w-8 bg-current" /> The method
          </p>
          <h2 className="text-editorial mt-5 text-[clamp(2.4rem,7vw,5.6rem)] text-cream">
            We cook with <span className="italic text-cream/55">fire</span>,
            <br /> then we wait.
          </h2>
          <p className="mt-6 max-w-md text-[0.92rem] leading-relaxed text-cream/55">
            Nothing here is finished in a hurry. The coals decide when a cut is ready — and the
            plate does not leave the pass until they do.
          </p>
        </div>

        <dl className="grid max-w-2xl grid-cols-3 gap-6 border-t border-cream/15 pt-6">
          {[
            { value: "20h", label: "In the marinade" },
            { value: "6h", label: "Over live coal" },
            { value: "0", label: "Shortcuts taken" },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="font-display text-3xl text-cream md:text-4xl">{stat.value}</dt>
              <dd className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-cream/35">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function AtmosphereGallery() {
  return (
    <section className="relative overflow-hidden bg-ink-2 py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-ember-3">
              <span className="inline-block h-px w-8 bg-current" /> The room
            </p>
            <h2 className="text-editorial mt-5 max-w-xl text-[clamp(2.2rem,4.6vw,3.8rem)] text-cream">
              Low light,
              <br />
              <span className="italic text-cream/45">long conversations.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[0.9rem] leading-relaxed text-cream/45">
            Twelve tables, an open pass and a fire you can hear. Reserve the long table for eight,
            or take the counter and watch the grill work.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {ATMOSPHERE.map((plate, index) => (
            <Reveal
              key={plate.src}
              delay={index * 0.08}
              className={index % 2 === 1 ? "lg:mt-14" : undefined}
            >
              <figure className="group relative overflow-hidden rounded-[1.25rem] border border-cream/8">
                <div
                  className={
                    index === 0 || index === 3 ? "aspect-[3/4]" : "aspect-[4/5]"
                  }
                >
                  <Image
                    src={plate.src}
                    alt={plate.label}
                    fill
                    sizes="(max-width: 1024px) 46vw, 23vw"
                    className="object-cover transition-transform duration-[1.3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-4 bottom-4">
                  <p className="font-display text-[1.05rem] leading-tight text-cream">{plate.label}</p>
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-cream/45">
                    {plate.note}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={cdnImage(IMAGERY.table, 1800)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(196,85,31,0.25),transparent_60%)]" />
      </div>
      <div className="container-x relative py-28 text-center md:py-36">
        <Reveal>
          <Badge tone="warm" className="mx-auto">
            <Flame className="size-3" /> Kitchen is live
          </Badge>
          <h2 className="text-editorial mx-auto mt-7 max-w-3xl text-[clamp(2.4rem,5.4vw,4.4rem)] text-cream">
            Come for the fire.
            <br />
            <span className="italic text-cream/55">Stay for the quiet.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[0.95rem] leading-relaxed text-cream/50">
            Order in minutes, or write to us for private dining. Either way, someone is already
            lighting the coals.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/menu" size="lg">
              Order now <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Private dining
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
