import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/supabaseServer";
import AdminShell from "@/components/admin/AdminShell";

/**
 * SERVER COMPONENT
 *
 * Senior-level responsibility:
 *
 * The layout owns the authenticated admin shell.
 *
 * It does NOT fetch:
 * - products
 * - orders
 * - analytics
 *
 * Those belong to their respective routes.
 *
 * This keeps the dashboard architecture route-oriented instead of creating
 * one giant admin component that loads the entire application state.
 *
 * `AdminShell` is a client component that owns purely visual state (sidebar
 * collapse, mobile drawer) — see components/admin/AdminShell.tsx for why
 * that state is isolated there instead of living here.
 */
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  /**
   * Defense in depth.
   *
   * Middleware should already protect this route, but authorization must never
   * depend exclusively on client navigation or middleware.
   */
  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell userEmail={user.email}>{children}</AdminShell>;
}