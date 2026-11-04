"use client";

import { Database, ExternalLink, KeyRound } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Shown by any data-driven surface when Firebase has not been connected yet.
 * It keeps the product honest: no invented menu, no fake availability.
 */
export function SetupNotice({ className, compact }: { className?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cream/12 bg-gradient-to-br from-cream/[0.06] via-cream/[0.03] to-transparent p-6 sm:p-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-ember/15 blur-[90px]"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow flex items-center gap-2 text-ember-3">
            <Database className="size-3.5" /> Backend not connected
          </p>
          <h3 className="mt-3 font-display text-2xl text-cream/95">
            The kitchen is plated — the pantry is empty.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-cream/50">
            UNTOUCH reads its menu, banners and orders from Firebase Realtime Database. Add your
            project credentials to <code className="rounded bg-cream/10 px-1.5 py-0.5 text-[0.78em]">.env.local</code>,
            then run the seed script to publish the menu. Nothing is mocked: as soon as credentials
            exist, this surface fills with live data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="shrink-0 self-start rounded-full border border-cream/20 px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] text-cream/70 transition-colors hover:bg-cream/8 hover:text-cream"
          aria-expanded={open}
        >
          {open ? "Hide steps" : "Setup steps"}
        </button>
      </div>

      {open ? (
        <ol className="relative mt-6 grid gap-3 border-t border-cream/10 pt-5 text-sm text-cream/55 sm:grid-cols-3">
          {[
            {
              icon: KeyRound,
              title: "1 · Firebase",
              body: "Create a web app in your Firebase project, enable Email/Password + Google auth, then paste the web config and Admin SDK keys into .env.local.",
            },
            {
              icon: Database,
              title: "2 · Rules & seed",
              body: "Run `npx firebase deploy --only database` and `npm run seed` to publish categories, dishes and settings.",
            },
            {
              icon: ExternalLink,
              title: "3 · Cloudinary",
              body: "Add your Cloudinary cloud name, API key and secret so admin uploads are signed on the server.",
            },
          ].map((step) => (
            <li key={step.title} className="rounded-xl border border-cream/10 bg-ink/30 p-4">
              <step.icon className="size-4 text-ember-3/80" />
              <p className="mt-2.5 text-[0.7rem] uppercase tracking-[0.16em] text-cream/70">
                {step.title}
              </p>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-cream/40">{step.body}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
