import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Flame, Leaf, Timer } from "lucide-react";
import { EyebrowHero } from "@/components/layout/page-hero";
import { Seal } from "@/components/brand/logo";
import { ButtonLink, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Parallax, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { IMAGERY } from "@/lib/imagery";
import { SITE } from "@/lib/site";
import { cdnImage } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "UNTOUCH began with one tandoor and a stubborn idea: a burger can carry the soul of a charcoal grill. Read the story behind the kitchen.",
  alternates: { canonical: "/about" },
};

const chapters = [
  {
    year: "2016",
    title: "One tandoor, six seats",
    body: "A back-street kitchen in Karachi with a handwritten menu and a queue that never quite disappeared.",
  },
  {
    year: "2019",
    title: "The charcoal room",
    body: "We rebuilt the pass around live coal and a single rule: nothing leaves until it is worth the wait.",
  },
  {
    year: "2022",
    title: "Built to travel",
    body: "Years of packing trials produced containers engineered per dish — vented, insulated, sauced separately.",
  },
  {
    year: "2026",
    title: "Same fire, wider door",
    body: "The dining room grew, the delivery kitchen opened, and the recipe book stayed exactly where it was.",
  },
];

export default function AboutPage() {
  return (
    <>
      <EyebrowHero
        eyebrow="The house · since 2016"
        title={
          <>
            Obsession has
            <br />
            <span className="italic text-cream/45">a kitchen.</span>
          </>
        }
        description="UNTOUCH is a study in patience: overnight marinades, charcoal fire, dough proved slowly, spice ground each morning. Nothing here is quick — except the ordering."
        meta={`${SITE.city} · ${SITE.country}`}
      />

      <section className="container-x grid gap-14 py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
            <Parallax distance={40} className="absolute inset-0">
              <div className="relative h-[112%] w-full">
                <Image
                  src={cdnImage(IMAGERY.fire, 1200)}
                  alt="The UNTOUCH charcoal pass"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          </div>
        </Reveal>

        <div className="lg:pt-6">
          <SectionHeading
            eyebrow="Our philosophy"
            title={
              <>
                We only know
                <br />
                <span className="italic text-cream/45">the long way.</span>
              </>
            }
          />
          <div className="mt-6 space-y-5 text-[0.95rem] leading-relaxed text-cream/50">
            <p>
              There is a version of this restaurant that is faster and cheaper. It uses gas, frozen
              patties, bottled sauces and a menu written to survive a freezer. We have eaten there.
              It is fine.
            </p>
            <p>
              UNTOUCH exists for the other thing: the moment a plate lands and the room goes quiet.
              That silence is engineered — twenty-hour marinades, hand-cut fries, spice milled at
              dawn, bread proved until it tells you it is ready.
            </p>
            <p>
              We are not precious about fine dining. We are precious about flavour, and about the
              fact that it cannot be rushed without being lost.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-4 border-t border-cream/10 pt-7">
            {[
              { icon: Flame, label: "Charcoal fired", value: "Daily" },
              { icon: Timer, label: "Marinade", value: "20 hrs" },
              { icon: Leaf, label: "Spice milled", value: "At dawn" },
            ].map((item) => (
              <div key={item.label}>
                <item.icon className="size-4 text-ember-3/80" />
                <p className="mt-2 font-display text-xl text-cream/90">{item.value}</p>
                <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.14em] text-cream/30">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-cream/8 bg-ink-2 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Chapters" title="Ten years, one direction." />
          <StaggerGroup className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {chapters.map((chapter) => (
              <StaggerItem key={chapter.year}>
                <div className="border-t border-cream/15 pt-5">
                  <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ember-3">
                    {chapter.year}
                  </p>
                  <h3 className="mt-3 font-display text-xl text-cream/90">{chapter.title}</h3>
                  <p className="mt-2 text-[0.84rem] leading-relaxed text-cream/40">{chapter.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container-x grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="The team"
            title={
              <>
                A small room,
                <br />
                <span className="italic text-cream/45">very loud at service.</span>
              </>
            }
            description="Nine people on the line, two on the pass, one who refuses to let a plate leave if the garnish leans wrong. UNTOUCH is built by the people who cook here."
          />
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Seal className="size-20 text-cream/35" />
            <div className="rounded-2xl border border-cream/10 bg-cream/[0.025] px-5 py-4">
              <p className="eyebrow text-cream/30">Digital craft</p>
              <p className="mt-2 text-[0.86rem] text-cream/70">
                Platform developed by <span className="text-cream">{SITE.credits.team}</span>
              </p>
              <p className="mt-1 text-[0.8rem] text-cream/45">
                Project Host: <span className="text-cream/75">{SITE.credits.host}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem]">
          <Image
            src={cdnImage(IMAGERY.table, 1200)}
            alt="Guests at the UNTOUCH counter"
            fill
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/20" />
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="flex flex-col items-center gap-5 rounded-[1.75rem] border border-cream/12 bg-gradient-to-br from-ember/12 via-cream/[0.03] to-transparent px-6 py-16 text-center">
          <p className="eyebrow text-ember-3">Now open</p>
          <h2 className="text-editorial max-w-2xl text-[clamp(2rem,4.4vw,3.4rem)] text-cream">
            The fire is already lit. Come eat.
          </h2>
          <ButtonLink href="/menu" size="lg" className="mt-2">
            Explore the menu <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
