import { redirect } from "next/navigation";

import { getSessionUser, supabaseServer } from "@/lib/supabaseServer";
import AdminShell from "@/featues/admin/ui/AdminShell";

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

  const supabase = await supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (user.app_metadata as { role?: string } | null)?.role ?? profile?.role;

  if (role !== "admin") {
    redirect("/");
  }

  return <AdminShell userEmail={user.email}>{children}</AdminShell>;
}