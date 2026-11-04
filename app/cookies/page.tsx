import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Cookie,
  Database,
  LockKeyhole,
  Megaphone,
  ServerOff,
  ShieldCheck,
} from "lucide-react";
import { CookieSettingsButton } from "@/components/consent/cookie-settings-button";
import { CONSENT_POLICY_DATE, CONSENT_VERSION } from "@/lib/consent-config";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie & storage policy",
  description:
    "How UNTOUCH uses cookies and browser storage, what each category does, and how to change your preferences.",
  alternates: { canonical: "/cookies" },
};

const policyDate = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${CONSENT_POLICY_DATE}T00:00:00Z`));

const categories = [
  {
    icon: ShieldCheck,
    title: "Essential",
    locked: true,
    body: "Keeps the platform working: Firebase Authentication sessions, your shopping cart, checkout state, consent preferences and security protections. These cannot be switched off because the application cannot function without them.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    locked: false,
    body: "Optional. Only after you explicitly allow analytics does UNTOUCH load Firebase Analytics and create analytics identifiers. It helps us understand which dishes and pages are used. Rejecting or revoking analytics stops collection and clears those identifiers.",
  },
  {
    icon: Megaphone,
    title: "Marketing",
    locked: false,
    body: "Optional. A stored choice for campaign measurement and personalised offers where marketing tools are used. It is off by default, is never enabled by “Reject Optional”, and this build does not set any marketing cookies.",
  },
];

const storage: Array<{
  name: string;
  technology: string;
  purpose: string;
  category: string;
  session?: boolean;
}> = [
  {
    name: "untouch.consent.v1",
    technology: "localStorage",
    purpose: "Your consent status, selected categories, timestamp and policy version.",
    category: "Essential",
  },
  {
    name: "untouch.cart.v1",
    technology: "localStorage",
    purpose: "The dishes in your cart so they survive a refresh or app restart.",
    category: "Essential",
  },
  {
    name: "Firebase Auth session",
    technology: "Browser storage / IndexedDB",
    purpose: "Keeps you signed in securely so authentication persists between visits.",
    category: "Essential",
  },
  {
    name: "untouch.install.dismissed.v1",
    technology: "sessionStorage",
    purpose: "Remembers that you dismissed the install card for this browser session.",
    category: "Essential",
    session: true,
  },
  {
    name: "untouch.sw.update.dismissed",
    technology: "sessionStorage",
    purpose: "Remembers that you postponed an application update for this session.",
    category: "Essential",
    session: true,
  },
  {
    name: "Service worker cache",
    technology: "Cache Storage",
    purpose:
      "Stores the public offline page, icons, fonts and static assets. Private pages and API responses are never cached.",
    category: "Essential",
  },
  {
    name: "_ga, _ga_*",
    technology: "HTTP cookies",
    purpose:
      "Google Analytics measurement used by Firebase Analytics. Only created after you allow analytics.",
    category: "Analytics",
  },
  {
    name: "Marketing tags",
    technology: "None in this build",
    purpose:
      "No advertising or marketing cookies are set by this build. Your marketing preference is recorded for when such tools are introduced.",
    category: "Marketing",
  },
];

export default function CookiesPage() {
  return (
    <article className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 size-[420px] rounded-full bg-ember/10 blur-[120px]"
      />
      <div className="container-x relative max-w-3xl py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-cream/40 transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back home
        </Link>

        <p className="eyebrow mt-8 flex items-center gap-2 text-ember-3">
          <Cookie className="size-3.5" aria-hidden /> Privacy
        </p>
        <h1 className="text-editorial mt-4 text-[clamp(2.4rem,5vw,4rem)] text-cream">
          Cookies, quietly.
        </h1>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/55">
          UNTOUCH uses a small amount of browser storage. Some of it is essential, some is
          optional, and all of it is yours to control. This policy covers policy version{" "}
          {CONSENT_VERSION}, last updated {policyDate}.
        </p>

        <h2 className="mt-12 font-display text-2xl text-cream">What we actually store</h2>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-cream/50">
          Consent preferences and your cart live in your browser&apos;s local storage — not as
          traditional HTTP cookies. Firebase Authentication keeps your signed-in session in the
          browser&apos;s own storage so you stay signed in. Analytics cookies are created only after
          you grant analytics consent. We only describe something as a cookie where an actual HTTP
          cookie is used.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-cream/10">
          <div className="hidden grid-cols-[1.1fr_0.9fr_1.5fr] gap-4 border-b border-cream/10 bg-cream/[0.035] px-5 py-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-cream/35 sm:grid">
            <span>Name</span>
            <span>Technology</span>
            <span>Purpose</span>
          </div>
          <div className="divide-y divide-cream/8">
            {storage.map((item) => (
              <div
                key={item.name}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1.1fr_0.9fr_1.5fr] sm:gap-4"
              >
                <div>
                  <p className="break-words font-mono text-[0.67rem] text-cream/70">{item.name}</p>
                  <p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-cream/25">
                    {item.session ? "Session · clears on close" : item.category}
                  </p>
                </div>
                <p className="text-[0.7rem] leading-relaxed text-cream/45">
                  <span className="mr-1.5 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-cream/25 sm:hidden">
                    Technology
                  </span>
                  {item.technology}
                </p>
                <p className="text-[0.7rem] leading-relaxed text-cream/45">
                  <span className="mr-1.5 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-cream/25 sm:hidden">
                    Purpose
                  </span>
                  {item.purpose}
                </p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="mt-12 font-display text-2xl text-cream">Permission categories</h2>
        <div className="mt-5 space-y-3">
          {categories.map((category) => (
            <section
              key={category.title}
              className="rounded-2xl border border-cream/10 bg-cream/[0.025] p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full border border-cream/12 bg-cream/4 text-cream/60">
                  <category.icon className="size-4" aria-hidden />
                </span>
                <h3 className="font-display text-xl text-cream/90">{category.title}</h3>
                <span className="rounded-full border border-cream/15 px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-cream/40">
                  {category.locked ? "Always on" : "Optional · off by default"}
                </span>
              </div>
              <p className="mt-3 text-[0.86rem] leading-relaxed text-cream/45">{category.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-cream/10 p-6">
            <Database className="size-5 text-ember-3" aria-hidden />
            <h2 className="mt-4 font-display text-xl text-cream">Your consent record</h2>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/45">
              We save the consent status, categories, a timestamp and policy version{" "}
              {CONSENT_VERSION}. When the policy changes, the version no longer matches and UNTOUCH
              asks again before using anything optional.
            </p>
          </div>
          <div className="rounded-2xl border border-cream/10 p-6">
            <LockKeyhole className="size-5 text-ember-3" aria-hidden />
            <h2 className="mt-4 font-display text-xl text-cream">What stays private</h2>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/45">
              The service worker never caches account pages, checkout, order tracking, admin pages,
              authentication details, payment responses or API responses. Cached order data is
              never shown as live information.
            </p>
          </div>
          <div className="rounded-2xl border border-cream/10 p-6 sm:col-span-2">
            <ServerOff className="size-5 text-ember-3" aria-hidden />
            <h2 className="mt-4 font-display text-xl text-cream">Before you choose</h2>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-cream/45">
              Optional analytics and marketing are not loaded before consent. The Reject Optional
              action means analytics and marketing are both off — it never implies acceptance.
              Sign-in, cart and checkout continue to work because they rely only on essential
              storage.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-ember/25 bg-ember/[0.07] p-6">
          <h2 className="font-display text-xl text-cream">Change your mind</h2>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-cream/50">
            Reopen your preferences whenever you like. Turning analytics off immediately disables
            Firebase Analytics collection and clears its browser identifiers.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CookieSettingsButton className="inline-flex h-11 items-center justify-center rounded-full bg-cream px-6 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember hover:text-cream">
              Open cookie settings
            </CookieSettingsButton>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-full border border-cream/20 px-6 text-[0.68rem] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:border-cream/40 hover:text-cream"
            >
              Ask a question
            </Link>
          </div>
        </div>

        <p className="mt-10 text-[0.72rem] leading-relaxed text-cream/30">
          Questions about storage or privacy can be sent to {SITE.name} at{" "}
          <a
            href="mailto:hello@untouch.pk"
            className="underline decoration-cream/20 hover:text-cream/60"
          >
            hello@untouch.pk
          </a>
          . This policy covers this website and its installed app.
        </p>
      </div>
    </article>
  );
}
