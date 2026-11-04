"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Download,
  Menu,
  Share,
  Smartphone,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import { useModalA11y } from "@/lib/use-modal-a11y";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallResult = "accepted" | "dismissed" | "instructions" | "installed" | "unsupported";

interface InstallContextValue {
  ready: boolean;
  installed: boolean;
  dismissed: boolean;
  prompting: boolean;
  canPrompt: boolean;
  ios: boolean;
  inApp: boolean;
  promptInstall: () => Promise<InstallResult>;
  dismissPrompt: () => void;
}

const INSTALL_DISMISS_KEY = "untouch.install.dismissed.v1";
const InstallContext = createContext<InstallContextValue | null>(null);

type NavigatorWithInstall = Navigator & {
  standalone?: boolean;
  getInstalledRelatedApps?: () => Promise<Array<{ platform: string; id?: string; url?: string }>>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const modes = ["standalone", "fullscreen", "minimal-ui"];
  const displayMode = modes.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches);
  const iosStandalone = (window.navigator as NavigatorWithInstall).standalone === true;
  return displayMode || iosStandalone;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(ua) || iPadOS;
}

function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|WhatsApp|Snapchat|Pinterest|TikTok|BytedanceWebview|musical_ly|GSA\//i.test(
    navigator.userAgent,
  );
}

