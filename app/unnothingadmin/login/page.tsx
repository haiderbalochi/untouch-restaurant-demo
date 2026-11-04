import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/admin-login";
import { getAdminSession } from "@/lib/admin/session";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "UNTOUCH Admin — Sign in",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getAdminSession()) redirect(SITE.adminPath);

  const { next } = await searchParams;
  const requested = typeof next === "string" ? next : "";
  const safeNext =
    requested.startsWith(SITE.adminPath) && !requested.startsWith("//") && !requested.includes("://")
      ? requested
      : SITE.adminPath;

  return <AdminLogin next={safeNext} />;
}
