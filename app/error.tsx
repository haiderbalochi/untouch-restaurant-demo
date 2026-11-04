"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[untouch] route error", error);
  }, [error]);

  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ember-2">
        Service interrupted
      </p>
      <h1 className="text-editorial mt-5 max-w-2xl text-[clamp(2.4rem,6vw,4rem)] text-cream">
        Something went quiet in the kitchen.
      </h1>
      <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-cream/45">
        This section could not load. Your cart and account are untouched — try again, or head back to
        the menu.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[0.62rem] text-cream/20">Ref {error.digest}</p>
      ) : null}
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-full bg-ember px-6 text-[0.74rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-ember-2"
        >
          Try again
        </button>
        <a
          href="/menu"
          className="inline-flex h-11 items-center rounded-full border border-cream/20 px-6 text-[0.74rem] uppercase tracking-[0.16em] text-cream/70 transition-colors hover:bg-cream/6"
        >
          Back to menu
        </a>
      </div>
    </section>
  );
}