function wasDismissedThisSession() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(INSTALL_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * One shared installation state for every InstallPrompt on the page. This keeps
 * the homepage card, footer link and account entry point in sync, and ensures a
 * dismissed prompt stays hidden for the rest of the browsing session.
 */
export function InstallProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [prompting, setPrompting] = useState(false);
  const [ios, setIos] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const promptingRef = useRef(false);

  const dismissPrompt = useCallback(() => {
    try {
      window.sessionStorage.setItem(INSTALL_DISMISS_KEY, "1");
    } catch {
      /* session storage unavailable */
    }
    setDismissed(true);
  }, []);

  useEffect(() => {
    setIos(isIOS());
    setInApp(isInAppBrowser());
    setDismissed(wasDismissedThisSession());
    setInstalled(isStandalone());
    setReady(true);

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
      setGuideOpen(false);
    }

    function onDisplayModeChange() {
      if (isStandalone()) onInstalled();
    }

    const displayMode = window.matchMedia("(display-mode: standalone)");
    displayMode.addEventListener?.("change", onDisplayModeChange);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Android Chrome can confirm an existing installation even when the site was
    // opened in the browser rather than from the home screen.
    const nav = window.navigator as NavigatorWithInstall;
    const relatedApps = nav.getInstalledRelatedApps?.();
    if (relatedApps) {
      void relatedApps
        .then((apps) => {
          if (apps.length > 0) onInstalled();
        })
        .catch(() => undefined);
    }

    return () => {
      displayMode.removeEventListener?.("change", onDisplayModeChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallResult> => {
    if (isStandalone()) {
      setInstalled(true);
      return "installed";
    }
    if (!deferred) {
      setGuideOpen(true);
      return "instructions";
    }
    if (promptingRef.current) return "unsupported";

    promptingRef.current = true;
    setPrompting(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setGuideOpen(false);
        return "accepted";
      }
      dismissPrompt();
      return "dismissed";
    } catch {
      // The browser may invalidate the event. Fall back to manual guidance.
      setDeferred(null);
      setGuideOpen(true);
      return "instructions";
    } finally {
      promptingRef.current = false;
      setPrompting(false);
    }
  }, [deferred, dismissPrompt]);

  const value = useMemo<InstallContextValue>(
    () => ({
      ready,
      installed,
      dismissed,
      prompting,
      canPrompt: Boolean(deferred),
      ios,
      inApp,
      promptInstall,
      dismissPrompt,
    }),
    [ready, installed, dismissed, prompting, deferred, ios, inApp, promptInstall, dismissPrompt],
  );

  return (
    <InstallContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {guideOpen && !installed ? (
          <InstallGuide
            key="install-guide"
            ios={ios}
            inApp={inApp}
            onClose={() => setGuideOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </InstallContext.Provider>
  );
}

export function useInstall() {
  const context = useContext(InstallContext);
  if (!context) throw new Error("useInstall must be used inside <InstallProvider>.");
  return context;
}

type GuideKind = "ios" | "in-app" | "chromium" | "safari-desktop" | "firefox" | "generic";

interface GuideStep {
  icon: typeof Share;
  text: string;
}

function guideKind(ios: boolean, inApp: boolean): GuideKind {
  if (inApp) return "in-app";
  if (ios) return "ios";
  if (typeof navigator === "undefined") return "generic";
  const ua = navigator.userAgent;
  if (/Firefox|FxiOS/i.test(ua)) return "firefox";
  if (/Edg|OPR|Chrome|CriOS|SamsungBrowser/i.test(ua)) return "chromium";
  if (/Safari/i.test(ua)) return "safari-desktop";
  return "generic";
}

const guides: Record<GuideKind, { title: string; intro: string; steps: GuideStep[] }> = {
  ios: {
    title: "Add UNTOUCH to your Home Screen",
    intro:
      "Safari on iPhone and iPad installs web apps from the Share menu — no app store needed.",
    steps: [
      { icon: Share, text: "Tap the Share button in Safari's toolbar." },
      { icon: SquareArrowOutUpRight, text: "Scroll down and choose “Add to Home Screen”." },
      { icon: Check, text: "Tap “Add”. UNTOUCH now opens full screen like a native app." },
    ],
  },
  "in-app": {
    title: "Open UNTOUCH in your browser",
    intro:
      "This in-app browser cannot add home-screen apps. Open the page in Safari or Chrome first.",
    steps: [
      { icon: Menu, text: "Tap the ••• or Share menu in this app." },
      { icon: SquareArrowOutUpRight, text: "Choose “Open in browser”, Safari or Chrome." },
      {
        icon: Download,
        text: "Then use the browser menu → “Add to Home Screen” (or Share → Add to Home Screen on iPhone).",
      },
    ],
  },
  chromium: {
    title: "Install UNTOUCH",
    intro: "Chrome, Edge and other Chromium browsers install UNTOUCH from the browser menu.",
    steps: [
      { icon: Menu, text: "Open the browser menu (⋮) in the address bar." },
      { icon: Download, text: "Choose “Install app” or “Add to Home screen”." },
      { icon: Check, text: "Confirm Install. UNTOUCH opens in its own full-screen window." },
    ],
  },
  "safari-desktop": {
    title: "Add UNTOUCH to your Dock",
    intro:
      "Safari on macOS can add UNTOUCH to the Dock. On older macOS versions, use Chrome or Edge instead.",
    steps: [
      { icon: Menu, text: "Open Safari's File menu (or the Share button)." },
      { icon: SquareArrowOutUpRight, text: "Choose “Add to Dock”." },
      { icon: Check, text: "Confirm Add — UNTOUCH launches like an app from your Dock." },
    ],
  },
  firefox: {
    title: "Use a browser with app installs",
    intro:
      "Firefox does not install Progressive Web Apps on desktop. Open UNTOUCH in Chrome, Edge or Safari to add it to your home screen or Dock.",
    steps: [
      { icon: SquareArrowOutUpRight, text: "Copy this page's address from the URL bar." },
      { icon: Smartphone, text: "Open it in Chrome, Edge or Safari." },
      { icon: Download, text: "Use the browser's Install app or Add to Home Screen option." },
    ],
  },
  generic: {
    title: "Add UNTOUCH to your home screen",
    intro: "Your browser may expose installation from its main menu or share sheet.",
    steps: [
      { icon: Menu, text: "Open the browser menu (⋮ or Share)." },
      { icon: Download, text: "Look for “Install app” or “Add to Home Screen”." },
      { icon: Check, text: "Confirm, then launch UNTOUCH from your home screen any time." },
    ],
  },
};

function InstallGuide({
  ios,
  inApp,
  onClose,
}: {
  ios: boolean;
  inApp: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const dialogRef = useModalA11y<HTMLDivElement>({ onEscape: onClose });
  const guide = guides[guideKind(ios, inApp)];

  return (
    <motion.div
      className="fixed inset-0 z-[140] overflow-y-auto overscroll-contain"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        aria-label="Close installation instructions"
        onClick={onClose}
        className="fixed inset-0 bg-ink/75 backdrop-blur-md"
      />
      <div className="relative flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
          aria-describedby="install-guide-intro"
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="grain relative w-full max-w-md overflow-hidden rounded-[1.65rem] border border-cream/12 bg-gradient-to-b from-ink-3/98 via-ink-2 to-ink p-6 text-left shadow-deep outline-none sm:p-7"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-60 rounded-full bg-ember/20 blur-[90px]"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-cream/12 text-cream/45 transition-colors hover:bg-cream/8 hover:text-cream"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>

          <div className="relative">
            <span className="relative grid size-16 place-items-center rounded-[1.15rem] border border-cream/15 bg-ink/60 shadow-lift">
              {/* Uses the same committed PWA artwork as the installed app. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/icon-192.png"
                alt=""
                width={46}
                height={46}
                className="rounded-xl"
              />
              <span className="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-ember text-cream">
                <Download className="size-3" aria-hidden />
              </span>
            </span>

            <p className="eyebrow mt-5 text-ember-3">Install UNTOUCH</p>
            <h2
              id="install-guide-title"
              className="mt-2 pr-8 font-display text-[1.7rem] leading-tight text-cream"
            >
              {guide.title}
            </h2>
            <p id="install-guide-intro" className="mt-2.5 text-[0.82rem] leading-relaxed text-cream/45">
              {guide.intro}
            </p>

            <ol className="mt-5 space-y-2.5">
              {guide.steps.map((step, index) => (
                <li
                  key={step.text}
                  className="flex items-start gap-3 rounded-xl border border-cream/8 bg-ink/30 p-3.5"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ember/15 text-ember-3">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                  <p className="pt-1 text-[0.79rem] leading-relaxed text-cream/62">
                    <span className="mr-1.5 font-mono text-[0.6rem] text-cream/25">
                      0{index + 1}
                    </span>
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-[0.68rem] leading-relaxed text-cream/28">
              UNTOUCH installs as the same secure website — no app store, no separate download and
              no extra account.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-cream text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember hover:text-cream"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
