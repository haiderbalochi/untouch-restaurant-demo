"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Download, Smartphone } from "lucide-react";
import { useInstall } from "@/components/pwa/install-context";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Installation surface shared by the homepage, footer and account settings.
 *
 * State comes from `InstallProvider`, so every entry point agrees on whether
 * the app is installed, dismissed or awaiting a native browser prompt. No
 * automatic prompt is ever shown: Chromium's `beforeinstallprompt` event is
 * only fired by a real click, and unsupported browsers get manual guidance.
 */
export function InstallPrompt({ variant = "card" }: { variant?: "card" | "button" }) {
  const reduce = useReducedMotion();
  const {
    ready,
    installed,
    dismissed,
    prompting,
    canPrompt,
    ios,
    inApp,
    promptInstall,
    dismissPrompt,
  } = useInstall();

  if (!ready || installed || dismissed) return null;

  // Keep the large homepage card for browsers that can install (or need iOS /
  // in-app guidance). Everywhere else the footer and account entries remain
  // available, so an unsupported browser is never shown a dead prompt.
  if (variant === "card" && !canPrompt && !ios && !inApp) return null;

  const actionLabel = prompting
    ? "Opening…"
    : canPrompt
      ? "Install UNTOUCH"
      : "How to install";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => void promptInstall()}
        disabled={prompting}
        className="group inline-flex items-center gap-1 text-[0.86rem] text-cream/55 transition-colors hover:text-cream disabled:opacity-60"
      >
        Install app
        <Download className="size-3 -translate-y-0.5 opacity-0 transition-opacity group-hover:opacity-60" />
      </button>
    );
  }

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
      className="container-x relative py-4"
      aria-labelledby="install-title"
    >
      <div className="grain relative overflow-hidden rounded-[1.6rem] border border-cream/12 bg-gradient-to-br from-ink-3 via-ink-2 to-ink p-6 sm:p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-ember/18 blur-[100px]"
        />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <span className="relative grid size-16 shrink-0 place-items-center rounded-[1.15rem] border border-cream/15 bg-ink/60 shadow-lift">
              {/* Uses the committed PWA artwork, which matches the installed app. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="" width={44} height={44} className="rounded-xl" />
              <span className="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-ember text-cream">
                <Download className="size-3" aria-hidden />
              </span>
            </span>
            <div>
              <p className="eyebrow text-ember-3">Install UNTOUCH</p>
              <h2
                id="install-title"
                className="mt-2 font-display text-[1.7rem] leading-tight text-cream sm:text-[2rem]"
              >
                Your table, one tap away.
              </h2>
              <p className="mt-2 max-w-md text-[0.86rem] leading-relaxed text-cream/50">
                Add UNTOUCH to your home screen for a full-screen, app-like experience — faster
                menu, saved cart and order updates without the browser chrome.
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                {["Full screen", "Works offline", "No app store"].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-[0.7rem] text-cream/40"
                  >
                    <Check className="size-3 text-ember-3" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col">
            <button
              type="button"
              onClick={() => void promptInstall()}
              disabled={prompting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cream px-7 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember hover:text-cream disabled:opacity-60"
            >
              <Smartphone className="size-4" aria-hidden />
              {actionLabel}
            </button>
            <button
              type="button"
              onClick={dismissPrompt}
              className="inline-flex h-11 items-center justify-center rounded-full border border-cream/15 px-6 text-[0.68rem] uppercase tracking-[0.14em] text-cream/45 transition-colors hover:border-cream/30 hover:text-cream/80"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
