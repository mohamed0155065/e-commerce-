// app/admin/dashboard/layout.tsx
/**
 * app/admin/dashboard/layout.tsx
 * ---------------------------------------------------------------------------
 * Protected shell for the admin dashboard section. Wraps every route under
 * /admin/dashboard/* (page.tsx = Overview, orders/page.tsx = Orders,
 * products/page.tsx = Products) with:
 *   - The auth/redirect guard (also enforced by middleware.ts, re-checked
 *     here as defense in depth and because layout.tsx is what actually runs
 *     for every nested route).
 *   - The persistent AdminSidebar (now real <Link> navigation between the
 *     three routes below, not scroll-spy — see components/admin/AdminSidebar.tsx).
 *
 * Deliberately scoped to app/admin/dashboard/**, not all of /admin/**, so it
 * does NOT wrap app/admin/login/page.tsx — that page must stay reachable by
 * a signed-out admin, and would infinite-redirect if this guard applied to it.
 *
 * Each child page (page.tsx / orders/page.tsx / products/page.tsx) fetches
 * only the data it needs — this is the actual routing split the admin asked
 * for, replacing the previous single page.tsx that fetched everything and
 * scroll-spied between in-page sections.
 * ---------------------------------------------------------------------------
 */
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f7f7f4]">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 overflow-x-hidden py-10">
        <div className="page-shell max-w-6xl">{children}</div>
      </main>
    </div>
  );
}