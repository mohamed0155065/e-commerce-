import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/supabaseServer";
import AdminSidebar from "@/components/admin/AdminSidebar";

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

  return (
    <div className="min-h-screen bg-[#f7f7f4] lg:flex">
      <AdminSidebar userEmail={user.email} />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}