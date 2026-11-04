"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: SITE.adminPath, label: "Overview", icon: BarChart3, exact: true },
  { href: `${SITE.adminPath}/orders`, label: "Orders", icon: ShoppingBag },
  { href: `${SITE.adminPath}/products`, label: "Products", icon: Package },
  { href: `${SITE.adminPath}/categories`, label: "Categories", icon: LayoutGrid },
  { href: `${SITE.adminPath}/customers`, label: "Customers", icon: Users },
  { href: `${SITE.adminPath}/promotions`, label: "Promotions", icon: Tag },
  { href: `${SITE.adminPath}/reviews`, label: "Reviews", icon: Star },
  { href: `${SITE.adminPath}/settings`, label: "Restaurant", icon: Settings },
];

export function AdminShell({ children, demo }: { children: React.ReactNode; demo: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace(`${SITE.adminPath}/login`);
      router.refresh();
    }
  }

  const activeLabel =
    NAV.slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)))?.label ??
    "Overview";

  return (
    <div className="min-h-screen bg-ink">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-cream/8 bg-ink-2 px-4 py-6 lg:flex">
          <Wordmark size="sm" href={SITE.adminPath} />
          <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-cream/25">
            Command room
          </p>

          <nav className="mt-8 flex-1 space-y-1" aria-label="Admin">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.82rem] transition-colors",
                    active
                      ? "bg-ember/15 text-ember-3"
                      : "text-cream/45 hover:bg-cream/5 hover:text-cream/85",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 space-y-2 border-t border-cream/8 pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.76rem] text-cream/40 transition-colors hover:text-cream"
            >
              <ExternalLink className="size-3.5" /> View storefront
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.76rem] text-cream/40 transition-colors hover:text-red-300 disabled:opacity-50"
            >
              <LogOut className="size-3.5" /> {signingOut ? "Signing out…" : "Sign out"}
            </button>
            <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-cream/5 px-3 py-2.5">
              <span className="grid size-7 place-items-center rounded-full bg-ember/20 font-mono text-[0.58rem] text-ember-3">
                <ShieldCheck className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.72rem] text-cream/70">Administrator</p>
                <p className="truncate text-[0.6rem] text-cream/30">Password session</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-cream/8 bg-ink/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-cream/25">
                  UNTOUCH · admin
                </p>
                <h1 className="mt-1 font-display text-xl text-cream/90">{activeLabel}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden rounded-full border border-cream/15 px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-cream/50 transition-colors hover:text-cream sm:block"
                >
                  Storefront
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  disabled={signingOut}
                  aria-label="Sign out"
                  className="grid size-9 place-items-center rounded-full border border-cream/12 text-cream/40 transition-colors hover:text-red-300 disabled:opacity-50 lg:hidden"
                >
                  <LogOut className="size-4" />
                </button>
                {demo ? (
                  <span className="rounded-full bg-amber-400/10 px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-amber-200/90">
                    Demo mode
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-emerald-300/80">
                    Live
                  </span>
                )}
              </div>
            </div>

            <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-2 text-[0.7rem] transition-colors",
                      active ? "bg-ember/18 text-ember-3" : "text-cream/45",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          {demo ? (
            <div
              role="status"
              className="flex items-start gap-2.5 border-b border-amber-300/15 bg-amber-300/[0.06] px-5 py-3 text-[0.74rem] leading-relaxed text-amber-100/75 md:px-8"
            >
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-200/80" />
              <p>
                <span className="font-medium text-amber-100/90">Demo mode.</span> This portfolio
                demo runs entirely in your browser: products, promotions, reviews and order updates
                are saved under a local demo key and never written to Firebase. Configure a Firebase
                Admin service account to switch the dashboard to live data.
              </p>
            </div>
          ) : null}

          <main className="px-5 py-7 md:px-8 md:py-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
