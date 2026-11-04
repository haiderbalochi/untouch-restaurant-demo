"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Check,
  Cookie,
  ExternalLink,
  Megaphone,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_POLICY_DATE,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  OPEN_CONSENT_EVENT,
  formatConsentDate,
  hasCurrentConsent,
  readConsent,
  saveConsent,
  type ConsentState,
} from "@/lib/consent";
import { syncAnalyticsConsent } from "@/lib/firebase/analytics";
import { useModalA11y } from "@/lib/use-modal-a11y";
import { cn } from "@/lib/utils";

type View = "hidden" | "banner" | "preferences";
type ReturnTo = "hidden" | "banner";

const ease = [0.22, 1, 0.36, 1] as const;

const policyDate = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date(`${CONSENT_POLICY_DATE}T00:00:00`));

export function CookieConsent() {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [returnTo, setReturnTo] = useState<ReturnTo>("banner");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const applyStored = useCallback((stored: ConsentState) => {
    setAnalytics(stored.analytics);
    setMarketing(stored.marketing);
    setSavedAt(stored.decidedAt);
  }, []);

  // First visit: show the consent panel after the page has settled. Returning
  // visitors with a current policy version keep their choice and never see it.
  useEffect(() => {
    let cancelled = false;
    const stored = readConsent();
    if (hasCurrentConsent(stored)) {
      applyStored(stored);
      void syncAnalyticsConsent();
      return;
    }

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setView((current) => (current === "hidden" ? "banner" : current));
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [applyStored]);

  // Footer entry point and cross-tab consent changes.
  useEffect(() => {
    function openSettings() {
      const stored = readConsent();
      const current = hasCurrentConsent(stored);
      if (current && stored) {
        applyStored(stored);
      } else {
        setAnalytics(false);
        setMarketing(false);
        setSavedAt(null);
      }
      setReturnTo(current ? "hidden" : "banner");
      setView("preferences");
    }

    function onConsentChange(event: Event) {
      const detail = (event as CustomEvent<ConsentState>).detail;
      if (detail && hasCurrentConsent(detail)) applyStored(detail);
      void syncAnalyticsConsent();
    }

    function onStorage(event: StorageEvent) {
      if (event.key !== CONSENT_STORAGE_KEY) return;
      const stored = readConsent();
      if (hasCurrentConsent(stored)) {
        applyStored(stored);
        setView((current) => (current === "banner" ? "hidden" : current));
      }
      void syncAnalyticsConsent();
    }

    window.addEventListener(OPEN_CONSENT_EVENT, openSettings);
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, openSettings);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [applyStored]);

  const closePreferences = useCallback(() => {
    setView(returnTo === "hidden" ? "hidden" : "banner");
  }, [returnTo]);

  const acceptAll = useCallback(() => {
    const stored = saveConsent({ analytics: true, marketing: true });
    applyStored(stored);
    setView("hidden");
    void syncAnalyticsConsent();
    toast.success("All optional cookies allowed.");
  }, [applyStored]);

  const rejectOptional = useCallback(() => {
    const stored = saveConsent({ analytics: false, marketing: false });
    applyStored(stored);
    setView("hidden");
    void syncAnalyticsConsent();
    toast.success("Only essential storage will be used.");
  }, [applyStored]);

  const persistPreferences = useCallback(() => {
    const stored = saveConsent({ analytics, marketing });
    applyStored(stored);
    setView("hidden");
    void syncAnalyticsConsent();
    toast.success("Cookie preferences saved.");
  }, [analytics, applyStored, marketing]);

  return (
    <AnimatePresence mode="wait">
      {view === "banner" ? (
        <ConsentScene key="banner">
          <BannerPanel
            onAllowAll={acceptAll}
            onReject={rejectOptional}
            onCustomize={() => {
              setReturnTo("banner");
              setView("preferences");
            }}
          />
        </ConsentScene>
      ) : view === "preferences" ? (
        <ConsentScene key="preferences">
          <PreferencesPanel
            analytics={analytics}
            marketing={marketing}
            savedAt={savedAt}
            onAnalytics={setAnalytics}
            onMarketing={setMarketing}
            onCancel={closePreferences}
            onSave={persistPreferences}
            onClose={closePreferences}
          />
        </ConsentScene>
      ) : null}
    </AnimatePresence>
  );
}

function ConsentScene({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-[130] overflow-y-auto overscroll-contain"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      <div className="absolute inset-0 bg-ink/65 backdrop-blur-[7px]" aria-hidden />
      <div className="relative flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
        {children}
      </div>
    </motion.div>
  );
}

function BannerPanel({
  onAllowAll,
  onReject,
  onCustomize,
}: {
  onAllowAll: () => void;
  onReject: () => void;
  onCustomize: () => void;
}) {
  const reduce = useReducedMotion();
  const dialogRef = useModalA11y<HTMLElement>();

  return (
    <motion.section
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.5, ease }}
      className="grain relative w-full max-w-[31rem] overflow-hidden rounded-[1.75rem] border border-cream/12 bg-gradient-to-b from-ink-3/95 via-ink-2/98 to-ink/98 p-6 text-left shadow-deep outline-none sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-ember/25 blur-[90px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-ember-2/60 to-transparent"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-full border border-ember/30 bg-ember/12 text-ember-3 shadow-[inset_0_1px_0_rgba(242,236,225,0.12)]">
            <Cookie className="size-5" aria-hidden />
          </span>
          <button
            type="button"
            onClick={onCustomize}
            className="grid size-9 place-items-center rounded-full border border-cream/10 text-cream/45 transition-colors hover:border-cream/25 hover:bg-cream/8 hover:text-cream"
            aria-label="Customize cookie preferences"
          >
            <Settings2 className="size-4" aria-hidden />
          </button>
        </div>

        <h2
          id="consent-title"
          className="mt-5 font-display text-[1.85rem] leading-tight text-cream sm:text-[2.05rem]"
        >
          A little cookie love <span aria-hidden>🍪</span>
        </h2>
        <p
          id="consent-description"
          className="mt-3 text-[0.86rem] leading-relaxed text-cream/55"
        >
          We use cookies and similar technologies to improve your experience, remember your
          preferences, and understand how our website is used.
        </p>
        <p className="mt-3 text-[0.72rem] leading-relaxed text-cream/35">
          Essential storage keeps your cart, sign-in and checkout working. Analytics and marketing
          stay off until you allow them. Preferences are saved in this browser&apos;s local
          storage — not as a traditional HTTP cookie.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onAllowAll}
            className="inline-flex h-12 items-center justify-center rounded-full bg-cream px-6 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:bg-ember hover:text-cream hover:shadow-glow focus-visible:outline-offset-4"
          >
            Allow All Cookies
          </button>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-11 items-center justify-center rounded-full border border-cream/20 px-4 text-[0.66rem] uppercase tracking-[0.13em] text-cream/70 transition-colors hover:border-cream/40 hover:bg-cream/6 hover:text-cream"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={onCustomize}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-ember/35 bg-ember/8 px-4 text-[0.66rem] uppercase tracking-[0.13em] text-cream/80 transition-colors hover:border-ember/60 hover:bg-ember/15 hover:text-cream"
            >
              <Settings2 className="size-3.5" aria-hidden /> Customize Preferences
            </button>
          </div>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.66rem] leading-relaxed text-cream/30">
          <span>Policy v{CONSENT_VERSION} · {policyDate}.</span>
          <Link
            href="/cookies"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-cream/45 underline decoration-cream/20 underline-offset-2 transition-colors hover:text-cream"
          >
            Read the cookie policy <ExternalLink className="size-2.5" aria-hidden />
          </Link>
        </p>
      </div>
    </motion.section>
  );
}

