"use client";

import Link from "next/link";
import { ArrowUpRight, Instagram, Facebook, Music2, Cookie } from "lucide-react";
import { Seal, Wordmark } from "@/components/brand/logo";
import { CookieSettingsButton } from "@/components/consent/cookie-settings-button";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { useSettings } from "@/lib/hooks";
import { SITE } from "@/lib/site";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Full menu", href: "/menu" },
      { label: "Categories", href: "/categories" },
      { label: "Today's specials", href: "/menu?filter=specials" },
      { label: "Best sellers", href: "/menu?sort=popular" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Reviews", href: "/about#reviews" },
      { label: "Contact", href: "/contact" },
      { label: "My account", href: "/account" },
    ],
  },
];

export function SiteFooter() {
  const { data: settings } = useSettings();
  const socials = [
    { href: settings.socials.instagram || SITE.socials.instagram, icon: Instagram, label: "Instagram" },
    { href: settings.socials.facebook || SITE.socials.facebook, icon: Facebook, label: "Facebook" },
    { href: settings.socials.tiktok || SITE.socials.tiktok, icon: Music2, label: "TikTok" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-cream/8 bg-ink-2 pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-40 size-[520px] rounded-full bg-ember/10 blur-[130px]"
      />
      <div className="container-x relative">
        <div className="grid gap-14 pb-16 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Wordmark size="lg" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/45">
              {settings.content.storyBody.split(".")[0]}.
            </p>
            <div className="mt-7 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="grid size-10 place-items-center rounded-full border border-cream/12 text-cream/50 transition-all duration-300 hover:border-ember/40 hover:text-ember-3"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>

            <ul className="mt-6 space-y-3">
              <li>
                <InstallPrompt variant="button" />
              </li>
              <li>
                <CookieSettingsButton className="group inline-flex items-center gap-1 text-[0.86rem] text-cream/55 transition-colors hover:text-cream">
                  <Cookie className="size-3.5" /> Cookie settings
                </CookieSettingsButton>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="group inline-flex items-center gap-1 text-[0.86rem] text-cream/55 transition-colors hover:text-cream"
                >
                  Cookie policy
                  <ArrowUpRight className="size-3 -translate-y-0.5 opacity-0 transition-opacity group-hover:opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow text-cream/30">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[0.86rem] text-cream/55 transition-colors hover:text-cream"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3 -translate-y-0.5 opacity-0 transition-opacity group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="eyebrow text-cream/30">Visit</p>
            <address className="mt-5 space-y-2 text-[0.86rem] not-italic leading-relaxed text-cream/55">
              <p>{settings.address}</p>
              <p>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-cream">
                  {settings.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-cream">
                  {settings.email}
                </a>
              </p>
            </address>
            <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cream/30">
              {settings.openTime} — {settings.closeTime} · Daily
            </p>
          </div>
        </div>

        <div className="relative flex items-end justify-between gap-8 border-t border-cream/8 py-10">
          <div className="space-y-2">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-cream/35">
              © {new Date().getFullYear()} {settings.name} — All rights reserved
            </p>
            <p className="text-[0.7rem] tracking-[0.04em] text-cream/25">
              Developed by Team Realhackers
              <span className="mx-2 text-cream/15">|</span>
              Project Host: Haider Baloch
            </p>
          </div>
          <Seal className="hidden size-16 shrink-0 text-cream/40 sm:block" />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden text-center leading-[0.75]"
      >
        <span className="block translate-y-[18%] font-display text-[clamp(5rem,17vw,16rem)] font-semibold uppercase tracking-[-0.02em] text-cream/[0.035]">
          Untouch
        </span>
      </div>
    </footer>
  );
}
