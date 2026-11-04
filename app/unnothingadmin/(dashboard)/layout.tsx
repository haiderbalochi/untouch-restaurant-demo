import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession, isAdminDemoMode } from "@/lib/admin/session";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect(`${SITE.adminPath}/login`);

  return <AdminShell demo={isAdminDemoMode()}>{children}</AdminShell>;
}
