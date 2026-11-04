"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, X } from "lucide-react";

const UPDATE_DISMISS_KEY = "untouch.sw.update.dismissed";

/**
 * Registers the offline shell in production builds only.
 *
 * Updates are deliberately NOT force-activated. A new worker enters `waiting`
 * and the customer chooses when to refresh, avoiding the classic "old page +
 * new chunks" breakage. The worker claims clients after activation and old
 * versioned caches are removed.
 */
export function ServiceWorkerRegister() {
  const reduce = useReducedMotion();
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const offerUpdate = useCallback((worker: ServiceWorker) => {
    if (sessionStorage.getItem(UPDATE_DISMISS_KEY) === "1") return;
    setWaiting(worker);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Development must never be served a stale production worker.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((item) => item.unregister())))
        .catch(() => undefined);
      return;
    }

    let cancelled = false;
    let interval: number | undefined;

    function onControllerChange() {
      if (!refreshingRef.current) return;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;

        if (registration.waiting && navigator.serviceWorker.controller) {
          offerUpdate(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              offerUpdate(worker);
            }
          });
        });

        registration.update().catch(() => undefined);
        interval = window.setInterval(() => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => undefined);
          }
        }, 60 * 60 * 1000);
      } catch {
        /* offline support is a progressive enhancement */
      }
    }

    if (document.readyState === "complete") void register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [offerUpdate]);

  const applyUpdate = useCallback(() => {
    if (!waiting) return;
    refreshingRef.current = true;
    setRefreshing(true);
    waiting.postMessage({ type: "SKIP_WAITING" });
    // Safety net for browsers that do not emit controllerchange promptly.
    window.setTimeout(() => {
      if (refreshingRef.current) window.location.reload();
    }, 4000);
  }, [waiting]);

  function dismissUpdate() {
    try {
      sessionStorage.setItem(UPDATE_DISMISS_KEY, "1");
    } catch {
      /* session storage unavailable */
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && waiting ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label="Application update"
          aria-live="polite"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[125] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-cream/14 bg-ink-2/95 p-4 shadow-deep backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-ember/15 text-ember-3">
              <RefreshCw className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.82rem] text-cream/85">A fresh UNTOUCH is ready.</p>
              <p className="mt-0.5 text-[0.7rem] leading-relaxed text-cream/40">
                Refresh to load the latest menu and app updates.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyUpdate}
                  disabled={refreshing}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cream px-4 text-[0.64rem] font-medium uppercase tracking-[0.13em] text-ink transition-colors hover:bg-ember hover:text-cream disabled:opacity-60"
                >
                  <RefreshCw className="size-3" aria-hidden />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  type="button"
                  onClick={dismissUpdate}
                  className="inline-flex h-9 items-center rounded-full border border-cream/15 px-4 text-[0.62rem] uppercase tracking-[0.12em] text-cream/50 transition-colors hover:bg-cream/6 hover:text-cream"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissUpdate}
              className="grid size-7 shrink-0 place-items-center rounded-full text-cream/35 transition-colors hover:bg-cream/8 hover:text-cream"
              aria-label="Dismiss update notice"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
