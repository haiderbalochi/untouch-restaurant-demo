"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

/** Renders storefront chrome everywhere except the hidden admin area. */
export function OutsideAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname === SITE.adminPath || pathname.startsWith(`${SITE.adminPath}/`);
  if (isAdmin) return null;
  return <>{children}</>;
}
