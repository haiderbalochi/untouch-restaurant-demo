import { getAdminSession, isAdminDemoMode } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  return Response.json(
    {
      authenticated: Boolean(session),
      expiresAt: session ? session.exp * 1000 : null,
      demo: isAdminDemoMode(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
