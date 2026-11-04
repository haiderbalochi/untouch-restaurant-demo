"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { SITE } from "@/lib/site";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading, signOutUser } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname || "/account");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="container-x grid gap-8 py-16 lg:grid-cols-[260px_1fr]">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-2xl text-cream/80">Taking you to sign in…</p>
      </div>
    );
  }

  const name = profile?.displayName || user.displayName || user.email || "Guest";
  const photo = profile?.photoURL || user.photoURL;

  return (
    <div className="container-x grid gap-8 py-12 lg:grid-cols-[260px_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-cream/10 bg-cream/[0.025] p-5">
          <div className="flex items-center gap-3">
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-ember/20 font-mono text-[0.7rem] text-ember-3">
              {photo ? (
                <Image src={photo} alt="" width={48} height={48} className="size-12 object-cover" />
              ) : (
                initials(name)
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.88rem] text-cream/85">{name}</p>
              <p className="truncate text-[0.7rem] text-cream/35">{user.email}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-0.5 border-t border-cream/8 pt-4" aria-label="Account">
            {NAV.map((item) => {
              const active =
                item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.82rem] transition-colors",
                    active
                      ? "bg-cream/10 text-cream"
                      : "text-cream/50 hover:bg-cream/5 hover:text-cream/85",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin ? (
              <Link
                href={SITE.adminPath}
                className="mt-1 flex items-center gap-3 rounded-lg bg-ember/12 px-3 py-2.5 text-[0.82rem] text-ember-3 transition-colors hover:bg-ember/20"
              >
                <LayoutDashboard className="size-4" /> Admin dashboard
              </Link>
            ) : null}
          </nav>

          <button
            type="button"
            onClick={async () => {
              await signOutUser();
              toast.success("Signed out.");
              router.push("/");
            }}
            className="mt-4 flex w-full items-center gap-3 rounded-lg border-t border-cream/8 px-3 pt-4 pb-1 text-[0.8rem] text-cream/40 transition-colors hover:text-red-300"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
