"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { useCategories, useSettings } from "@/lib/hooks";
import { SITE } from "@/lib/site";
import { sortCategories } from "@/lib/data/catalog";
import { cn, initials, isOpenNow } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, profile, isAdmin, loading } = useAuth();
  const { lines, openDrawer } = useCart();
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const open = settings.isOpen && isOpenNow(settings.openTime, settings.closeTime, true);

  const onScroll = useCallback(() => setScrolled(window.scrollY > 24), []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    setMobileOpen(false);
    setCategoriesOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  return (
    <>
      <div className="relative z-[60] hidden border-b border-cream/8 bg-ink/90 md:block">
        <div className="container-x flex h-9 items-center justify-between text-[0.68rem] text-cream/55">
          <p className="flex items-center gap-2 font-mono uppercase tracking-[0.16em]">
            <span
              className={cn(
                "inline-block size-1.5 rounded-full",
                open ? "bg-emerald-400 animate-[blink_2.4s_ease-in-out_infinite]" : "bg-red-400",
              )}
            />
            {open ? `Open now · ${settings.openTime} – ${settings.closeTime}` : "Closed · pre-order available"}
          </p>
          <p className="truncate pl-8 font-mono uppercase tracking-[0.16em] text-cream/45">
            {settings.content.announcement}
          </p>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-[60] transition-all duration-500",
          solid
            ? "border-b border-cream/8 bg-ink/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-ink/65"
            : "bg-transparent",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Wordmark size="md" />
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {SITE.nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              if (item.href === "/categories") {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setCategoriesOpen(true)}
                    onMouseLeave={() => setCategoriesOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.78rem] uppercase tracking-[0.16em] transition-colors",
                        active ? "text-cream" : "text-cream/60 hover:text-cream",
                      )}
                      aria-expanded={categoriesOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-3 transition-transform duration-300",
                          categoriesOpen && "rotate-180",
                        )}
                      />
                    </Link>
                    <AnimatePresence>
                      {categoriesOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                        >
                          <div className="glass-dark overflow-hidden rounded-2xl p-2 shadow-deep">
                            <div className="grid grid-cols-2 gap-1">
                              {sortCategories(categories).slice(0, 10).map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/categories/${category.slug}`}
                                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-cream/8"
                                >
                                  <span className="relative size-10 overflow-hidden rounded-lg bg-ink-3">
                                    {category.image ? (
                                      <Image
                                        src={category.image}
                                        alt=""
                                        fill
                                        sizes="40px"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                      />
                                    ) : null}
                                  </span>
                                  <span className="text-[0.82rem] text-cream/80 group-hover:text-cream">
                                    {category.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                            <Link
                              href="/menu"
                              className="mt-1 flex items-center justify-between rounded-xl bg-cream/5 px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-cream/60 transition-colors hover:text-cream"
                            >
                              Browse the full menu <Search className="size-3.5" />
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[0.78rem] uppercase tracking-[0.16em] transition-colors",
                    active ? "text-cream" : "text-cream/60 hover:text-cream",
                  )}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-ember-2"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/menu"
              aria-label="Search the menu"
              className="hidden size-10 place-items-center rounded-full text-cream/65 transition-colors hover:bg-cream/8 hover:text-cream sm:grid"
            >
              <Search className="size-[1.05rem]" />
            </Link>

            {!loading && user ? (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-cream/15 py-1 pl-1 pr-3 transition-colors hover:border-cream/30"
                  aria-expanded={accountOpen}
                  aria-label="Account menu"
                >
                  <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-ember/25 font-mono text-[0.65rem] text-ember-3">
                    {profile?.photoURL || user.photoURL ? (
                      <Image
                        src={(profile?.photoURL || user.photoURL) as string}
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 object-cover"
                      />
                    ) : (
                      initials(profile?.displayName || user.displayName || user.email || "U")
                    )}
                  </span>
                  <span className="max-w-24 truncate text-[0.78rem] text-cream/75">
                    {(profile?.displayName || user.displayName || "Account").split(" ")[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {accountOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.24 }}
                      className="absolute right-0 top-full w-60 pt-2"
                    >
                      <div className="glass-dark overflow-hidden rounded-2xl p-2 shadow-deep">
                        <p className="px-3 pb-2 pt-1.5 text-[0.68rem] text-cream/35">
                          {user.email}
                        </p>
                        {[
                          { label: "My account", href: "/account" },
                          { label: "My orders", href: "/account/orders" },
                          { label: "Saved addresses", href: "/account/addresses" },
                          { label: "Settings", href: "/account/settings" },
                        ].map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-lg px-3 py-2 text-sm text-cream/70 transition-colors hover:bg-cream/8 hover:text-cream"
                          >
                            {link.label}
                          </Link>
                        ))}
                        {isAdmin ? (
                          <Link
                            href={SITE.adminPath}
                            className="mt-1 block rounded-lg bg-ember/15 px-3 py-2 text-sm text-ember-3 transition-colors hover:bg-ember/25"
                          >
                            Admin dashboard
                          </Link>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.76rem] uppercase tracking-[0.16em] text-cream/70 transition-colors hover:text-cream sm:flex"
              >
                <User className="size-4" /> Sign in
              </Link>
            )}

            <button
              type="button"
              onClick={openDrawer}
              className="relative ml-1 flex items-center gap-2 rounded-full bg-cream/8 px-3.5 py-2.5 text-cream transition-colors hover:bg-cream/14"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingBag className="size-[1.05rem]" />
              <span className="text-[0.72rem] uppercase tracking-[0.14em]">Cart</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "grid size-5 place-items-center rounded-full font-mono text-[0.62rem]",
                    count > 0 ? "bg-ember text-cream" : "bg-cream/10 text-cream/45",
                  )}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="ml-0.5 grid size-10 place-items-center rounded-full text-cream/80 transition-colors hover:bg-cream/8 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-ink/90 backdrop-blur-xl"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ y: "-6%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-4%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col px-6 pb-10 pt-6"
              aria-label="Mobile"
            >
              <div className="flex items-center justify-between">
                <Wordmark size="md" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid size-10 place-items-center rounded-full border border-cream/15 text-cream/70"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-14 flex flex-col gap-1">
                {SITE.nav.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + index * 0.05, duration: 0.5 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-baseline justify-between border-b border-cream/8 py-4 font-display text-3xl text-cream/85"
                    >
                      {item.label}
                      <span className="font-mono text-[0.6rem] text-cream/25">
                        0{index + 1}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={user ? "/account" : "/login"}
                    className="rounded-full border border-cream/18 py-3 text-center text-[0.72rem] uppercase tracking-[0.16em] text-cream/75"
                  >
                    {user ? "My account" : "Sign in"}
                  </Link>
                  <Link
                    href="/menu"
                    className="rounded-full bg-ember py-3 text-center text-[0.72rem] uppercase tracking-[0.16em] text-cream"
                  >
                    Order now
                  </Link>
                </div>
                <p className="pt-2 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cream/25">
                  {settings.phone} · {open ? "Open" : "Closed"}
                </p>
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