function PreferencesPanel({
  analytics,
  marketing,
  savedAt,
  onAnalytics,
  onMarketing,
  onCancel,
  onSave,
  onClose,
}: {
  analytics: boolean;
  marketing: boolean;
  savedAt: string | null;
  onAnalytics: (value: boolean) => void;
  onMarketing: (value: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const dialogRef = useModalA11y<HTMLElement>({ onEscape: onCancel });

  return (
    <motion.section
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prefs-title"
      aria-describedby="prefs-description"
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.45, ease }}
      className="grain relative my-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-cream/12 bg-gradient-to-b from-ink-3/95 via-ink-2/98 to-ink/98 text-left shadow-deep outline-none"
    >
      <div className="relative flex items-start justify-between gap-4 border-b border-cream/10 p-6 sm:p-7">
        <div>
          <p className="eyebrow flex items-center gap-2 text-ember-3">
            <ShieldCheck className="size-3.5" aria-hidden /> Privacy controls
          </p>
          <h2 id="prefs-title" className="mt-3 font-display text-2xl text-cream">
            Cookie preferences
          </h2>
          <p
            id="prefs-description"
            className="mt-2 max-w-sm text-[0.8rem] leading-relaxed text-cream/45"
          >
            Choose what UNTOUCH may store beyond the essentials. You can change this any time from
            the footer.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-cream/15 text-cream/55 transition-colors hover:bg-cream/8 hover:text-cream"
          aria-label="Close cookie preferences"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="relative divide-y divide-cream/8">
        <PreferenceRow
          icon={ShieldCheck}
          title="Essential"
          body="Required for sign-in, cart, checkout and security. These cannot be switched off. No optional analytics is sent through essential storage."
          checked
          locked
        />
        <PreferenceRow
          icon={BarChart3}
          title="Analytics"
          body="Helps us understand which dishes and pages people use. Firebase Analytics is not loaded or sent until you explicitly allow it."
          checked={analytics}
          onChange={onAnalytics}
        />
        <PreferenceRow
          icon={Megaphone}
          title="Marketing"
          body="Allows campaign measurement and personalised offers when marketing tools are in use. Off by default; nothing is shared with advertising partners without this."
          checked={marketing}
          onChange={onMarketing}
        />
      </div>

      <div className="relative flex flex-col-reverse gap-2.5 border-t border-cream/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <p className="text-[0.66rem] leading-relaxed text-cream/30">
          Policy v{CONSENT_VERSION} · {policyDate}
          {savedAt ? <span className="block">Last saved {formatConsentDate(savedAt)}</span> : null}
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-full border border-cream/18 px-6 text-[0.68rem] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:bg-cream/6 hover:text-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-cream px-7 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember hover:text-cream"
          >
            <Check className="size-3.5" aria-hidden /> Save Preferences
          </button>
        </div>
      </div>

      <p className="relative px-6 pb-6 text-[0.68rem] leading-relaxed text-cream/28 sm:px-7">
        Your choice, categories, timestamp and policy version are stored in local storage under{" "}
        <code className="font-mono text-cream/40">untouch.consent.v1</code>. Firebase Authentication
        uses the browser&apos;s own session storage so you stay signed in; the cart is kept on this
        device. We only call something a cookie where an actual HTTP cookie is used.
      </p>
    </motion.section>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  body,
  checked,
  locked,
  onChange,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const bodyId = useId();
  return (
    <div className="flex items-start gap-4 px-6 py-5 sm:px-7">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-cream/12 bg-cream/4 text-cream/60">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-[1.05rem] text-cream/90">{title}</h3>
          {locked ? (
            <span className="rounded-full border border-cream/15 px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-cream/40">
              Always on
            </span>
          ) : (
            <span className="rounded-full border border-ember/25 bg-ember/8 px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-ember-3">
              Optional
            </span>
          )}
        </div>
        <p id={bodyId} className="mt-1.5 text-[0.76rem] leading-relaxed text-cream/40">
          {body}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${title} ${locked ? "always enabled" : checked ? "enabled" : "disabled"}`}
        aria-describedby={bodyId}
        disabled={locked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300",
          checked ? "border-ember/50 bg-ember/80" : "border-cream/18 bg-cream/8",
          locked ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "block size-4 rounded-full bg-cream shadow-sm",
            checked ? "ml-auto mr-1" : "ml-1 mr-auto",
          )}
        />
      </button>
    </div>
  );
}
