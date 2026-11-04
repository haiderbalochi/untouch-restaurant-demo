import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline",
  description: "UNTOUCH needs a connection to load live menu and order data.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="container-x flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-24 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-cream/12 bg-cream/[0.04] text-cream/50">
        <WifiOff className="size-6" />
      </span>
      <h1 className="text-editorial mt-7 text-[clamp(2rem,5vw,3.2rem)] text-cream">
        The fire is still on.
      </h1>
      <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-cream/50">
        You appear to be offline. Live menu, prices and order tracking resume as soon as your
        connection returns — we never show cached order data as if it were live.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-cream px-6 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ember hover:text-cream"
      >
        Try again
      </Link>
    </div>
  );
}
